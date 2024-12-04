import { system } from "@minecraft/server";
import { delayedFunc } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.water.moves.geyser.name' },
    description: { translate: 'elements.water.moves.geyser.description' },

    cost: 35,
    cooldown: 35,
    type: 'standard',

    id: 60,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 0.25) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 0.25;
        
        player.playAnimation("animation.air.jump");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.water_blast", player.location, { volume: 1.5, pitch: 1.4 + Math.random() * 0.2 }), 2);

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

        delayedFunc(player, movementReturn => {
            player.runCommand(`camerashake add @s 0.4 0.2 positional`);
            PLAYER_DATA.dimension.spawnParticle("a:water_wave", player.location);

            player.applyKnockback(0, 0, 0, 1.8);
            player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

            let currentTick = 0;
            const sched_ID = system.runInterval(function tick() {
                currentTick++;
                if (currentTick > 15) return system.clearRun(sched_ID);
                PLAYER_DATA.dimension.spawnParticle("a:water_preloaded_8", player.location);
            }, 1);
        }, 4);
    }
}

export default move;