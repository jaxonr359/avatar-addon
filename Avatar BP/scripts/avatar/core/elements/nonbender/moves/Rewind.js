
import { calcVectorOffset, applyBendingDamage, traceLine } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.nonbender.moves.rewind.name' },
    description: { translate: 'elements.nonbender.moves.rewind.description' },

    cost: 1.6,
    cooldown: 10,
    type: 'duration',

    id: 54,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'rewind',

    start(player, PLAYER_DATA) {
        PLAYER_DATA.saveLocation = player.location;
        
        if (PLAYER_DATA.health) {
            PLAYER_DATA.saveHealth = PLAYER_DATA.health.currentValue;
        }
    },
    end(player, PLAYER_DATA) {
        PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", player.location);
        player.teleport(PLAYER_DATA.saveLocation, { dimension: PLAYER_DATA.dimension });
        PLAYER_DATA.saveLocation = null;
        PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", player.location);

        if (PLAYER_DATA.saveHealth && PLAYER_DATA.health) {
            PLAYER_DATA.health.setCurrentValue(PLAYER_DATA.saveHealth);
            PLAYER_DATA.saveHealth = null;
        }
    },
    activate(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 2;
        PLAYER_DATA.dimension.spawnParticle("a:air_flutter", player.location);
    }
}

export default move;