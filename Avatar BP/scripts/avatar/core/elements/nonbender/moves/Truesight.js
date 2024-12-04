
import { calcVectorOffset, applyBendingDamage, traceLine } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.nonbender.moves.truesight.name' },
    description: { translate: 'elements.nonbender.moves.truesight.description' },

    cost: 1,
    cooldown: 10,
    type: 'duration',

    id: 55,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'truesight',

    start(player, PLAYER_DATA) {
        player.addEffect("minecraft:night_vision", 1000, { showParticles: false });

        player.runCommand("camera @s fade time 0.1 0.3 0.5 color 0 0 0");
        PLAYER_DATA.dimension.playSound("beacon.power", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        player.removeEffect("minecraft:night_vision");

        player.runCommand("camera @s fade time 0.1 0.3 0.5 color 0 0 0");
        PLAYER_DATA.dimension.playSound("beacon.deactivate", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
    },
    activate(player, PLAYER_DATA) {
        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer < 5) return;

        PLAYER_DATA.cooldown = 1;

        const entities = PLAYER_DATA.dimension.getEntities({ location: player.location, maxDistance: 48, excludeNames: [player.name] });
        for (const entity of entities) {
            player.spawnParticle("a:fire_blast_pop", entity.location);
        }
    }
}

export default move;