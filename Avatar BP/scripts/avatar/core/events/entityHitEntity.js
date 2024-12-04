import { Player, MolangVariableMap } from "@minecraft/server";
import { calcVectorOffset, createShockwave, enterCombatMode, spawnTrail } from "../../utils.js";

import { PLAYER_DATA_MAP } from "../../index.js";

const map = new MolangVariableMap();

export const entityHitEntity = (eventData) => {
    // Properties from class
    let { hitEntity, damagingEntity } = eventData;
	
    // If it's not a player who did the hit then ignore
    if (!(damagingEntity instanceof Player)) return;

	const PLAYER_DATA = PLAYER_DATA_MAP[damagingEntity.id];
	if (!PLAYER_DATA) return;

	// Air stall
	if (PLAYER_DATA.airStall) {
        PLAYER_DATA.airStall = false;
        const viewDir = PLAYER_DATA.viewDir;
        const directedMap = map;
        directedMap.setVector3("variable.plane", viewDir);
        damagingEntity.dimension.spawnParticle("a:block_indicator", calcVectorOffset(damagingEntity, 0, 0, 1, viewDir, damagingEntity.getHeadLocation()), directedMap);
        createShockwave(damagingEntity, damagingEntity.location, 6, 5, 0);
        const horizontal = Math.sqrt(viewDir.x ** 2 + viewDir.z ** 2);
        hitEntity.applyKnockback(viewDir.x, viewDir.z, horizontal*8, viewDir.y*3);
        damagingEntity.runCommandAsync("camerashake add @a[r=8] 1 0.2 positional");
		PLAYER_DATA.dimension.playSound("avatar.debris", damagingEntity.location, { volume: 3, pitch: 1 });
		damagingEntity.runCommand(`stopsound @s avatar.swing`);
		spawnTrail(hitEntity, 10);
    }

	// If it's not a player who was hit then ignore
	if (!(hitEntity instanceof Player)) return;

	// Chi blocking
	if (PLAYER_DATA.skills.includes("chi_blocking")) {
		PLAYER_DATA.combo = Math.min(PLAYER_DATA.combo + 1, 8);
		if (PLAYER_DATA.combo > 7.9) {
			PLAYER_DATA.combo = 0;

			hitEntity.addEffect("slowness", 120, { amplifier: 1, showParticles: false });
			hitEntity.addEffect("weakness", 120, { amplifier: 1, showParticles: false });
		
			const viewDir = PLAYER_DATA.viewDir;
			const directedMap = map;
			directedMap.setVector3("variable.plane", viewDir);
			damagingEntity.dimension.spawnParticle("a:block_indicator", calcVectorOffset(damagingEntity, 0, 0, 1, viewDir, damagingEntity.getHeadLocation()), directedMap);
			damagingEntity.dimension.playSound("avatar.perfect_block", damagingEntity.location, { volume: 3, pitch: 1 });

			damagingEntity.sendMessage({rawtext: [{ text: '§7' }, { translate: "status_message.chi_blocked_attacker" }]});
			hitEntity.sendMessage({rawtext: [{ text: '§7' }, { translate: "status_message.chi_blocked_target" }]});

			const TARGET_DATA = PLAYER_DATA_MAP[hitEntity.id];
			if (!TARGET_DATA) return;

			TARGET_DATA.combo = 0;
			TARGET_DATA.chi = 0;
			TARGET_DATA.cooldown = 120;
		}
	}

	enterCombatMode(damagingEntity, hitEntity);
}