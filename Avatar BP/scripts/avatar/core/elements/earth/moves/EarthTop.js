import { delayedFunc } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.earth.moves.earthtop.name' },
    description: { translate: 'elements.earth.moves.earthtop.description' },

    cost: 10,
    cooldown: 10,
    type: 'standard',

    id: 28,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.earth.pull");

        delayedFunc(player, () => {
            player.runCommand("camerashake add @s 0.6 0.1 positional");
            PLAYER_DATA.dimension.spawnParticle("a:shook_earth", player.location);
            PLAYER_DATA.dimension.playSound("avatar.rock_punch", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.8 });

            const { x, y, z } = player.location;
            const highest = PLAYER_DATA.dimension.getTopmostBlock({ x: x, z: z }, y + 456);
            if (!highest) return player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.earthtop_failed' }]);
            if (highest.typeId === "minecraft:bedrock") return player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.earthtop_nether' }]);
            if (highest.y - y < 2) return player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.earthtop_failed' }]);

            player.teleport({ x, y: highest.y + 2, z });
            PLAYER_DATA.dimension.spawnParticle("a:shook_earth", player.location);
        }, 10);
    }
}

export default move;