import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, calculateDistance, delayedFunc, applyBendingDamage, calculateKnockbackVector, traceLine } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.water.moves.tidalslice.name' },
    description: { translate: 'elements.water.moves.tidalslice.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 70,

    damage: {
        base: 2,
        multiplied: 2
    },

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 1) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 1;

        player.playAnimation("animation.air.tornado");
        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.water_blast", player.location, { volume: 1.5, pitch: 0.9 - Math.random() * 0.2 }), 7);

        player.inputPermissions.movementEnabled = false;
        delayedFunc(player, () => {
            player.runCommand(`camerashake add @s 0.1 1 positional`);

            const viewDir = PLAYER_DATA.viewDir;
            const travelDir = { x: viewDir.x, y: 0, z: viewDir.z };
            const startPosition = player.location;

            let currentTick = -1;
            let endRuntime = false;

            map.setVector3("variable.plane", travelDir);

            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick += 2;
                if (currentTick > 50) {
                    return system.clearRun(sched_ID);
                }

                // Find the block current location based on the last particle location
                const loc = calcVectorOffset(player, 0, 1, currentTick/3, travelDir, startPosition);

                // Apply bending damage to nearby entities
                const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 7, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
                nearbyEntities.forEach(entity => {
                    try {
                        const knockback = calculateKnockbackVector(entity.location, loc, 1);
                        entity.applyKnockback(knockback.x, knockback.z, -3, -knockback.y + 0.3);

                        if (calculateDistance(entity.location, loc) < 1.5) applyBendingDamage(player, entity, (1 + PLAYER_DATA.levelFactor * 1), 0);
                    } catch (e) {
                        try {
                            const knockback = calculateKnockbackVector(entity.location, loc, -0.4);
                            entity.applyImpulse(knockback);
                        } catch (e) {}
                    }
                });

                // Check if the block is passable
                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", loc, map);
                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", calcVectorOffset(player, -0.8, 0, -1, travelDir, loc), map);
                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", calcVectorOffset(player, 0.8, 0, -1, travelDir, loc), map);
                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", calcVectorOffset(player, -1.7, 0, -1.5, travelDir, loc), map);
                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", calcVectorOffset(player, 1.7, 0, -1.5, travelDir, loc), map);
                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", calcVectorOffset(player, -2.4, 0, -2, travelDir, loc), map);
                PLAYER_DATA.dimension.spawnParticle("a:tidal_wave", calcVectorOffset(player, 2.4, 0, -2, travelDir, loc), map);

                // The end of the runtime
                if (currentTick > 50 || endRuntime) {
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 35);
    }
}

export default move;