import { world } from "@minecraft/server";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from '../../index.js';
import { updatePlayerMoveUsage, updateSubLevel } from '../../utils.js';
import { elements } from '../elements/import.js';
import { refreshWorldSettings } from '../scroll/adminSettings.js';

export const benderRuntime = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    if (!PLAYER_DATA) return;

    const SELECTED_SLOT_INDEX = player.selectedSlotIndex;
    if (PLAYER_DATA.elementMap.length === 0) return;

    let healthCurrentVal = 20;
    if (player.isValid()) {
        try {
            if (!PLAYER_DATA.health) PLAYER_DATA.health = player.getComponent("health");
    
            // If the player is dead, reset all their data and return
            if (!PLAYER_DATA.health || PLAYER_DATA.health.currentValue == 0) {
                // Weird bugs here if you access any player properties after they die
                // DO NOT put inputPermissions.movementEnabled = true; here, that will cause the player to respawn 
                // in the same spot they died, which is not what we want
                PLAYER_DATA.selectedChargeSlot = undefined;
                PLAYER_DATA.currentDurationMove = null;
                PLAYER_DATA.currentDurationMoveTimer = 0;
                PLAYER_DATA.charge = 0;
                PLAYER_DATA.doubleSneakTimer = 0;
                return;
            }
    
            healthCurrentVal = PLAYER_DATA.health.currentValue;
        } catch (error) {};
    }

    // Store the player's dimension before the move is activated
    PLAYER_DATA.dimension = player.dimension;
    PLAYER_DATA.viewDir = player.getViewDirection();

    const worldSettingsNotLoaded = Object.keys(WORLD_SETTINGS).length === 0;
    if (worldSettingsNotLoaded) {
        refreshWorldSettings();
    } else {
        if (!WORLD_SETTINGS.enabled) return;

        if (WORLD_SETTINGS.border) {
            const distanceXZ = Math.sqrt((player.location.x - WORLD_SETTINGS.centerloc.x) ** 2 + (player.location.z - WORLD_SETTINGS.centerloc.z) ** 2);
            const borderSize = WORLD_SETTINGS.bordersz;
    

            if (distanceXZ > borderSize + 50 || !PLAYER_DATA.dimension || (PLAYER_DATA.dimension.id === 'minecraft:nether' && distanceXZ > borderSize / 8 + 6)) {
                const centerLoc = WORLD_SETTINGS.centerloc;
                try {
                    const highestBlock = PLAYER_DATA.dimension.getTopmostBlock({ x: centerLoc.x, z: centerLoc.z });
                    if (!highestBlock) player.addEffect("slow_falling", 400, { amplifier: 0, showParticles: false });
                    player.teleport({ x: centerLoc.x, y: (highestBlock.y || 264) + 1, z: centerLoc.z }, { dimension: world.getDimension('minecraft:overworld') });
                } catch (error) {
                    player.teleport({ x: centerLoc.x, y: 264, z: centerLoc.z }, { dimension: world.getDimension('minecraft:overworld') });
                    player.addEffect("slow_falling", 1400, { amplifier: 0, showParticles: false });
                }
            } else if (distanceXZ > borderSize || (PLAYER_DATA.dimension.id === 'minecraft:nether' && distanceXZ > borderSize / 8)) {
                const knockbackX = WORLD_SETTINGS.centerloc.x - player.location.x;
                const knockbackZ = WORLD_SETTINGS.centerloc.z - player.location.z;
        
                player.applyKnockback(knockbackX, knockbackZ, 1, 0.2);
                player.sendMessage([{ text: '§c' }, { translate: 'status_message.boundary' }]);
            }
        }
    
        // No bending zones
        if (WORLD_SETTINGS.noBendingZones && WORLD_SETTINGS.noBendingZones.length > 0) {
            for (const zone of WORLD_SETTINGS.noBendingZones) {
                const distanceXZ = Math.sqrt((player.location.x - zone.c.x) ** 2 + (player.location.z - zone.c.z) ** 2);
                if (distanceXZ < zone.r) {
                    if (!PLAYER_DATA.noBendingZone && PLAYER_DATA.settings.showStatusMessages) player.sendMessage([{ text: '§7' }, { translate: 'status_message.no_bending_zone.enter' }]);
                    return PLAYER_DATA.noBendingZone = true;
                }
            }
    
            if (PLAYER_DATA.noBendingZone && PLAYER_DATA.settings.showStatusMessages) player.sendMessage([{ text: '§7' }, { translate: 'status_message.no_bending_zone.exit' }]);
            PLAYER_DATA.noBendingZone = false;
        } else {
            PLAYER_DATA.noBendingZone = undefined;
        }
    }

    // Combat log message
    PLAYER_DATA.combatTimer--;
    if (PLAYER_DATA.combatTimer < 1) {
        player.sendMessage([{ text: '§a' }, { translate: 'status_message.combat_timer_up' }]);
        PLAYER_DATA.combatTimer = undefined;
        player.setDynamicProperty("combat_timer", undefined);
    }

    // These skills are applied across all elements, so they are here
    const skills = PLAYER_DATA.skills;
    if (skills.includes('chi_infusion') && (!player.getEffect("regeneration"))) {
		player.addEffect("regeneration", 20000000, { amplifier: 0, showParticles: false });
	}

    if (skills.includes('warriors_spirit') && (!player.getEffect("strength"))) {
		player.addEffect("strength", 20000000, { amplifier: 0, showParticles: false });
	}

    // If the player has bending disabled, return
    if (!PLAYER_DATA.enabled || !PLAYER_DATA.settings.enabledBending) return;

    // Chi regeneration and cooldown
    // Basically just a sigmoid function that maps how much chi should be regenerated based on the player's current chi
    // Look sue me for these magic numbers, but they have no real meaning they just model the function I want!
    const MULTIPLIER = (skills.includes('chi_infusion_plus') && healthCurrentVal < 8) ? 3 : 2;
    const COOLDOWN_CHECK = PLAYER_DATA.cooldown === 0;
    const CHI_REGEN = 0.3 + 1.7 / (1 + Math.exp(-0.05 * (-40 + (PLAYER_DATA.chi) - (-0.2))));

    if (COOLDOWN_CHECK) PLAYER_DATA.chi += CHI_REGEN * MULTIPLIER * (worldSettingsNotLoaded ? 1 : WORLD_SETTINGS.chispd);

    // Overflow stuff
    // This is the combo reward system, where the player can reach an overflow state after a certain amount of consecutive hits
    const OVERFLOW = PLAYER_DATA.overflow;
    if (OVERFLOW > 0) {
        PLAYER_DATA.overflow--;
        PLAYER_DATA.chi += 5;
        PLAYER_DATA.waterLoaded = 6;
        const FACTOR = ((OVERFLOW - 1) / 120) * 8;
        PLAYER_DATA.combo = Math.max(FACTOR, 0);

        if (OVERFLOW === 1 && PLAYER_DATA.settings.showStatusMessages) {
            player.sendMessage([{ text: '§7' }, { translate: 'status_message.chi_overflow_exit' }]);
        }
    }

    if (PLAYER_DATA.combo > 0 && PLAYER_DATA.lastHit + 1000 < Date.now()) {
        PLAYER_DATA.combo = Math.max(PLAYER_DATA.combo - 0.26, 0);
        PLAYER_DATA.lastHit = Date.now();
    }

    if (PLAYER_DATA.chi > 100) PLAYER_DATA.chi = 100;

    // Chi can't go up while the player is in cooldown state
    if (PLAYER_DATA.cooldown > 0) PLAYER_DATA.cooldown--;

    // Water stuff
    if (PLAYER_DATA.inWater) PLAYER_DATA.waterLoaded = 6;

    // Runtimes
    for (const element of PLAYER_DATA.elementMap) {
        elements[element].runtime(player, PLAYER_DATA);
    }

    // Reused conditions
	const LEFT_CHECK = PLAYER_DATA.leftClick;
	const SNEAK_CHECK = PLAYER_DATA.sneak;
    const VIEW_DIRECTION = PLAYER_DATA.viewDir;
    const IS_JUMPING = player.isJumping;
    const ON_GROUND = player.isOnGround;

    // Double sneak
    const DOUBLE_SNEAK_TIMER_SETTING = PLAYER_DATA.settings.doubleSneakTimer;
    const DOUBLE_SNEAK_ACTIVE = (SNEAK_CHECK && PLAYER_DATA.doubleSneakTimer < DOUBLE_SNEAK_TIMER_SETTING - 1 && PLAYER_DATA.doubleSneakTimer > 0);    
    if (!DOUBLE_SNEAK_ACTIVE) {
        if (SNEAK_CHECK) PLAYER_DATA.doubleSneakTimer = DOUBLE_SNEAK_TIMER_SETTING;
        if (PLAYER_DATA.doubleSneakTimer > 0) PLAYER_DATA.doubleSneakTimer--;
    }

    if (!PLAYER_DATA.sneakTimer) PLAYER_DATA.sneakTimer = 0;
    if (SNEAK_CHECK) {
        PLAYER_DATA.sneakTimer++;
    } else {
        PLAYER_DATA.sneakTimer = 0;
    }

    // Double jump
    if (IS_JUMPING) PLAYER_DATA.isJumping = true;
    if (!IS_JUMPING && PLAYER_DATA.isJumping) PLAYER_DATA.doubleJump = true;

    if (PLAYER_DATA.isJumping && ON_GROUND) {
        PLAYER_DATA.isJumping = false;
        PLAYER_DATA.doubleJump = false;
    }

    // Right click
    if (PLAYER_DATA.rightClick > 0) PLAYER_DATA.rightClick--;
    
	// List of conditions for each action
	const DOUBLE_SNEAK = DOUBLE_SNEAK_ACTIVE;
	const SNEAK_PUNCH = SNEAK_CHECK && LEFT_CHECK;
	const RIGHT_CLICK = PLAYER_DATA.rightClick > 0 && PLAYER_DATA.rightClickSlot === SELECTED_SLOT_INDEX;
	const LOOK_UP_SNEAK = VIEW_DIRECTION.y > 0.95 && SNEAK_CHECK;
    const LOOK_DOWN_SNEAK = VIEW_DIRECTION.y < -0.95 && SNEAK_CHECK;
	const PUNCH = LEFT_CHECK;
    const LOOK_DOWN_PUNCH = VIEW_DIRECTION.y < -0.95 && LEFT_CHECK;
    const LOOK_UP_PUNCH = VIEW_DIRECTION.y > 0.95 && LEFT_CHECK;
    const DOUBLE_JUMP = IS_JUMPING && !ON_GROUND && PLAYER_DATA.doubleJump
    const SNEAK_JUMP = SNEAK_CHECK && IS_JUMPING;

    PLAYER_DATA.doubleJumpOther = DOUBLE_JUMP;

	// List of actions
	const ACTIONS = [DOUBLE_SNEAK, RIGHT_CLICK, SNEAK_PUNCH, PUNCH, LOOK_DOWN_PUNCH, LOOK_UP_SNEAK, LOOK_DOWN_SNEAK, LOOK_UP_PUNCH, DOUBLE_JUMP, SNEAK_JUMP];

    const MOVE = PLAYER_DATA.trueMoveset[SELECTED_SLOT_INDEX];
    const ACTIVATION_INDEX = PLAYER_DATA.bindings[SELECTED_SLOT_INDEX];
    const ACTIVATE_MOVE = ACTIONS[ACTIVATION_INDEX];

    // If the player switches slots while charging, cancel the charge
    if (PLAYER_DATA.selectedChargeSlot != undefined && PLAYER_DATA.selectedChargeSlot !== SELECTED_SLOT_INDEX) {
        PLAYER_DATA.trueMoveset[PLAYER_DATA.selectedChargeSlot].cancel(player);
        PLAYER_DATA.selectedChargeSlot = undefined;
        PLAYER_DATA.charge = 0;
    }

    // If the player is charging a move, activate it when they release the charge
    if (MOVE && PLAYER_DATA.selectedChargeSlot != undefined && (PLAYER_DATA.chi === 0 || (PLAYER_DATA.charge >= 30 && ACTIVATE_MOVE))) {
        try {
            MOVE.activate(player, PLAYER_DATA);
        } catch (error) {}

        updatePlayerMoveUsage(player, MOVE.name.translate);
        updateSubLevel(player, 40);

        PLAYER_DATA.cooldown = MOVE.cooldown;
        PLAYER_DATA.charge = 0;
        PLAYER_DATA.selectedChargeSlot = undefined;
        return;
    }

    if (ACTIVATE_MOVE && MOVE) {
        // So using the same slot while the move is active will cancel it
        if (PLAYER_DATA.currentDurationMove && PLAYER_DATA.currentDurationMove === MOVE && PLAYER_DATA.currentDurationMoveTimer > 10) {
            PLAYER_DATA.currentDurationMoveTimer = 0;
            PLAYER_DATA.cooldown = 5;
            PLAYER_DATA.currentDurationMove.end(player, PLAYER_DATA);
            PLAYER_DATA.currentDurationMove = null;

            return;
        };
    };

    if (ACTIVATE_MOVE && COOLDOWN_CHECK && MOVE && (PLAYER_DATA.chi >= MOVE.cost || MOVE.type === 'charge')) {
        PLAYER_DATA.doubleSneakTimer = 0;
        PLAYER_DATA.cooldown = 5;

        switch (MOVE.type) {
            case 'standard':
                try {
                    MOVE.activate(player, PLAYER_DATA);
                } catch (error) {}
                PLAYER_DATA.cooldown = MOVE.cooldown;
                PLAYER_DATA.chi -= MOVE.cost;

                updatePlayerMoveUsage(player, MOVE.name.translate);
                updateSubLevel(player, MOVE.cost);
                break;
            case 'duration':
                MOVE.start(player, PLAYER_DATA);
                PLAYER_DATA.currentDurationMove = MOVE;

                updatePlayerMoveUsage(player, MOVE.name.translate);
                break;
            case 'charge':
                PLAYER_DATA.chargeCost = MOVE.cost;
                PLAYER_DATA.selectedChargeSlot = SELECTED_SLOT_INDEX;
                break;
        }
    }

    // Charge the move
    if (PLAYER_DATA.selectedChargeSlot != undefined) {
        PLAYER_DATA.cooldown = 5;
        
        // Move charge up by MOVE.cost as long as the player has the chi to do so
        if (PLAYER_DATA.chi > 0) PLAYER_DATA.charge = Math.min(PLAYER_DATA.charge + PLAYER_DATA.chargeCost, 200);
        PLAYER_DATA.chi = Math.max(PLAYER_DATA.chi - PLAYER_DATA.chargeCost, 0);

        MOVE.charge(player, PLAYER_DATA.charge);
    }

    // Call the activate function of the current duration move every tick until it ends
    if (PLAYER_DATA.currentDurationMove) {
        const MOVE_STYLE = PLAYER_DATA.moveset[SELECTED_SLOT_INDEX].style;
        const NO_WATER = (PLAYER_DATA.waterLoaded < 0.1 && MOVE_STYLE === 'water')
        if (NO_WATER) player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);

        if (PLAYER_DATA.chi < PLAYER_DATA.currentDurationMove.cost || NO_WATER) {
            PLAYER_DATA.currentDurationMoveTimer = 0;
            PLAYER_DATA.cooldown = 5;
            PLAYER_DATA.currentDurationMove.end(player, PLAYER_DATA);
            return PLAYER_DATA.currentDurationMove = null;
        }

        PLAYER_DATA.currentDurationMoveTimer++;
        if (PLAYER_DATA.currentDurationMoveTimer > 10) {
            PLAYER_DATA.chi -= PLAYER_DATA.currentDurationMove.cost;
        }

        try {
            PLAYER_DATA.currentDurationMove.activate(player, PLAYER_DATA);
        } catch (error) {}
    }
}