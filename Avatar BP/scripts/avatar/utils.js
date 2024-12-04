import { system, world, Player, MolangVariableMap } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "./index.js";

import { chooseBendingMenu } from "./core/scroll/chooseBending.js";
import { chooseSlotsMenu } from "./core/scroll/chooseSlots.js";
import { showSkillTreeMenu } from "./core/scroll/skillTree.js";
import { chooseSettingsMenu } from "./core/scroll/chooseSettings.js";
import { statsInfoMenu } from "./core/scroll/statsInfo.js";
import { teamsMenu } from "./core/scroll/teams.js";
import { clear } from "./core/player/hud.js";

const map = new MolangVariableMap();

export const autoSmeltItems = {
    "minecraft:cod": "minecraft:cooked_cod",
    "minecraft:beef": "minecraft:cooked_beef",
    "minecraft:chicken": "minecraft:cooked_chicken",
    "minecraft:porkchop": "minecraft:cooked_porkchop",
    "minecraft:rabbit": "minecraft:cooked_rabbit",
    "minecraft:mutton": "minecraft:cooked_mutton",
    "minecraft:salmon": "minecraft:cooked_salmon",
	"minecraft:raw_copper": "minecraft:copper_ingot",
	"minecraft:raw_iron": "minecraft:iron_ingot",
	"minecraft:raw_gold": "minecraft:gold_ingot",
	"minecraft:iron_ore": "minecraft:raw_iron",
    "minecraft:gold_ore": "minecraft:raw_gold",
    "minecraft:diamond_ore": "minecraft:diamond",
    "minecraft:emerald_ore": "minecraft:emerald",
	"minecraft:copper_ore": "minecraft:raw_copper",
    "minecraft:quartz_ore": "minecraft:quartz",
	"minecraft:nether_gold_ore": "minecraft:gold_nugget",
    "minecraft:coal_ore": "minecraft:coal",
    "minecraft:lapis_ore": "minecraft:lapis_lazuli",
    "minecraft:redstone_ore": "minecraft:redstone",
	"minecraft:deepslate_coal_ore": "minecraft:coal",
    "minecraft:deepslate_iron_ore": "minecraft:raw_iron",
    "minecraft:deepslate_gold_ore": "minecraft:raw_gold",
    "minecraft:deepslate_diamond_ore": "minecraft:diamond",
    "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",
    "minecraft:deepslate_redstone_ore": "minecraft:redstone",
    "minecraft:deepslate_emerald_ore": "minecraft:emerald",
	"minecraft:deepslate_copper_ore": "minecraft:raw_copper",
    "minecraft:stick": "torch"
}

export const groundBlocks = new Set([
	"minecraft:dirt",
	"minecraft:grass_block",
    "minecraft:podzol",
	"minecraft:mycelium",
	"minecraft:grass_path",
	"minecraft:gravel",
	"minecraft:sandstone",
    "minecraft:red_sandstone",
	"minecraft:stone",
    "minecraft:granite",
    "minecraft:polished_granite",
    "minecraft:diorite",
    "minecraft:polished_diorite",
    "minecraft:andesite",
    "minecraft:polished_andesite",
	"minecraft:sand",
	"minecraft:obsidian",
	"minecraft:blackstone",
	"minecraft:mud",
	"minecraft:packed_mud",
	"minecraft:end_stone",
	"minecraft:netherrack",
	"minecraft:deepslate",
    "minecraft:cobble",
    "minecraft:cobblestone",
	"minecraft:cobbled_deepslate",
    "minecraft:cobbled_deepslate_double_slab",
    "minecraft:mossy_cobblestone",
	"minecraft:farmland",
	"minecraft:clay",
	"minecraft:crimson_nylium",
	"minecraft:warped_nylium",
	"minecraft:crying_obsidian",
    "minecraft:hardened_clay",
    "minecraft:stained_hardened_clay",
    "minecraft:black_glazed_terracotta",
    "minecraft:blue_glazed_terracotta",
    "minecraft:brown_glazed_terracotta",
    "minecraft:cyan_glazed_terracotta",
    "minecraft:gray_glazed_terracotta",
    "minecraft:green_glazed_terracotta",
    "minecraft:light_blue_glazed_terracotta",
    "minecraft:lime_glazed_terracotta",
    "minecraft:magenta_glazed_terracotta",
    "minecraft:orange_glazed_terracotta",
    "minecraft:pink_glazed_terracotta",
    "minecraft:purple_glazed_terracotta",
    "minecraft:red_glazed_terracotta",
    "minecraft:silver_glazed_terracotta",
    "minecraft:white_glazed_terracotta",
    "minecraft:yellow_glazed_terracotta",
    "minecraft:farmland",
    "minecraft:basalt",
    "minecraft:polished_basalt",
    "minecraft:smooth_basalt",
    "minecraft:soul_sand",
    "minecraft:soul_soil",
    "minecraft:nether_brick",
    "minecraft:calcite",
    "minecraft:moss_block",
    "minecraft:mud",
    "minecraft:tuff",
    "minecraft:dripstone_block",
    "minecraft:red_sand",
    "minecraft:gravel",
    "minecraft:suspicious_sand",
    "minecraft:suspicious_gravel",
    "minecraft:packed_mud",
    "minecraft:mud_bricks",
    "minecraft:cracked_deepslate_bricks",
    "minecraft:cracked_deepslate_tiles",
    "minecraft:deepslate_tiles",
    "minecraft:cracked_nether_bricks",
    "minecraft:cracked_polished_blackstone_bricks",
    "minecraft:tuff_bricks",
    "minecraft:deepslate_bricks",
    "minecraft:stonebrick",
    "minecraft:chiseled_tuff_bricks",
    "minecraft:amethyst_block",
]);

export const mobTypes = new Set([
    "minecraft:zombie",
    "minecraft:skeleton",
    "minecraft:spider",
    "minecraft:cave_spider",
    "minecraft:creeper",
    "minecraft:enderman",
    "minecraft:witch",
    "minecraft:husk",
    "minecraft:stray",
    "minecraft:zombified_piglin",
    "minecraft:blaze",
    "minecraft:ghast",
    "minecraft:magma_cube",
    "minecraft:slime",
    "minecraft:phantom",
    "minecraft:drowned",
    "minecraft:guardian",
    "minecraft:elder_guardian",
    "minecraft:shulker",
    "minecraft:ender_dragon",
    "minecraft:wither",
    "minecraft:evoker",
    "minecraft:vindicator",
    "minecraft:vex",
    "minecraft:illager_beast",
    "minecraft:pillager",
    "minecraft:ravager",
    "minecraft:hoglin",
    "minecraft:piglin",
    "minecraft:strider",
    "minecraft:zoglin",
    "minecraft:strider",
    "minecraft:zombie_villager",
    "minecraft:zombie_horse",
    "minecraft:skeleton_horse",
    "minecraft:husk",
    "minecraft:drowned",
    "minecraft:phantom",
    "minecraft:wither_skeleton",
    "minecraft:endermite",
    "minecraft:guardian",
    "minecraft:elder_guardian",
    "minecraft:shulker",
    "minecraft:illusioner",
    "minecraft:zombie_villager_v2",
    "minecraft:evocation_illager",
    "minecraft:vindicator_v2",
    "minecraft:illusioner",
    "minecraft:piglin_brute"
]);

export const animalTypes = new Set([
    "minecraft:cow",
    "minecraft:mooshroom",
    "minecraft:pig",
    "minecraft:sheep",
    "minecraft:chicken",
    "minecraft:horse",
    "minecraft:donkey",
    "minecraft:wolf",
    "minecraft:ocelot",
    "minecraft:parrot",
    "minecraft:rabbit",
    "minecraft:fox",
    "minecraft:polar_bear",
    "minecraft:bee",
    "minecraft:cat",
    "minecraft:cod",
    "minecraft:salmon",
    "minecraft:tropical_fish",
    "minecraft:pufferfish",
    "minecraft:squid",
    "minecraft:bat",
    "minecraft:axolotl",
    "minecraft:glow_squid",
    "minecraft:goat",
    "minecraft:moobloom",
    "minecraft:wandering_trader",
    "minecraft:panda",
    "minecraft:trader_llama",
    "minecraft:llama",
    "minecraft:snowball",
]);

export const conductiveBlocks = new Set([
    "minecraft:iron_block",
    "minecraft:gold_block",
    "minecraft:copper_block",
    "minecraft:netherite_block",
    "minecraft:water",
    "minecraft:iron_bars",
    "minecraft:anvil",
    "minecraft:chipped_anvil",
    "minecraft:damaged_anvil",
    "minecraft:chain",
    "minecraft:hopper",
    "minecraft:dispenser",
    "minecraft:dropper",
    "minecraft:blast_furnace",
    "minecraft:furnace",
    "minecraft:cauldron",
    "minecraft:lightning_rod",
    "minecraft:iron_door",
    "minecraft:iron_trapdoor",
    "minecraft:iron_rail",
    "minecraft:detector_rail",
    "minecraft:activator_rail",
    "minecraft:heavy_weighted_pressure_plate",
    "minecraft:bell"
]);

/**
 * Delays a function a certain number of ticks.
 * @param {Player} player The player entity the function will run at.
 * @param {Function} func The function ran after the delay.
 * @param {number} tickDelay The number of ticks delayed for. Default 1.
 */
export function delayedFunc(player, func, tickDelay = 1) {
    system.runTimeout(() => {
        try {
            func(player);
        } catch (error) {
            console.warn(`Error in delayed function: ${error}`);
        }
    }, tickDelay);
};

/**
 * Calculates the magnitude of a Vector3.
 * @param {Vector3} entityPosition - The Vector3 input.
 * @returns {number} The magnitude of the vector.
 */
export function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
};

/**
 * Normalizes the given vector and scales it by the factor `s`.
 * @param {Vector3} vector - The 3D vector to normalize.
 * @param {number} s - The scale factor to apply to the normalized vector.
 * @returns {Vector3} The normalized and scaled vector.
 */
export function normalizeVector (vector,s) {
    let l = Math.hypot(vector.x,vector.y,vector.z)
    return {
        x: s * (vector.x/l),
        y: s * (vector.y/l),
        z: s * (vector.z/l)
    }
}

/**
 * Finds a location based on their view direction and the scaling factors from the players current position, the same as ^^^ in commands.
 * @param {object} player - The player object to base the view direction and starting position on.
 * @param {number} xf - The scaling factor for the x direction.
 * @param {number} yf - The scaling factor for the y direction.
 * @param {number} zf - The scaling factor for the z direction.
 * @returns {{x: number, y: number, z: number}} The transformed location.
 */
export function calcVectorOffset (player, xf, yf, zf, d = player.getViewDirection(), l = player.location) {
    let m = Math.hypot(d.x, d.z);
    let xx = normalizeVector({
        x: d.z,
        y: 0,
        z: -d.x
    }, xf);
    let yy = normalizeVector({
        x: (d.x / m) * -d.y,
        y: m,
        z: (d.z / m) * -d.y
    }, yf);
    let zz = normalizeVector(d, zf);

    return {
        x: l.x + xx.x + yy.x + zz.x,
        y: l.y + xx.y + yy.y + zz.y,
        z: l.z + xx.z + yy.z + zz.z
    };
}

/**
 * Calculates the distance between an position and another position.
 * @param {Vector3} entityPosition - The position of the entity as a Vector3.
 * @param {Vector3} forceSourcePosition - The position of the force source as a Vector3.
 * @param {Vector3} forceMagnitude - The magnitude of the force to be applied.
 * @returns {Vector3} The knockback vector as a Vector3.
 */
export function calculateDistance(posA, posB) {
    let direction = {
        x: posA.x - posB.x,
        y: posA.y - posB.y,
        z: posA.z - posB.z
    };
    return magnitude(direction);
}

/**
 * Calculates the knockback vector based on an entity's position, a force source position, and the force magnitude.
 * @param {Vector3} entityPosition - The position of the entity as a Vector3.
 * @param {Vector3} forceSourcePosition - The position of the force source as a Vector3.
 * @param {Vector3} forceMagnitude - The magnitude of the force to be applied.
 * @returns {Vector3} The knockback vector as a Vector3.
 */
export function calculateKnockbackVector(entityPosition, pusherPosition, forceMagnitude) {
    let direction = {
        x: entityPosition.x - pusherPosition.x,
        y: entityPosition.y - pusherPosition.y,
        z: entityPosition.z - pusherPosition.z
    };

    let distance = magnitude(direction);

    if (!forceMagnitude) forceMagnitude = distance;
  
    // Normalize the direction vector so it has a magnitude of 1
    direction = {
        x: direction.x / distance,
        y: direction.y / distance,
        z: direction.z / distance
    };
  
    // Scale the direction vector by the force magnitude to get the final knockback vector
    let knockback = {
        x: direction.x * forceMagnitude,
        y: direction.y * forceMagnitude,
        z: direction.z * forceMagnitude
    };
  
    return knockback;
}

export const getBendingResistance = (entity) => {
    try {
        const armorSlots = ["Head", "Chest", "Legs", "Feet"]
        let total = 0;
        for (const slotName of armorSlots) {
            const item = entity.getComponent('minecraft:equippable').getEquipment(slotName);

            if (item) {
                const enchantable = item.getComponent('minecraft:enchantable');
                if (!enchantable) continue;
                const bending_resistance = enchantable.getEnchantment('minecraft:projectile_protection');
                if (!bending_resistance) continue;

                total += bending_resistance.level;
            }
        }

        return (total / 16) * 0.90;
    } catch (error) {
        return 1;
    }
}

export const enterCombatMode = (player, target) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const TARGET_DATA = PLAYER_DATA_MAP[target.id];

    if (!PLAYER_DATA.combatTimer) PLAYER_DATA.combatTimer = 600;
    if (!TARGET_DATA.combatTimer) TARGET_DATA.combatTimer = 600;

    player.setDynamicProperty("combat_timer", PLAYER_DATA.combatTimer);
    target.setDynamicProperty("combat_timer", TARGET_DATA.combatTimer);

    player.sendMessage([{ text: '§c' }, { translate: 'status_message.combat_timer_down' }]);
    target.sendMessage([{ text: '§c' }, { translate: 'status_message.combat_timer_down' }]);
}

/**
 * Checks if a ray is clear from the start to end position.
 * @param {Player} player The player object used for dimension and particles.
 * @param {Vector3} start The starting position of the ray.
 * @param {Vector3} end The ending position of the ray.
 * @returns {boolean} True if the ray is clear, false if it is obstructed.
 */
export const isRayClear = (player, start, end) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    if (!PLAYER_DATA) return false;

    // Get the view direction from start position to end position
    const viewDir = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    };

    const magnitude = Math.sqrt(viewDir.x ** 2 + viewDir.y ** 2 + viewDir.z ** 2);

    // Check if the ray is clear
    const block = PLAYER_DATA.dimension.getBlockFromRay(start, viewDir, { maxDistance: magnitude, includePassableBlocks: false, includeLiquidBlocks: false });
    return !block;
}

const damageBypass = [
    "minecraft:item",
    "minecraft:xp_orb",
    "minecraft:painting",
    "minecraft:leash_knot",
    "minecraft:armor_stand",
];

export function applyBendingDamage (player, target, damage, knockback, bypass = false, setOnFire = false) {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    let trueDamage = damage;
    const damageCause = bypass ? "override" : "entityAttack";

    const playerViewDir = PLAYER_DATA.viewDir;
    if (target.hasTag("bending_dmg_off")) return false;

    if (target instanceof Player) {
        // Player blocking checks and other stuff here
        const TARGET_DATA = PLAYER_DATA_MAP[target.id];        

        // Team friendly fire check
        // Before reflect damage check
        if (PLAYER_DATA.teamId && TARGET_DATA.teamId && TARGET_DATA.teamId === PLAYER_DATA.teamId) {
            const team = world.getDynamicProperty(`team_${PLAYER_DATA.teamId}`);
            const parsedTeam = JSON.parse(team);
            if (parsedTeam && !parsedTeam.settings.friendlyFire) return false;
        }

        // Reflect damage check
        // Before blocking and invincible check
        if (TARGET_DATA.reflectDamage) {
            const reflectDamage = player.applyDamage(damage, { cause: damageCause, damagingEntity: target });
            if (reflectDamage) {
                target.sendMessage([{ text: '§7' }, { translate: 'elements.nonbender.message.boomerang_success' }]);
                return false;
            }
        }

        // Invincible check        
        if (TARGET_DATA.invincible) return false;

        // Block check
        const target_skills = TARGET_DATA.skills;
        if (TARGET_DATA.sneakTimer > 2 && TARGET_DATA.sneakTimer < 6 && (!TARGET_DATA.block_cooldown || TARGET_DATA.block_cooldown < Date.now())) {
            const viewDir = TARGET_DATA.viewDir;
            const directedMap = map;
            directedMap.setVector3("variable.plane", viewDir);
            TARGET_DATA.dimension.spawnParticle("a:block_indicator", calcVectorOffset(target, 0, 0, 0.7, viewDir, target.getHeadLocation()), directedMap);
            TARGET_DATA.dimension.playSound("avatar.perfect_block", target.location, { volume: 3, pitch: 1 });
            TARGET_DATA.block_cooldown = Date.now() + 1000;

            target.playAnimation("animation.air.push");

            player.sendMessage([{ text: '§7' }, { translate: 'status_message.block.perfect.blocked' }]);
            target.sendMessage([{ text: '§7' }, { translate: 'status_message.block_perfect.blocker' }]);

            target.addEffect("resistance", 60, { amplifier: 255, showParticles: true });
            target.addEffect("regeneration", 60, { amplifier: 3, showParticles: true });

            if (target_skills.includes('neutral_jing')) TARGET_DATA.chi = Math.min(100, TARGET_DATA.chi + 50);

            return false;
        }

        // Bending resistance checks
        if (target_skills.includes('bending_resistance_plus')) {
            if (damage < 5) damage = 0;
            damage *= 0.7;
            trueDamage *= 0.7;
        } else if (target_skills.includes('bending_resistance')) {
            damage *= 0.7;
            trueDamage *= 0.7;
        }

        // Bending resistance armor checks
        const resistance = (1 - getBendingResistance(target));
        damage *= resistance;
        trueDamage *= resistance;

        enterCombatMode(player, target);
    } else {
        damage = damage * 2.5;
    }


    const clearLineOfSight = isRayClear(player, player.location, target.location) || isRayClear(player, player.getHeadLocation(), target.location);
    const wasDamageable = !damageBypass.includes(target.typeId) && clearLineOfSight;

    if (wasDamageable) {
        if (PLAYER_DATA.overflow === 0 && PLAYER_DATA.lastHit < Date.now() + 1300) {
            PLAYER_DATA.combo += Math.min(3, Math.max(1, trueDamage / 10));
            if (PLAYER_DATA.combo > 8) PLAYER_DATA.combo = 8;

            PLAYER_DATA.lastHit = Date.now() + 1500;   
        }

        if (PLAYER_DATA.combo > 7 && PLAYER_DATA.overflow === 0) {
            PLAYER_DATA.combo = 8.5;
            PLAYER_DATA.overflow = 125; // 20 ticks = 1 second, 125 = 6.25 seconds
            if (PLAYER_DATA.settings.showStatusMessages) player.sendMessage([{ text: '§7' }, { translate: 'status_message.chi_overflow_enter' }]);

            player.addEffect("speed", 125, { amplifier: 2, showParticles: false });
            player.addEffect("resistance", 125, { amplifier: 1, showParticles: false });
            player.runCommand("camerashake add @s 0.05 6 positional");
        } else if (PLAYER_DATA.overflow > 0) {
            damage *= 1.25;
            trueDamage *= 1.25;
        }

        const skills = PLAYER_DATA.skills;
        if (skills.includes('warriors_spirit_plus')) {
            damage *= 1.15;
            trueDamage *= 1.15;
        }
    }

    // Debug message to display damage dealt
    if (PLAYER_DATA.settings.showDamageDebug && Date.now() > PLAYER_DATA.lastChatMsg) {
        PLAYER_DATA.lastChatMsg = Date.now() + 50;
        player.sendMessage([{ text: '§7' }, { translate: 'debug.message.damage', with: [damage.toFixed(1), (trueDamage).toFixed(1)] }]);
    }

    if (wasDamageable) target.applyDamage(damage, { cause: damageCause, damagingEntity: player});
    if (setOnFire) target.setOnFire(5, true);

    if (knockback === 0) return wasDamageable;
    if (!clearLineOfSight) return false;

    try {
        target.applyKnockback(playerViewDir.x, playerViewDir.z, knockback, knockback * 0.15);
    } catch (error) {
        try {
            target.applyImpulse({ x: playerViewDir.x * 0.01 * knockback, y: 0.01 * knockback, z: playerViewDir.z * 0.01 * knockback });
        } catch (error) {}
    }
};

export const getEntitiesNearViewDirection = (player, rayDistance = 100, upper = 3, scaleFactor = 0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const viewDir = PLAYER_DATA.viewDir;

    const totalEntities = [];
    for (let i = 0; i < rayDistance; i++) {
        const pos = calcVectorOffset(player, 0, 0, i, viewDir);

        // Really interesting reverse falloff function that I came up with to check for entities
        // The idea is that the farther away the entity is, the harder it is to hit it so we should expand the detection radius as we go
        const sigmoidFalloff = 1 + upper / (1 + 2**(-i+5)) + scaleFactor;

        // Check if we hit an entity
        const entities = player.dimension.getEntities({ location: pos, maxDistance: sigmoidFalloff, excludeNames: [player.name], excludeTags: ["bending_dmg_off"] });
        if (entities.length > 0) {
            for (const entity of entities) {
                if (!totalEntities.find(e => e.id === entity.id)) totalEntities.push(entity);
            }
        }
    }

    return totalEntities;
}

/**
 * Finds the best entity to target out of a group of entities, based on their types.
 * @param {Array} entities The entities to choose from.
 * @returns {Entity} The best entity to target.
 */
export const findDesireableTarget = (entities) => {
    if (entities.length === 0) return undefined;

    // Order: Players, Mobs, Animals, Items
    let target = entities.find(entity => entity instanceof Player);
    if (target) return target;

    target = entities.find(entity => mobTypes.has(entity.typeId));
    if (target) return target;

    target = entities.find(entity => animalTypes.has(entity.typeId));
    if (target) return target;

    return undefined;
};

export const findMultipleDesireableTargets = (entities, length, excludeItems = false) => {
    if (entities.length === 0) return undefined;

    // Order: Players, Mobs, Animals, Items
    let targets = entities.filter(entity => entity instanceof Player);
    if (targets.length >= length) return targets.slice(0, length);

    targets = entities.filter(entity => mobTypes.has(entity.typeId));
    if (targets.length >= length) return targets.slice(0, length);

    targets = entities.filter(entity => animalTypes.has(entity.typeId));
    if (targets.length >= length) return targets.slice(0, length);

    if (excludeItems) entities = entities.filter(entity => !damageBypass.includes(entity.typeId));

    return entities.slice(0, length);
};

/**
 * Creates a shockwave that does damage to all entities near the location and applies knockback, both damage and knockback increase via distance to the origination point.
 * @param {Player} player The player object that the shockwave will originate from, and who is immune.
 * @param {object} location The position the shockwave will spawn from.
 * @param {number} strength The power of the shockwave
 * @param {number} range The range of the shockwave that entities can be affected by, as damage smooths at the outer rim.
 * @param {number | undefined} knockback The additional multiplier for the knockback that is using the shockwave
 * @param {boolean | undefined} setOnFire Whether or not to set entities on fire.
 */
export function createShockwave(player, location, strength, range, knockback = 1, setOnFire = false) {
    // Create the needed variables for kb and pos
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const entities = PLAYER_DATA.dimension.getEntities({ location: location, maxDistance: range, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] });

    // Loop through all nearby entities (not items though)
    entities.forEach(entity => {
        // Calculate damage
        const kbIntensity = knockback / (1 + Math.exp(-5 * (Math.ceil(calculateDistance(entity.location, location)) - 0.5)));
        const kbVector = calculateKnockbackVector(entity.location, location, kbIntensity/2);

        // Apply damage and knockback
        const appliedDamage = applyBendingDamage(player, entity, strength, 0, false, setOnFire);
        if (!appliedDamage) return;

        // Apply knockback
        try {
            entity.applyKnockback(kbVector.x, kbVector.z, kbIntensity * 0.25, kbIntensity * 0.05);
        } catch (error) {
            const kbItem = normalizeVector(kbVector, kbIntensity * 0.3);
            try { entity.applyImpulse(kbItem); } catch (error) {}
        }
    });
};

/**
 * Applies damage to an entity based on the damage type and amount.
 * @param {Player} player The player object used for dimension and particles.
 * @param {Vector3} startPoint The position the particles will originate from.
 * @param {Vector3} endPoint The position the particles will end at.
 * @param {number} numOfPoints The number of particles in between the start and end points.
 * @param {string} particle The particle to spawn, or false to not spawn particles and return vector3 positions.
 */
export function traceLine(player, startPoint, endPoint, numOfPoints, particle) {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
	for (let i = 1; i <= numOfPoints; i++) {
        const position = {x: ((startPoint.x - endPoint.x) / numOfPoints) * i + endPoint.x, y: ((startPoint.y - endPoint.y) / numOfPoints) * i + endPoint.y, z: ((startPoint.z - endPoint.z) / numOfPoints) * i + endPoint.z};
        
        try { PLAYER_DATA.dimension.spawnParticle(particle, position); } catch (error) {};
	}
}

function minifiedTraceLine(entity, startPoint, endPoint, numOfPoints, particle) {
    for (let i = 1; i <= numOfPoints; i++) {
        const position = {x: ((startPoint.x - endPoint.x) / numOfPoints) * i + endPoint.x, y: ((startPoint.y - endPoint.y) / numOfPoints) * i + endPoint.y, z: ((startPoint.z - endPoint.z) / numOfPoints) * i + endPoint.z};
        try { entity.dimension.spawnParticle(particle, position); } catch (error) {};
    }
}

/**
 * Spawns a trail of particles behind an entity.
 * @param {Entity} entity The entity to spawn the trail behind.
 * @param {number} time The number of ticks to spawn the trail for.
 */
export const spawnTrail = (entity, time) => {
    let currentTick = 0;
    let lastEntityPos = entity.location;
    const sched_ID = system.runInterval(function tick() {
        if (currentTick > time) return system.clearRun(sched_ID);
        currentTick++;

        if (!entity.isValid()) return system.clearRun(sched_ID);

        const playerPos = entity.location;
        minifiedTraceLine(entity, lastEntityPos, playerPos, 3, "a:air_flutter")
        minifiedTraceLine(entity, lastEntityPos, playerPos, 10, "a:air_blast_tiny")
        lastEntityPos = playerPos;
    }, 1);
}

export const getNeighbors = (block) => {
    const neighbors = [];
    const directions = ['north', 'south', 'east', 'west', 'above', 'below'];

    for (const direction of directions) {
        const neighbor = block[direction]();
        if (neighbor) {
            neighbors.push(neighbor);
        }
    }

    return neighbors;
}

export const depthFirstSearch = (startBlock, blockset = conductiveBlocks) =>{
    const stack = [startBlock];
    const visited = new Set();
    const connectedBlocks = [];

    while (stack.length > 0) {
        if (connectedBlocks.length > 96) {
            break;
        }
        const currentBlock = stack.pop();
        const key = `${currentBlock.location.x},${currentBlock.location.y},${currentBlock.location.z}`;

        if (visited.has(key)) {
            continue;
        }

        visited.add(key);

        if (blockset.has(currentBlock.typeId)) {
            connectedBlocks.push(currentBlock);
            const neighbors = getNeighbors(currentBlock);
            for (const neighbor of neighbors) {
                stack.push(neighbor);
            }
        }
    }

    return connectedBlocks;
}

export const parseMenu = (source, menuData, returnFunc = ()=>{}, sidebar = false) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[source.id];
    PLAYER_DATA.inMenu = true;

	if (menuData.type === "modal") {
		const modalForm = new ModalFormData();
		modalForm.title({ rawtext: [
			{ text: '§m§f' },
			menuData.title,
		]});

		menuData.content.forEach(({ title, type, data, update }) => {
			switch (type) {
				case "toggle":
					modalForm.toggle({ rawtext: [
						title,
					]}, data.condition);
					break;
				case "slider":
					modalForm.slider({ rawtext: [
						title,
						{ text: `\n§7` },
						data.description,
						{ text: ` ` },
						data.valuePrefix
					]}, data.min, data.max, data.step, data.value);
					break;
				case "dropdown":
					modalForm.dropdown({ rawtext: [
						title,
					]}, data.options, data.selected);
					break;
			}
		});

		modalForm.show(source).then((modalFormResponse) => {
			const { formValues } = modalFormResponse;
			if (!formValues) {
                source.sendMessage({
                    rawtext: [
                        { text: '§c' },
                        { translate: "scroll.settings.quick.cancel" }
                    ]
                });
                PLAYER_DATA.inMenu = false;
                return returnFunc(source);
            }

            PLAYER_DATA.inMenu = false;
			menuData.content.forEach(({ title, type, data, update }, i) => {
				const value = formValues[i];
				update(value);
			});
		});
	} else if (menuData.type === "action") {
		const actionForm = new ActionFormData();
		actionForm.title({ rawtext: [
			{ text: '§d§f' },
			menuData.title,
		]});
		actionForm.body(menuData.body);

        if (sidebar) {
            actionForm.button('', 'textures/ui/avatar/avatar_logo');
            actionForm.button('', 'textures/ui/avatar/movesets');
            actionForm.button('', 'textures/ui/avatar/skill_tree');
            actionForm.button('', 'textures/ui/avatar/info');
            actionForm.button('', 'textures/ui/avatar/teams');
            actionForm.button('§p', 'textures/ui/settings_glyph_color_2x');
        } else {
            actionForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
            for (let i = 0; i < 5; i++) actionForm.button('');
        }

		menuData.content.forEach(({ title, icon, action }) => {
			actionForm.button({ rawtext: [
				{ text: '§f' },
				title,
			]}, icon);
		});

		actionForm.show(source).then((actionFormResponse) => {
			const { selection } = actionFormResponse;
			if (selection === undefined) {
                source.sendMessage({
                    rawtext: [
                        { text: '§c' },
                        { translate: "scroll.admin.cancel" }
                    ]
                });
                PLAYER_DATA.inMenu = false;
                return returnFunc(source);
            }

            PLAYER_DATA.inMenu = false;
            if (!sidebar && selection === 0) {
                if (menuData.back) return menuData.back(source);
                return returnFunc(source);
            }

            const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
            if (menuActions[selection]) return menuActions[selection](player);

			menuData.content[selection - 6].action();
		});
	}
}


export const updatePlayerMoveUsage = (player, move) => {
    const rawUsage = player.getDynamicProperty("moveUsage");
    const usageMap = rawUsage ? JSON.parse(rawUsage) : {};

    if (usageMap[move]) {
        usageMap[move]++;
    } else {
        usageMap[move] = 1;
    }

    player.setDynamicProperty("moveUsage", JSON.stringify(usageMap));

    const time = Date.now();
    console.log(`UpdateDB usedMove ${player.id} ${player.name} ${move} ${usageMap[move]} ${time}`);
}

export const updateSubLevel = (player, chiCost) => {
    const rawSubLevel = player.getDynamicProperty("subLevel");
    const subLevel = rawSubLevel ? parseFloat(rawSubLevel) : 0;

    const chiCostFactor = chiCost / 100;
    const newSubLevel = subLevel + chiCostFactor;
    player.setDynamicProperty("subLevel", newSubLevel);

    levelUpCheck(player, newSubLevel);

    const time = Date.now();
    console.log(`UpdateDB subLevel ${player.id} ${player.name} ${newSubLevel} ${time}`);
}

const levelUpCheck = (player, subLevel) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const level = PLAYER_DATA.level;

    const levelFunction = 0.05 * Math.pow(level, 2) + 0.8 * level + 2 * 1/(0.01 + WORLD_SETTINGS.lvlspd);

    if (level < 12) subLevel *= 6;

    if (subLevel > levelFunction) {
        PLAYER_DATA.level++;
        PLAYER_DATA.levelFactor = PLAYER_DATA.level / 100;
        player.setDynamicProperty("level", PLAYER_DATA.level);
        player.setDynamicProperty("subLevel", 0);
  
        const allowedMoves = [];
        const elements = PLAYER_DATA.elements;
        let moveIndex = 0;
        for (const element of elements) {
            for (const move of element.moves) {
                moveIndex++;
                if ((moveIndex > level + 1) && !move.skill_required) continue;
                if (move.skill_required && !PLAYER_DATA.skills.includes(move.skill_required)) continue;
    
                allowedMoves.push(move);
            }
        }

        PLAYER_DATA.dimension.spawnParticle(`a:level_up`, player.location);
        PLAYER_DATA.dimension.playSound("random.levelup", player.location, { pitch: 1, volume: 2 });

        player.addExperience(20);
        player.addLevels(1);

        const time = Date.now();
        console.log(`UpdateDB levelUp ${player.id} ${player.name} ${PLAYER_DATA.level} ${time}`);
        
        if (allowedMoves.length <= level || allowedMoves[level].skill_required) {
            player.sendMessage({
                rawtext: [
                    { text: '§f---------------------\n§e' },
                    { translate: 'scroll.level_up', with: [`${PLAYER_DATA.level}`] },
                    { text: '\n§f---------------------' }
                ]
            });

            return;
        }

        player.sendMessage({
            rawtext: [
                { text: '§f---------------------\n§e' },
                { translate: 'scroll.level_up', with: [`${PLAYER_DATA.level}`] },
                { text: '\n\n §e' },
                allowedMoves[level].name,
                { text: ' §r\n- ' },
                allowedMoves[level].description,
                { text: '\n§f---------------------' }
            ]
        });
    }
};