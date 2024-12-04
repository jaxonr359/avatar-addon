import { MolangVariableMap, system } from "@minecraft/server";
import { createShockwave, applyBendingDamage, calculateDistance, delayedFunc } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.airshockwave.name' },
    description: { translate: 'elements.air.moves.airshockwave.description' },

    cost: 5,
    cooldown: 10,
    type: 'charge',

    id: 7,

    damage: {
        base: 4,
        multiplied: 28
    },

    charge(player, charge) {
        player.runCommand(`camerashake add @a[r=${0.08*charge}] ${charge/100} 0.05 positional`);
        player.inputPermissions.movementEnabled = false;
        player.dimension.spawnParticle("a:air_charge", player.location);
    },

    cancel(player) {
        player.inputPermissions.movementEnabled = true;
    },

    activate(player, PLAYER_DATA) {
        const charge = PLAYER_DATA.charge;
        const chargeFactor = charge/100;
        player.playAnimation("animation.air.shockwave");

        
        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.air_blast", player.location, { volume: 0.65, pitch: 1 + Math.random() * 0.2 }), 1);

        delayedFunc(player, () => {
            PLAYER_DATA.dimension.playSound("random.explode", player.location, { volume: 10, pitch: 1 + Math.random() * 0.2 })

            const playerPos = { x: player.location.x, y: player.location.y + 0.6, z: player.location.z };
            map.setVector3("variable.plane", { x: 0.7*chargeFactor+0.3, y: 100*chargeFactor, z: 55*chargeFactor+4 });
            PLAYER_DATA.dimension.spawnParticle("a:air_shockwave_dynamic", playerPos, map);
            
            createShockwave(player, playerPos, (4 + PLAYER_DATA.levelFactor * 28 * chargeFactor), 10 * chargeFactor, 25);
    
            let currentTick = 0;
            const sched_ID = system.runInterval(function tick() {
                currentTick++;
                if (currentTick > 10*chargeFactor) return system.clearRun(sched_ID);
    
                // Four directional particles
                const directions = [ 
                    { x: 1, z: 0 },
                    { x: -1, z: 0 },
                    { x: 0, z: 1 },
                    { x: 0, z: -1 }
                ];
    
                for (let i = 0; i < directions.length; i++) {
                    const direction = directions[i];
                    
                    // Now spawn the particle in the direction of direction with a magnitude of currentTick
                    const newLoc = { x: playerPos.x + direction.x * currentTick*2, y: playerPos.y + 0.5, z: playerPos.z + direction.z * currentTick*2 };
    
                    PLAYER_DATA.dimension.spawnParticle("a:air_flutter", newLoc);
                    PLAYER_DATA.dimension.spawnParticle("a:air", newLoc);
    
                    createShockwave(player, newLoc, 4 + PLAYER_DATA.levelFactor * 16 * chargeFactor, 3 + 2*chargeFactor, 0.5);
                }
            }, 1);
        }, 5);

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 25)
    }
}

export default move;