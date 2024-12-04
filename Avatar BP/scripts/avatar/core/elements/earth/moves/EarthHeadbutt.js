
import { PLAYER_DATA_MAP } from "../../../../index.js";
import { groundBlocks, applyBendingDamage, traceLine } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.earth.moves.eartheadbutt.name' },
    description: { translate: 'elements.earth.moves.eartheadbutt.description' },

    cost: 8,
    cooldown: 20,
    type: 'duration',

    id: 18,

    damage: {
        base: 5,
        multiplied: 10
    },

    skill_required: 'earth_headbutt',

    start(player, PLAYER_DATA) {
        player.playAnimation("animation.air.rush");
        
        PLAYER_DATA.dimension.playSound("avatar.earth_charge", player.location, { volume: 0.5, pitch: 1 });

        // We also add slow falling before the animation starts in case the player is trying to fall damage cancel
        player.addEffect("slow_falling", 95, { amplifier: 255, showParticles: false });
    },
    end(player) {
        player.playAnimation("animation.fire.sprint.end");

        player.runCommand("stopsound @a[r=40] avatar.earth_charge");
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 5) return;

        PLAYER_DATA.cooldown = 10;

        // Apply velocity in the direction the player is looking at
        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 2.5, 0);

        // Get the blocks around the player
        const { x, y, z } = player.location;
        const blockLocs = [
            { x: x + 1, y: y, z: z },
            { x: x - 1, y: y, z: z },
            { x: x, y: y, z: z + 1 },
            { x: x, y: y, z: z - 1 },
            { x: x + 1, y: y, z: z + 1 },
            { x: x - 1, y: y, z: z - 1 },
            { x: x + 1, y: y, z: z - 1 },
            { x: x - 1, y: y, z: z + 1 },
            { x: x + 1, y: y + 1, z: z },
            { x: x - 1, y: y + 1, z: z },
            { x: x, y: y + 1, z: z + 1 },
            { x: x, y: y + 1, z: z - 1 },
            { x: x + 1, y: y + 1, z: z + 1 },
            { x: x - 1, y: y + 1, z: z - 1 },
            { x: x + 1, y: y + 1, z: z - 1 },
            { x: x - 1, y: y + 1, z: z + 1 }
        ];

        for (const blockLoc of blockLocs) {
            const block = PLAYER_DATA.dimension.getBlock(blockLoc);
            if (groundBlocks.has(block.typeId)) {
                player.runCommand(`setblock ${blockLoc.x} ${blockLoc.y} ${blockLoc.z} minecraft:air destroy`);
            }
        }

        PLAYER_DATA.dimension.spawnParticle("a:earth_sprint", { x, y, z });

        // The end of the runtime
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });

        // Apply bending damage to nearby entities
        const nearbyEntities = [...player.dimension.getEntities({ location: player.location, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
        nearbyEntities.forEach(entity => applyBendingDamage(player, entity, (3 + PLAYER_DATA.levelFactor * 10), 0.1));
    
        player.runCommand(`camerashake add @s 0.4 0.05 positional`);
    }
}

export default move;