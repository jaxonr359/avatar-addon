import { system } from "@minecraft/server";

const move = {
    name: { translate: 'elements.fire.moves.fireleap.name' },
    description: { translate: 'elements.fire.moves.fireleap.description' },

    cost: 20,
    cooldown: 10,
    type: 'standard',

    id: 42,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.push");

        const levelCheck = PLAYER_DATA.level >= 100;
        const fireType = (levelCheck) ? "a:fire_blue_blast" : "a:fire_blast";
        const fireTypeSecondary = (levelCheck) ? "a:fire_flutter_blue" : "a:fire_flutter";
        const fireTypePop = (levelCheck) ? "a:fire_blue_blast_pop" : "a:fire_blast_pop";    

        PLAYER_DATA.dimension.spawnParticle(fireTypePop, player.location);

        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 4, 0.3);
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });

        PLAYER_DATA.dimension.playSound("avatar.fire_woosh", player.location, { volume: 0.5, pitch: 0.9 + Math.random() * 0.3 })

        let currentTick = 0;
        const sched_ID = system.runInterval(function tick() {
            currentTick++;
            if (currentTick > 15) return system.clearRun(sched_ID);
            PLAYER_DATA.dimension.spawnParticle(fireTypeSecondary, player.location);
            PLAYER_DATA.dimension.spawnParticle(fireType, player.location);
        }, 1);
    }
}

export default move;