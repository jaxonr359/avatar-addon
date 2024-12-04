import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, calculateDistance } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.air.moves.airspirit.name' },
    description: { translate: 'elements.air.moves.airspirit.description' },

    cost: 0.25,
    cooldown: 10,
    type: 'duration',

    skill_required: 'air_spirit',

    id: 10,

    damage: {
        base: 0,
        multiplied: 0
    },

    start(player, PLAYER_DATA) {
        const tags = player.getTags();
        const spiritTags = tags.filter(tag => tag.startsWith('spiritId'));
        const spiritLocTags = tags.filter(tag => tag.startsWith('spiritloc'));
        const gameModeTags = tags.filter(tag => tag.startsWith('orginalGM'));
        spiritTags.forEach(tag => player.removeTag(tag));
        spiritLocTags.forEach(tag => player.removeTag(tag));
        gameModeTags.forEach(tag => player.removeTag(tag));
        player.removeTag('inSpirit');
        
        player.addTag('orginalGM ' + player.getGameMode());

        PLAYER_DATA.cooldown = 10;
        PLAYER_DATA.chi = Math.max(PLAYER_DATA.chi - 2, 0);
        const entity = player.dimension.spawnEntity('a:spirit_player', player.location);
        player.setGameMode('spectator');

        entity.addTag('spiritId ' + player.id);

        player.addTag('inSpirit');
        player.addTag('spiritId ' + entity.id);
        player.addTag('spiritloc ' + JSON.stringify(player.location));
        player.sendMessage([{ text: '§7' }, { translate: 'elements.air.message.airspirit_start' }]);

        player.runCommand("camera @s fade time 0.1 0.3 0.5 color 255 255 255");
        PLAYER_DATA.dimension.playSound("beacon.power", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        const entity = player.dimension.getEntities({ type: 'a:spirit_player', tags: ['spiritId ' + player.id] })[0];
        if (entity) {
            entity.triggerEvent('minecraft:despawn');

            const tags = player.getTags();
            const locTag = tags.find(tag => tag.startsWith('spiritloc'));
            const loc = JSON.parse(locTag.split(' ')[1]);
            player.teleport(loc);

            const spiritTags = tags.filter(tag => tag.startsWith('spiritId'));
            const spiritLocTags = tags.filter(tag => tag.startsWith('spiritloc'));

            spiritTags.forEach(tag => player.removeTag(tag));
            spiritLocTags.forEach(tag => player.removeTag(tag));

            player.removeTag('inSpirit');
        } else {
            const tags = player.getTags();
            const locTag = tags.find(tag => tag.startsWith('spiritloc'));
            if (!locTag) return;

            const loc = JSON.parse(locTag.split(' ')[1]);
            player.teleport(loc);

            const spiritTags = tags.filter(tag => tag.startsWith('spiritId'));
            const spiritLocTags = tags.filter(tag => tag.startsWith('spiritloc'));

            spiritTags.forEach(tag => player.removeTag(tag));
            spiritLocTags.forEach(tag => player.removeTag(tag));
            player.removeTag('inSpirit');
        }

        const orginalGM = player.getTags().find(tag => tag.startsWith('orginalGM'));
        if (orginalGM) {
            const gameMode = orginalGM.split(' ')[1];
            player.setGameMode(gameMode);

            player.removeTag(orginalGM);
        } else {
            player.setGameMode('survival');
        }

        player.runCommand("camera @s fade time 0.1 0.3 0.5 color 255 255 255");
        PLAYER_DATA.dimension.playSound("beacon.deactivate", player.location, { volume: 8.7, pitch: 2 + Math.random() * 0.2 });
    },
    activate(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 1;
        const entity = player.dimension.getEntities({ type: 'a:spirit_player', tags: ['spiritId ' + player.id] })[0];
        if (!entity) {
            player.sendMessage([{ text: '§c' }, { translate: 'elements.air.message.airspirit_fail_interfere' }]);
            return PLAYER_DATA.chi = 0;
        }

        const distance = calculateDistance(player.location, entity.location);
        if (distance > 32) {
            player.sendMessage([{ text: '§c' }, { translate: 'elements.air.message.airspirit_fail_to_far' }]);
            return PLAYER_DATA.chi = 0;
        }

        const timer = PLAYER_DATA.currentDurationMoveTimer;
        if (timer > 45 && distance < 0.5) {
            return PLAYER_DATA.chi = 0;
        }
    }
}

export default move;