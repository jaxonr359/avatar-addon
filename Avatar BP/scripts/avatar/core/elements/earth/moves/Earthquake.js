import { system, Player, MolangVariableMap } from '@minecraft/server'
import { calculateDistance, applyBendingDamage } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.earth.moves.earthquake.name' },
    description: { translate: 'elements.earth.moves.earthquake.description' },

    cost: 5,
    cooldown: 10,
    type: 'duration',

    id: 21,

    damage: {
        base: 4,
        multiplied: 2
    },

    skill_required: 'earthquake',

    start(player) { 
        player.dimension.playSound("avatar.earth_charge", player.location, { volume: 2, pitch: 1.5 });
    },
    end(player) {
        player.runCommand("stopsound @a[r=40] avatar.earth_charge");
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 5) return;

        PLAYER_DATA.cooldown = 1;

        PLAYER_DATA.dimension.spawnParticle("a:earthquake", player.location);
        player.runCommand(`camerashake add @s 0.6 0.1 positional`);

        const entities = [...player.dimension.getEntities({ location: player.location, maxDistance: 20, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        for (const entity of entities) {
            if (entity.location.y < player.location.y + 2) {
                applyBendingDamage(player, entity, 1, 0);
                entity.addEffect("slowness", 20, { amplifier: 1, showParticles: false });
            }
        }
    }
}

export default move;