
export const earthRuntime = (player, PLAYER_DATA) => {
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
}