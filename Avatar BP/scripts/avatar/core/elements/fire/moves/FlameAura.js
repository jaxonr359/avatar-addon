import { system } from "@minecraft/server";
import { calcVectorOffset, createShockwave, calculateDistance, delayedFunc } from "../../../../utils.js";


const shootFireball = (player, PLAYER_DATA) => {
    const fireball = PLAYER_DATA.dimension.spawnEntity('minecraft:fireball', calcVectorOffset(player, 0, 1, 2));
    fireball.triggerEvent("a:player_spawned");
    fireball.applyDamage(1, { cause: "entityAttack", damagingEntity: player });

    PLAYER_DATA.dimension.spawnParticle("a:fire_blast", fireball.location);

    let loc = player.location;
    let currentTick = 0;
    const sched_ID = system.runInterval(function tick() {
        // In case of errors
        currentTick++;
        if (currentTick > 130) return system.clearRun(sched_ID);

        const valid = fireball.isValid();

        if (!valid) {
            PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
            createShockwave(player, loc, (2 + PLAYER_DATA.levelFactor * 2), 4, 2, true);
            return system.clearRun(sched_ID);
        }

        loc = fireball.location;
    }, 1);
}


const move = {
    name: { translate: 'elements.fire.moves.flameaura.name' },
    description: { translate: 'elements.fire.moves.flameaura.description' },

    cost: 2,
    cooldown: 10,
    type: 'duration',

    id: 44,

    skill_required: 'flame_aura',

    damage: {
        base: 2,
        multiplied: 2
    },

    start(player) {
        player.dimension.playSound("avatar.fire_sprint", player.location, { volume: 1, pitch: 0.9 });
    },
    end(player) {
        player.runCommand("stopsound @a[r=30] avatar.fire_sprint");
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 10) return;

        PLAYER_DATA.cooldown = 2;

        if (timer % 10 === 0) {
            PLAYER_DATA.dimension.playSound("avatar.fire_blast", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 });
        }

        if (timer % 10 === 0) {
            shootFireball(player, PLAYER_DATA);
        }

        PLAYER_DATA.dimension.spawnParticle("a:fire_blast_pop", player.location);
    }
}

export default move;