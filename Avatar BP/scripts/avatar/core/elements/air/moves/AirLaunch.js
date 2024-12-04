import { MolangVariableMap, system } from "@minecraft/server";
import { delayedFunc } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.airlaunch.name' },
    description: { translate: 'elements.air.moves.airlaunch.description' },

    cost: 50,
    cooldown: 15,
    type: 'standard',

    id: 2,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.jump");

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });
        const playerPos = { x: player.location.x, y: player.location.y + 0.6, z: player.location.z };

        PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
        delayedFunc(player, movementReturn => {
            PLAYER_DATA.dimension.playSound("avatar.air_woosh", playerPos, { volume: 0.5, pitch: 0.8 + Math.random() * 0.2 })

            map.setVector3("variable.plane", { x: 0.6, y: 35, z: 35 });
            PLAYER_DATA.dimension.spawnParticle("a:air_shockwave_dynamic", playerPos, map);
            PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", playerPos);

            player.applyKnockback(0, 0, 0, 2);
            player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

            let currentTick = 0;
            const sched_ID = system.runInterval(function tick() {
                currentTick++;
                if (currentTick > 25) return system.clearRun(sched_ID);
                const playerPos = player.location;
                PLAYER_DATA.dimension.spawnParticle("a:air_flutter", playerPos);
                PLAYER_DATA.dimension.spawnParticle("a:air_blast_tiny", playerPos);
            }, 1);
        }, 4);
    }
}

export default move;