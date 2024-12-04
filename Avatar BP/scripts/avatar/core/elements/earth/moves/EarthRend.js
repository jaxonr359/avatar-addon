import { system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, groundBlocks, createShockwave } from './../../../../utils.js';

let removeBlocks = [];

function findBlock(player, currentPos) {
	var currentBlock = player.dimension.getBlock(currentPos);
	while (!currentBlock.isSolid) { // grass path is not solid, add check here later
		currentPos = { x: currentPos.x, y: currentPos.y - 1, z: currentPos.z }
		currentBlock = player.dimension.getBlock(currentPos);
	}

    if (!groundBlocks.has(currentBlock.typeId)) return console.warn(currentBlock.typeId);

    const alreadyExists = removeBlocks.some(item => item.block.location === currentBlock.location);
    if (alreadyExists || currentBlock.typeId == "minecraft:air") return;

    const currentType = currentBlock.type;
    currentBlock.setType("minecraft:air");

    delayedFunc(player, () => {
        currentBlock.setType(currentType);
    }, 35);
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
    name: { translate: 'elements.earth.moves.earthrend.name' },
    description: { translate: 'elements.earth.moves.earthrend.description' },

    cost: 50,
    cooldown: 50,
    type: 'standard',

    id: 22,

    damage: {
        base: 4,
        multiplied: 10
    },

    skill_required: 'earth_rend',

    activate(player, PLAYER_DATA) {
        removeBlocks = [];

        player.playAnimation("animation.earth.shockwave");
        player.inputPermissions.movementEnabled = false;

        // To be executed when the animation is done
        delayedFunc(player, () => {
            let currentTick = 0;
            let endRuntime = false;
            let currentLocation;

            const playerView = PLAYER_DATA.viewDir;
            const directions = [
                playerView,
                applyAngleTransform(playerView, 15),
                applyAngleTransform(playerView, 5),
                applyAngleTransform(playerView, -5),
                applyAngleTransform(playerView, -15)
            ]
            

            PLAYER_DATA.dimension.playSound("avatar.earth_rend", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.5 });

            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 10) return system.clearRun(sched_ID);

                for (const direction of directions) {
                    const travelDir = {
                        x: direction.x,
                        y: 0.4,
                        z: direction.z
                    }
                    
                    let currentPos;
                    if (!currentLocation) currentLocation = player.location;
                    currentPos = calcVectorOffset(player, 0, 0, currentTick, travelDir, currentLocation);
                    findBlock(player, currentPos);
                }

                // The end of the runtime
                if (currentTick > 8 || endRuntime) {
                    return system.clearRun(sched_ID);
                }
            }, 1);

            createShockwave(player, player.location, (4 + PLAYER_DATA.levelFactor * 10), 5, 1);
        }, 10);
        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 40);
    }
}

export default move;