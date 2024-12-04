import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";

import { chooseBendingMenu } from "./chooseBending.js";
import { chooseSlotsMenu } from "./chooseSlots.js";
import { showSkillTreeMenu } from "./skillTree.js";
import { teamsMenu } from "./teams.js";
import { chooseSettingsMenu } from "./chooseSettings.js";

import { traverseTree } from "./skillTree.js";
import { elements } from "../elements/import.js";
import { actionTranslations } from "./chooseSlots.js";

const displayMoveInfo = (player, move) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const moveInfoDisplay = new ActionFormData();
    moveInfoDisplay.title({ rawtext: [
        move.name,
        { text: '§d§f' },
    ]});

    const typeMap = {
        'standard': { translate: 'elements.move.type.standard' },
        'charge': { translate: 'elements.move.type.charge' },
        'duration': { translate: 'elements.move.type.duration' }
    }

    const moveDamage = (move.damage.base + move.damage.multiplied * PLAYER_DATA.levelFactor) / 2;

    moveInfoDisplay.body({ rawtext: [
        { text : '§p' },
        { translate: 'elements.move.name' },
        { text : ': §7' },
        move.name,
        { text : '§p\n' },
        { translate: 'elements.move.type' },
        { text : ': §7' },
        typeMap[move.type],
        { text : '§p\n' },
        { translate: 'elements.move.cost' },
        { text : `: §7${move.cost}§p\n` },
        { translate: 'elements.move.cooldown' },
        { text : `: §7${move.cooldown}§p\n` },
        { translate: 'elements.move.player_damage' },
        { text : `: §7${moveDamage.toFixed(1)}§p\n` },
        { translate: 'elements.move.mob_damage' },
        { text : `: §7${(moveDamage * 2.5).toFixed(1)}§p\n` },
        { translate: 'elements.move.description' },
        { text : ': §7' },
        move.description,
    ]});

    moveInfoDisplay.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');

    moveInfoDisplay.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return showMoveInfoMenu(player);
        if (selection === 0) return showMoveInfoMenu(player);
    });
};

const displayStyleInfo = (player, style) => {
    const styleInfoDisplay = new ActionFormData();
    styleInfoDisplay.title({ rawtext: [
        style.name,
        { text: '§d§f' },
    ]});

    styleInfoDisplay.body({ rawtext: [
        { text : '§p' },
        style.name,
        { text : '\n§7' },
        style.description,
        { text : '\n§p\n' },
        { translate: 'scroll.move_info.breakdown' },
        { text : '\n§7' },
        style.breakdown,
    ]});

    styleInfoDisplay.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');

    styleInfoDisplay.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return showStyleInfoMenu(player);
        if (selection === 0) return showStyleInfoMenu(player);
    });
};

const displaySkillInfo = (player, skill) => {
    const skillInfoDisplay = new ActionFormData();
    skillInfoDisplay.title({ rawtext: [
        skill.name,
        { text: '§d§f' },
    ]});

    skillInfoDisplay.body({ rawtext: [
        { text : '§p' },
        skill.name,
        { text : '\n§7' },
        ...skill.description.map((desc) => { return {rawtext: [ desc, { text: ' ' } ]} }),
    ]});

    skillInfoDisplay.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');

    skillInfoDisplay.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return showSkillInfoMenu(player);
        if (selection === 0) return showSkillInfoMenu(player);
    });
};

const displayPlayerStats = (player, target) => {
    const TARGET_DATA = PLAYER_DATA_MAP[target.id];

    if (TARGET_DATA.elementMap.length === 0) {
        player.sendMessage([{ text: '§c' }, { translate: 'stats.player_no_element.error' }]);
        return statsInfoMenu(player);
    }

    const statsDisplay = new ActionFormData();
    statsDisplay.title(`§d§f${target.name}`);

    const level = TARGET_DATA.level;
    const style = TARGET_DATA.elements[0].name;

    const rawSubLevel = target.getDynamicProperty("subLevel");
    const subLevel = rawSubLevel ? parseFloat(rawSubLevel) : 0;

    const levelFunction = 0.05 * Math.pow(level, 2) + 0.8 * level + 2;
    const progressToNextLevel = subLevel / levelFunction * 100;

    const joinDate = parseInt(target.getDynamicProperty("joinDate")) || Date.now();
    const playTime = Date.now() - joinDate;

    const playTimeSeconds = Math.floor(playTime / 1000);
    const playTimeMinutes = Math.floor(playTimeSeconds / 60);
    const playTimeHours = Math.floor(playTimeMinutes / 60);
    const playTimeDays = Math.floor(playTimeHours / 24);

    const rawUsage = target.getDynamicProperty("moveUsage");
    const usageMap = rawUsage ? JSON.parse(rawUsage) : {};

    const topFiveMoves = Object.entries(usageMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key, value]) => key);
    const timesUsed = Object.entries(usageMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key, value]) => value);
    
    const killsCount = target.getDynamicProperty("kills") || 0;
    const deathsCount = target.getDynamicProperty("deaths") || 0;

    const moveset = TARGET_DATA.trueMoveset;
    const moveNames = moveset.map((move) => move ? move.name : { translate: 'hud.sidebar.empty' });
    
    const movesetDisplay = moveNames.map((name, index) => {
        return { rawtext: [
            { translate: `elements.slots.${index + 1}` },
            { text: ': §7' },
            name,
            { text: '\n' }, 
        ]};
    });

    const bindings = TARGET_DATA.bindings;

    const bindingsDisplay = bindings.map((binding, index) => {
        return { rawtext: [
            { translate: `elements.slots.${index + 1}` },
            { text: ': §7' },
            actionTranslations[binding],
            { text: '\n' },
        ]};
    });

    statsDisplay.body({ rawtext: [
        { text: `§p` },
        { translate: 'elements.stats.style' },
        { text: `: §7` },
        style,
        { text: '\n§p\n' },
        { translate: 'elements.stats.level' },
        { text: `: §7${level}\n§p` },
        { translate: 'elements.stats.progress' },
        { text: `: §7${progressToNextLevel.toFixed(1)}%%\n§p` },
        { translate: 'elements.stats.timesincejoined' },
        { text: `: §7${playTimeDays}d ${playTimeHours % 24}h ${playTimeMinutes % 60}m ${playTimeSeconds % 60}s\n§p\n` },
        { translate: 'elements.stats.topmoves' },
        { text: `: §7\n` },
        ...topFiveMoves.map((move, index) => { return { rawtext: [ { text: `${index + 1}. ` }, { translate: move }, { text: ` (${timesUsed[index]})\n` } ] }}),
        { text: '\n§p' },
        { translate: 'elements.stats.kills' },
        { text: `: §7${killsCount}\n§p` },
        { translate: 'elements.stats.deaths' },
        { text: `: §7${deathsCount}\n§p` },
        { text: '\n§p' },
        { translate: 'elements.stats.moveset' },
        { text: `: §7\n` },
        { rawtext: movesetDisplay },
        { text: '\n§p' },
        { translate: 'elements.stats.bindings' },
        { text: `: §7\n` },
        { rawtext: bindingsDisplay },
    ]});

    statsDisplay.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');

    statsDisplay.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return showStatsMenu(player);
        if (selection === 0) return showStatsMenu(player);
    });
};

const showStatsMenu = (player, start = 0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const playerStatsMenu = new ActionFormData();
    playerStatsMenu.title({ rawtext: [
        { translate: 'scroll.statsmenu.title' },
        { text: '§d§f' },
    ]});

    playerStatsMenu.body({ translate: 'scroll.statsmenu.description' });

    playerStatsMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) playerStatsMenu.button('');

    const players = world.getAllPlayers();

    if (start > players.length) start = 0;


    for (let i = 0; i < 10; i++) {
        const player = players[i + start];
        if (!player) break;
        playerStatsMenu.button(player.name);
    }

    if (players.length > 10) playerStatsMenu.button({ translate: 'standard.buttons.next' });
    if (start > 0) playerStatsMenu.button({ translate: 'standard.buttons.back' });


    playerStatsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return statsInfoMenu(player);

       
        const removeFrom = (players.length - start - 10) < 0 ? players.length - start - 10 : 0;

        if (selection === 16 + removeFrom) return showStatsMenu(player, start + 10);
        if (selection === 17 + removeFrom) return showStatsMenu(player, start - 10);

        const selectedPlayer = players[selection - 6];
        if (!selectedPlayer) return showStatsMenu(player);

        displayPlayerStats(player, selectedPlayer);
    });
    
};

const showHomesMenu = (player) => {
    if (!WORLD_SETTINGS.sethme) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.disabled" }]});
        return statsInfoMenu(player);
    }

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    if (PLAYER_DATA.combatTimer > Date.now()) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "status_message.combat_timer_nope" }]});
        return statsInfoMenu(player);
    }

    const homesMenu = new ActionFormData();
    homesMenu.title({ rawtext: [
        { translate: 'scroll.statsmenu.homes.title' },
        { text: '§c§b' },
    ]});

    homesMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) homesMenu.button('');

    homesMenu.button({ translate: 'scroll.statsmenu.homes.create.title' }, 'textures/ui/avatar/whitelist_add');
    homesMenu.button({ translate: 'scroll.statsmenu.homes.load.title' }, 'textures/ui/avatar/pay');
    homesMenu.button({ translate: 'scroll.statsmenu.homes.delete.title' }, 'textures/ui/avatar/whitelist_remove');

    homesMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            return statsInfoMenu(player);
        }

        if (selection === 6) {
            return createHomeMenu(player);
        } else if (selection === 7) {
            return loadHomeMenu(player);
        } else if (selection === 8) {
            deleteHomeMenu(player);
        }

        PLAYER_DATA.inMenu = false;
    });
};

const createHomeMenu = (player) => {
    const MAX_HOMES = 12;
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeHome = new ModalFormData();
    makeHome.title({ rawtext: [
        { translate: 'scroll.statsmenu.homes.create.title' },
        { text: '§m§f' },
    ]});

    makeHome.textField({ translate: 'scroll.statsmenu.homes.create.description' }, { translate: 'scroll.statsmenu.homes.create.placeholder' });
    
    makeHome.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.create.exit" }]});
            return showHomesMenu(player);
        }
        
        const [ name ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.create.tooshort", with: [`${MIN_LENGTH}`] }]});
            return createHomeMenu(player);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.create.toolong", with: [`${MAX_LENGTH}`] }]});
            return createHomeMenu(player);
        }

        // Get all homes
        const homes = player.getDynamicPropertyIds().filter(prop => prop.startsWith("home_"));
        if (homes.includes("home_" + name)) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.create.exists", with: [name] }]});
        }

        if (homes.length > MAX_HOMES) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.create.toomany", with: [`${MAX_HOMES}`] }]});
        }
        
        const { x, y, z } = player.location;
        const d = player.dimension.id;
        player.setDynamicProperty("home_" + name, `${JSON.stringify({ x, y, z, d })}`);
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.statsmenu.homes.create.success", with: [name] }]});
        PLAYER_DATA.inMenu = false;
    });
};

const loadHomeMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const homes = player.getDynamicPropertyIds().filter(prop => prop.startsWith("home_"));
    if (homes.length === 0) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.load.none" }]});
        return showHomesMenu(player);
    }

    const loadHomeForm = new ActionFormData();
    loadHomeForm.title({ rawtext: [
        { translate: 'scroll.statsmenu.homes.load.title' },
        { text: '§d§f' },
    ]});

    loadHomeForm.body({ translate: 'scroll.statsmenu.homes.load.description' });

    loadHomeForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) loadHomeForm.button('');

    // Get all homes
    for (const home of homes) {
        loadHomeForm.button(home.replace("home_", ""));
    }

    loadHomeForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.load.exit" }]});
        }

        if (selection === 0) {
            return showHomesMenu(player);
        }

        const home = homes[selection - 6];
        const homeData = JSON.parse(player.getDynamicProperty(home));

        const x = homeData.x;
        const y = homeData.y;
        const z = homeData.z;
        const d = homeData.d;

        player.teleport({ x, y, z }, { dimension: world.getDimension(d) });
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.statsmenu.homes.load.success", with: [home.replace("home_", "")] }]});

        // SOUND

        PLAYER_DATA.inMenu = false;
    });
}

const deleteHomeMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const homes = player.getDynamicPropertyIds().filter(prop => prop.startsWith("home_"));
    if (homes.length === 0) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.delete.none" }]});
        return showHomesMenu(player);
    }

    const deleteHomeForm = new ActionFormData();
    deleteHomeForm.title({ rawtext: [
        { translate: 'scroll.statsmenu.homes.delete.title' },
        { text: '§d§f' },
    ]});

    deleteHomeForm.body({ translate: 'scroll.statsmenu.homes.delete.description' });

    deleteHomeForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) deleteHomeForm.button('');

    // Get all homes
    for (const home of homes) {
        deleteHomeForm.button(home.replace("home_", ""));
    }

    deleteHomeForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.statsmenu.homes.delete.exit" }]});
        }

        if (selection === 0) {
            return showHomesMenu(player);
        }

        const home = homes[selection - 6];
        player.setDynamicProperty(home, undefined);
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.statsmenu.homes.delete.success", with: [home.replace("home_", "")] }]});

        PLAYER_DATA.inMenu = false;
    });
}

const showTutorialMenu = (player) => {
    player.setDynamicProperty("TutorialCompleted", false);
};

const showMoveInfoMenu = (player, start=0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    if (PLAYER_DATA.elementMap.length === 0) {
        player.sendMessage([{ text: '§c' }, { translate: 'scroll.choose_element.error' }]);
        return statsInfoMenu(player);
    }

    const movesInfoMenu = new ActionFormData();
    movesInfoMenu.title({ rawtext: [
        { translate: 'scroll.move_info.title' },
        { text: '§d§f' },
    ]});
    movesInfoMenu.body({ translate: 'scroll.move_info.description' });

    movesInfoMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) movesInfoMenu.button('');

    const elements = PLAYER_DATA.elements;
    const moves = [];

    let movesLength = 0;
    for (const element of elements) {
        for (const move of element.moves) {
            if (move.skill_required && !PLAYER_DATA.skills.includes(move.skill_required)) continue;
            movesLength++;
        }
    }

    let buttonsPushed = 0;

    let count = 0;
    outer: for (const element of elements) {
        for (const move of element.moves) {
            if (move.skill_required && !PLAYER_DATA.skills.includes(move.skill_required)) continue;
            
            count++;
            if (count < start + 1) continue;
            if (count > start + 8) break outer;

            moves.push(move);
            movesInfoMenu.button(move.name);

            buttonsPushed++;
        }
    }

    if (count < movesLength) movesInfoMenu.button({ translate: 'standard.buttons.next' });
    if (start > 0) movesInfoMenu.button({ translate: 'standard.buttons.back' });

    movesInfoMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return statsInfoMenu(player);

        
        if (selection - 6 === buttonsPushed) {
            if (count >= movesLength) return showMoveInfoMenu(player, start - 8);
            return showMoveInfoMenu(player, start + 8);
        } else if (selection - 6 === buttonsPushed + 1) {
            return showMoveInfoMenu(player, start - 8);
        }
        
        const MOVE = moves[selection - 6];
        if (!MOVE) return showMoveInfoMenu(player);


        displayMoveInfo(player, MOVE);
    });
};

const showStyleInfoMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    const stylesInfoMenu = new ActionFormData();
    stylesInfoMenu.title('Style Info§d§f')
    stylesInfoMenu.body('Pick a style to view its information!');

    stylesInfoMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) stylesInfoMenu.button('');

    for (const element of Object.values(elements)) {
        if (PLAYER_DATA.elementMap.includes(element.type)) {
            stylesInfoMenu.button({ rawtext: [
                { text: '§p' },
                element.short,
            ]}, element.icon);
            continue;
        }
        stylesInfoMenu.button(element.short, element.icon);
    }

    stylesInfoMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return statsInfoMenu(player);

        const ELEMENT = Object.values(elements)[selection - 6];
        if (!ELEMENT) return showStyleInfoMenu(player);

        displayStyleInfo(player, ELEMENT);
    });
};

const showSkillInfoMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    if (PLAYER_DATA.elementMap.length === 0) {
        player.sendMessage([{ text: '§c' }, { translate: 'scroll.choose_element.error' }]);
        return statsInfoMenu(player);
    }

    const skillsInfoMenu = new ActionFormData();
    skillsInfoMenu.title('Skill Info§d§f')
    skillsInfoMenu.body('Pick a skill to view its information!');

    skillsInfoMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) skillsInfoMenu.button('');

    const skillTree = PLAYER_DATA.elements[0].skillTree;
    const skillsArray = [];
    traverseTree(skillTree.core, skillsArray);

    for (const skill of skillsArray) {
        skillsInfoMenu.button(skill.name, skill.texture);
    }

    skillsInfoMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return statsInfoMenu(player);

        const SKILL = skillsArray[selection - 6];
        if (!SKILL) return showSkillInfoMenu(player);

        displaySkillInfo(player, SKILL);
    });
};

export const statsInfoMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = statsInfoMenu;

    const statsMenu = new ActionFormData()
    statsMenu.title({ rawtext: [
        { translate: 'scroll.utility.title' },
        { text: '§c§b' },
    ]});

    statsMenu.body({ translate: 'scroll.utility.description' });
    
    statsMenu.button('', 'textures/ui/avatar/avatar_logo');
    statsMenu.button('', 'textures/ui/avatar/movesets');
    statsMenu.button('', 'textures/ui/avatar/skill_tree');
    statsMenu.button('§p', 'textures/ui/avatar/info');
    statsMenu.button('', 'textures/ui/avatar/teams');
    statsMenu.button('', 'textures/ui/settings_glyph_color_2x') ;

    statsMenu.button('Stats', 'textures/ui/avatar/ping')
    statsMenu.button('Homes', 'textures/ui/avatar/home')
    statsMenu.button('Tutorial', 'textures/ui/avatar/inventory')

    statsMenu.button('Move Info', 'textures/ui/avatar/movesets')
    statsMenu.button('Style Info', 'textures/ui/avatar/avatar_logo')
    statsMenu.button('Skill Info', 'textures/ui/avatar/skill_tree')

    statsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        const statsMenus = [showStatsMenu, showHomesMenu, showTutorialMenu, showMoveInfoMenu, showStyleInfoMenu, showSkillInfoMenu];
        statsMenus[selection - 6](player);

        PLAYER_DATA.inMenu = false;
    });
};