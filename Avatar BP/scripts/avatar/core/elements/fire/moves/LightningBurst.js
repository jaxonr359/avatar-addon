import { MolangVariableMap, system } from "@minecraft/server";
import {
    calcVectorOffset,
    applyBendingDamage,
    calculateDistance,
    delayedFunc,
    findMultipleDesireableTargets,
    getEntitiesNearViewDirection,
    conductiveBlocks,
    depthFirstSearch,
    createShockwave
} from "../../../../utils.js";

const customMap = new MolangVariableMap();

export const traceLine = (player, pStart, pEnd) => {
    try {
        const point1 = pStart;
        const point2 = pEnd;
        const distance = calculateDistance(point1, point2);
        const vectorDir = { x: point1.x - point2.x, y: point1.y - point2.y, z: point1.z - point2.z };
    
        const midPoint = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2, z: (point1.z + point2.z) / 2 };
    
        customMap.setVector3("variable.plane", { x: 0.1, y: 0.9, z: 1 });
        customMap.setVector3("variable.direction", vectorDir);
        customMap.setFloat("variable.width", 0.06);
        customMap.setFloat("variable.length", distance/2);
        player.dimension.spawnParticle("a:lightning_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 0.1, y: 0.6, z: 1 });
        customMap.setFloat("variable.width", 0.08);
        player.dimension.spawnParticle("a:lightning_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 1, y: 1, z: 1 });
        customMap.setFloat("variable.width", 0.03);
        player.dimension.spawnParticle("a:lightning_line", midPoint, customMap);
    } catch (error) {};
}

const conductivitySim = (player, block) => {
    const connectedBlocks = depthFirstSearch(block);

    let currentTick = 0;
    const sched_ID = system.runInterval(function tick() {
        currentTick++;
        if (currentTick > 4) {
            return system.clearRun(sched_ID);
        }

        for (const connectedBlock of connectedBlocks) {
            const entities = connectedBlock.dimension.getEntities({ location: connectedBlock.location, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] });
            for (const entity of entities) {
                applyBendingDamage(player, entity, (6), 0);
            }

            const { x, y, z } = connectedBlock.location;
            const locationA = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };
            const locationB = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };
            const locationC = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };
            const locationD = { x: x + Math.random() * 2 - 1 + 0.5, y: y + Math.random() * 2 - 0.5, z: z + Math.random() * 2 - 1 + 0.5 };

            traceLine(connectedBlock, locationA, locationB);
            traceLine(connectedBlock, locationB, locationC);
            traceLine(connectedBlock, locationC, locationD);
        }

    }, 1);
};

const move = {
    name: { translate: 'elements.fire.moves.lightningburst.name' },
    description: { translate: 'elements.fire.moves.lightningburst.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 48,

    damage: {
        base: 3,
        multiplied: 24
    },

    skill_required: 'lightning_burst',

    activate(player, PLAYER_DATA) {
        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;

        player.playAnimation("animation.earth.spikes");

        PLAYER_DATA.dimension.playSound("avatar.lightning_burst", player.location, { volume: 0.2, pitch: 1.2 + Math.random() * 0.2 });

        let currentTick = 0;
        let canDoConductivity = true;
        player.runCommandAsync("camerashake add @a[r=10] 0.8 0.2 positional");
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 3) {
                return system.clearRun(sched_ID);
            }

            for (let i = 0; i < 2; i++) {
                const numLocations = 6;
                const locations = [];
                
                for (let i = 0; i < numLocations; i++) {
                    const xOffset = i === numLocations - 1 ? 0 : i === 0 ? 0 : Math.random() * 3 - 1.5;
                    const yOffset = i === numLocations - 1 ? 0 : i === 0 ? 0.6 : Math.random() * 3 - 1;
                    const zOffset = i === numLocations - 1 ? 3 * chargeFactor : 0.4 * chargeFactor * i + Math.random() * 4;
                
                    locations.push(calcVectorOffset(player, xOffset, yOffset, zOffset));
                
                    if (i > 0) {
                        traceLine(player, locations[i - 1], locations[i]);
                    }
                }
            }

            if (canDoConductivity) {
                const blockRay = player.getBlockFromViewDirection({ includePassableBlocks: true, includeLiquidBlocks: false, maxDistance: 25 });
                if (blockRay) {
                    const block = blockRay.block;
                    if (conductiveBlocks.has(block.typeId)) {
                        conductivitySim(player, block);
                        canDoConductivity = false;
                    }
                }
            }

            const viewDirection = PLAYER_DATA.viewDir;
            player.applyKnockback(viewDirection.x, viewDirection.z, -2.5, -viewDirection.y);

            createShockwave(player, player.location, 3 + 24 * PLAYER_DATA.levelFactor, 4.5, 1, true);
        }, 1);
    }
}

export default move;