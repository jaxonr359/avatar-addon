import { system } from "@minecraft/server";
import { calcVectorOffset, createShockwave, calculateDistance, delayedFunc } from "../../../../utils.js";

import FireJump from "./FireJump.js";

const move = {
    name: { translate: 'elements.fire.moves.fireball.name' },
    description: { translate: 'elements.fire.moves.fireball.description' },

    cost: 30,
    cooldown: 10,
    type: 'standard',

    id: 39,

    damage: {
        base: 2,
        multiplied: 6
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.blast");

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("avatar.fire_blast", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            const fireball = PLAYER_DATA.dimension.spawnEntity('minecraft:fireball', calcVectorOffset(player, 0, 1, 2));
            fireball.triggerEvent("a:player_spawned");
            fireball.applyDamage(1, { cause: "entityAttack", damagingEntity: player });

            PLAYER_DATA.dimension.spawnParticle("a:fire_blast", fireball.location);

            

            const levelCheck = PLAYER_DATA.level >= 100;
            const fireTypeSecondary = (levelCheck) ? "a:fire_flutter_blue" : "a:fire_flutter";

            let loc = player.location;
            let currentTick = 0;
            const sched_ID = system.runInterval(function tick() {
                // In case of errors
                currentTick++;
                if (currentTick > 130) return system.clearRun(sched_ID);

                const valid = fireball.isValid();

                if (!valid) {
                    PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
                    createShockwave(player, loc, (2 + PLAYER_DATA.levelFactor * 6), 6, 2, true);

                    if (calculateDistance(player.location, loc) < 4) {
                        FireJump.activate(player, PLAYER_DATA);
                    }

                    PLAYER_DATA.dimension.playSound("random.explode", loc, { volume: 10, pitch: 1 - Math.random() * 0.2 });

                    return system.clearRun(sched_ID);
                } else {
                    try {
                        PLAYER_DATA.dimension.spawnParticle(fireTypeSecondary, loc);
                    } catch (err) {
                        return system.clearRun(sched_ID);
                    }
                }

                loc = fireball.location;
            }, 1);
        }, 8);
    }
}

export default move;