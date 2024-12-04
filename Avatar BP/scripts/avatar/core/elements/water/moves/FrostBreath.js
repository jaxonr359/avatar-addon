import { system, Player } from "@minecraft/server";
import { delayedFunc } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.water.moves.frostbreath.name' },
    description: { translate: 'elements.water.moves.frostbreath.description' },

    cost: 35,
    cooldown: 35,
    type: 'standard',

    id: 58,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'frost_breath',

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 0.25) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 0.25;
        
        player.playAnimation("animation.air.blast");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.ice_form", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.1 }), 1);

        delayedFunc(player, movementReturn => {
            player.runCommand(`camerashake add @s 0.4 0.2 positional`);
            
            PLAYER_DATA.dimension.spawnParticle("a:frost_breath", player.location);

            const nearbyEntities = PLAYER_DATA.dimension.getEntities({ location: player.location, maxDistance: 6, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] });

            for (const entity of nearbyEntities) {
                if (entity instanceof Player) {
                    player.inputPermissions.movementEnabled = false;

                    // Delayed function per player (so that logging out doesn't affect other players)
                    delayedFunc(entity, () => {
                        player.inputPermissions.movementEnabled = true;
                    }, 60);
                } else {
                    entity.addEffect("slowness", 60, { amplifier: 255, showParticles: false });
                }
            }

            let currentTick = 0;
            const sched_ID = system.runInterval(function tick() {
                currentTick++;
                if (currentTick > 60) return system.clearRun(sched_ID);
                
                for (const entity of nearbyEntities) {
                    try {
                       PLAYER_DATA.dimension.spawnParticle("a:frost_breath", entity.location); 
                    } catch (error) {};
                }
            }, 1);
        }, 4);
    }
}

export default move;