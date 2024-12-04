import { PLAYER_DATA_MAP } from "../../index.js";
import { delayedFunc, magnitude } from "../../utils.js";

export const playerDimensionChange = (eventData) => {
    const { player } = eventData;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    if (!PLAYER_DATA) return;

    PLAYER_DATA.waitUntilZero = true;
}