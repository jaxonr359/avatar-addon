import { MolangVariableMap } from "@minecraft/server";
import { calculateDistance, getEntitiesNearViewDirection, findDesireableTarget, delayedFunc, normalizeVector, traceLine } from "../../../../utils";

const map = new MolangVariableMap();

const arrowAimBot = (player, PLAYER_DATA) => {
	const playerLoc = player.location;
	const nearbyArrows = [...PLAYER_DATA.dimension.getEntities({ location: playerLoc, maxDistance: 100, type: "arrow" })];

	if (nearbyArrows.length === 0 && !PLAYER_DATA.holdingBow) return;

	let inactiveArrows = 0;
	for (const arrow of nearbyArrows) {
		const velocity = arrow.getVelocity();
		if (velocity.x == 0 && velocity.y == 0 && velocity.z == 0) {
			inactiveArrows += 1;
			continue;	
		}

		if (calculateDistance(playerLoc, arrow.location) < 6) arrow.addTag('pl');
		if (!arrow.hasTag('pl')) continue;
	}


	if (inactiveArrows === nearbyArrows.length && !PLAYER_DATA.holdingBow) return;

	const entities = getEntitiesNearViewDirection(player, 32, 6);
    const entity = findDesireableTarget(entities);

	if (!entity || entity.typeId === "minecraft:arrow") return;
	const targetLoc = entity.getHeadLocation();

	player.spawnParticle("a:aim_indicator", { x: targetLoc.x, y: targetLoc.y + 1.5, z: targetLoc.z });

	for (const arrow of nearbyArrows) {
		try {
			const velocity = arrow.getVelocity();
			if (velocity.x == 0 && velocity.y == 0 && velocity.z == 0) continue;

			arrow.clearVelocity();

			const tags = arrow.getTags();
			const locTag = tags.find(tag => tag.startsWith('loc_'));
			const oldLocArr = locTag ? locTag.split('_').slice(1).map(Number) : arrow.location;
			const oldLoc = { x: oldLocArr[0], y: oldLocArr[1], z: oldLocArr[2] };
			if (locTag) arrow.removeTag(locTag);

			const loc = arrow.location;
			arrow.addTag(`loc_${loc.x}_${loc.y}_${loc.z}`);
			
			const arrowPath = normalizeVector({ x: targetLoc.x - arrow.location.x, y: targetLoc.y - arrow.location.y, z: targetLoc.z - arrow.location.z }, 3);
			arrow.applyImpulse(arrowPath);
			PLAYER_DATA.dimension.spawnParticle("a:air_flutter", arrow.location);
			traceLine(player, oldLoc, arrow.location, 5, "a:air_blast_tiny");

			if (calculateDistance(arrow.location, targetLoc) < 2) {
				entity.applyDamage(8, { cause: "entityAttack", damagingEntity: player })
				arrow.kill();
			}
		} catch (error) {}
	}
}


export const airRuntime = (player, PLAYER_DATA) => {
	const skills = PLAYER_DATA.skills;
	if (skills === undefined) return;


	if (player.hasTag('inSpirit') && PLAYER_DATA.chi == 100) {
		const entity = player.dimension.getEntities({ type: 'a:spirit_player', tags: ['spiritId ' + player.id] })[0];
		if (entity) entity.triggerEvent('minecraft:despawn');

		player.sendMessage([{ text: '§c' }, { translate: 'elements.air.message.airspirit_fail_logout' }]);

		const tags = player.getTags();
		const locTag = tags.find(tag => tag.startsWith('spiritloc'));
		const loc = JSON.parse(locTag.split(' ')[1]);
		player.teleport(loc);

		const spiritTags = tags.filter(tag => tag.startsWith('spiritId'));
		const spiritLocTags = tags.filter(tag => tag.startsWith('spiritloc'));
		spiritTags.forEach(tag => player.removeTag(tag));
		spiritLocTags.forEach(tag => player.removeTag(tag));
		player.removeTag('inSpirit');
		
		const orginalGM = player.getTags().find(tag => tag.startsWith('orginalGM'));
        if (orginalGM) {
            const gameMode = orginalGM.split(' ')[1];
            player.setGameMode(gameMode);

            player.removeTag(orginalGM);
        } else {
            player.setGameMode('survival');
        }
	}



	if (skills.includes('whirlwind_redirection')) arrowAimBot(player, PLAYER_DATA);
		
	if (skills.includes('airflow') && (!player.getEffect("jump_boost") || !player.getEffect("speed"))) {
		player.addEffect("jump_boost", 20000000, { amplifier: 1, showParticles: false });
		player.addEffect("speed", 20000000, { amplifier: 1, showParticles: false });
	}

	if (!skills.includes('double_jump')) return;

	const DOUBLE_JUMP = PLAYER_DATA.doubleJumpOther;

	if (PLAYER_DATA.hasHitGround === undefined) {
		PLAYER_DATA.hasHitGround = true;
		PLAYER_DATA.canDash = true;
	}

	const ON_GROUND = player.isOnGround;
	if (ON_GROUND) {
		PLAYER_DATA.hasHitGround = true;
		PLAYER_DATA.canDash = true;
	}

	if (DOUBLE_JUMP && PLAYER_DATA.hasHitGround) {
		player.applyKnockback(0, 0, 0, 0.8);
		PLAYER_DATA.hasHitGround = false;

		try {
			map.setVector3("variable.plane", { x: 0.5, y: 10, z: 8 });
			PLAYER_DATA.dimension.spawnParticle("a:air_shockwave_dynamic", player.location, map);	
		} catch (error) {}

		PLAYER_DATA.dimension.playSound("avatar.air_woosh", player.location, { volume: 0.5, pitch: 2 + Math.random() * 0.2 })

		delayedFunc(player, () => player.addEffect("slow_falling", 15, { amplifier: 0, showParticles: false }), 15);
	}

	if (!skills.includes('wind_dash')) return;

	if (PLAYER_DATA.sneak && !PLAYER_DATA.hasHitGround && PLAYER_DATA.canDash) {
		PLAYER_DATA.canDash = false;

		const beforeLoc = player.location;
		PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", beforeLoc);
		const viewDirection = PLAYER_DATA.viewDir;
		player.applyKnockback(viewDirection.x, viewDirection.z, 8, 0);

		PLAYER_DATA.dimension.playSound("avatar.air_woosh", player.location, { volume: 0.5, pitch: 1.5 + Math.random() * 0.2 })

        delayedFunc(player, () => {
			player.applyKnockback(-viewDirection.x, -viewDirection.z, 3, 0);
			PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", player.location);

			traceLine(player, beforeLoc, player.location, 8, "a:air_flutter");
        }, 2);

		delayedFunc(player, () => player.addEffect("slow_falling", 15, { amplifier: 0, showParticles: false }), 15);
	}
}