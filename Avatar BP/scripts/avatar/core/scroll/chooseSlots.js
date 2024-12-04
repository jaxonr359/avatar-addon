import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";

import { chooseBendingMenu } from "./chooseBending.js";
import { showSkillTreeMenu } from "./skillTree.js";
import { chooseSettingsMenu } from "./chooseSettings.js";
import { statsInfoMenu } from "./statsInfo.js";
import { loadMoveset } from "../player/load.js";
import { sidebar } from "../player/hud.js";
import { delayedFunc } from "../../utils.js";
import { teamsMenu } from "./teams.js";

export const actionTranslations = [
    { translate: 'elements.bindings.double_sneak' },
    { translate: 'elements.bindings.right_click' },
    { translate: 'elements.bindings.sneak_punch' },
    { translate: 'elements.bindings.punch' },
    { translate: 'elements.bindings.look_down_punch' },
    { translate: 'elements.bindings.look_up_sneak' },
    { translate: 'elements.bindings.look_down_sneak' },
    { translate: 'elements.bindings.look_up_punch' },
    { translate: 'elements.bindings.double_jump' },
    { translate: 'elements.bindings.sneak_jump' }
]

const infoMenu = (player, slot = 0, movestart = 0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    
    const infoMenu = new ActionFormData();
    infoMenu.title({ rawtext: [
        { translate: 'scroll.choose_slots.info.title' },
        { text: '§d§f' },
    ]});

    infoMenu.body({ rawtext: [
        { text: '§p' },
        { translate: 'scroll.choose_slots.info.whatare' },
        { text: '\n§7' },
        { translate: 'scroll.choose_slots.info.whatare.desc' },
        { text: '\n\n§p' },
        { translate: 'scroll.choose_slots.info.howto' },
        { text: '\n§7' },
        { translate: 'scroll.choose_slots.info.howto.desc' },
        { text: '\n\n§p' },
        { translate: 'scroll.choose_slots.info.save' },
        { text: '\n§7' },
        { translate: 'scroll.choose_slots.info.save.desc' }
    ]})

    infoMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');

    infoMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            chooseSlotsMenu(player, slot, movestart);
        }

        PLAYER_DATA.inMenu = false;
    });
};

const movesetsMenu = (player, slot, movestart) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const movesetsMenu = new ActionFormData();
    movesetsMenu.title({ rawtext: [
        { translate: 'scroll.choose_slots.movesets.title' },
        { text: '§c§b' },
    ]});

    movesetsMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) movesetsMenu.button('');

    movesetsMenu.button({ translate: 'scroll.choose_slots.movesets.save' }, 'textures/ui/avatar/whitelist_add');
    movesetsMenu.button({ translate: 'scroll.choose_slots.movesets.load' }, 'textures/ui/avatar/pay');
    movesetsMenu.button({ translate: 'scroll.choose_slots.movesets.delete' }, 'textures/ui/avatar/whitelist_remove');

    movesetsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            return chooseSlotsMenu(player, slot, movestart);
        }

        if (selection === 6) {
            return createMovesetMenu(player, slot, movestart);
        } else if (selection === 7) {
            return loadMovesetMenu(player, slot, movestart);
        } else if (selection === 8) {
            deleteMovesetMenu(player, slot, movestart);
        }

        PLAYER_DATA.inMenu = false;
    });
};

const createMovesetMenu = (player, slot, movestart) => {
    const MAX_MOVESETS = 12;
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeMoveset = new ModalFormData();
    makeMoveset.title({ rawtext: [
        { translate: 'scroll.choose_slots.movesets.create.title' },
        { text: '§m§f' },
    ]});

    makeMoveset.textField({ translate: 'scroll.choose_slots.movesets.create.description' }, { translate: 'scroll.choose_slots.movesets.create.placeholder' });
    
    makeMoveset.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.create.exit" }]});
            return movesetsMenu(player, slot, movestart);
        }
        
        const [ name ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.create.tooshort", with: [`${MIN_LENGTH}`] }]});
            return createMovesetMenu(player, slot, movestart);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.create.toolong", with: [`${MAX_LENGTH}`] }]});
            return createMovesetMenu(player, slot, movestart);
        }

        // Get all movesets
        const movesets = player.getDynamicPropertyIds().filter(prop => prop.startsWith("moveset_"));
        if (movesets.includes("moveset_" + name)) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.create.exists", with: [name] }]});
        }

        if (movesets.length > MAX_MOVESETS) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.create.toomany", with: [`${MAX_MOVESETS}`] }]});
        }
        
        const movesetAndBindings = [JSON.stringify(PLAYER_DATA.moveset), JSON.stringify(PLAYER_DATA.bindings)];
        player.setDynamicProperty("moveset_" + name, JSON.stringify(movesetAndBindings));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.choose_slots.movesets.create.success", with: [name] }]});

        PLAYER_DATA.inMenu = false;
    });
};

const loadMovesetMenu = (player, slot, movestart) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const movesets = player.getDynamicPropertyIds().filter(prop => prop.startsWith("moveset_"));
    if (movesets.length === 0) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.load.none" }]});
        return movesetsMenu(player, slot, movestart);
    }

    const loadMovesetForm = new ActionFormData();
    loadMovesetForm.title({ rawtext: [
        { translate: 'scroll.choose_slots.movesets.load.title' },
        { text: '§d§f' },
    ]});

    loadMovesetForm.body({ translate: 'scroll.choose_slots.movesets.load.description' });

    loadMovesetForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) loadMovesetForm.button('');

    // Get all movesets
    for (const moveset of movesets) {
        loadMovesetForm.button(moveset.replace("moveset_", ""));
    }

    loadMovesetForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.load.exit" }]});
        }

        if (selection === 0) {
            return movesetsMenu(player, slot, movestart);
        }

        const moveset = movesets[selection - 6];
        const movesAndBindings = JSON.parse(player.getDynamicProperty(moveset));

        const [ moves, bindings ] = movesAndBindings;
        PLAYER_DATA.bindings = JSON.parse(bindings);
        PLAYER_DATA.moveset = JSON.parse(moves);

        loadMoveset(player);
        fixMoveset(player);
        loadMoveset(player);
        
        sidebar(player, PLAYER_DATA);
        player.setDynamicProperty("moveset", JSON.stringify(PLAYER_DATA.moveset));
        
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.choose_slots.movesets.load.success", with: [moveset.replace("moveset_", "")] }]});

        // Delay the inMenu flag to prevent the hud from overwriting the sidebar command
        delayedFunc(player, () => {
            PLAYER_DATA.inMenu = false;
        }, 2);
    });
}

const deleteMovesetMenu = (player, slot, movestart) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const movesets = player.getDynamicPropertyIds().filter(prop => prop.startsWith("moveset_"));
    if (movesets.length === 0) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.delete.none" }]});
        return movesetsMenu(player, slot, movestart);
    }

    const deleteMovesetForm = new ActionFormData();
    deleteMovesetForm.title({ rawtext: [
        { translate: 'scroll.choose_slots.movesets.delete.title' },
        { text: '§d§f' },
    ]});

    deleteMovesetForm.body({ translate: 'scroll.choose_slots.movesets.delete.description' });

    deleteMovesetForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) deleteMovesetForm.button('');

    // Get all movesets
    for (const moveset of movesets) {
        deleteMovesetForm.button(moveset.replace("moveset_", ""));
    }

    deleteMovesetForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.choose_slots.movesets.delete.exit" }]});
        }

        if (selection === 0) {
            return movesetsMenu(player, slot, movestart);
        }

        const moveset = movesets[selection - 6];
        player.setDynamicProperty(moveset, undefined);
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.choose_slots.movesets.delete.success", with: [moveset.replace("moveset_", "")] }]});

        PLAYER_DATA.inMenu = false;
    });
}

const resetMenu = (player, slot, movestart) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const resetMenu = new ActionFormData();
    resetMenu.title({ rawtext: [
        { translate: 'scroll.choose_slots.reset.title' },
        { text: '§d§f' },
    ]});

    resetMenu.body({ translate: 'scroll.choose_slots.reset.description' });

    resetMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) resetMenu.button('');

    // Reset all slots
    resetMenu.button({ translate: 'scroll.choose_slots.reset.all' });
    resetMenu.button({ translate: 'scroll.choose_slots.reset.current' });

    resetMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            return chooseSlotsMenu(player, slot, movestart);
        }

        if (selection === 6) {
            for (let i = 0; i < 9; i++) {
                PLAYER_DATA.moveset[i] = { style: null, index: null };
                PLAYER_DATA.bindings[i] = 0;
            }

            loadMoveset(player);
            sidebar(player, PLAYER_DATA);

            player.setDynamicProperty("moveset", JSON.stringify(PLAYER_DATA.moveset));
            player.setDynamicProperty("bindings", JSON.stringify(PLAYER_DATA.bindings));

            return player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.choose_slots.reset.all.success" }]});
        } else if (selection === 7) {
            PLAYER_DATA.moveset[slot] = { style: null, index: null };
            PLAYER_DATA.bindings[slot] = 0;

            loadMoveset(player);
            sidebar(player, PLAYER_DATA);

            player.setDynamicProperty("moveset", JSON.stringify(PLAYER_DATA.moveset));
            player.setDynamicProperty("bindings", JSON.stringify(PLAYER_DATA.bindings));

            return player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.choose_slots.reset.current.success" }]});
        }

        PLAYER_DATA.inMenu = false;
    });

}

export const fixMoveset = (player) => {
    // The purpose of this function is to verify that the moveset is valid
    // AKA: doesn't have moves the player can't use (due to skill tree)

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const trueMoveset = PLAYER_DATA.trueMoveset;
    const level = PLAYER_DATA.level;

    const allowedMoves = [];
    const elements = PLAYER_DATA.elements;
    let moveIndex = 0;
    for (const element of elements) {
        for (const move of element.moves) {
            moveIndex++;
            if ((moveIndex > level) && !move.skill_required) continue;
            if (move.skill_required && !PLAYER_DATA.skills.includes(move.skill_required)) continue;
            if (WORLD_SETTINGS.bannedmoves.includes(move.id)) continue;

            allowedMoves.push(move);
        }
    }

    for (let i = 0; i < 9; i++) {
        const trueMove = trueMoveset[i];
        if (!trueMove) continue;

        let found = false;
        for (const move of allowedMoves) {
            if (JSON.stringify(move) === JSON.stringify(trueMove)) {
                found = true;
                break;
            }
        }

        if (!found) {
            PLAYER_DATA.moveset[i] = { style: null, index: null };
        }
    }
}

export const chooseSlotsMenu = (player, slot = 0, movestart = 0) => {
    /* 
     * My condolences.
     * A forward to all those who are reading this code.
     * It's completely unreadable.. I know. I'm sorry.
     * It was done at 3AM on 300mg of caffeine.
     * I can't even read it myself. It works, though. Somehow.
     */

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    if (PLAYER_DATA.elementMap.length === 0) {
        player.sendMessage([{ text: '§c' }, { translate: 'scroll.choose_element.error' }]);
        PLAYER_DATA.inMenu = false;
        if (PLAYER_DATA.lastMenu) {
            return PLAYER_DATA.lastMenu(player);
        }
        return chooseBendingMenu(player);
    }

    const prevSidebarSetting = PLAYER_DATA.settings.showSidebar;
    PLAYER_DATA.settings.showSidebar = true;
    sidebar(player, PLAYER_DATA);

    PLAYER_DATA.lastMenu = chooseSlotsMenu;

    const currentSlot = slot;

    const slotsMenu = new ActionFormData();
    slotsMenu.title('Choose Slots§c§s');

    slotsMenu.button('', 'textures/ui/avatar/avatar_logo');
	slotsMenu.button('§p', 'textures/ui/avatar/movesets');
	slotsMenu.button('', 'textures/ui/avatar/skill_tree');
	slotsMenu.button('', 'textures/ui/avatar/info');
	slotsMenu.button('', 'textures/ui/avatar/teams') ;
	slotsMenu.button('', 'textures/ui/settings_glyph_color_2x');

    slotsMenu.button('Info')
    slotsMenu.button('Movesets')
    slotsMenu.button('Reset')
    
    // Get the players elements
    const elements = PLAYER_DATA.elements;
    const level = PLAYER_DATA.level;

    // Get all moves from the elements
    const moves = [];
    moves.push({ name: { translate: 'hud.sidebar.empty' } });
    
    let moveIndex = 0;
    for (const element of elements) {
        for (const move of element.moves) {
            moveIndex++;
            if ((moveIndex > level) && !move.skill_required) continue;
            if (move.skill_required && !PLAYER_DATA.skills.includes(move.skill_required)) continue;
            if (WORLD_SETTINGS.bannedmoves.includes(move.id)) continue;

            moves.push(move);
        }
    }

    // A second hidden moves array with the element and index in the original element moves array
    const movesIndices = [];
    movesIndices.push({ style: null, index: null });

    let moveIndex2 = 0;
    for (const element of elements) {
        for (let i = 0; i < element.moves.length; i++) {
            moveIndex2++;
            const move = element.moves[i];
            const req = move.skill_required;

            if ((moveIndex2 > level) && !req) continue;
            if (req && !PLAYER_DATA.skills.includes(req)) continue;
            if (WORLD_SETTINGS.bannedmoves.includes(move.id)) continue;

            movesIndices.push({ style: element.type, index: i });
        }
    }

    let lastPage = false;
    const buffer = slot < 5 ? 0 : 5;
    for (let i = 0; i < 5; i++) {
        if (i + buffer > 8) {
            lastPage = true;
            break;
        }
        const selectedFlag = i === currentSlot - buffer ? '§p' : '';
        slotsMenu.button({ rawtext: [
            { translate: 'elements.slots.' + (i + 1 + buffer) },
            { text: selectedFlag }
        ]});
    }

    const nextSlot = slot < 5 ? { translate: 'standard.buttons.next' } : { translate: 'standard.buttons.back' };
    slotsMenu.button(nextSlot);
    if (lastPage) slotsMenu.button("");

    const pushExtraMoveInstead = moves.length < 11 ? 1 : 0;

    let counter = 0;
    for (let i = movestart; i < movestart + 9 + pushExtraMoveInstead; i++) {
        if (i >= moves.length) {
            counter++;
            continue;
        }
        
        if ((PLAYER_DATA.moveset[slot].style == null && i === 0) || (JSON.stringify(PLAYER_DATA.moveset[slot]) === JSON.stringify(movesIndices[i]))) {
            slotsMenu.button({ rawtext: [
                { text: '§p' },
                moves[i].name
            ]});
            continue;
        }

        slotsMenu.button(moves[i].name);
    }

    if (moves.length < 11) {} else if (moves.length < movestart + 9) {
        slotsMenu.button({ translate: 'standard.buttons.back' });
    } else {
        slotsMenu.button({ translate: 'standard.buttons.next' });
    }

    for (let i = 0; i < counter; i++) {
        slotsMenu.button("");
    }

    for (let i = 0; i < 10; i++) {

        if (i === PLAYER_DATA.bindings[slot]) {
            slotsMenu.button({ rawtext: [
                { text: '§p' },
                actionTranslations[i]
            ]});
            continue;
        }

        slotsMenu.button(actionTranslations[i]);
    }

    slotsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
            PLAYER_DATA.inMenu = false;
            return;
        }

        // index 0-5 are for the menu choices
        if (selection < 15) {
            PLAYER_DATA.settings.showSidebar = prevSidebarSetting;

            // I AM THE DUCK TAPE PRODIGY
            PLAYER_DATA.inMenu = false
            delayedFunc(player, () => PLAYER_DATA.inMenu = false, 2);
        }

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        if (selection === 6) {
            return infoMenu(player, slot, movestart);
        } else if (selection === 7) {
            return movesetsMenu(player, slot, movestart);
        } else if (selection === 8) {
            return resetMenu(player, slot, movestart);
        }

        if (selection > 8 && selection < 14) {
            const buffer = slot < 5 ? 0 : 5;

            if (selection - 9 + buffer === 9) {
                PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
                if (slot < 5) {
                    return chooseSlotsMenu(player, 5, movestart);
                } else {
                    return chooseSlotsMenu(player, 0, movestart);
                }
            }

            return chooseSlotsMenu(player, selection - 9 + buffer, movestart);
        } else if (selection === 14) {
            PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
            if (slot < 5) {
                return chooseSlotsMenu(player, 5, movestart);
            } else {
                return chooseSlotsMenu(player, 0, movestart);
            }
        } 

        if (selection > 14 && selection < (24 - counter)) {
            const moveIndex = selection - 15;
            const move = movesIndices[moveIndex + movestart];

            PLAYER_DATA.moveset[slot] = move;
            loadMoveset(player);
            sidebar(player, PLAYER_DATA);

            player.setDynamicProperty("moveset", JSON.stringify(PLAYER_DATA.moveset));

            PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
            return chooseSlotsMenu(player, slot, movestart);
        } else if (selection === (24 - counter)) {
            if (pushExtraMoveInstead) {
                const moveIndex = selection - 15;
                const move = movesIndices[moveIndex + movestart];

                PLAYER_DATA.moveset[slot] = move;
                loadMoveset(player);
                sidebar(player, PLAYER_DATA);

                player.setDynamicProperty("moveset", JSON.stringify(PLAYER_DATA.moveset));
                return chooseSlotsMenu(player, slot, movestart);
            } else if (moves.length < movestart + 9) {
                PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
                return chooseSlotsMenu(player, slot, 0);
            }
            PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
            return chooseSlotsMenu(player, slot, movestart + 9);
        }

        if (selection > 24 && selection < 35) {
            const actionIndex = selection - 25;
            PLAYER_DATA.bindings[slot] = actionIndex;
            player.setDynamicProperty("bindings", JSON.stringify(PLAYER_DATA.bindings));

            PLAYER_DATA.settings.showSidebar = prevSidebarSetting;
            return chooseSlotsMenu(player, slot, movestart);
        }

        PLAYER_DATA.inMenu = false;
    });
        

}