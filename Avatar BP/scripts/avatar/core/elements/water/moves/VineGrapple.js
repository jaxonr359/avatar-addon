import { system, Player, MolangVariableMap } from '@minecraft/server'
import { createShockwave, delayedFunc, traceLine, calculateDistance, calculateKnockbackVector, calcVectorOffset } from "../../../../utils.js";

const customMap = new MolangVariableMap();

const traceLineFlat = (player, pStart, pEnd) => {
    try {
        const point1 = pStart;
        const point2 = pEnd;
        const distance = calculateDistance(point1, point2);
        const vectorDir = { x: point1.x - point2.x, y: point1.y - point2.y, z: point1.z - point2.z };
    
        const midPoint = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2, z: (point1.z + point2.z) / 2 };
    
        customMap.setVector3("variable.direction", vectorDir);
        customMap.setFloat("variable.length", distance/2);
        customMap.setFloat("variable.width", 0.08);
        customMap.setVector3("variable.plane", { x: 0.3, y: 1, z: 0.3 });
        player.dimension.spawnParticle("a:metal_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 0.3, y: 0.9, z: 0.3 });
        customMap.setFloat("variable.width", 0.06);
        player.dimension.spawnParticle("a:metal_line", midPoint, customMap);
    } catch (error) {};
}

const shootWeb = (player, start, end, time, points) => {
    let liveUpdate = false;
    if (start instanceof Player) {
        liveUpdate = true;
        start = start.location;
    }

    let currentTick = 0;
    let endRuntime = false;
    const sched_ID = system.runInterval(function tick() {
        if (currentTick > time || endRuntime) return system.clearRun(sched_ID);
        currentTick++;

        if (liveUpdate) start = player.location;

        const ratio = currentTick / time;

        // Get point on the line formed between start and end points
        const x = (1 - ratio) * start.x + ratio * end.x;
        const y = (1 - ratio) * start.y + ratio * end.y;
        const z = (1 - ratio) * start.z + ratio * end.z;

        const position = { x, y, z };
        traceLineFlat(player, start, position);
    }, 1);
};

const getEntitiesNearViewDirection = (player, rayDistance = 100) => {
    const viewDir = player.getViewDirection();

    for (let i = 0; i < rayDistance; i++) {
        const pos = calcVectorOffset(player, 0, 0, i, viewDir);

        // Check if we hit a solid block
        const rayCast = player.dimension.getBlockFromRay(pos, viewDir, { includePassableBlocks: true, includeLiquidBlocks: true, maxDistance: 1.1 });
        if (rayCast) return [];

        // Check if we hit an entity
        const entities = player.dimension.getEntities({ location: pos, maxDistance: 2.5, excludeNames: [player.name] });
        if (entities.length > 0) return entities;
    }

    return [];
}

const grappleForwardCombo = (player, target) => {
    createShockwave(player, player.location, 9, 6, 2);
    player.dimension.playSound("avatar.debris", player.location, { volume: 3, pitch: 1 });
    player.runCommand(`stopsound @s avatar.swing`);

    const viewDir = player.getViewDirection();
    player.applyKnockback(-viewDir.x, -viewDir.z, 3, 0.5);
}

const grappleUpCombo = (player, PLAYER_DATA, target) => {
    createShockwave(player, player.location, 9, 6, 2);

    PLAYER_DATA.dimension.playSound("avatar.debris", player.location, { volume: 3, pitch: 1 });
    player.runCommand(`stopsound @s avatar.swing`);

    PLAYER_DATA.stalledEntity = target;
    PLAYER_DATA.timeInStall = 0;
    PLAYER_DATA.airStall = true;
}

const grappleDownCombo = (player, PLAYER_DATA)  => {
    createShockwave(player, player.location, 9, 6, 8);
    player.dimension.spawnParticle("minecraft:huge_explosion_emitter", player.location);

    player.dimension.spawnParticle("a:air_puff", player.location);
    player.runCommandAsync("camerashake add @a[r=8] 0.8 0.2 positional");

    PLAYER_DATA.dimension.playSound("random.explode", player.location, { volume: 3, pitch: 1 });
    PLAYER_DATA.dimension.playSound("avatar.debris", player.location, { volume: 3, pitch: 1 });
    player.runCommand(`stopsound @s avatar.swing`);

    // Get all nearby entities
    player.playAnimation("animation.earth.landing");
    const entities = [...player.dimension.getEntities({ location: player.location, maxDistance: 6, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] })];
    entities.forEach(entity => {
        try {
            entity.applyKnockback(0, 0, 0, 1.4);
            entity.addEffect("slow_falling", 25, { amplifier: 255, showParticles: false });
        } catch (error) {}
    });

    if (entities.length == 0) return;

    // All of this is to hold the entities in place for a short duration
    let currentTick = 0;
    let wasAirStall = false;
    const sched_ID = system.runInterval(function tick() {
        if (currentTick > 60) return system.clearRun(sched_ID);
        currentTick++;

        // So we don't keep the entities in place if the player has already done the punch move
        if (wasAirStall && !PLAYER_DATA.airStall) return system.clearRun(sched_ID);
        if (PLAYER_DATA.airStall && !wasAirStall) wasAirStall = true;

        if (currentTick > 20) {
            entities.forEach(entity => {
                try {        
                    entity.applyKnockback(0, 0, 0, 0.03);  
                } catch (error) {}
            });
        }
    }, 1);

}

const pullTowardsCombo = (player, PLAYER_DATA, target) => {
    let currentTick = 0;
    let endRuntime = false;

    // Pull the entity towards the player
    const sched_ID = system.runInterval(function tick() {
        currentTick++;
        if (currentTick > 140 || endRuntime || !target.isValid()) {
            PLAYER_DATA.airStall = true;
            PLAYER_DATA.timeInStall = 0;
            PLAYER_DATA.stalledEntity = target;
            return system.clearRun(sched_ID);
        }

        const { x, y, z } = target.location;
        const vector = { x: x - player.location.x, y: y - player.location.y, z: z - player.location.z };

        const newTarget = calcVectorOffset(player, 0, 0, -0.5, vector, target.location);
        const distance = calculateDistance(player.location, newTarget);

        //traceLine(player, player.location, newTarget, distance, "a:metal_blast");
        traceLineFlat(player, player.location, newTarget);

        if (distance < 3) {
            endRuntime = true;

            PLAYER_DATA.airStall = true;
            PLAYER_DATA.timeInStall = 0;
            PLAYER_DATA.stalledEntity = target;
        } else {
            const kbVector = calculateKnockbackVector(player.location, newTarget, 0.1);
            const horizontal = Math.sqrt(kbVector.x ** 2 + kbVector.z ** 2);
    
            target.applyKnockback(kbVector.x, kbVector.z, horizontal*18, kbVector.y*18);
            player.applyKnockback(0, 0, 0, 0.06);
        }
    }, 1);
}


const move = {
    name: { translate: 'elements.water.moves.vinegrapple.name' },
    description: { translate: 'elements.water.moves.vinegrapple.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 72,

    damage: {
        base: 20,
        multiplied: 10
    },

    skill_required: 'vine_grapple',

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.water.whip");

        const grappleID = Math.random().toString(36).substring(7);
        PLAYER_DATA.grappleID = grappleID;
    
        let target;
        let isEntity = false;
        const entityRay = getEntitiesNearViewDirection(player, 100);
    
        if (entityRay.length > 0) {
            target = entityRay[0];
            isEntity = true;
        } else {
            const blockRay = player.getBlockFromViewDirection({ includePassableBlocks: false, includeLiquidBlocks: false });
            if (!blockRay) return;
            target = blockRay.block;
        }

        const { x, y, z } = target.location;
        const vector = { x: x - player.location.x, y: y - player.location.y, z: z - player.location.z };
        
        let newTargetL = calcVectorOffset(player, 1, 0, -0.5, vector, { x, y, z })
        let newTargetR = calcVectorOffset(player, -1, 0, -0.5, vector, { x, y, z })
    
        PLAYER_DATA.cooldown = 10;
    
        shootWeb(player, player, newTargetL, 4);
        shootWeb(player, player, newTargetR, 4);

        PLAYER_DATA.dimension.playSound("avatar.air_woosh", player.location, { volume: 3, pitch: 2 });
    
        const distanceFallen = player.location.y - target.location.y;
    
        player.addEffect("slow_falling", 5, { amplifier: 5, showParticles: false });
    
        delayedFunc(player, () => {
            let currentTick = 0;
            let endRuntime = false;
            let lastPosition = player.location;
            let lastPlayerPos = player.location;
    
            const viewDir = PLAYER_DATA.viewDir;
            const isLookingDown = viewDir.y < -0.9;
    
            const slam = isLookingDown && distanceFallen > 6;
    
            const blockBelow = PLAYER_DATA.dimension.getBlockBelow(player.location, { maxDistance: 5, includePassableBlocks: true, includeLiquidBlocks: true });
            const pullTowards = (isEntity && !slam && !target.isFalling && !player.isOnGround && !blockBelow);
            if (pullTowards) {
                return pullTowardsCombo(player, PLAYER_DATA, target);
            }
    
            const maxGrappleTime = Math.min(calculateDistance(player.location, target.location)*0.75, 500);
   
            PLAYER_DATA.dimension.playSound("avatar.swing", player.location, { volume: 3, pitch: 1 });
            const sched_ID = system.runInterval(function tick() {
                if (PLAYER_DATA.grappleID != grappleID) endRuntime = true;
    
                if (currentTick > maxGrappleTime || endRuntime) return system.clearRun(sched_ID);
                currentTick++;
    
                if (isEntity) {
                    const { x, y, z } = target.location;
                    const vector = { x: x - player.location.x, y: y - player.location.y, z: z - player.location.z };            
                    newTargetL = calcVectorOffset(player, 1, 0, -0.5, vector, { x, y, z })
                    newTargetR = calcVectorOffset(player, -1, 0, -0.5, vector, { x, y, z })
                }
                
                const start = player.location;
                const distance = calculateDistance(start, newTargetL);
    
                // traceLine(player, player.location, newTargetL, distance*0.5, "a:metal_blast");
                // traceLine(player, player.location, newTargetR, distance*0.5, "a:metal_blast");
                traceLineFlat(player, player.location, newTargetL);
                traceLineFlat(player, player.location, newTargetR);

                if (distance < 2) endRuntime = true;
    
                if (slam) {
                    player.addEffect("slow_falling", 25, { amplifier: 5, showParticles: false });
                    player.applyKnockback(0, 0, 0, -8);
    
                    const playerPos = player.location;
                    traceLine(player, lastPlayerPos, playerPos, 25, "a:air_flutter");
                    traceLine(player, lastPlayerPos, playerPos, 25, "a:air_blast_tiny");

                    lastPlayerPos = playerPos;
                } else {
                    const kbVector = calculateKnockbackVector(start, newTargetL, 0.1);
                    const horizontal = Math.sqrt(kbVector.x ** 2 + kbVector.z ** 2);
        
                    player.applyKnockback(-kbVector.x, -kbVector.z, horizontal*18, -kbVector.y*18);    
                }
    
                const velocity = player.getVelocity();
                const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
    
                if (speed < 0.3 && currentTick > 5) endRuntime = true;
                lastPosition = player.location;
    
                if (slam && velocity.y == 0) endRuntime = true;
    
                player.addEffect("slow_falling", 45, { amplifier: 1, showParticles: false });
         
                if ((endRuntime || currentTick > maxGrappleTime) && isEntity && !target.isOnGround) {
                    grappleUpCombo(player, PLAYER_DATA, target);
                } else if ((endRuntime || currentTick > maxGrappleTime) && slam) {
                    grappleDownCombo(player, PLAYER_DATA);
                } else if ((endRuntime || currentTick > maxGrappleTime) && isEntity) {
                    grappleForwardCombo(player, target);
                } else if (endRuntime || currentTick > maxGrappleTime) {
                    player.applyKnockback(0, 0, 0, 1.2);
                    player.runCommand(`stopsound @s avatar.swing`);
                }
            }, 1);
        }, 4);
    }
}

export default move;