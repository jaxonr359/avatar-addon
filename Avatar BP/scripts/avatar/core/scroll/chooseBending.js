import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";

import { chooseSlotsMenu } from "./chooseSlots.js";
import { showSkillTreeMenu } from "./skillTree.js";
import { chooseSettingsMenu } from "./chooseSettings.js";
import { statsInfoMenu } from "./statsInfo.js";

import { elements } from "../elements/import.js";

import { reset, reload } from "../player/setup.js";
import { teamsMenu } from "./teams.js";

const chooseStartingElementAvatar = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const styleStartingElement = new ActionFormData();
    styleStartingElement.title({ rawtext: [
        { text: '§d§f' },
        { translate: 'scroll.choose_element.starting_element' },
    ]});

    styleStartingElement.body({ rawtext: [
        { translate: 'scroll.choose_element.starting_element_desc' },
    ]});

    for (let i = 0; i < 6; i++) styleStartingElement.button('');

    const types = Object.values(elements);
    const elementNames = [];

    for (const element of types) {
        if (element.type === 'avatar' || element.type === 'nonbender') break;
        elementNames.push(element.type);

        styleStartingElement.button({ rawtext: [
            element.short,
        ]}, element.icon);
    }

    styleStartingElement.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined || selection === 0) return chooseBendingMenu(player);

        // cycle order: fire, air, water, earth
        const elementSelected = elementNames[selection - 6];

        reset(player);

        switch (elementSelected) {
            case 'fire':
                PLAYER_DATA.elements = [elements.avatar, elements.fire, elements.air, elements.water, elements.earth];
                break;
            case 'air':
                PLAYER_DATA.elements = [elements.avatar, elements.air, elements.water, elements.earth, elements.fire];
                break;
            case 'water':
                PLAYER_DATA.elements = [elements.avatar, elements.water, elements.earth, elements.fire, elements.air];
                break;
            case 'earth':
                PLAYER_DATA.elements = [elements.avatar, elements.earth, elements.fire, elements.air, elements.water];
                break;
        }

        PLAYER_DATA.elementMap = PLAYER_DATA.elements.map(element => element.type);
        player.setDynamicProperty("elements", JSON.stringify(PLAYER_DATA.elementMap));

        reload(player);

        PLAYER_DATA.inMenu = false;
    });
};

const chooseElement = (player, element) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    reset(player);

    PLAYER_DATA.elements = [element];
    PLAYER_DATA.elementMap = PLAYER_DATA.elements.map(element => element.type);
    player.setDynamicProperty("elements", JSON.stringify(PLAYER_DATA.elementMap));

    reload(player);

    if (element.type != 'avatar' && element.type != 'nonbender') {
        player.dimension.spawnParticle(`a:choose_${element.type}`, player.location);
    } else if (element.type === 'avatar') {
        PLAYER_DATA.elements = [elements.avatar, elements.air, elements.water, elements.earth, elements.fire];
        PLAYER_DATA.elementMap = PLAYER_DATA.elements.map(element => element.type);
        player.setDynamicProperty("elements", JSON.stringify(PLAYER_DATA.elementMap));

        chooseStartingElementAvatar(player);

        player.dimension.spawnParticle(`a:choose_air`, player.location);
        player.dimension.spawnParticle(`a:choose_water`, player.location);
        player.dimension.spawnParticle(`a:choose_earth`, player.location);
        player.dimension.spawnParticle(`a:choose_fire`, player.location);
    }

    switch (element.type) {
        case 'fire':
            player.dimension.playSound("avatar.fire_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            break;
        case 'air':
            player.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            break;
        case 'water':
            player.dimension.playSound("avatar.water_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            break;
        case 'earth':
            player.dimension.playSound("avatar.earth_big_spike", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            break;
        case 'avatar':
            player.dimension.playSound("avatar.fire_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            player.dimension.playSound("avatar.air_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            player.dimension.playSound("avatar.water_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            player.dimension.playSound("avatar.earth_big_spike", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 })
            break;
    }

    player.runCommand('camerashake add @s 0.1 0.2 positional');
    player.runCommand('xp -1000l @s');
}

const showElementInfo = (player, element) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const styleInfoDisplay = new ActionFormData();
    styleInfoDisplay.title({ rawtext: [
        { translate: 'scroll.choose_element.select' },
        { text: ' ' },
        element.name,
        { text: '§d§f' },
    ]});

    styleInfoDisplay.body({ rawtext: [
        { text : '§p' },
        element.name,
        { text : '\n§7' },
        element.description,
        { text : '\n§p\n' },
        { translate: 'scroll.move_info.breakdown' },
        { text : '\n§7' },
        element.breakdown
    ]});

    styleInfoDisplay.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) styleInfoDisplay.button('');

    styleInfoDisplay.button({ rawtext: [
        { translate: 'scroll.choose_element.select' },
        { text: ' ' },
        element.short,
    ]}, element.icon);

    styleInfoDisplay.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined || selection === 0) return chooseBendingMenu(player);

        if (selection === 6) {
            chooseElement(player, element);
        }

        PLAYER_DATA.inMenu = false;
    });
}

const chooseRandomElement = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const styleRandomElement = new ActionFormData();
    styleRandomElement.title({ rawtext: [
        { text: '§d§f' },
        { translate: 'scroll.choose_element.random_set' }
    ]});

    styleRandomElement.body({ rawtext: [
        { translate: 'scroll.choose_element.random_desc' },
    ]});

    styleRandomElement.button('§p', 'textures/ui/avatar/avatar_logo');
    styleRandomElement.button('', 'textures/ui/avatar/movesets');
    styleRandomElement.button('', 'textures/ui/avatar/skill_tree');
    styleRandomElement.button('', 'textures/ui/avatar/info');
    styleRandomElement.button('', 'textures/ui/avatar/teams');
    styleRandomElement.button('', 'textures/ui/settings_glyph_color_2x');

    styleRandomElement.button({ translate: 'scroll.choose_element.randomize' }, 'textures/ui/avatar/avatar');

    styleRandomElement.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        if (selection === 6) {

            let element;
            if (!WORLD_SETTINGS.avatar) {
                let counter = 0;
                while (true) {
                    // Prevent infinite loop, and if you manage to get 100 avatars in a row, you deserve it
                    counter++;
                    if (counter > 100) break;

                    element = Object.values(elements)[Math.floor(Math.random() * Object.keys(elements).length)];
                    if (element.type !== 'avatar') break;
                }
                
                chooseElement(player, element);
            } else {
                element = Object.values(elements)[Math.floor(Math.random() * Object.keys(elements).length)];
                chooseElement(player, element);
            }

            player.sendMessage([{ text: '§7' }, { translate: 'scroll.choose_element.random', with: {rawtext: [element.name]} }]);
        }

        PLAYER_DATA.inMenu = false;
    });
}

const chooseElementFinal = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const bendingMenu = new ActionFormData()
    bendingMenu.title({ rawtext: [
        { text: '§d§f' },
        { translate: 'scroll.choose_element.title' },
        (WORLD_SETTINGS.choicefinl ? {rawtext: [{text: ' '}, { translate: 'scroll.choose_element.final.tag' }]} : { text: '§7' }),
    ] });

    bendingMenu.body({ rawtext: [
        { translate: 'scroll.choose_element.final', with: {rawtext: [PLAYER_DATA.elements[0].name]}},
    ]});

    bendingMenu.button('§p', 'textures/ui/avatar/avatar_logo');
    bendingMenu.button('', 'textures/ui/avatar/movesets');
    bendingMenu.button('', 'textures/ui/avatar/skill_tree');
    bendingMenu.button('', 'textures/ui/avatar/info');
    bendingMenu.button('', 'textures/ui/avatar/teams');
    bendingMenu.button('', 'textures/ui/settings_glyph_color_2x');

    bendingMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        PLAYER_DATA.inMenu = false;
    });
}




export const chooseBendingMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = chooseBendingMenu;

    // 1 = not final, 0 = final (int)
    if (WORLD_SETTINGS.choicefinl && PLAYER_DATA.elementMap.length > 0) return chooseElementFinal(player);

    // 0 = chosen bending, 1 = randomized bending
    if (WORLD_SETTINGS.bending) return chooseRandomElement(player);

	const bendingMenu = new ActionFormData()
    bendingMenu.title({ rawtext: [
        { translate: 'scroll.choose_element.title' },
        (WORLD_SETTINGS.choicefinl ? {rawtext: [{text: ' '}, { translate: 'scroll.choose_element.final.tag' }]} : { text: '§7' }),
        { text: '§c§b' },
    ] });

    bendingMenu.button('§p', 'textures/ui/avatar/avatar_logo');
    bendingMenu.button('', 'textures/ui/avatar/movesets');
    bendingMenu.button('', 'textures/ui/avatar/skill_tree');
    bendingMenu.button('', 'textures/ui/avatar/info');
    bendingMenu.button('', 'textures/ui/avatar/teams');
    bendingMenu.button('', 'textures/ui/settings_glyph_color_2x');

    const isAvatar = PLAYER_DATA.elementMap.includes('avatar');

    for (const element of Object.values(elements)) {
        if (element.type === 'avatar' && !WORLD_SETTINGS.avatar) {
            bendingMenu.button({rawtext: [{ text: '§8' }, element.short]}, element.icon);
            continue;
        }

        if (element.type === 'avatar' && isAvatar) {
            bendingMenu.button({rawtext: [{ text: '§p' }, element.short]}, element.icon);
            continue;
        }

        if (PLAYER_DATA.elementMap.includes(element.type) && !isAvatar) {
            bendingMenu.button({ rawtext: [
                { text: '§p' },
                element.short,
            ]}, element.icon);
            continue;
        }

        bendingMenu.button(element.short, element.icon);
    }
  
	bendingMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        const names = Object.keys(elements);
        const elementSelected = names[selection - 6];
        const element = elements[elementSelected];

        if (element.type === 'avatar' && !WORLD_SETTINGS.avatar) {
            player.sendMessage([{ text: '§7' }, { translate: 'scroll.choose_element.avatar_disabled' }]);
            return chooseBendingMenu(player);
        }

        showElementInfo(player, element);

        PLAYER_DATA.inMenu = false;
	});
  };