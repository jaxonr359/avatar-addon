
export const nonbenderRuntime = (player, PLAYER_DATA) => {
	const skills = PLAYER_DATA.skills;
	if (skills === undefined) return;

	if (skills.includes('fast_footed') && (!player.getEffect("jump_boost") || !player.getEffect("speed"))) {
		player.addEffect("jump_boost", 20000000, { amplifier: 1, showParticles: false });
		player.addEffect("speed", 20000000, { amplifier: 1, showParticles: false });
	}

	if (PLAYER_DATA.health && skills.includes('adrenaline') && PLAYER_DATA.health.currentValue < 8) {
		player.addEffect("strength", 60, { amplifier: 1, showParticles: false });
	}

	if (PLAYER_DATA.health && skills.includes('perseverance') && PLAYER_DATA.health.currentValue < 8) {
		player.addEffect("resistance", 60, { amplifier: 1, showParticles: false });
	}
}