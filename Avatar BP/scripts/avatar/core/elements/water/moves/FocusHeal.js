import { delayedFunc } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.water.moves.focusheal.name' },
    description: { translate: 'elements.water.moves.focusheal.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 57,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'focused_healing',

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 1) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 1;

        player.inputPermissions.movementEnabled = false;

        PLAYER_DATA.dimension.playSound("beacon.power", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });

        PLAYER_DATA.dimension.spawnParticle("a:water_healing", player.location);
        player.playAnimation("animation.water.slow_healing");

        player.addEffect("regeneration", 65, { amplifier: 4, showParticles: true });
        player.addEffect("fire_resistance", 300, { amplifier: 1, showParticles: false });
        player.addEffect("saturation", 600, { amplifier: 255, showParticles: false });
        player.removeEffect("blindness");
        player.removeEffect("wither");
        player.removeEffect("poison");
        player.removeEffect("fatal_poison");

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 25);
    }
}

export default move;