import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, calculateDistance, applyBendingDamage, groundBlocks } from "../../../../utils.js";

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

const getBlock = (player, location, searchHeight = 4, iter = 0) => {
    if (iter >= 8) return;

    // Find the highest block at the given x and z coordinates
    const below = player.dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (!groundBlocks.has(below.typeId) || block.y < location.y - 5) return;
    if (!block || !block.isAir) return getBlock(player, location, searchHeight - 2, iter + 1);

    return below;
}

const preFireRuntime = (player) => {
    const loc1 = getBlock(player, calcVectorOffset(player, 0, 0, 5));
    if (!loc1) return [null, null, null, null, null];

    const loc2 = getBlock(player, { x: loc1.x, y: loc1.y, z: loc1.z + 1 });
    const loc3 = getBlock(player, { x: loc1.x, y: loc1.y, z: loc1.z - 1 });
    const loc4 = getBlock(player, { x: loc1.x + 1, y: loc1.y, z: loc1.z });
    const loc5 = getBlock(player, { x: loc1.x - 1, y: loc1.y, z: loc1.z });

    const locs = [loc1, loc2, loc3, loc4, loc5];
    for (const loc of locs) {
        if (!loc) continue;
        player.spawnParticle("a:highlight", { x: loc.x + 0.5, y: loc.y + 1.03, z: loc.z + 0.5 });
    }

    return locs;
}

const postFireRuntime = (player, locs, timer, dimension, initTypes) => {
    const center = locs[0];
    if (!center) return;

    const entities = [...dimension.getEntities({ location: center, maxDistance: 4, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
    for (const entity of entities) {
        try {
            entity.applyKnockback(0, 0, 0, 2.3);
            
            delayedFunc(player, () => {
                applyBendingDamage(player, entity, 10);
            }, 2);
        } catch (error) {
            try {
                entity.applyImpulse({ x: 0, y: 0.5, z: 0 });
            } catch (error) {}
        }
    }
    
    const factor = Math.floor(timer/1);
    
    // for (const loc of locs) {
    //     if (!loc) continue;
    //     if (loc != center && factor > 1) continue;

    //     const typeId = dimension.getBlock(loc).below(1).typeId;
    //     const block = dimension.getBlock(loc).above(factor);
    //     if (!block || !block.isAir) continue;

    //     dimension.spawnParticle("a:shook_earth", loc);

    //     block.setType(typeId);

    //     if (fallingBlocks[block.typeId] && factor > 0) block.below(1).setType(fallingBlocks[block.typeId]);

    //     delayedFunc(player, () => {
    //         if (!block.isAir && (block.typeId === typeId || fallingBlocks[block.typeId])) block.setType("minecraft:air");

    //         if (inverseFallingBlocks[block.below(1).typeId]) block.below(1).setType(inverseFallingBlocks[block.below(1).typeId]);
            
    //         dimension.spawnParticle("a:shook_earth", loc);
    //     }, 80 - factor * 4);
    // }

    for (let i = 0; i < locs.length; i++) {
        const loc = locs[i];
        if (!loc) continue;
        if (loc != center && factor > 1) continue;

        const initType = initTypes[i];
        if (!initType) continue;

        const block = dimension.getBlock(loc).above(factor + 1);
        const below = dimension.getBlock(loc).above(factor);
    
        if (!block || !block.isAir) return;
    
        dimension.spawnParticle("a:shook_earth", loc.location);
    
        block.setType(initType);
        below.setType(fallingBlocks[initType] || initType);
    
        delayedFunc(player, () => {
            block.setType("minecraft:air");
            if (fallingBlocks[initType]) below.setType(inverseFallingBlocks[below.typeId] || below.typeId);
    
            dimension.spawnParticle("a:shook_earth", loc.location);
        }, 80 - factor * 4);
    }
}

const move = {
    name: { translate: 'elements.earth.moves.earthbigspike.name' },
    description: { translate: 'elements.earth.moves.earthbigspike.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 17,

    damage: {
        base: 10,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        const statusMessages = PLAYER_DATA.settings.showStatusMessages;
        if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.activate_sneak' }]);

        let timer = 0;
        let state = 0; // 0 = pre, 1 = post
        let locs = [];
        let initTypes = [];
        let currentTick = 0;
        const dimension = PLAYER_DATA.dimension;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 180 || timer > 4) {
                return system.clearRun(sched_ID);
            }

            if (state === 0) locs = preFireRuntime(player);
            if (currentTick < 10) return PLAYER_DATA.doubleSneakTimer = 0;

            PLAYER_DATA.cooldown = 20;
            if ((PLAYER_DATA.doubleSneakTimer > 0 || currentTick > 100) && state === 0) {
                state = 1;
                timer = 0;

                player.playAnimation("animation.earth.landing");

                // Return if every item in the array is null
                const length = locs.filter(loc => loc).length;
                if (length === 0) {
                    if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    return system.clearRun(sched_ID);
                }

                for (const loc of locs) {
                    if (!loc) {
                        initTypes.push(null);
                        continue;
                    }
                    const block = dimension.getBlock(loc);
                    initTypes.push(block.typeId);
                }

                PLAYER_DATA.dimension.playSound("avatar.earth_big_spike", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.5 });

                player.runCommand(`camerashake add @a[r=12] 0.2 0.6 positional`);

                delayedFunc(player, () => {
                    player.runCommand(`camerashake add @a[r=12] 0.1 0.5 positional`);
                    PLAYER_DATA.dimension.playSound("avatar.earth_raise", player.location, { volume: 0.2, pitch: 1 + Math.random() * 0.1 });
                }, 68);
            }

            if (state === 1) {
                if (!locs || locs.length === 0 || !locs[0]) return system.clearRun(sched_ID);
                if (locs[0] && calculateDistance(player.location, locs[0]) < 1.9) {
                    player.applyKnockback(0, 0, 0, 2.4);
                    player.addEffect("slow_falling", 160, { showParticles: false });

                    let currentTick = 0;
                    const sched_ID = system.runInterval(function tick() {
                        currentTick++;
                        if (currentTick > 15) return system.clearRun(sched_ID);
                        player.dimension.spawnParticle("a:earth_trail", player.location);
                    }, 1);
                }

                postFireRuntime(player, locs, timer, dimension, initTypes);
                timer++;
            }
        });
    }
}

export default move;