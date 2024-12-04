import { world, MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, calculateDistance } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.water.moves.bloodbending.name' },
    description: { translate: 'elements.air.moves.bloodbending.description' },

    cost: 1,
    cooldown: 10,
    type: 'duration',

    id: 56,

    damage: {
        base: 0,
        multiplied: 0
    },

    skill_required: 'bloodbending',

    start(player) {

    },
    end(player) {

    },
    activate(player, PLAYER_DATA) {
        PLAYER_DATA.cooldown = 10;

        const phase = world.getMoonPhase();
        const day = world.getTimeOfDay();

        if (phase !== 0 || day < 13000 || day > 23000) {
            PLAYER_DATA.chi = 0;
            return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.bloodbending' }]);
        }

        player.runCommand("camerashake add @s 0.02 0.2 positional");
        player.runCommandAsync(`execute as @s positioned ^^1^7.5 run tp @e[c=3,r=4] ~~~`);
    }
}

export default move;