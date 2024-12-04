import { system, MolangVariableMap } from "@minecraft/server";
import { calcVectorOffset, createShockwave, calculateDistance, delayedFunc } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";

const angleMap = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.airsniper.name' },
    description: { translate: 'elements.air.moves.airsniper.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 9,

    damage: {
        base: 4,
        multiplied: 32
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.blast");

        delayedFunc(player, () => {
            PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 1.5, pitch: 2 + Math.random() * 0.2 });
            PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 2.5, pitch: 0.7 + Math.random() * 0.2 });
        }, 4);


        delayedFunc(player, () => {
            const travelDir = PLAYER_DATA.viewDir;
            const startPosition = player.location;

            player.runCommand(`camerashake add @s 0.1 0.05 positional`);

            let currentTick = 0;
            let endRuntime = false;
            const sched_ID = system.runInterval(function tick() {
                try {
                    // In case of errors
                    currentTick += 3;
                    if (currentTick > 97) {
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
                    if (nearbyEntities[0] != undefined) endRuntime = true;

                    // Check if the block is passable
                    const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 6 });
                    if (rayCast) endRuntime = true;

                    // Spawn the particles
                    PLAYER_DATA.dimension.spawnParticle("a:air", loc);
                    PLAYER_DATA.dimension.spawnParticle("a:air_flutter", loc);
                    PLAYER_DATA.dimension.spawnParticle("a:air_blast_tiny", loc);
                    if (currentTick % 12 == 0) {
                        const entityViewDir = PLAYER_DATA.viewDir;
                        angleMap.setVector3("variable.plane", entityViewDir);
                        PLAYER_DATA.dimension.spawnParticle("a:block_indicator", loc, angleMap);
                    }

                    // The end of the runtime
                    if (currentTick > 95 || endRuntime) {
                        // Particle effects and sound
                        PLAYER_DATA.dimension.spawnParticle("a:air_explosion", loc);
                        createShockwave(player, loc, (4 + PLAYER_DATA.levelFactor * 32 * currentTick/95), 8, 2);

                        PLAYER_DATA.dimension.playSound("avatar.debris", loc, { volume: 3.7, pitch: 1 + Math.random() * 0.2 });
                        PLAYER_DATA.dimension.playSound("random.explode", loc, { volume: 5.7, pitch: 1 - Math.random() * 0.2 });
        
                        delete ALL_PROJECTILES[sched_ID];
                        return system.clearRun(sched_ID);
                    }
                } catch (e) {
                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;