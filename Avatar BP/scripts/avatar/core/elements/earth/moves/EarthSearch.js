function formatBlockName(block) {
    const parts = block.split(':');
    const name = parts[1];
  
    const formattedName = name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  
    return formattedName;
}
  
const specialBlocks = new Set([
    "minecraft:coal_ore",
    "minecraft:copper_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:lapis_ore",
    "minecraft:emerald_ore",
    "minecraft:ancient_debris",
    "minecraft:nether_gold_ore",
    "minecraft:quartz_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:coal_block",
    "minecraft:copper_block",
    "minecraft:iron_block",
    "minecraft:gold_block",
    "minecraft:redstone_block",
    "minecraft:diamond_block",
    "minecraft:lapis_block",
    "minecraft:emerald_block",
    "minecraft:netherite_block"
]);


const move = {
    name: { translate: 'elements.earth.moves.earthsearch.name' },
    description: { translate: 'elements.earth.moves.earthsearch.description' },

    cost: 5,
    cooldown: 25,
    type: 'standard',

    id: 23,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.runCommand("camerashake add @s 0.4 0.1 positional");
        player.playAnimation("animation.earth.landing");
        PLAYER_DATA.dimension.spawnParticle("a:earth_shockwave_small", player.location);
        PLAYER_DATA.dimension.playSound("avatar.rock_punch", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.8 });

        let foundAnything = false;
        for (let i = 0; i < 256; i++) {
            try {
                const currentBlock = PLAYER_DATA.dimension.getBlock({ x: player.location.x, y: player.location.y - i, z: player.location.z });
                if (specialBlocks.has(currentBlock.typeId)) {
                    foundAnything = true;
                    player.sendMessage(`§7Found ${formatBlockName(currentBlock.typeId)} ${i} blocks below you!`);
                }
            } catch (error) {
                break;
            };
        };

        if (!foundAnything) player.sendMessage(`§7Found nothing.`);
    }
}

export default move;