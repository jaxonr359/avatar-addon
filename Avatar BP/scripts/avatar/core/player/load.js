import { PLAYER_DATA_MAP } from "../../index.js";
import { elements } from "../elements/import";

export const loadMoveset = (player) => {
    // Basically, we take the index map thing in 'moveset' and put the actual move in 'trueMoveset'
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    for (let i = 0; i < PLAYER_DATA.moveset.length; i++) {
        const move = PLAYER_DATA.moveset[i];
        if (move.style) {
            if (!PLAYER_DATA.elementMap.includes(move.style)) continue;

            const length = elements[move.style].moves.length;
            if (move.index < length) {
                PLAYER_DATA.trueMoveset[i] = elements[move.style].moves[move.index];
            } else {
                PLAYER_DATA.trueMoveset[i] = undefined;
            }
        } else {
            PLAYER_DATA.trueMoveset[i] = undefined;
        }
    }
};