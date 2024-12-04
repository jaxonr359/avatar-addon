import { system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, calculateDistance, delayedFunc, traceLine } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";

// For Combos
import Geyser from "./Geyser.js";

const move = {
    name: { translate: 'elements.water.moves.torrent.name' },
    description: { translate: 'elements.water.moves.torrent.description' },

    cost: 20,
    cooldown: 10,
    type: 'standard',

    id: 71,

    damage: {
        base: 4,
        multiplied: 2
    },

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 0.025) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 0.025;

        player.playAnimation("animation.air.blast");
        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.water_blast", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            let travelDir = PLAYER_DATA.viewDir;
            const startPosition = player.location;

            player.runCommand(`camerashake add @s 0.1 0.05 positional`);

            let currentTick = -3;
            let endRuntime = false;
            let lastPos = calcVectorOffset(player, 0, 0.5, 0, travelDir);
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick += 4;
                if (currentTick > 17) {
                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }

                // Find the block current location based on the last particle location
                const loc = calcVectorOffset(player, 0, 1, currentTick, travelDir, startPosition);
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
                const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
                nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (4 + PLAYER_DATA.levelFactor * 2), 1));
                if (nearbyEntities[0] != undefined) endRuntime = true;

                // Check if the block is passable
                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                // Spawn the particle
                traceLine(player, lastPos, loc, 3, "a:water_preloaded_8");
                lastPos = loc;

                // The end of the runtime
                if (currentTick > 15 || endRuntime) {
                    if (calculateDistance(player.location, loc) < 2 && travelDir.y < -0.95) Geyser.activate(player, PLAYER_DATA);

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;