import { delayedFunc } from "../../../../utils";

const move = {
    name: { translate: 'elements.water.moves.frostwalker.name' },
    description: { translate: 'elements.water.moves.frostwalker.description' },

    cost: 0.5,
    cooldown: 10,
    type: 'duration',

    id: 59,

    damage: {
        base: 0,
        multiplied: 0
    },

    start(player) {
        player.dimension.playSound("avatar.water_charge", player.location, { volume: 0.9, pitch: 1 });
    },
    end(player) {
        player.runCommand("stopsound @a[r=30] avatar.water_charge");
    },
    activate(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 10;
        PLAYER_DATA.waterLoaded -= 0.0025;

        const feet = PLAYER_DATA.dimension.getBlock(player.location);
        if (feet.isAir) {
            const { x, y, z } = player.location;
            const offsets = [
                { x: 0, y: -1, z: 0 },
                { x: 0, y: -1, z: 1 },
                { x: 0, y: -1, z: -1 },
                { x: 1, y: -1, z: 0 },
                { x: -1, y: -1, z: 0 },
                { x: 1, y: -1, z: 1 },
                { x: 1, y: -1, z: -1 },
                { x: -1, y: -1, z: 1 },
                { x: -1, y: -1, z: -1 }
            ]

            for (const offset of offsets) {
                const block = PLAYER_DATA.dimension.getBlock({ x: x + offset.x, y: y + offset.y, z: z + offset.z });
                if (block.isAir) {
                    block.setType("minecraft:ice");
                    delayedFunc(player, () => block.setType("minecraft:air"), 30);
                }
            }
        }

        PLAYER_DATA.dimension.spawnParticle("a:water_trail", { x: player.location.x, y: player.location.y + 0.5, z: player.location.z });
        player.addEffect("speed", 60, { amplifier: 1, showParticles: false });
    }
}

export default move;