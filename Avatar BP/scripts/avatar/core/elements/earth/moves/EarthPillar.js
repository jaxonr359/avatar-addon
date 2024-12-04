import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, calculateDistance, applyBendingDamage, groundBlocks } from "../../../../utils.js";

const map = new MolangVariableMap();

const fallingBlocks = {
    "minecraft:grass_block": "minecraft:dirt",
    "minecraft:grass_path": "minecraft:coarse_dirt",
    "minecraft:sand": "minecraft:sandstone",
    "minecraft:red_sand": "minecraft:red_sandstone",
    "minecraft:gravel": "minecraft:stone",
    "minecraft:suspicious_sand": "minecraft:end_stone",
    "minecraft:suspicious_gravel": "minecraft:cobblestone",
};

const inverseFallingBlocks = {
    "minecraft:dirt": "minecraft:grass_block",
    "minecraft:coarse_dirt": "minecraft:grass_path",
    "minecraft:sandstone": "minecraft:sand",
    "minecraft:red_sandstone": "minecraft:red_sand",
    "minecraft:end_stone": "minecraft:suspicious_sand",
    "minecraft:cobblestone": "minecraft:suspicious_gravel",
    "minecraft:stone": "minecraft:gravel",
};

const getBlock = (player, location, PLAYER_DATA, searchHeight = 4, iter = 0) => {
    if (iter >= 8) return;

    // Find the highest block at the given x and z coordinates
    const below = PLAYER_DATA.dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (!groundBlocks.has(below.typeId) || block.y < location.y - 5) return;
    if (!block || !block.isAir) return getBlock(player, location, PLAYER_DATA, searchHeight - 2, iter + 1);

    return below;
}

const preFireRuntime = (player, PLAYER_DATA) => {
    const loc = getBlock(player, calcVectorOffset(player, 0, 0.3, 4), PLAYER_DATA);

    if (!loc) return;
    player.spawnParticle("a:highlight", { x: loc.x + 0.5, y: loc.y + 1.03, z: loc.z + 0.5 });

    return loc;
}

const postFireRuntime = (player, loc, timer, dimension, initType) => {
    const center = loc.location;
    const entities = [...dimension.getEntities({ location: center, maxDistance: 4, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
    for (const entity of entities) {
        try {
            entity.applyKnockback(0, 0, 0, 0.3);
            applyBendingDamage(player, entity, 5, 0);
        } catch (error) {}
    }

    const factor = Math.floor(timer/1.5);
    const block = dimension.getBlock(loc).above(factor + 1);
    const below = dimension.getBlock(loc).above(factor);

    if (!block || !block.isAir) return;

    dimension.spawnParticle("a:shook_earth", { x: center.x, y: center.y + 1, z: center.z });

    block.setType(initType);
    below.setType(fallingBlocks[initType] || initType);

    delayedFunc(player, () => {
        block.setType("minecraft:air");
        if (fallingBlocks[initType]) below.setType(inverseFallingBlocks[below.typeId] || below.typeId);

        dimension.spawnParticle("a:shook_earth", { x: center.x, y: center.y + 1, z: center.z });
    }, 80 - factor * 4);
}

/**
 * 
 *     const center = loc;

    const entities = [...dimension.getEntities({ location: center, maxDistance: 4, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
    for (const entity of entities) {
        try {
            entity.applyKnockback(0, 0, 0, 0.3);
            applyBendingDamage(player, entity, 5, 0);
        } catch (error) {}
    }
    
    const factor = Math.floor(timer/1.5);
    const typeId = dimension.getBlock(loc).below(1).typeId;
    const block = dimension.getBlock(loc).above(factor);
    if (!block || !block.isAir) return;

    dimension.spawnParticle("a:shook_earth", loc);

    block.setType(typeId);

    if (fallingBlocks[block.typeId] && factor > 0) block.below(1).setType(fallingBlocks[block.typeId]);

    delayedFunc(player, () => {
        if (!block.isAir && (block.typeId === typeId || fallingBlocks[block.typeId] != undefined)) block.setType("minecraft:air");

        if (inverseFallingBlocks[block.below(1).typeId]) block.below(1).setType(inverseFallingBlocks[block.below(1).typeId]);
        
        dimension.spawnParticle("a:shook_earth", loc);
    }, 80 - factor * 4);
 */

const move = {
    name: { translate: 'elements.earth.moves.earthpillar.name' },
    description: { translate: 'elements.earth.moves.earthpillar.description' },

    cost: 15,
    cooldown: 5,
    type: 'standard',

    id: 20,

    damage: {
        base: 5,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        const statusMessages = PLAYER_DATA.settings.showStatusMessages;
        if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.activate_sneak' }]);

        let timer = 0;
        let state = 0; // 0 = pre, 1 = post
        let loc;
        let currentTick = 0;
        let locType;
        const dimension = PLAYER_DATA.dimension;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 180 || timer > 5) {
                return system.clearRun(sched_ID);
            }

            if (state === 0) loc = preFireRuntime(player, PLAYER_DATA);
            if (currentTick < 5) return PLAYER_DATA.doubleSneakTimer = 0;

            PLAYER_DATA.cooldown = 5;
            if ((PLAYER_DATA.doubleSneakTimer > 0 || currentTick > 100) && state === 0) {
                state = 1;
                timer = 0;

                player.playAnimation("animation.earth.landing");

                if (!loc) {
                    if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    return system.clearRun(sched_ID);
                }

                player.runCommand(`camerashake add @a[r=12] 0.2 0.6 positional`);

                PLAYER_DATA.dimension.playSound("avatar.earth_raise", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.6 });

                delayedFunc(player, () => {
                    player.runCommand(`camerashake add @a[r=12] 0.1 0.5 positional`);
                    PLAYER_DATA.dimension.playSound("avatar.earth_raise", player.location, { volume: 0.2, pitch: 1 + Math.random() * 0.6 });
                }, 68);

                locType = loc.typeId;
            }

            if (state === 1) {
                if (loc && calculateDistance(player.location, loc) < 1.5) {
                    player.applyKnockback(0, 0, 0, 0.9);
                }

                postFireRuntime(player, loc, timer, dimension, locType);
                timer++;
            }
        });
    }
}

export default move;