import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, calculateDistance, delayedFunc, getEntitiesNearViewDirection, findDesireableTarget } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.artillery.name' },
    description: { translate: 'elements.air.moves.artillery.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 11,

    damage: {
        base: 4,
        multiplied: 8
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.blast");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            let travelDir = PLAYER_DATA.viewDir;
            const startPosition = calcVectorOffset(player, 0, 1, 0);

            player.runCommand(`camerashake add @s 0.1 0.05 positional`);

            let currentTick = -1;
            let endRuntime = false;
            let loc = startPosition;

            // Find the nearest entity, and the view direction towards it (sorta)
            const entities = getEntitiesNearViewDirection(player, 32, 10);
            const entity = findDesireableTarget(entities);

            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick += 1;
                if (currentTick > 27 || !entity || !entity.isValid()) {
                    player.sendMessage([{ text: '§c' }, { translate: 'elements.air.message.artillery_fail' }]);

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }

                // Find the nearest entity, and the view direction towards it (sorta)
                const lookForEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 32, excludeNames: [player.name], excludeTypes: ["item"], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] })];
                
                if (entity && entity.isValid()) {
                    const entity = lookForEntities[0];
                    const goalDirection = { x: entity.location.x - loc.x, y: entity.location.y - loc.y, z: entity.location.z - loc.z };
                    const length = Math.sqrt(goalDirection.x * goalDirection.x + goalDirection.y * goalDirection.y + goalDirection.z * goalDirection.z);
                    const goalDirectionNorm = { x: goalDirection.x / length, y: goalDirection.y / length, z: goalDirection.z / length };
                    
                    const homingIntensity = 0.1;
                    const originationIntensity = 1 - homingIntensity;

                    travelDir = { x: travelDir.x * originationIntensity + goalDirectionNorm.x * homingIntensity, y: travelDir.y * originationIntensity + goalDirectionNorm.y * homingIntensity, z: travelDir.z * originationIntensity + goalDirectionNorm.z * homingIntensity };
                }

                // Slight arc normal
                loc = calcVectorOffset(player, 0, 0, 1, travelDir, loc);

                if (ALL_PROJECTILES[sched_ID] === undefined) {
                    ALL_PROJECTILES[sched_ID] = { id: sched_ID, loc: loc, collision: false, watchForIds: [], type: 'air' };

                    // Are there any projectiles nearby?
                    for (const projectile of Object.values(ALL_PROJECTILES)) {
                        if (projectile.id != sched_ID && calculateDistance(projectile.loc, loc) < 64) {
                            ALL_PROJECTILES[sched_ID].watchForIds.push(projectile.id);
                        }
                    }
                } else {
                    const projectile = ALL_PROJECTILES[sched_ID];
                    projectile.loc = loc;
                    if (projectile.collision) endRuntime = true;
                }

                // Apply bending damage to nearby entities
                const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"], excludeTypes: ["item"], excludeFamilies: ["inanimate"] })];
                nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (4 + PLAYER_DATA.levelFactor * 7), 1));
                if (nearbyEntities[0] != undefined) endRuntime = true;

                // Check if the block is passable
                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 1 });
                if (rayCast) endRuntime = true;

                // Spawn the particle
                PLAYER_DATA.dimension.spawnParticle("a:air", loc);

                // The end of the runtime
                if (currentTick > 25 || endRuntime) {
                    // Particle effects and sound
                    PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", loc, map);

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;