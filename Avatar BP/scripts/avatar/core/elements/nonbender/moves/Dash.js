import { delayedFunc } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.nonbender.moves.dash.name' },
    description: { translate: 'elements.nonbender.moves.dash.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 53,

    damage: {
        base: 2,
        multiplied: 6
    },

    skill_required: 'dash',

    activate(player, PLAYER_DATA) {
        const beforeLoc = player.location;
		PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", beforeLoc);
		const viewDirection = PLAYER_DATA.viewDir;
		player.applyKnockback(viewDirection.x, viewDirection.z, 3, 0.5);
		PLAYER_DATA.dimension.playSound("avatar.air_woosh", player.location, { volume: 0.5, pitch: 1.5 + Math.random() * 0.2 })
		delayedFunc(player, () => player.addEffect("slow_falling", 15, { amplifier: 0, showParticles: false }), 15);
    }
}

export default move;