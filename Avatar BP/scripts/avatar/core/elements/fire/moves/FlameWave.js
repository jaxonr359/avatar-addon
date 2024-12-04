import { createShockwave, delayedFunc } from "../../../../utils.js";

const placeBlock = (player, location, searchHeight = 6, iter = 0, dimension) => {
    if (iter >= 8) return;

    // Find the highest block at the given x and z coordinates
    const below = dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 5) return;
    if (!block || !block.isAir) return placeBlock(player, location, searchHeight - 2, iter + 1, dimension);

    // Place the block
    block.setType("minecraft:fire");
    dimension.spawnParticle("a:fire_blast_pop", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });

    delayedFunc(player, () => {
        if (!block.isAir && block.typeId === "minecraft:fire") block.setType("minecraft:air");
    }, 17);
}

const createRing = (player, location, radius, dimension) => {
    const playerPos = location;
    const angleStep = 360 / 32;
    for (let angle = 0; angle < 360; angle += angleStep) {
        const angleRad = angle * (Math.PI / 180);
        const x = playerPos.x + radius * Math.cos(angleRad);
        const z = playerPos.z + radius * Math.sin(angleRad);
        placeBlock(player, { x: x, y: playerPos.y, z: z }, 6, 0, dimension);
    }
}

const move = {
    name: { translate: 'elements.fire.moves.flamewave.name' },
    description: { translate: 'elements.fire.moves.flamewave.description' },

    cost: 5,
    cooldown: 10,
    type: 'charge',

    id: 46,

    damage: {
        base: 4,
        multiplied: 36
    },

    charge(player, charge) {
        player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/100} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;
        player.dimension.spawnParticle("a:fire_charge", player.location);

        if (charge < 6) player.dimension.playSound("avatar.fire_sprint", player.location, { volume: 0.5, pitch: 1 });
    },

    cancel(player) {
        player.runCommand("stopsound @a[r=30] avatar.fire_sprint");
        player.inputPermissions.movementEnabled = true;
    },

    activate(player, PLAYER_DATA) {
        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;
        player.playAnimation("animation.air.shockwave");
        player.addEffect("fire_resistance", 85, { amplifier: 1, showParticles: false });

        player.runCommand("stopsound @a[r=30] avatar.fire_sprint");
        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.flame_wave", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            player.runCommand(`camerashake add @a[r=12] 1.8 0.3 positional`);
            const playerPos = player.location;
            createShockwave(player, playerPos, (5 + PLAYER_DATA.levelFactor * 36 * chargeFactor), 14 * chargeFactor, 3, true);
        }, 8);

        delayedFunc(player, () => createRing(player, player.location, 12 * chargeFactor, PLAYER_DATA.dimension), 14);
        delayedFunc(player, () => createRing(player, player.location, 10 * chargeFactor, PLAYER_DATA.dimension), 13);
        delayedFunc(player, () => createRing(player, player.location, 8 * chargeFactor, PLAYER_DATA.dimension), 12);
        delayedFunc(player, () => createRing(player, player.location, 6 * chargeFactor, PLAYER_DATA.dimension), 11);
        delayedFunc(player, () => createRing(player, player.location, 4 * chargeFactor, PLAYER_DATA.dimension), 10);
        delayedFunc(player, () => createRing(player, player.location, 2 * chargeFactor, PLAYER_DATA.dimension), 9);
        delayedFunc(player, () => createRing(player, player.location, 1 * chargeFactor, PLAYER_DATA.dimension), 8);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 30);
    }
}

export default move;