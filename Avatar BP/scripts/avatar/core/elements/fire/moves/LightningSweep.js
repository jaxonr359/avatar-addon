import { MolangVariableMap, system } from "@minecraft/server";
import {
    calcVectorOffset,
    applyBendingDamage,
    calculateDistance,
    delayedFunc,
    findMultipleDesireableTargets,
    getEntitiesNearViewDirection,
    depthFirstSearch,
    conductiveBlocks
} from "../../../../utils.js";

const customMap = new MolangVariableMap();

const traceLine = (player, pStart, pEnd) => {
    try {
        const point1 = pStart;
        const point2 = pEnd;
        const distance = calculateDistance(point1, point2);
        const vectorDir = { x: point1.x - point2.x, y: point1.y - point2.y, z: point1.z - point2.z };
    
        const midPoint = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2, z: (point1.z + point2.z) / 2 };
    
        customMap.setVector3("variable.plane", { x: 0.1, y: 0.9, z: 1 });
        customMap.setVector3("variable.direction", vectorDir);
        customMap.setFloat("variable.width", 0.06);
        customMap.setFloat("variable.length", distance/2);
        player.dimension.spawnParticle("a:lightning_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 0.1, y: 0.6, z: 1 });
        customMap.setFloat("variable.width", 0.08);
        player.dimension.spawnParticle("a:lightning_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 1, y: 1, z: 1 });
        customMap.setFloat("variable.width", 0.03);
        player.dimension.spawnParticle("a:lightning_line", midPoint, customMap);
    } catch (error) {};
}

const applyStun = (entity) => {
    entity.addEffect("slowness", 60, { amplifier: 4, showParticles: false });
    entity.addEffect("blindness", 60, { amplifier: 1, showParticles: false });
};

const stunRuntime = (entity) => {
    const { x, y, z } = entity.location
    const locationA = { x: x + Math.random() * 2 - 1, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 };
    const locationB = { x: x + Math.random() * 2 - 1, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 };
    const locationC = { x: x + Math.random() * 2 - 1, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 };
    const locationD = { x: x + Math.random() * 2 - 1, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 };

    traceLine(entity, locationA, locationB);
    traceLine(entity, locationB, locationC);
    traceLine(entity, locationC, locationD);
}

const conductivitySim = (player, block) => {
    const connectedBlocks = depthFirstSearch(block);

    // Spawn particles at each connected block randomly offset like 'stunRuntime'

    let currentTick = 0;
    const sched_ID = system.runInterval(function tick() {
        currentTick++;
        if (currentTick > 8) {
            return system.clearRun(sched_ID);
        }

        for (const connectedBlock of connectedBlocks) {
            const entities = connectedBlock.dimension.getEntities({ location: connectedBlock.location, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] });
            for (const entity of entities) {
                applyBendingDamage(player, entity, (3), 0);
            }

            const { x, y, z } = connectedBlock.location;
            const locationA = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };
            const locationB = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };
            const locationC = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };
            const locationD = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };

            traceLine(connectedBlock, locationA, locationB);
            traceLine(connectedBlock, locationB, locationC);
            traceLine(connectedBlock, locationC, locationD);
        }

    }, 1);
};

const move = {
    name: { translate: 'elements.fire.moves.lightningsweep.name' },
    description: { translate: 'elements.fire.moves.lightningsweep.description' },

    cost: 5,
    cooldown: 10,
    type: 'charge',

    id: 49,

    damage: {
        base: 2,
        multiplied: 6
    },

    skill_required: 'lightning_sweep',

    charge(player, charge) {
        player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/100} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;

        const locationA = calcVectorOffset(player, Math.random() * 2 - 1, Math.random() * 2 - 0.5, Math.random() * 2 - 1)
        const locationB = calcVectorOffset(player, Math.random() * 2 - 1, Math.random() * 2 - 0.5, Math.random() * 2 - 1)
        const locationC = calcVectorOffset(player, Math.random() * 2 - 1, Math.random() * 2 - 0.5, Math.random() * 2 - 1)
        const locationD = calcVectorOffset(player, Math.random() * 2 - 1, Math.random() * 2 - 0.5, Math.random() * 2 - 1)

        traceLine(player, locationA, locationB);
        traceLine(player, locationB, locationC);
        traceLine(player, locationC, locationD);

        if (charge < 6) player.dimension.playSound("avatar.lightning_charge", player.location, { volume: 4.7, pitch: 1 - Math.random() * 0.2 });
    },

    cancel(player) {
        player.inputPermissions.movementEnabled = true;
        player.runCommand("stopsound @a[r=30] avatar.lightning_charge");
    },

    activate(player, PLAYER_DATA) {
        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;

        player.playAnimation("animation.earth.spikes");
        player.runCommand("stopsound @a[r=30] avatar.lightning_charge");

        PLAYER_DATA.dimension.playSound("avatar.lightning_sweep", player.location, { volume: 4.7, pitch: 1 - Math.random() * 0.2 });

        const stunEntity = [];
        delayedFunc(player, () => {
            let currentTick = 0;
            let canDoConductivity = true;
            player.runCommandAsync("camerashake add @a[r=10] 0.8 0.2 positional");

            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 36) {
                    return system.clearRun(sched_ID);
                }
    
                for (let i = 0; i < 2; i++) {
                    const numLocations = 4;
                    const locations = [];
                    
                    for (let i = 0; i < numLocations; i++) {
                        const xOffset = i === numLocations - 1 ? 0 : i === 0 ? 0 : Math.random() * 4 - 2;
                        const yOffset = i === numLocations - 1 ? 0 : i === 0 ? 0.6 : Math.random() * 2 - 0.5;
                        const zOffset = i === numLocations - 1 ? 10 * chargeFactor : 2 * chargeFactor * i + Math.random() * 2;
                    
                        locations.push(calcVectorOffset(player, xOffset, yOffset, zOffset));
                    
                        if (i > 0) {
                            traceLine(player, locations[i - 1], locations[i]);
                        }
                    }
                }

                if (canDoConductivity) {
                    const blockRay = player.getBlockFromViewDirection({ includePassableBlocks: true, includeLiquidBlocks: false, maxDistance: 10 });
                    if (blockRay) {
                        const block = blockRay.block;
                        if (conductiveBlocks.has(block.typeId)) {
                            conductivitySim(player, block);
                            canDoConductivity = false;
                        }
                    }
                }

                if (currentTick % 8 === 0) {
                    const entities = getEntitiesNearViewDirection(player, 14, 3);
                    const targets = findMultipleDesireableTargets(entities, 3, true);

                    if (!targets || targets.length === 0) return;
                    for (const target of targets) {
                        if (!stunEntity.includes(target)) {
                            stunEntity.push(target);
                        }
                    }
                }
            }, 1);
        }, 20);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;

            let currentTick = 0;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 60) {
                    return system.clearRun(sched_ID);
                }

                if (currentTick < 5) {
                    for (const entity of stunEntity) {
                        try {
                            applyStun(entity);
                        } catch (e) {
                            stunEntity.splice(stunEntity.indexOf(entity), 1);
                        }
                    }
                }

                for (const entity of stunEntity) {
                    try {
                        stunRuntime(entity);
                        applyBendingDamage(player, entity, (1 + PLAYER_DATA.levelFactor * 4), 0, false, true);
                    } catch (e) {
                        stunEntity.splice(stunEntity.indexOf(entity), 1);
                    }
                }
            }, 1);
        }, 30);
    }
}

export default move;