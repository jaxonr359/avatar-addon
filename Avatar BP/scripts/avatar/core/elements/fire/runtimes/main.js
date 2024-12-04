
export const fireRuntime = (player, PLAYER_DATA) => {
	const skills = PLAYER_DATA.skills;
	if (skills === undefined) return;

	if (skills.includes('fast_footed') && (!player.getEffect("jump_boost") || !player.getEffect("speed"))) {
		player.addEffect("jump_boost", 20000000, { amplifier: 1, showParticles: false });
		player.addEffect("speed", 20000000, { amplifier: 1, showParticles: false });
	}

	if (skills.includes('firey_disposition') && !player.getEffect("fire_resistance")) {
		player.addEffect("fire_resistance", 20000000, { amplifier: 1, showParticles: false });
	}

	if (skills.includes('hot_blooded') && (
		player.getEffect("hunger") ||
		player.getEffect("weakness") ||
		player.getEffect("poison") ||
		player.getEffect("fatal_poison") ||
		player.getEffect("wither") ||
		player.getEffect("blindness") ||
		player.getEffect("instant_damage") ||
		player.getEffect("nausea"))) {
		player.removeEffect("hunger");
		player.removeEffect("weakness");
		player.removeEffect("poison");
		player.removeEffect("fatal_poison");
		player.removeEffect("wither");
		player.removeEffect("blindness");
		player.removeEffect("instant_damage");
		player.removeEffect("nausea");
	}
}