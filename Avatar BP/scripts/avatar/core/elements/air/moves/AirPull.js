import { system } from "@minecraft/server";
import { delayedFunc, calculateKnockbackVector } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.air.moves.airpull.name' },
    description: { translate: 'elements.air.moves.airpull.description' },

    cost: 50,
    cooldown: 15,
    type: 'standard',

    id: 4,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.pull");

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });

        PLAYER_DATA.dimension.playSound("avatar.air_woosh", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 });
        PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 });

        delayedFunc(player, movementReturn => {
            const dimension = PLAYER_DATA.dimension;
            const spawnPos = player.location;
            const entities = [...dimension.getEntities({ location: spawnPos, maxDistance: 32, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["permKbSafe", "bending_dmg_off"] })];
            const items = [...dimension.getEntities({ location: spawnPos, maxDistance: 32, type: "item" })];
    
            entities.forEach(entity => {
                const kbVector = calculateKnockbackVector(entity.location, spawnPos, 1);
                entity.applyKnockback(-kbVector.x, -kbVector.z, 5, kbVector.y+0.5);
                if (player.location.y > entity.location.y + 8) {
                    entity.applyKnockback(0, 0, 0, 3);
                }
            });

            items.forEach(item => {
                const itemkKbVector = calculateKnockbackVector(item.location, spawnPos, 3);
                item.applyImpulse({x: -itemkKbVector.x, y: -itemkKbVector.y, z: -itemkKbVector.z});
            });

            dimension.spawnParticle("a:air_pull", spawnPos);
        }, 4);
    }
}

export default move;