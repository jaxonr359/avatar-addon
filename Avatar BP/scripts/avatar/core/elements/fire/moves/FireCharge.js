import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, calculateDistance, delayedFunc, traceLine } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.fire.moves.firecharge.name' },
    description: { translate: 'elements.fire.moves.firecharge.description' },

    cost: 30,
    cooldown: 25,
    type: 'standard',

    id: 41,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.inputPermissions.movementEnabled = false;
        player.runCommand("camerashake add @s 0.4 1 positional");
        player.playAnimation("animation.fire.pull");

        player.addEffect("resistance", 15, { amplifier: 255, showParticles: false });
        PLAYER_DATA.dimension.playSound("avatar.fire_woosh", player.location, { volume: 0.5, pitch: 0.9 + Math.random() * 0.3 });
        PLAYER_DATA.dimension.playSound("avatar.fire_swish", player.location, { volume: 0.5, pitch: 1.2 + Math.random() * 0.3 });

        if (PLAYER_DATA.level >= 100) {
            PLAYER_DATA.dimension.spawnParticle("a:fire_blue_charge_quick", player.location);
            PLAYER_DATA.dimension.spawnParticle("a:fire_flutter_blue_lots", player.location);
        } else {
            PLAYER_DATA.dimension.spawnParticle("a:fire_charge_quick", player.location);
            PLAYER_DATA.dimension.spawnParticle("a:fire_flutter_lots", player.location);
        }

        player.addEffect("saturation", 600, { amplifier: 255, showParticles: false });
        player.addEffect("regeneration", 60, { amplifier: 1, showParticles: false });
        player.addEffect("speed", 15, { amplifier: 5, showParticles: false });

        delayedFunc(player, (moveAgain) => player.inputPermissions.movementEnabled = true, 25);
    }
}

export default move;