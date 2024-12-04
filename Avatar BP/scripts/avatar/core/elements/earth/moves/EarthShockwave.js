import { MolangVariableMap, system } from "@minecraft/server";
import {
    createShockwave,
    calculateKnockbackVector,
    calculateDistance,
    delayedFunc
} from "../../../../utils.js";

const map = new MolangVariableMap();

const placeBlock = (player, location, searchHeight = 16, iter = 0, dimension, map) => {
    if (iter >= 8) return 0;

    // Find the highest block at the given x and z coordinates
    const below = dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return 0;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 16) {
        return 0;
    }
    if (!block || !block.isAir) return placeBlock(player, location, searchHeight - 2, iter + 1, dimension, map);

    // Place the block
    dimension.spawnParticle("a:shook_earth_small", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });
    
    if (below.typeId === "minecraft:amethyst_block") {
        dimension.spawnParticle("a:ame_earth_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
    } else {
        dimension.spawnParticle("a:earth_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
    }

    delayedFunc(player, () => {
        dimension.spawnParticle("a:shook_earth_small", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });
    }, 12);

    return 1;
}

const createRing = (player, location, radius, dimension) => {
    const playerPos = location;
    const angleStep = 360 / 32;
    for (let angle = 0; angle < 360; angle += angleStep) {
        const angleRad = angle * (Math.PI / 180);
        const x = playerPos.x + radius * Math.cos(angleRad);
        const z = playerPos.z + radius * Math.sin(angleRad);

        map.setFloat("speed", 60*(radius/7)+20);
        map.setFloat("resistance", 20*(radius/7)+20);

        placeBlock(player, { x: x, y: playerPos.y, z: z }, 6, 0, dimension, map);
    }
}

const move = {
    name: { translate: 'elements.earth.moves.earthshockwave.name' },
    description: { translate: 'elements.earth.moves.earthshockwave.description' },

    cost: 1,
    cooldown: 10,
    type: 'charge',

    id: 25,

    damage: {
        base: 5,
        multiplied: 48
    },

    charge(player, charge) {
        if (charge < 2) player.dimension.playSound("avatar.earth_charge", player.location, { volume: 0.5, pitch: 1 });

        player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/100} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;
        player.dimension.spawnParticle("a:earth_charge", player.location, map);

        // Pull nearby entities towards the player
        const entities = [...player.dimension.getEntities({ location: player.location, maxDistance: 8, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        for (const entity of entities) {
            const kbIntensity = (1 + Math.exp(-5 * (Math.ceil(calculateDistance(entity.location, player.location)) - 0.5)));
            const kbVector = calculateKnockbackVector(entity.location, player.location, -kbIntensity/2);
    
            // Apply knockback
            try {
                entity.applyKnockback(kbVector.x, kbVector.z, kbIntensity * 0.25, 0);
            } catch (error) {
                try { entity.applyImpulse(kbVector); } catch (error) {}
            }
        }

        if (!player.getEffect("resistance")) player.addEffect("resistance", 25, { amplifier: 1, showParticles: false })
    },

    cancel(player) {
        player.runCommand("stopsound @a[r=30] avatar.earth_charge");
        player.inputPermissions.movementEnabled = true;
    },

    activate(player, PLAYER_DATA) {
        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;
        player.playAnimation("animation.air.shockwave");

        delayedFunc(player, () => {
            const playerPos = player.location;
            map.setVector3("variable.plane", { x: 0.7*chargeFactor+0.5, y: 100*chargeFactor, z: 75*chargeFactor+4 });
            PLAYER_DATA.dimension.spawnParticle("a:earth_shockwave_dynamic", playerPos, map);
            player.runCommand(`camerashake add @a[r=12] 1.8 0.3 positional`);
            
            createShockwave(player, playerPos, (5 + PLAYER_DATA.levelFactor * 36 * chargeFactor), 8 * chargeFactor, 0);
        }, 5);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 25)

        delayedFunc(player, () => createRing(player, player.location, 7 * chargeFactor, PLAYER_DATA.dimension), 10);
        delayedFunc(player, () => createRing(player, player.location, 5 * chargeFactor, PLAYER_DATA.dimension), 8);
        delayedFunc(player, () => createRing(player, player.location, 3 * chargeFactor, PLAYER_DATA.dimension), 6);
        delayedFunc(player, () => createRing(player, player.location, 1 * chargeFactor, PLAYER_DATA.dimension), 4);

        PLAYER_DATA.dimension.playSound("avatar.earth_shockwave", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 });
    }
}

export default move;