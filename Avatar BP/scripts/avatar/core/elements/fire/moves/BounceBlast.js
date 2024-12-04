import { system } from "@minecraft/server";
import { calcVectorOffset, calculateDistance, delayedFunc, traceLine, createShockwave } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";

const move = {
    name: { translate: 'elements.fire.moves.bounceblast.name' },
    description: { translate: 'elements.fire.moves.bounceblast.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 33,

    damage: {
        base: 4,
        multiplied: 20
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.blast");

        const levelCheck = PLAYER_DATA.level >= 100;
        const fireType = (levelCheck) ? "a:fire_blue_blast" : "a:fire_blast";
        const fireTypeSecondary = (levelCheck) ? "a:fire_flutter_blue" : "a:fire_flutter";
        const fireTypePop = (levelCheck) ? "a:fire_blue_blast_pop" : "a:fire_blast_pop";    


        PLAYER_DATA.dimension.playSound("avatar.fire_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 });
        delayedFunc(player, () => {
            let travelDir = PLAYER_DATA.viewDir;
            let prevLoc = player.location;
            let loc = calcVectorOffset(player, 0, 1.4, 0.5, travelDir, player.location);
            let distance = 0;

            let currentTick = -1;
            let endRuntime = false;
            let bounces = 0;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick += 0.5;
                distance += 0.5;
                if (currentTick > 27) {
                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }

                // Find the block current location based on the last particle location
                prevLoc = loc;
                loc = calcVectorOffset(player, 0, 0, distance/4, travelDir, loc);

                // Apply bending damage to nearby entities
                const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
                if (nearbyEntities[0] != undefined) endRuntime = true;

                const checkForward = 3;

                // Check if the block is passable
                try {
                    const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: true, includeLiquidBlocks: true, maxDistance: checkForward });
                    if (rayCast) {
                        const face = rayCast.face;
                        const relative = rayCast.faceLocation;
                        const blockLoc = rayCast.block.location;

                        switch (face) {
                            case "Up":
                            case "Down":
                                travelDir.y = -travelDir.y;
                                distance = 0;
                                break;
                            case "North":
                            case "South":
                                travelDir.z = -travelDir.z;
                                distance = 0;
                                break;
                            case "East":
                            case "West":
                                travelDir.x = -travelDir.x;
                                distance = 0;
                                break;
                        }

                        const fixedLoc = { x: blockLoc.x + relative.x, y: blockLoc.y + relative.y, z: blockLoc.z + relative.z };
                        PLAYER_DATA.dimension.spawnParticle(fireTypePop, fixedLoc);
                        PLAYER_DATA.dimension.playSound("avatar.air_woosh", fixedLoc, { volume: 0.1, pitch: 2 + Math.random() * 0.2 })

                        if (bounces < 6) bounces++;
                    }
                } catch (err) {
                    endRuntime = true;
                }

                // Spawn the particles
                try {
                    traceLine(player, prevLoc, loc, 3, fireType);
                    PLAYER_DATA.dimension.spawnParticle(fireTypeSecondary, loc);
                } catch (err) {}

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

                // The end of the runtime
                if (currentTick > 25 || endRuntime) {
                    // Particle effects and sound
                    try {
                        PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
                    } catch (err) {};

                    PLAYER_DATA.dimension.playSound("random.explode", loc, { volume: 4.7, pitch: 1 - Math.random() * 0.2 });
                    createShockwave(player, loc, (3 + PLAYER_DATA.levelFactor * 20 * (bounces/4)), 6, 2, true);

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;