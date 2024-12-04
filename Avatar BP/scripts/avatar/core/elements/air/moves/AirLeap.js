import { system } from "@minecraft/server";

const move = {
    name: { translate: 'elements.air.moves.airleap.name' },
    description: { translate: 'elements.air.moves.airleap.description' },

    cost: 20,
    cooldown: 10,
    type: 'standard',

    id: 3,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.air.push");
        PLAYER_DATA.dimension.spawnParticle("a:air_blast_pop", player.location);

        const viewDirection = PLAYER_DATA.viewDir;
        player.applyKnockback(viewDirection.x, viewDirection.z, 5, 0.7);
        player.addEffect("slow_falling", 65, { amplifier: 255, showParticles: false });

        PLAYER_DATA.dimension.playSound("avatar.air_woosh", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
        PLAYER_DATA.dimension.playSound("firework.launch", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 })

        let currentTick = 0;
        const sched_ID = system.runInterval(function tick() {
            currentTick++;
            if (currentTick > 25) return system.clearRun(sched_ID);
            PLAYER_DATA.dimension.spawnParticle("a:air_flutter", player.location);
            PLAYER_DATA.dimension.spawnParticle("a:air_blast_tiny", player.location);
        }, 1);
    }
}

export default move;