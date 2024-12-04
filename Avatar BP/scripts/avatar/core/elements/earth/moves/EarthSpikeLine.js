import { system, MolangVariableMap } from "@minecraft/server";
import { calcVectorOffset, createShockwave, delayedFunc, normalizeVector, groundBlocks } from "../../../../utils.js";

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

    if (!groundBlocks.has(below.typeId)) return 0;

    // Place the block
    dimension.spawnParticle("a:shook_earth_small", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });
    
    if (below.typeId === "minecraft:amethyst_block") {
        dimension.spawnParticle("a:ame_earth_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
        createShockwave(player, block.location, (4 + levelFactor * 20), 4, 1);
    } else {
        dimension.spawnParticle("a:earth_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
        createShockwave(player, block.location, (4 + levelFactor * 20), 4, 1); 
    }
    delayedFunc(player, () => {
        dimension.spawnParticle("a:shook_earth_small", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });
    }, 12);

    return 1;
}

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.earth.moves.earthspikeline.name' },
    description: { translate: 'elements.earth.moves.earthspikeline.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 26,

    damage: {
        base: 4,
        multiplied: 20
    },

    skill_required: 'earth_spike_line',

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.fire.push");
        player.inputPermissions.movementEnabled = false;

        PLAYER_DATA.dimension.playSound("avatar.earth_spikes", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.1 });

        delayedFunc(player, () => {
            const viewDirection = PLAYER_DATA.viewDir;
            const playerDir = normalizeVector({ x: viewDirection.x, y: 0, z: viewDirection.z }, 1);
            const finalDir = { x: playerDir.x, y: 0.4, z: playerDir.z };

            let currentTick = 0;
            let successCount = 0;
            let lastLoc 
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 15) {
                    system.clearRun(sched_ID);

                    if (successCount === 0 && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    }
                }
    
                map.setFloat("speed", 60*(currentTick/20)+20);
                map.setFloat("resistance", 20*(currentTick/20)+20);
                const loc = calcVectorOffset(player, 0, -1, currentTick*2.5, finalDir, player.location);
                
                if (lastLoc) {
                    // Get a location between the last and current location
                    const diff = { x: loc.x - lastLoc.x, y: loc.y - lastLoc.y, z: loc.z - lastLoc.z };
                    const distance = Math.sqrt(diff.x**2 + diff.y**2 + diff.z**2);
                    const steps = Math.ceil(distance);
                    const step = { x: diff.x/steps, y: diff.y/steps, z: diff.z/steps };
                    for (let i = 1; i <= steps; i++) {
                        const stepLoc = { x: lastLoc.x + step.x*i, y: lastLoc.y + step.y*i, z: lastLoc.z + step.z*i };
                        successCount += placeBlock(player, stepLoc, 6, 0, PLAYER_DATA.dimension, map, PLAYER_DATA.levelFactor);
                    }
                }

                successCount += placeBlock(player, loc, 6, 0, PLAYER_DATA.dimension, map, PLAYER_DATA.levelFactor);
                lastLoc = loc;
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