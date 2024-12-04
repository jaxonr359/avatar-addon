import { PLAYER_DATA_MAP } from "../../index.js";

export const itemReleaseUse = (eventData) => {
    const { source, itemStack } = eventData;

    const PLAYER_DATA = PLAYER_DATA_MAP[source.id];
    if (!PLAYER_DATA) return;

    PLAYER_DATA.holdingBow = false;
}