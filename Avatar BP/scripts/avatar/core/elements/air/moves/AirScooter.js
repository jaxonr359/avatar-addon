import { MolangVariableMap, system } from "@minecraft/server";
import { traceLine, applyBendingDamage } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.airscooter.name' },
    description: { translate: 'elements.air.moves.airscooter.description' },

    cost: 0.1,
    cooldown: 10,
    type: 'duration',

    id: 6,

    damage: {
        base: 0,
        multiplied: 0
    },

    start(player, PLAYER_DATA) {
        player.playAnimation("animation.air.scooter.start");

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

        map.setVector3("variable.plane", { x: 0.4, y: 50, z: 15 });
        PLAYER_DATA.dimension.spawnParticle("a:air_shockwave_dynamic", player.location, map);

        PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 });

        player.applyKnockback(0, 0, 0, 0.7);

        const { x, y, z } = player.location;
        traceLine(player, player.location, { x: x, y: y + 4, z: z }, 8, "a:air_flutter");
        traceLine(player, player.location, { x: x, y: y + 4, z: z }, 8, "a:air_blast_tiny");

        PLAYER_DATA.dimension.playSound("avatar.air_rush", player.location, { volume: 0.1, pitch: 1 - Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        player.playAnimation("animation.air.scooter.end");

        player.runCommand("stopsound @s avatar.air_rush");
        PLAYER_DATA.dimension.playSound("avatar.air_rush_end", player.location, { volume: 0.7, pitch: 0.8 });
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer == 1) PLAYER_DATA.chi -= Math.min(PLAYER_DATA.chi, PLAYER_DATA.chi - 80);
        if (timer < 10) return;

        PLAYER_DATA.cooldown = 10;

        PLAYER_DATA.dimension.spawnParticle("a:air_ball", player.location, map);
        player.playAnimation("animation.air.scooter");

        // Apply velocity in the direction the player is looking at
        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 0.5, viewDirection.y/4);

        // The end of the runtime
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });
    }
}

export default move;