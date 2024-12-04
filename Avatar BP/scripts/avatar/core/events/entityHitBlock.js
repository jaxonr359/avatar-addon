import { Player, system, MolangVariableMap } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "../../index.js";

const drainableBlocks = {
    "minecraft:grass_block": "minecraft:dirt",
    "minecraft:acacia_leaves": "minecraft:deadbush",
    "minecraft:birch_leaves": "minecraft:deadbush",
    "minecraft:oak_leaves": "minecraft:deadbush",
    "minecraft:jungle_leaves": "minecraft:deadbush",
    "minecraft:spruce_leaves": "minecraft:deadbush",
    "minecraft:dark_oak_leaves": "minecraft:deadbush",
    "minecraft:water": "minecraft:water",
    "minecraft:cherry_leaves": "minecraft:deadbush",
    "minecraft:azalea_leaves": "minecraft:deadbush",
    "minecraft:flowering_azalea_leaves": "minecraft:deadbush",
    "minecraft:mangrove_leaves": "minecraft:deadbush",
    "minecraft:snow_layer": "minecraft:air",
    "minecraft:snow": "minecraft:snow_layer",
    "minecraft:ice": "minecraft:air",
    "minecraft:packed_ice": "minecraft:packed_ice",
    "minecraft:blue_ice": "minecraft:ice",
    "minecraft:powder_snow": "minecraft:powder_snow",
}

const map = new MolangVariableMap();

export const entityHitBlock = (eventData) => {
    const { hitBlock, damagingEntity } = eventData;

    if (!(damagingEntity instanceof Player) || !hitBlock) return;

    const PLAYER_DATA = PLAYER_DATA_MAP[damagingEntity.id];
    const skills = PLAYER_DATA.skills;

    if (!skills.includes("moisture_drain")) return;

    if (hitBlock.typeId in drainableBlocks) {
        hitBlock.setType(drainableBlocks[hitBlock.typeId]);
        PLAYER_DATA.waterLoaded = 6;

        damagingEntity.runCommand(`camerashake add @s 0.1 0.1 positional`);
        map.setVector3("variable.plane", { x: 0.2, y: 40, z: 15 });
        PLAYER_DATA.dimension.spawnParticle("a:water_shockwave_dynamic", damagingEntity.location, map);

        if (PLAYER_DATA.settings.showStatusMessages) damagingEntity.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.drain' }]);
    } 
}