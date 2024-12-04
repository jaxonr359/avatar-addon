import { MolangVariableMap, system } from "@minecraft/server";
import { createShockwave, traceLine } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.fire.moves.deathslam.name' },
    description: { translate: 'elements.fire.moves.deathslam.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 35,

    damage: {
        base: 4,
        multiplied: 12
    },

    skill_required: 'death_slam',

    activate(player, PLAYER_DATA) {
        let currentTick = 0;
        let lastPlayerPos = player.location;

        const levelCheck = PLAYER_DATA.level >= 100;
        const fireType = (levelCheck) ? "a:fire_blue_blast" : "a:fire_blast";
        const fireFlutter = (levelCheck) ? "a:fire_flutter_blue" : "a:fire_flutter";   
        const shockwaveType = (levelCheck) ? "a:fire_shockwave_dynamic_blue" : "a:fire_shockwave_dynamic";

        PLAYER_DATA.dimension.playSound("avatar.fire_blast", lastPlayerPos, { volume: 3.7, pitch: 1 + Math.random() * 0.2 });
        const sched_ID = system.runInterval(function tick() {
            currentTick++;
            if (currentTick > 100) return system.clearRun(sched_ID);
            player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });
            player.applyKnockback(0, 0, 0, -8);
            
            const playerPos = player.location;
            traceLine(player, lastPlayerPos, playerPos, 10, fireFlutter)
            traceLine(player, lastPlayerPos, playerPos, 10, fireType)
            lastPlayerPos = playerPos;

            if (player.getVelocity().y == 0) {
                if (currentTick < 3) {
                    player.sendMessage("§cYou must be in the air with enough downward force to use this!");
                    return system.clearRun(sched_ID);
                }

                player.playAnimation("animation.earth.landing");
                
                map.setVector3("variable.plane", { x: 0.5, y: 140, z: 75 });
                PLAYER_DATA.dimension.spawnParticle(shockwaveType, {
                    x: playerPos.x,
                    y: playerPos.y + 0.6,
                    z: playerPos.z
                }, map);

                PLAYER_DATA.dimension.playSound("avatar.debris", playerPos, { volume: 3.7, pitch: 1 + Math.random() * 0.2 });
                PLAYER_DATA.dimension.playSound("random.explode", playerPos, { volume: 5.7, pitch: 1 - Math.random() * 0.2 });

                if (currentTick < 5) {
                    createShockwave(player, playerPos, 4 + PLAYER_DATA.levelFactor * 5, 7, 10, true);
                } else {
                    createShockwave(player, playerPos, 4 + PLAYER_DATA.levelFactor * 12, 7, 10, true);
                }
                return system.clearRun(sched_ID);
            }
            // The end of the runtime
            if (currentTick > 10) return system.clearRun(sched_ID);
        }, 1);
    }
}

export default move;