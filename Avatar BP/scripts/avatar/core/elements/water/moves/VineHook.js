
import { system, MolangVariableMap } from "@minecraft/server";
import { calculateDistance, calculateKnockbackVector, createShockwave, delayedFunc } from "../../../../utils.js";

const customMap = new MolangVariableMap();

const traceLineFlat = (player, pStart, pEnd) => {
    try {
        const point1 = pStart;
        const point2 = pEnd;
        const distance = calculateDistance(point1, point2);
        const vectorDir = { x: point1.x - point2.x, y: point1.y - point2.y, z: point1.z - point2.z };
    
        const midPoint = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2, z: (point1.z + point2.z) / 2 };
    
        customMap.setVector3("variable.direction", vectorDir);
        customMap.setFloat("variable.length", distance/2);
        customMap.setFloat("variable.width", 0.08);
        customMap.setVector3("variable.plane", { x: 0.3, y: 1, z: 0.3 });
        player.dimension.spawnParticle("a:metal_line", midPoint, customMap);

        customMap.setVector3("variable.plane", { x: 0.3, y: 0.9, z: 0.3 });
        customMap.setFloat("variable.width", 0.06);
        player.dimension.spawnParticle("a:metal_line", midPoint, customMap);
    } catch (error) {};
}

const move = {
    name: { translate: 'elements.water.moves.vinehook.name' },
    description: { translate: 'elements.water.moves.vinehook.description' },

    cost: 5,
    cooldown: 10,
    type: 'charge',

    id: 73,

    damage: {
        base: 10,
        multiplied: 16
    },

    skill_required: 'vine_hook',

    charge(player, charge) {
        //player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/200} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;

        if (charge < 6) player.dimension.playSound("avatar.water_charge", player.location, { volume: 0.9, pitch: 1 });
    },

    cancel(player) {
        player.inputPermissions.movementEnabled = true;
        player.runCommand("stopsound @a[r=30] avatar.water_charge");
    },

    activate(player, PLAYER_DATA) {
        const CHARGE_FACTOR = PLAYER_DATA.charge / 100;
        let entities = player.dimension.getEntities({ location: player.location, maxDistance: 16*CHARGE_FACTOR, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["spider_dmg_off"] });    

        let currentTick = 0;
        let endRuntime = false;
        const sched_ID = system.runInterval(function tick() {
            currentTick++;
            if (currentTick > 22 || endRuntime) {
                player.runCommand("stopsound @a[r=30] avatar.water_charge");
                return system.clearRun(sched_ID);
            }
            PLAYER_DATA.cooldown = 10;
    
            for (const entity of entities) {
                entity.addEffect("fatal_poison", 60, { amplifier: 1, showParticles: false });
                const kbVector = calculateKnockbackVector(entity.location, player.location, 1);
                const horizontal = Math.sqrt(kbVector.x ** 2 + kbVector.z ** 2);

                const { x, y, z } = player.location;
                traceLineFlat(player, { x, y: y + 1, z }, entity.location);
                entity.applyKnockback(-kbVector.x, -kbVector.z, horizontal * 3, -kbVector.y * 3 + 0.5);
            }
    
            if (entities.length == 0) endRuntime = true;
        }, 1);

        player.inputPermissions.movementEnabled = true;
    }
}

export default move;