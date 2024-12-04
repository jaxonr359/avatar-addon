
import { calcVectorOffset, applyBendingDamage, traceLine } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.fire.moves.fireboosters.name' },
    description: { translate: 'elements.fire.moves.fireboosters.description' },

    cost: 3,
    cooldown: 10,
    type: 'duration',

    id: 40,

    damage: {
        base: 4,
        multiplied: 10
    },

    start(player) {
        player.playAnimation("animation.air.rush");

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });
        player.dimension.playSound("avatar.fire_sprint", player.location, { volume: 1, pitch: 1.7 });
    },
    end(player) {
        player.playAnimation("animation.fire.sprint.end");
        player.runCommand("stopsound @a[r=30] avatar.fire_sprint");
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 10) return;

        PLAYER_DATA.cooldown = 2;

        player.playAnimation("animation.fire.sprint.runtime");

        const loc = { x: player.location.x, y: player.location.y + 1, z: player.location.z };
        if (PLAYER_DATA.level >= 100) {
            PLAYER_DATA.dimension.spawnParticle("a:fire_flutter_blue", loc);
            PLAYER_DATA.dimension.spawnParticle("a:fire_blue_blast_pop", loc);
        } else {
            PLAYER_DATA.dimension.spawnParticle("a:fire_flutter", loc);
            PLAYER_DATA.dimension.spawnParticle("a:fire_blast_pop", loc);
        }

        // Apply velocity in the direction the player is looking at
        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 2, viewDirection.y);

        // The end of the runtime
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });

        // Apply bending damage to nearby entities
        const nearbyEntities = [...player.dimension.getEntities({ location: player.location, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (3 + PLAYER_DATA.levelFactor * 10), 1, false, true));
    
        player.runCommand(`camerashake add @s 0.4 0.05 positional`);
    }
}

export default move;