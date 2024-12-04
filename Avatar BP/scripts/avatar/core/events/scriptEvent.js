import { PLAYER_DATA_MAP, ALL_PROJECTILES } from "../../index.js";

import { reset } from "../player/setup.js";

export const scriptEvent = (eventData) => {
    const { id, message, sourceEntity, sourceType } = eventData;
    const PLAYER_DATA = PLAYER_DATA_MAP[sourceEntity.id];
    if (!PLAYER_DATA) return;

    const args = message.split(" ");

    switch (id.replace("avatar:", "")) {
        case "left_click_on":
            PLAYER_DATA.leftClick = true;
            break;
        case "left_click_off":
            PLAYER_DATA.leftClick = false;
            break;
        case "sneak_on":
            PLAYER_DATA.sneak = true;
            break;
        case "sneak_off":
            PLAYER_DATA.sneak = false;
            break;
        case "water_on":
            PLAYER_DATA.inWater = true;
            break;
        case "water_off":
            PLAYER_DATA.inWater = false;
            break;
        case "tutorial":
            sourceEntity.setDynamicProperty("TutorialCompleted", false);
            break;
        case "reset":
            reset(sourceEntity);
            break;
        case "sidebar":
            PLAYER_DATA.pauseChibar = true;
            PLAYER_DATA.sidebarRefreshed = false;
            break;
        case "set_level":
            sourceEntity.setDynamicProperty("level", parseInt(args[0]));
            PLAYER_DATA.level = parseInt(args[0]);
            PLAYER_DATA.levelFactor = PLAYER_DATA.level / 100;
        case "clear_move_usage":
            sourceEntity.setDynamicProperty("moveUsage", undefined);
            break;
        case "player_data":
            sourceEntity.sendMessage(JSON.stringify(PLAYER_DATA));
            break;
        case "projectile_data":
            sourceEntity.sendMessage(JSON.stringify(ALL_PROJECTILES));
            break;
        case "health":
            PLAYER_DATA.health = null;
            break;
        default:
            break;
    }
};