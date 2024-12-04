import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, delayedFunc } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.airrush.name' },
    description: { translate: 'elements.air.moves.airrush.description' },

    cost: 1,
    cooldown: 10,
    type: 'duration',

    id: 5,

    damage: {
        base: 2,
        multiplied: 5
    },

    start(player, PLAYER_DATA) {
        player.playAnimation("animation.air.rush");

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

        PLAYER_DATA.dimension.playSound("avatar.air_rush", player.location, { volume: 0.1, pitch: 1.2 + Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        player.playAnimation("animation.air.rush.end");
        player.runCommand("stopsound @s avatar.air_rush");
        PLAYER_DATA.dimension.playSound("avatar.air_rush_end", player.location, { volume: 0.7, pitch: 0.8 });
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 10) return;

        PLAYER_DATA.cooldown = 10;

        player.playAnimation("animation.air.rush.runtime");

        // Apply velocity in the direction the player is looking at
        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 1, viewDirection.y);

        // The end of the runtime
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });

        // Particle effects and sound
        const loc = calcVectorOffset(player, 0, 1, -0.5);
        PLAYER_DATA.dimension.spawnParticle("a:air", loc, map);

        // Apply bending damage to nearby entities
        const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (2 + PLAYER_DATA.levelFactor * 5), 1));
    }
}

export default move;