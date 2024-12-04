import { PLAYER_DATA_MAP } from "../../index.js";

import { benderRuntime } from "./bender.js";
import { startTutorial } from "../tutorial/main.js";

import { setup } from "./setup.js";
import { hud } from "./hud.js";

export const playerRuntime = (player) => {
    // If the player is just joining, set them up with the default data
    if (!PLAYER_DATA_MAP[player.id]) setup(player);

    // Check if the player has completed the tutorial
    const hasCompletedTutorial = player.getDynamicProperty("TutorialCompleted");
    if (!hasCompletedTutorial) {
        player.setDynamicProperty("TutorialCompleted", true);
        startTutorial(player);
    }

    // Update the player's HUD
    hud(player);

    // This technically runs for nonbenders too, since "nonbender" is a type of bender
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    try {
        if (PLAYER_DATA.bender) benderRuntime(player);
    } catch (e) {};
    // if (PLAYER_DATA.bender) benderRuntime(player);
}