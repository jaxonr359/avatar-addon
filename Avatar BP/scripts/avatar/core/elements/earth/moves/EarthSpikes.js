import { system, MolangVariableMap } from "@minecraft/server";
import { calcVectorOffset, createShockwave, delayedFunc, normalizeVector, groundBlocks } from "../../../../utils.js";

const placeBlock = (player, location, searchHeight = 6, iter = 0, dimension, map, levelFactor) => {
    if (iter >= 8) return 0;


    // Find the highest block at the given x and z coordinates
    const below = dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return 0;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 5) return 0;
    if (!block || !block.isAir) return placeBlock(player, location, searchHeight - 2, iter + 1, dimension, map, levelFactor);

    if (!groundBlocks.has(below.typeId)) return 0;

    if (below.typeId === "minecraft:amethyst_block") {
        dimension.spawnParticle("a:ame_earth_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
    } else {
        dimension.spawnParticle("a:earth_spike", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 }, map);
    }

    if (Math.random() > 0.6 && below.typeId === "minecraft:amethyst_block") {
        createShockwave(player, block.location, (4 + levelFactor * 20), 2, 1);
    } else {
        createShockwave(player, block.location, (4 + levelFactor * 12), 2, 1);    
    }

    dimension.spawnParticle("a:shook_earth_small", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });

    delayedFunc(player, () => {
        dimension.spawnParticle("a:shook_earth_small", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });
    }, 13);

    return 1;
}

function applyAngleTransform(viewVector, angleDegrees) {
    // Convert angle to radians
    const angle = angleDegrees * (Math.PI / 180);
  
    // Normalize the view vector
    const magnitude = Math.sqrt(viewVector.x ** 2 + viewVector.y ** 2 + viewVector.z ** 2);
    const normalizedVector = {
        x: viewVector.x / magnitude,
        y: viewVector.y / magnitude,
        z: viewVector.z / magnitude,
    };
  
    // Calculate sine and cosine of the angle
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
  
    // Apply the angle transform
    const transformedVector = {
        x: normalizedVector.x * cosAngle - normalizedVector.z * sinAngle,
        y: normalizedVector.y,
        z: normalizedVector.x * sinAngle + normalizedVector.z * cosAngle,
    };
  
    return transformedVector;
}

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.earth.moves.earthspikes.name' },
    description: { translate: 'elements.earth.moves.earthspikes.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 27,

    damage: {
        base: 4,
        multiplied: 12
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.fire.push");
        player.inputPermissions.movementEnabled = false;

        PLAYER_DATA.dimension.playSound("avatar.earth_spikes", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.5 });

        delayedFunc(player, () => {
            const viewDirection = PLAYER_DATA.viewDir;
            const playerDir = normalizeVector({ x: viewDirection.x, y: 0, z: viewDirection.z }, 1);
    
            const directions = [
                playerDir,
                applyAngleTransform(playerDir, 25),
                applyAngleTransform(playerDir, 15),
                applyAngleTransform(playerDir, 5),
                applyAngleTransform(playerDir, -5),
                applyAngleTransform(playerDir, -15),
                applyAngleTransform(playerDir, -25)
            ]
    
            let currentTick = 0;
            let successCount = 0;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 10) {
                    system.clearRun(sched_ID);

                    if (successCount === 0 && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.no_blocks' }]);
                    }
                }
    
                for (const direction of directions) {
                    const travelDir = {
                        x: direction.x,
                        y: 0.4,
                        z: direction.z
                    }
                    
                    map.setFloat("speed", 80*(currentTick/10));
                    map.setFloat("resistance", 30*(currentTick/10)+10);
                    const loc = calcVectorOffset(player, 0, -1, currentTick, travelDir, player.location);
                    successCount += placeBlock(player, loc, 6, 0, PLAYER_DATA.dimension, map, PLAYER_DATA.levelFactor);
                }
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