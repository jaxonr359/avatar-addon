import { system, Player, MolangVariableMap } from '@minecraft/server'
import { calculateDistance, mobTypes, animalTypes, calcVectorOffset } from "../../../../utils.js";

const customMap = new MolangVariableMap();

const traceLine = (player, pStart, pEnd, tint) => {
    try {
        const point1 = pStart;
        const point2 = pEnd;
        const distance = calculateDistance(point1, point2);
        const vectorDir = { x: point1.x - point2.x, y: point1.y - point2.y, z: point1.z - point2.z };
    
        const midPoint = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2, z: (point1.z + point2.z) / 2 };
    

        customMap.setVector3("variable.plane", tint);
        customMap.setVector3("variable.direction", vectorDir);
        customMap.setFloat("variable.length", distance/2);

        customMap.setFloat("variable.width", 0.003);
        player.spawnParticle("a:tracer_line", midPoint, customMap);
    } catch (error) {};
}

const move = {
    name: { translate: 'elements.earth.moves.seismicsense.name' },
    description: { translate: 'elements.earth.moves.seismicsense.description' },

    cost: 0.1,
    cooldown: 1,
    type: 'duration',

    id: 32,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'seismic_sense',

    start(player, PLAYER_DATA) {
        player.addEffect("minecraft:night_vision", 1000, { showParticles: false });

        player.runCommand("camera @s fade time 0.1 0.3 0.5 color 255 255 255");
        PLAYER_DATA.dimension.playSound("beacon.power", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        player.removeEffect("minecraft:night_vision");

        player.runCommand("camera @s fade time 0.1 0.3 0.5 color 255 255 255");
        PLAYER_DATA.dimension.playSound("beacon.deactivate", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 5) return;

        PLAYER_DATA.cooldown = 1;

        const { x, y, z } = player.location;
        const startLoc = calcVectorOffset(player, 0, 0, 1, PLAYER_DATA.viewDir, { x, y: y + 1.62, z });

        const entities = PLAYER_DATA.dimension.getEntities({ location: player.location, maxDistance: 48, excludeNames: [player.name] });
        let counter = 0;
        for (const entity of entities) {
            counter++;
            if (counter > 5) break;

            const typeId = entity.typeId;
            if (entity instanceof Player) {
                traceLine(player, startLoc, entity.location, { x: 1, y: 1, z: 0 });
            } else if (typeId === "minecraft:item") {
                traceLine(player, startLoc, entity.location, { x: 0.1, y: 0.9, z: 1 });
            } else if (mobTypes.has(typeId)) {
                traceLine(player, startLoc, entity.location, { x: 1, y: 0, z: 0 });
            } else if (animalTypes.has(typeId)) {
                traceLine(player, startLoc, entity.location, { x: 0, y: 1, z: 0 });
            } else {
                traceLine(player, startLoc, entity.location, { x: 1, y: 1, z: 0 });
            }
        }
    }
}

export default move;