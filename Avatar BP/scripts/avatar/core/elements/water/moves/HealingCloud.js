import { delayedFunc } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.water.moves.healingcloud.name' },
    description: { translate: 'elements.water.moves.healingcloud.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 62,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'healing_cloud',

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 1) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 1;

        player.inputPermissions.movementEnabled = false;

        PLAYER_DATA.dimension.playSound("beacon.power", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
        player.playAnimation("animation.water.healing");

        PLAYER_DATA.dimension.spawnParticle("a:water_healing_area", player.location);
        const location = player.location;
        const entities = [...PLAYER_DATA.dimension.getEntities({ location: location, maxDistance: 16 })];
        entities.forEach(entity => {
            entity.addEffect("regeneration", 200, { amplifier: 1, showParticles: true });
            entity.addEffect("fire_resistance", 300, { amplifier: 1, showParticles: false });
        });

        delayedFunc(player, () => {
            player.inputPermissions.movementEnabled = true;
        }, 25);
    }
}

export default move;