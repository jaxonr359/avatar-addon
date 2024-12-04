import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, calculateDistance } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.water.moves.jetstream.name' },
    description: { translate: 'elements.water.moves.jetstream.description' },

    cost: 2,
    cooldown: 10,
    type: 'duration',

    id: 68,

    damage: {
        base: 2,
        multiplied: 5
    },

    start(player, PLAYER_DATA) {
        player.playAnimation("animation.air.rush");

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

        PLAYER_DATA.dimension.playSound("avatar.water_rush", player.location, { volume: 0.3, pitch: 1 });
    },
    end(player, PLAYER_DATA) {
        player.playAnimation("animation.air.rush.end");
        player.runCommand("stopsound @s avatar.water_rush");
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 10) return;

        PLAYER_DATA.cooldown = 10;

        player.playAnimation("animation.air.rush.runtime");

        // Apply velocity in the direction the player is looking at
        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 1.5, viewDirection.y);

        // The end of the runtime
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });

        // Particle effects and sound
        const loc = calcVectorOffset(player, 0, 1, -0.5);
        PLAYER_DATA.dimension.spawnParticle("a:water_preloaded_8", loc);

        // Apply bending damage to nearby entities
        const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (2 + PLAYER_DATA.levelFactor * 5), 1));
    }
}

export default move;