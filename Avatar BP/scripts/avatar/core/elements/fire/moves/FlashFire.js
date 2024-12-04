import { system } from "@minecraft/server";
import { traceLine, createShockwave, delayedFunc } from "../../../../utils.js";

const placeBlock = (player, location) => {
    // Find the highest block at the given x and z coordinates
    const below = player.dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + 6);
    if (!below) return;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (!block || !block.isAir) return;

    // Place the block
    block.setType("minecraft:fire");
    player.dimension.spawnParticle("a:fire_blast_pop", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });

    delayedFunc(player, () => {
        if (!block.isAir && block.typeId === "minecraft:fire") block.setType("minecraft:air");
    }, 35);
}

const move = {
    name: { translate: 'elements.fire.moves.flashfire.name' },
    description: { translate: 'elements.fire.moves.flashfire.description' },

    cost: 4,
    cooldown: 0,
    type: 'duration',

    id: 47,

    damage: {
        base: 2,
        multiplied: 6
    },

    start(player) {
        player.playAnimation("animation.fire.push");
        player.addEffect("fire_resistance", 25, { amplifier: 1, showParticles: false });

        player.dimension.playSound("avatar.fire_sprint", player.location, { volume: 1, pitch: 1 });
    },
    end(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 20;
        player.runCommand("stopsound @a[r=30] avatar.fire_sprint");
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 10) return;

        PLAYER_DATA.cooldown = 20;

        player.addEffect("speed", 10, { amplifier: 10, showParticles: false });
        player.addEffect("fire_resistance", 25, { amplifier: 1, showParticles: false });

        placeBlock(player, player.location);
        createShockwave(player, player.location, 2 + 6 * PLAYER_DATA.levelFactor, 3, 2, true);

        player.runCommand(`camerashake add @s 0.4 0.05 positional`);
    }
}

export default move;