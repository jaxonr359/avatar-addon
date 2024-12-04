import { world, system, Player, GameMode, MolangVariableMap } from "@minecraft/server";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";
import { magnitude } from "../../utils.js";

export const clear = (player) => {
    player.onScreenDisplay.setTitle(`ema:reset`);
    player.onScreenDisplay.setActionBar(`a:reset`);
};

export const moveslot = (player, PLAYER_DATA) => {
    const TRUE_MOVESET = PLAYER_DATA.trueMoveset;
    const MOVE = TRUE_MOVESET[player.selectedSlotIndex];

    if (!MOVE) return player.onScreenDisplay.setActionBar({ translate: 'hud.sidebar.empty' });

    player.onScreenDisplay.setActionBar(MOVE.name);
}

export const chibar = (player, PLAYER_DATA) => {
    if (PLAYER_DATA.pauseChibar) return PLAYER_DATA.pauseChibar = false;

    // Get the filled amount of the chi bar to multiples of 4
    const ELEMENT = PLAYER_DATA.elements[0];
    const CHI_PERCENT = PLAYER_DATA.chi / 100;
    const FILLED = Math.floor(CHI_PERCENT*70)

    const statusFlag = PLAYER_DATA.charge > 10 ? "center" : "";
    const waterFlag = PLAYER_DATA.elementMap.includes("water") ? `a:water_${Math.floor(PLAYER_DATA.waterLoaded)}` : "a:water_hide";

    const gamemodeFlag = ["creative", "spectator"].includes(player.getGameMode()) ? "creative" : "combo";
    const combo = PLAYER_DATA.combo;
    const comboFlag = combo ? `a:${gamemodeFlag}_${Math.floor(combo)}` : "a:combo_hide";

    const hideSidebarFlag = PLAYER_DATA.settings.showSidebar ? "" : "xgk";

    // Set the title of the on screen display to show the chi bar UI
    // The first two characters control the color of the chi bar, ar for air, wt for water, et for earth, fr for fire
    // The next two are the 'hide' code 'a:' to remove from title text and display the chi bar
    const CHI_COLOR = PLAYER_DATA.overflow > 0 ? ELEMENT.chiCodeOverflow : ELEMENT.chiCode;
    player.onScreenDisplay.setTitle(`${CHI_COLOR}a:chibar_${FILLED}${statusFlag}${comboFlag}${waterFlag}${hideSidebarFlag}`);
};

export const sidebar = (player, PLAYER_DATA) => {
    if (!PLAYER_DATA.settings.showSidebar) return player.onScreenDisplay.setTitle("ara:chibar_0a:combo_hidea:water_hide}");

    const ELEMENT = PLAYER_DATA.elements[0];
    const MOVESET = PLAYER_DATA.trueMoveset;
    const NAMES = MOVESET.map(move => move ? move.name : { translate: 'hud.sidebar.empty' });

    player.onScreenDisplay.setTitle([{ text: `ara:chibar_0a:combo_hidea:water_hide}§l-- ${ELEMENT.color}` }, { translate: 'hud.sidebar.slots'}, { text: '§r§l --§r'}, ...NAMES.flatMap((name, index) => { return [{ text: `\n${index + 1}. ` }, name] })]);
};

export const hud = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    if (!WORLD_SETTINGS.enabled) return player.onScreenDisplay.setActionBar({ translate: 'hud.disabled' });
    if (PLAYER_DATA.noBendingZone) return player.onScreenDisplay.setActionBar({ translate: 'hud.no_bending_zone' });

    if (PLAYER_DATA.bender && PLAYER_DATA.enabled && PLAYER_DATA.settings.enabledBending && PLAYER_DATA.settings.showHudElements && !PLAYER_DATA.inMenu) {
        if (PLAYER_DATA.elementMap.length === 0) return;

        chibar(player, PLAYER_DATA);
        moveslot(player, PLAYER_DATA);

        // This is a bit messy, but until we get a surefire way to detect if the onScreenDisplay...
        // is actually being updated while the player loads, this will have to do
        if (!PLAYER_DATA.sidebarRefreshed) {
            const vel = player.getVelocity();
            if (magnitude(vel) > 0.1) {
                sidebar(player, PLAYER_DATA);
                PLAYER_DATA.sidebarRefreshed = true;
            }
        }

        // Same as above, but for portal travel, where (for some fucking reason) the player keeps their velocity the entire time
        // So we can't just wait until they move to know if the screen is clear. We gotta wait until it hits zero first
        if (PLAYER_DATA.waitUntilZero) { 
            const vel = player.getVelocity();
            if (magnitude(vel) < 0.1) {
                PLAYER_DATA.waitUntilZero = false;
                PLAYER_DATA.pauseChibar = true;
                PLAYER_DATA.sidebarRefreshed = false;
            }
        }
    } else if (!PLAYER_DATA.inMenu) {
        clear(player);
    }
};


