import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, calculateDistance, applyBendingDamage, groundBlocks } from "../../../../utils.js";

const fallingBlocks = {
    "minecraft:grass_block": "minecraft:dirt",
    "minecraft:sand": "minecraft:sandstone",
    "minecraft:red_sand": "minecraft:red_sandstone",
    "minecraft:gravel": "minecraft:stone",
    "minecraft:suspicious_sand": "minecraft:end_stone",
    "minecraft:suspicious_gravel": "minecraft:cobblestone",
};

const inverseFallingBlocks = {
    "minecraft:dirt": "minecraft:grass_block",
    "minecraft:sandstone": "minecraft:sand",
    "minecraft:red_sandstone": "minecraft:red_sand",
    "minecraft:stone": "minecraft:gravel",
    "minecraft:end_stone": "minecraft:suspicious_sand",
    "minecraft:cobblestone": "minecraft:suspicious_gravel",
};

const getBlock = (player, location, searchHeight = 4, iter = 0) => {
    if (iter >= 8) return;

    // Find the highest block at the given x and z coordinates
    const below = player.dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (!groundBlocks.has(below.typeId) || block.y < location.y - 2) return;
    if (!block || !block.isAir) return getBlock(player, location, searchHeight - 2, iter + 1);

    return { x: block.x, y: block.y, z: block.z };
}

const preFireRuntime = (player) => {
    let didSpawnParticles = false;
    const { x, y, z } = player.location;
    const base = [
        { x: x, y: y, z: z + 2 },
        { x: x + 1, y: y, z: z + 2 },
        { x: x - 1, y: y, z: z + 2 },

        { x: x - 2, y: y, z: z },
        { x: x - 2, y: y, z: z + 1 },
        { x: x - 2, y: y, z: z - 1 },

        { x: x, y: y, z: z - 2 },
        { x: x + 1, y: y, z: z - 2 },
        { x: x - 1, y: y, z: z - 2 },

        { x: x + 2, y: y, z: z },
        { x: x + 2, y: y, z: z + 1 },
        { x: x + 2, y: y, z: z - 1 },

        { x: x, y: y, z: z + 3 },
        { x: x, y: y, z: z - 3 },
        { x: x + 3, y: y, z: z },
        { x: x - 3, y: y, z: z }
    ];
    
    for (const loc of base) {
        if (!loc) continue;
        const block = getBlock(player, loc);
        if (!block) continue;

        player.spawnParticle("a:highlight", { x: block.x + 0.5, y: block.y + 0.03, z: block.z + 0.5 });
        didSpawnParticles = true;
    }

    return didSpawnParticles;
}

const postFireRuntime = (player, timer, location, dimension) => {
    const { x, y, z } = location;
    const base = [
        { x: x, y: y, z: z + 3 },
        { x: x, y: y, z: z - 3 },
        { x: x + 3, y: y, z: z },
        { x: x - 3, y: y, z: z },

        { x: x, y: y, z: z + 2 },
        { x: x + 1, y: y, z: z + 2 },
        { x: x - 1, y: y, z: z + 2 },

        { x: x - 2, y: y, z: z },
        { x: x - 2, y: y, z: z + 1 },
        { x: x - 2, y: y, z: z - 1 },

        { x: x, y: y, z: z - 2 },
        { x: x + 1, y: y, z: z - 2 },
        { x: x - 1, y: y, z: z - 2 },

        { x: x + 2, y: y, z: z },
        { x: x + 2, y: y, z: z + 1 },
        { x: x + 2, y: y, z: z - 1 }
    ];
    
    const factor = Math.floor(timer/3.5) - 2;
    let lastTypeId = null;
    for (const loc of base) {
        if (!loc) continue;
        const block2 = getBlock(player, loc);
        if (!block2) continue;
        const typeId = dimension.getBlock(block2).below(1).typeId;
        lastTypeId = typeId;

        const block = dimension.getBlock(loc).above(factor);
        if (!block || !block.isAir) continue;

        block.setType(typeId);
        if (fallingBlocks[block.typeId] && factor > 0) block.below(1).setType(fallingBlocks[block.typeId]);

        dimension.spawnParticle("a:shook_earth", loc);

        delayedFunc(player, () => {
            dimension.spawnParticle("a:shook_earth", loc);
            if (!block.isAir && (block.typeId === typeId || fallingBlocks[block.typeId])) block.setType("minecraft:air");
            if (inverseFallingBlocks[block.below(1).typeId]) block.below(1).setType(inverseFallingBlocks[block.below(1).typeId]);
        }, 100 - factor * 8);
    }

    if (timer < 13) return;

    const roof = [
        { x: x, y: y + 3, z: z + 1 },
        { x: x, y: y + 3, z: z - 1 },
        { x: x + 1, y: y + 3, z: z },
        { x: x - 1, y: y + 3, z: z },
        { x: x, y: y + 4, z: z },
    ];

    for (const loc of roof) {
        const block = dimension.getBlock(loc);

        if (!block || !block.isAir || !lastTypeId) continue;
        if (fallingBlocks[lastTypeId]) lastTypeId = fallingBlocks[lastTypeId];

        block.setType(lastTypeId);

        delayedFunc(player, () => {
            if (!block.isAir && block.typeId === lastTypeId) block.setType("minecraft:air");
        }, 80);
    }
}

const move = {
    name: { translate: 'elements.earth.moves.earthshield.name' },
    description: { translate: 'elements.earth.moves.earthshield.description' },

    cost: 100,
    cooldown: 50,
    type: 'standard',

    id: 24,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        const statusMessages = PLAYER_DATA.settings.showStatusMessages;
        if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.activate_sneak' }]);

        
        let timer = 0;
        let state = 0; // 0 = pre, 1 = post
        let currentTick = 0;
        const dimension = PLAYER_DATA.dimension;
        let location = player.location;
        let inRange = false;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 180 || timer > 14) {
                return system.clearRun(sched_ID);
            }

            if (state === 0) inRange = preFireRuntime(player);
            if (currentTick < 10) return PLAYER_DATA.doubleSneakTimer = 0;

            PLAYER_DATA.cooldown = 20;
            if ((PLAYER_DATA.doubleSneakTimer > 0 || currentTick > 100) && state === 0) {
                state = 1;
                timer = 0;
                location = getBlock(player, player.location);
                if (!location) {
                    if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    system.clearRun(sched_ID);
                }

                player.playAnimation("animation.fire.pull");

                if (!inRange) {
                    if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    return system.clearRun(sched_ID);
                }

                PLAYER_DATA.dimension.playSound("avatar.earth_raise", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.1 });

                player.runCommand(`camerashake add @a[r=12] 0.3 0.8 positional`);  
                
                delayedFunc(player, () => {
                    player.runCommand(`camerashake add @a[r=12] 0.3 0.8 positional`);
                    PLAYER_DATA.dimension.playSound("avatar.earth_raise", player.location, { volume: 0.3, pitch: 1 - Math.random() * 0.2 });
                }, 90);
            }

            if (state === 1) {
                if (!location) return system.clearRun(sched_ID);
                postFireRuntime(player, timer, location, dimension);
                timer++;
            }
        });
    }
}

export default move;