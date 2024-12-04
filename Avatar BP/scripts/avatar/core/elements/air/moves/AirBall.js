import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, calculateDistance, delayedFunc, createShockwave } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";

// For Combos
import AirLaunch from "./AirLaunch.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.airball.name' },
    description: { translate: 'elements.air.moves.airball.description' },

    cost: 65,
    cooldown: 10,
    type: 'standard',

    id: 0,

    damage: {
        base: 6,
        multiplied: 20
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.blast");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            const travelDir = PLAYER_DATA.viewDir;
            const startPosition = player.location;

            let currentTick = -1;
            let endRuntime = false;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick += 1;
                if (currentTick > 152) {
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
                const nearbyEntities = [...player.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
                if (nearbyEntities[0] != undefined) endRuntime = true;

                // Check if the block is passable
                const rayCast = player.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                // Spawn the particle
                PLAYER_DATA.dimension.spawnParticle("a:air_ball", loc);

                // The end of the runtime
                if (currentTick > 150 || endRuntime) {
                    if (calculateDistance(player.location, loc) < 2 && travelDir.y < -0.95) AirLaunch.activate(player, PLAYER_DATA);

                    // Particle effects and sound
                    PLAYER_DATA.dimension.spawnParticle("a:air_explosion", loc, map);
                    createShockwave(player, loc, (6 + PLAYER_DATA.levelFactor * 20), 6, 2);
                    PLAYER_DATA.dimension.playSound("random.explode", loc, { volume: 4.7, pitch: 1 - Math.random() * 0.2 })

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;