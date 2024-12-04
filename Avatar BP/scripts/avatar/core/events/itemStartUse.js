import { PLAYER_DATA_MAP } from "../../index.js";

export const itemStartUse = (eventData) => {
    const { source, itemStack } = eventData;

    const PLAYER_DATA = PLAYER_DATA_MAP[source.id];
    if (!PLAYER_DATA) return;

    if (itemStack.typeId != "minecraft:bow") return;

    PLAYER_DATA.holdingBow = true;
}