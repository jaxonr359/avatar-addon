import { MolangVariableMap } from "@minecraft/server";
import { createShockwave, delayedFunc } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.water.moves.splash.name' },
    description: { translate: 'elements.water.moves.splash.description' },

    cost: 5,
    cooldown: 10,
    type: 'charge',

    id: 69,

    damage: {
        base: 10,
        multiplied: 16
    },

    charge(player, charge) {
        player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/200} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;
        player.dimension.spawnParticle("a:water_charge", player.location);

        if (charge < 6) player.dimension.playSound("avatar.water_charge", player.location, { volume: 0.9, pitch: 1 });
    },

    cancel(player) {
        player.inputPermissions.movementEnabled = true;
        player.runCommand("stopsound @a[r=30] avatar.water_charge");
    },

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 0.25) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 0.25;

        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;
        player.playAnimation("animation.air.shockwave");
        player.runCommand("stopsound @a[r=30] avatar.water_charge");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.water_splash", player.location, { volume: 0.9, pitch: 1 }), 2);

        delayedFunc(player, () => {
            player.runCommand(`camerashake add @a[r=12] 1.8 0.3 positional`);
            const playerPos = player.location;
            createShockwave(player, playerPos, (10 + PLAYER_DATA.levelFactor * 16 * chargeFactor), 8 * chargeFactor, 3);

            player.dimension.spawnParticle("a:water_splash", player.location);
            player.dimension.spawnParticle("a:water_wave", player.location);


            map.setVector3("variable.plane", { x: 0.7*chargeFactor+0.5, y: 300*chargeFactor, z: 35*chargeFactor+4 });
            PLAYER_DATA.dimension.spawnParticle("a:water_shockwave_dynamic", playerPos, map);
        }, 8);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 30);
    }
}

export default move;