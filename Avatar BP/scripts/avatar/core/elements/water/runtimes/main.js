export const waterRuntime = (player, PLAYER_DATA) => {
    if (PLAYER_DATA && PLAYER_DATA.airStall) {
		if (PLAYER_DATA.timeInStall > 35) PLAYER_DATA.airStall = false;
		PLAYER_DATA.timeInStall++;
	
		player.applyKnockback(0, 0, 0, 0.07);

		if (PLAYER_DATA.stalledEntity.isValid()) {
            try {
              PLAYER_DATA.stalledEntity.applyKnockback(0, 0, 0, 0.07);  
            } catch (e) {
                PLAYER_DATA.airStall = false;
            }
		} else {
			PLAYER_DATA.airStall = false;
		}
	}

    if (PLAYER_DATA.skills.includes("waterwash")) {
        if (!PLAYER_DATA.lastTakenDamage) PLAYER_DATA.lastTakenDamage = Date.now();
        if (PLAYER_DATA.lastTakenDamage < Date.now() && PLAYER_DATA.waterLoaded > 0) {
            player.addEffect("resistance", 80, { amplifier: 3, showParticles: false });
        }
    }

    if (!PLAYER_DATA.skills.includes("water_jet_rush")) return;

    const speed = player.getEffect("speed");

    if (player.isSprinting) {
        PLAYER_DATA.sprintCounter ? PLAYER_DATA.sprintCounter++ : PLAYER_DATA.sprintCounter = 1;
    } else {
        PLAYER_DATA.sprintCounter = 0;
    }

    if (PLAYER_DATA.sprintCounter > 85) {
        const newAmplifier = Math.min(12, Math.floor(PLAYER_DATA.sprintCounter / 80));
        if (!speed || (speed.amplifier < newAmplifier && speed.duration < 79)) player.addEffect("speed", 80, { amplifier: newAmplifier, showParticles: false });

        const { x, y, z } = player.location;
        const blockBelow = PLAYER_DATA.dimension.getBlock({ x: x, y: y - 0.5, z: z });

        if (blockBelow && blockBelow.typeId === "minecraft:water") {
            const viewDir = PLAYER_DATA.viewDir;
            player.applyKnockback(viewDir.x, viewDir.z, 1, 0.05);
        }

        PLAYER_DATA.dimension.spawnParticle("a:water_outburst", player.location);
    }
}