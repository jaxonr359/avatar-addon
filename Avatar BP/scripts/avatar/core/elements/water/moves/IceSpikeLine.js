import { system, MolangVariableMap } from "@minecraft/server";
import { calcVectorOffset, createShockwave, delayedFunc, normalizeVector } from "../../../../utils.js";

const placeBlock = (player, location, searchHeight = 16, iter = 0, dimension, map, levelFactor) => {
    if (iter >= 8) return 0;

    // Find the highest block at the given x and z coordinates
    const below = dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return 0;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 16) {
        return 0;
    }
    if (!block || !block.isAir) return placeBlock(player, location, searchHeight - 2, iter + 1, dimension, map, levelFactor);

    // Place the block
    dimension.spawnParticle("a:ice_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
    createShockwave(player, block.location, (4 + levelFactor * 8), 2, 1);    
    dimension.spawnParticle("a:water_preloaded_4", { x: block.x + 0.5, y: block.y + 0.4, z: block.z + 0.5 });
    delayedFunc(player, () => {
        dimension.spawnParticle("a:water_preloaded_4", { x: block.x + 0.5, y: block.y + 0.4, z: block.z + 0.5 });
    }, 13);

    return 1;
}

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.water.moves.icespikeline.name' },
    description: { translate: 'elements.water.moves.icespikeline.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 65,

    damage: {
        base: 4,
        multiplied: 8
    },

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 0.5) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 0.5;

        player.playAnimation("animation.fire.push");
        player.inputPermissions.movementEnabled = false;

        PLAYER_DATA.dimension.playSound("avatar.earth_spikes", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.1 });
        PLAYER_DATA.dimension.playSound("avatar.water_blast", player.location, { volume: 0.7, pitch: 1.5 + Math.random() * 0.1 });

        delayedFunc(player, () => {
            const viewDirection = PLAYER_DATA.viewDir;
            const playerDir = normalizeVector({ x: viewDirection.x, y: 0, z: viewDirection.z }, 1);
            const finalDir = { x: playerDir.x, y: 0.4, z: playerDir.z };

            let currentTick = 0;
            let successCount = 0;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 20) {
                    system.clearRun(sched_ID);

                    if (successCount === 0 && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    }
                }
    
                map.setFloat("speed", 60*(currentTick/20)+20);
                map.setFloat("resistance", 20*(currentTick/20)+20);
                const loc = calcVectorOffset(player, 0, -1, currentTick*1.5, finalDir, player.location);
                successCount += placeBlock(player, loc, 6, 0, PLAYER_DATA.dimension, map, PLAYER_DATA.levelFactor);
            }, 1);

            player.runCommand(`camerashake add @s 0.3 0.6 positional`);
        }, 5);

        delayedFunc(player, (removeDirtBlock) => {
            player.inputPermissions.movementEnabled = true;
        }, 12);

        delayedFunc(player, () => {
            player.runCommand(`camerashake add @s 0.3 0.6 positional`);
        }, 20);
    }
}

export default move;