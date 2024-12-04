
import { calcVectorOffset, applyBendingDamage, traceLine } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.nonbender.moves.boomerang.name' },
    description: { translate: 'elements.nonbender.moves.boomerang.description' },

    cost: 2.4,
    cooldown: 60,
    type: 'duration',

    id: 52,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'boomerang',

    start(player, PLAYER_DATA) {
        PLAYER_DATA.reflectDamage = true;
    },
    end(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 60;
        PLAYER_DATA.reflectDamage = null;
    },
    activate(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 60;
        PLAYER_DATA.dimension.spawnParticle("a:shield", player.location);
    }
}

export default move;