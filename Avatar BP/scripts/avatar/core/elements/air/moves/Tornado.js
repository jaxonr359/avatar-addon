import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, calculateDistance, delayedFunc, applyBendingDamage, calculateKnockbackVector } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.tornado.name' },
    description: { translate: 'elements.air.moves.tornado.description' },

    cost: 75,
    cooldown: 10,
    type: 'standard',

    id: 14,

    damage: {
        base: 2,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.tornado");
        player.inputPermissions.movementEnabled = false;

        PLAYER_DATA.dimension.playSound("avatar.air_tornado", player.location, { volume: 0.1, pitch: 1 + Math.random() * 0.2 });

        delayedFunc(player, () => {
            const viewDir = PLAYER_DATA.viewDir;
            const travelDir = { x: viewDir.x, y: 0, z: viewDir.z };
            const startPosition = player.location;

            const tornadoEntity = PLAYER_DATA.dimension.spawnEntity('a:tornado', player.location);
            tornadoEntity.addTag("bending_dmg_off");

            let currentTick = -1;
            let endRuntime = false;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                const valid = tornadoEntity.isValid();
                currentTick += 1;
                if (currentTick > 152 || !valid) {
                    player.runCommand("stopsound @a[r=50] avatar.air_tornado");
                    PLAYER_DATA.dimension.spawnParticle("minecraft:egg_destroy_emitter", calcVectorOffset(player, 0, 1, currentTick/3, travelDir, startPosition));
                    PLAYER_DATA.dimension.playSound("random.explode", startPosition, { volume: 5.7, pitch: 1 - Math.random() * 0.2 });

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
                

                // Find the block current location based on the last particle location
                const loc = calcVectorOffset(player, 0, 1, currentTick/3, travelDir, startPosition);

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
                const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 6, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
                nearbyEntities.forEach(entity => {
                    try {
                        const knockback = calculateKnockbackVector(entity.location, loc, 1);
                        entity.applyKnockback(knockback.x, knockback.z, -0.5, -knockback.y + 0.1);

                        if (calculateDistance(entity.location, loc) < 0.5) applyBendingDamage(player, entity, (1 + PLAYER_DATA.levelFactor * 1), 0);
                    } catch (e) {
                        try {
                            const knockback = calculateKnockbackVector(entity.location, loc, -0.1);
                            entity.applyImpulse(knockback);
                        } catch (e) {}
                    }
                });

                // Check if the block is passable
                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                // The end of the runtime
                if (currentTick > 150 || endRuntime) {

                    tornadoEntity.playAnimation("animation.tornado_end");
                    PLAYER_DATA.dimension.spawnParticle("minecraft:egg_destroy_emitter", loc);
                    delayedFunc(player, () => {
                        tornadoEntity.triggerEvent("minecraft:instant_despawn");
                    }, 10);

                    delete ALL_PROJECTILES[sched_ID];
                    player.runCommand("stopsound @a[r=50] avatar.air_tornado");

                    return system.clearRun(sched_ID);
                }

                if (currentTick % 10 == 0 || currentTick < 10) {
                    tornadoEntity.playAnimation("animation.tornado");
                }

                PLAYER_DATA.dimension.spawnParticle("a:tornado", loc);
                PLAYER_DATA.dimension.spawnParticle("a:tornado_dust", loc);

                tornadoEntity.teleport(loc);

            }, 1);
        }, 8);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 35);
    }
}

export default move;