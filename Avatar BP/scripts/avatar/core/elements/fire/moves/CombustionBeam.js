import { MolangVariableMap, system } from "@minecraft/server";
import {
    calcVectorOffset,
    applyBendingDamage,
    calculateDistance,
    delayedFunc,
    findMultipleDesireableTargets,
    getEntitiesNearViewDirection,
    conductiveBlocks,
    depthFirstSearch,
    createShockwave,
    findDesireableTarget
} from "../../../../utils.js";

const customMap = new MolangVariableMap();

export const traceLine = (PLAYER_DATA, pStart, pEnd) => {
    try {
        const point1 = pStart;
        const point2 = pEnd;
        const distance = calculateDistance(point1, point2);
        const vectorDir = { x: point1.x - point2.x, y: point1.y - point2.y, z: point1.z - point2.z };
    
        const midPoint = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2, z: (point1.z + point2.z) / 2 };
    
        customMap.setVector3("variable.plane", { x: 1, y: 1, z: 1 });
        customMap.setVector3("variable.direction", vectorDir);
        customMap.setFloat("variable.width", 0.01);
        customMap.setFloat("variable.length", distance/2);
        PLAYER_DATA.dimension.spawnParticle("a:combustion_line", midPoint, customMap);
        //
        customMap.setVector3("variable.plane", { x: 1, y: 0.87, z: 0 });
        customMap.setFloat("variable.width", 0.02);
        PLAYER_DATA.dimension.spawnParticle("a:combustion_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 1, y: 0.6, z: 0 });
        customMap.setFloat("variable.width", 0.04);
        PLAYER_DATA.dimension.spawnParticle("a:combustion_line", midPoint, customMap);

        // Find 4 evenly spaced points between the start and end
        for (let i = 0; i < 5; i++) {
            const x = point1.x + (point2.x - point1.x) * i / 5;
            const y = point1.y + (point2.y - point1.y) * i / 5;
            const z = point1.z + (point2.z - point1.z) * i / 5;
            const loc = { x, y, z };
            customMap.setVector3("variable.plane", PLAYER_DATA.viewDir);
            PLAYER_DATA.dimension.spawnParticle("a:block_indicator", loc, customMap);
        }

    } catch (error) {};
}

const move = {
    name: { translate: 'elements.fire.moves.combustionbeam.name' },
    description: { translate: 'elements.fire.moves.combustionbeam.description' },

    cost: 3,
    cooldown: 10,
    type: 'charge',

    id: 34,

    damage: {
        base: 2,
        multiplied: 40
    },

    skill_required: 'combustion_beam',

    charge(player, charge) {
        player.inputPermissions.movementEnabled = false;
        player.dimension.spawnParticle("a:fire_charge", player.location);
    },

    cancel(player) {
        player.inputPermissions.movementEnabled = true;
    },

    activate(player, PLAYER_DATA) {
        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;

        player.playAnimation("animation.earth.spikes");

        delayedFunc(player, () => {
            player.runCommandAsync("camerashake add @a[r=10] 0.1 0.2 positional");

            const exactLoc = player.getHeadLocation();
            const headLoc = { x: exactLoc.x, y: exactLoc.y + 0.2, z: exactLoc.z };
            
            const target = player.getBlockFromViewDirection({ includePassableBlocks: true });
            const entityRay = getEntitiesNearViewDirection(player, 100, 10, -0.5);
            const entityTarget = findDesireableTarget(entityRay);

            // If we have neither a block nor an entity, we just shoot the beam forward
            if (!target && !entityTarget) return traceLine(PLAYER_DATA, headLoc, calcVectorOffset(player, 0, 0, 50, PLAYER_DATA.viewDir, headLoc));

            player.dimension.playSound("avatar.thunderclap", player.location, { volume: 2, pitch: 1.4 + Math.random() * 0.2 });

            if (entityTarget) {
                try {
                    traceLine(PLAYER_DATA, headLoc, entityTarget.location);
                    PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", entityTarget.location);
                    createShockwave(player, entityTarget.location, 2 + 40 * chargeFactor * PLAYER_DATA.levelFactor, 10, 1, true);
                } catch (error) {}
            } else {
                try {
                    const block = target.block;
                    traceLine(PLAYER_DATA, headLoc, block.location);
                    PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", block.location);
                    createShockwave(player, { x: block.x, y: block.y + 1, z: block.z }, 2 + 40 * chargeFactor * PLAYER_DATA.levelFactor, 10, 1, true);
                } catch (error) {}
            }
        }, 20);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 30);
    }
}

export default move;