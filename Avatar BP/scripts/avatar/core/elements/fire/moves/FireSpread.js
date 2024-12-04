import { system } from "@minecraft/server";
import { calcVectorOffset, createShockwave, delayedFunc, normalizeVector } from "../../../../utils.js";


const placeBlock = (player, location, searchHeight = 6, iter = 0, dimension) => {
    if (iter >= 8) return 0;

    // Find the highest block at the given x and z coordinates
    const below = dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return 0;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 5) return 0;
    if (!block || !block.isAir) return placeBlock(player, location, searchHeight - 2, iter + 1, dimension);

    // Place the block
    block.setType("minecraft:fire");
    dimension.spawnParticle("a:fire_blast_pop", { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });

    delayedFunc(player, () => {
        if (!block.isAir && block.typeId === "minecraft:fire") block.setType("minecraft:air");
    }, 5);

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

const move = {
    name: { translate: 'elements.fire.moves.firespread.name' },
    description: { translate: 'elements.fire.moves.firespread.description' },

    cost: 40,
    cooldown: 5,
    type: 'standard',

    id: 43,

    damage: {
        base: 4,
        multiplied: 22
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.fire.push");
        player.inputPermissions.movementEnabled = false;

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.fire_blast", player.location, { volume: 1.5, pitch: 1 - Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            player.addEffect("fire_resistance", 85, { amplifier: 1, showParticles: false });
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
                        player.sendMessage([{ text: '§7' }, { translate: 'elements.fire.message.no_blocks' }]);
                    }
                }
    
                for (const direction of directions) {
                    const travelDir = {
                        x: direction.x,
                        y: 0.4,
                        z: direction.z
                    }
                    
                    const loc = calcVectorOffset(player, 0, -1, currentTick, travelDir, player.location);
                    successCount += placeBlock(player, loc, 6, 0, PLAYER_DATA.dimension);
                }
            }, 1);

            createShockwave(player, calcVectorOffset(player, 0, 2.5, 5, playerDir), (4 + PLAYER_DATA.levelFactor * 22), 8, 2, true);
            player.runCommand(`camerashake add @s 0.4 0.2 positional`);
        }, 5);

        delayedFunc(player, (removeDirtBlock) => {
            player.inputPermissions.movementEnabled = true;
        }, 12);
    }
}

export default move;