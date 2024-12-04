import { MolangVariableMap, system } from "@minecraft/server";
import {
    createShockwave,
    calculateKnockbackVector,
    calculateDistance,
    delayedFunc
} from "../../../../utils.js";


const placeBlock = (player, location, searchHeight = 16, iter = 0, dimension) => {
    if (iter >= 8) return 0;

    // Find the highest block at the given x and z coordinates
    const below = dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return 0;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 16) {
        return 0;
    }
    if ((!block || !block.isAir) && iter < 8) return placeBlock(player, location, searchHeight - 2, iter + 1, dimension);
    
    // Place the block
    dimension.spawnParticle("a:fire_blast", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });

    const inventoryComponent = below.getComponent("inventory");
    if (inventoryComponent) return 0;

    const beforeType = below.typeId;
    const beforePermutation = below.permutation;
    if (beforeType === "minecraft:magma") return 0;

    const aboveType = block.typeId;
    const abovePermutation = block.permutation;

    block.setType("minecraft:air");

    below.setType("minecraft:magma");

    createShockwave(player, block.location, 18, 4, 1);

    delayedFunc(player, () => {
        if (!below.isAir && below.typeId === "minecraft:magma") below.setType(beforeType);
        below.setPermutation(beforePermutation);
        block.setType(aboveType);
        block.setPermutation(abovePermutation);
    }, 126);

    return 1;
}


const move = {
    name: { translate: 'elements.earth.moves.magmasurge.name' },
    description: { translate: 'elements.earth.moves.magmasurge.description' },

    cost: 2,
    cooldown: 10,
    type: 'charge',

    id: 30,

    damage: {
        base: 20,
        multiplied: 0
    },

    skill_required: 'magma_surge',

    charge(player, charge) {
        if (charge < 3) player.dimension.playSound("avatar.earth_charge", player.location, { volume: 0.5, pitch: 1 });

        player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/100} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;
        player.dimension.spawnParticle("a:earth_charge", player.location);

        const entities = [...player.dimension.getEntities({ location: player.location, maxDistance: 30, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        for (const entity of entities) {
            const kbIntensity = (1 + Math.exp(-5 * (Math.ceil(calculateDistance(entity.location, player.location)) - 0.5)));
            const kbVector = calculateKnockbackVector(entity.location, player.location, -kbIntensity/2);
    
            // Apply knockback
            try {
                entity.applyKnockback(kbVector.x, kbVector.z, kbIntensity * 0.45, 0.02);
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
        player.runCommand("stopsound @a[r=30] avatar.earth_charge");

        PLAYER_DATA.dimension.playSound("avatar.magma_surge", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.8 });

        const { x, y, z } = player.location;

        let currentTick = 0;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 35 || currentTick > chargeFactor * 10) {
                player.inputPermissions.movementEnabled = true;
                return system.clearRun(sched_ID);
            }

            // For 8 directions around the player
            for (let i = 0; i < 24; i++) {
                const direction = i * Math.PI / 12;
                const stepSize = currentTick;

                const travelDir = { x: Math.cos(direction), y: 0, z: Math.sin(direction) };

                const loc = { x: x + travelDir.x * stepSize, y: y, z: z + travelDir.z * stepSize };

                placeBlock(player, loc, 16, 0, PLAYER_DATA.dimension);
            }
        }, 1);

    }
}

export default move;