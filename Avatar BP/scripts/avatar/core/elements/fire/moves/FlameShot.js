import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, calculateDistance, delayedFunc, traceLine } from "../../../../utils.js";

import { ALL_PROJECTILES } from "../../../../index.js";
import FireJump from "./FireJump.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.fire.moves.flameshot.name' },
    description: { translate: 'elements.fire.moves.flameshot.description' },

    cost: 20,
    cooldown: 4,
    type: 'standard',

    id: 45,

    damage: {
        base: 4,
        multiplied: 6
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.blast");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.fire_blast", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            let travelDir = PLAYER_DATA.viewDir;
            const startPosition = player.location;
            
            player.runCommand(`camerashake add @s 0.3 0.05 positional`);

            const levelCheck = PLAYER_DATA.level >= 100;
            const fireType = (levelCheck) ? "a:fire_blue_blast" : "a:fire_blast";
            const fireTypeSecondary = (levelCheck) ? "a:fire_flutter_blue" : "a:fire_flutter";
            const fireTypePop = (levelCheck) ? "a:fire_blue_blast_pop" : "a:fire_blast_pop";    

            let currentTick = -2;
            let endRuntime = false;
            let prevLocation;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick += 2;
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
                nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (4 + PLAYER_DATA.levelFactor * 6), 1, false, true));
                if (nearbyEntities[0] != undefined) endRuntime = true;

                // Check if the block is passable
                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                // Spawn the particle
                if (prevLocation) {
                    traceLine(player, prevLocation, loc, 4, fireType);
                    traceLine(player, prevLocation, loc, 4, fireTypeSecondary);
                }
                prevLocation = loc;

                // The end of the runtime
                if (currentTick > 15 || endRuntime) {
                    // Particle effects and sound
                    PLAYER_DATA.dimension.spawnParticle(fireTypePop, loc, map);

                    if (calculateDistance(player.location, loc) < 2 && travelDir.y < -0.95) {
                        FireJump.activate(player, PLAYER_DATA);
                    }

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;