import { system, ItemStack } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "../../index.js";

import { depthFirstSearch } from "../../utils.js";


const ores = [
    "minecraft:coal_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:redstone_ore",
    "minecraft:lit_redstone_ore",
    "minecraft:lapis_ore",
    "minecraft:diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:copper_ore",
    "minecraft:quartz_ore",
    "minecraft:nether_gold_ore",
    "minecraft:ancient_debris",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:lit_deepslate_redstone_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:deepslate_copper_ore"
];

const oreMap = {
    "minecraft:coal_ore": "minecraft:coal",
    "minecraft:iron_ore": "minecraft:raw_iron",
    "minecraft:gold_ore": "minecraft:raw_gold",
    "minecraft:redstone_ore": "minecraft:redstone",
    "minecraft:lit_redstone_ore": "minecraft:redstone",
    "minecraft:lapis_ore": "minecraft:lapis_lazuli",
    "minecraft:diamond_ore": "minecraft:diamond",
    "minecraft:emerald_ore": "minecraft:emerald",
    "minecraft:copper_ore": "minecraft:copper_ingot",
    "minecraft:quartz_ore": "minecraft:quartz",
    "minecraft:nether_gold_ore": "minecraft:gold_ingot",
    "minecraft:ancient_debris": "minecraft:netherite_scrap",
    "minecraft:deepslate_coal_ore": "minecraft:coal",
    "minecraft:deepslate_iron_ore": "minecraft:raw_iron",
    "minecraft:deepslate_gold_ore": "minecraft:raw_gold",
    "minecraft:deepslate_redstone_ore": "minecraft:redstone",
    "minecraft:lit_deepslate_redstone_ore": "minecraft:redstone",
    "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",
    "minecraft:deepslate_diamond_ore": "minecraft:diamond",
    "minecraft:deepslate_emerald_ore": "minecraft:emerald",
    "minecraft:deepslate_copper_ore": "minecraft:copper_ingot"
}

const oreStuff = (player, block, dimension, skills) => {
    const gamemode = player.getGameMode();
    const itemType = oreMap[block.typeId];

    if (skills.includes("fortunate_fists") && gamemode != "creative") {
        system.run(() => {
            const item = new ItemStack(itemType, Math.floor(1 + 2 * Math.random()));
            dimension.spawnItem(item, block.location);
        });   
    }
    
    if (skills.includes("vein_miner")) {
        // Create a "set" with literally just the block that was broken
        const blockSet = new Set([...ores]);
        const allBlocks = depthFirstSearch(block, blockSet);
        if (allBlocks.length < 2) return;

        system.run(() => {
            if (gamemode === "creative") { 
                for (const iterblock of allBlocks) {
                    iterblock.setType("minecraft:air");
                }  
            } else {
                for (const iterblock of allBlocks) {
                    const { x, y, z } = iterblock.location;
                    player.runCommand(`setblock ${x} ${y} ${z} minecraft:air destroy`);

                    const item = new ItemStack(itemType, Math.floor(1 + 2 * Math.random()));
                    dimension.spawnItem(item, iterblock.location);
                }
            }
        });
    }
}

export const playerBreakBlock = (eventData) => {
    const { player, block, dimension } = eventData;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const skills = PLAYER_DATA.skills;

    if (!skills.includes("fortunate_fists") && !skills.includes('vein_miner')) return;

    if (ores.includes(block.typeId)) {
        oreStuff(player, block, dimension, skills);
    }
}