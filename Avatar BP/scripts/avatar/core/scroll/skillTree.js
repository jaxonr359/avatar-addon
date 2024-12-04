import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";

import { chooseBendingMenu } from "./chooseBending.js";
import { chooseSlotsMenu, fixMoveset } from "./chooseSlots.js";
import { chooseSettingsMenu } from "./chooseSettings.js";
import { statsInfoMenu } from "./statsInfo.js";
import { teamsMenu } from "./teams.js";

import { loadMoveset } from "../player/load.js";
import { sidebar } from "../player/hud.js";
 

const saveSkillTree = boolArray => boolArray.reduce((acc, val, i) => val ? acc | (1 << i) : acc, 0);
const loadSkillTree = number => Array.from({ length: 24 }, (_, i) => (number & (1 << i)) !== 0);

const resetPlayerEvents = (player) => {
    const resetEvents = [
        "a:set_trigger_skulk_on",
        "a:normal_hunger",
        "a:mob_agro",
        "a:reset_damage_sensor"
    ]

    for (const event of resetEvents) {
        player.triggerEvent(event);
    }

    player.removeEffect("speed");
    player.removeEffect("resistance");
    player.removeEffect("regeneration");
    player.removeEffect("strength");
    player.removeEffect("jump_boost");
    player.removeEffect("fire_resistance");
}

const infoMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    
    const infoMenu = new ActionFormData();
    infoMenu.title({ rawtext: [
        { translate: 'skilltree.info.title' },
        { text: '§d§f' },
    ]});

    infoMenu.body({ rawtext: [
        { text: '§p' },
        { translate: 'skilltree.info.what' },
        { text: '\n§7' },
        { translate: 'skilltree.info.what.desc' },
        { text: '\n\n§p' },
        { translate: 'skilltree.info.how' },
        { text: '\n§7' },
        { translate: 'skilltree.info.how.desc' }
    ]})

    infoMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');

    infoMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            showSkillTreeMenu(player);
        }
    });
};

const optionsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const movesetsMenu = new ActionFormData();
    movesetsMenu.title({ rawtext: [
        { translate: 'skill_tree.options.title' },
        { text: '§c§b' },
    ]});

    movesetsMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) movesetsMenu.button('');

    movesetsMenu.button({ translate: 'scroll.choose_slots.movesets.save' }, 'textures/ui/avatar/skill_add');
    movesetsMenu.button({ translate: 'scroll.choose_slots.movesets.load' }, 'textures/ui/avatar/skill_load');
    movesetsMenu.button({ translate: 'scroll.choose_slots.movesets.delete' }, 'textures/ui/avatar/skill_delete');

    movesetsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            return showSkillTreeMenu(player);
        }

        if (selection === 6) {
            return createPresetMenu(player);
        } else if (selection === 7) {
            return loadPresetMenu(player);
        } else if (selection === 8) {
            deletePresetMenu(player);
        }

        PLAYER_DATA.inMenu = false;
    });
};

const createPresetMenu = (player) => {
    const MAX_MOVESETS = 4;
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeMoveset = new ModalFormData();
    makeMoveset.title({ rawtext: [
        { translate: 'skilltree.builds.create.title' },
        { text: '§m§f' },
    ]});

    makeMoveset.textField({ translate: 'skilltree.builds.create.description' }, { translate: 'skilltree.builds.create.placeholder' });
    
    makeMoveset.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.create.exit" }]});
            return optionsMenu(player);
        }
        
        const [ name ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.create.tooshort", with: [`${MIN_LENGTH}`] }]});
            return createPresetMenu(player);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.create.toolong", with: [`${MAX_LENGTH}`] }]});
            return createPresetMenu(player);
        }

        // Get all movesets
        const movesets = player.getDynamicPropertyIds().filter(prop => prop.startsWith("treebuild_"));
        if (movesets.includes("treebuild_" + name)) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.create.exists", with: [name] }]});
        }

        if (movesets.length > MAX_MOVESETS) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.create.toomany", with: [`${MAX_MOVESETS}`] }]});
        }
        
        const skillScore = player.getDynamicProperty("skillTree");
        player.setDynamicProperty("treebuild_" + name, skillScore);

        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "skilltree.builds.create.success", with: [name] }]});

        PLAYER_DATA.inMenu = false;
    });
};

const loadPresetMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const movesets = player.getDynamicPropertyIds().filter(prop => prop.startsWith("treebuild_"));
    if (movesets.length === 0) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.load.none" }]});
        return optionsMenu(player);
    }

    const loadMovesetForm = new ActionFormData();
    loadMovesetForm.title({ rawtext: [
        { translate: 'skilltree.builds.load.title' },
        { text: '§d§f' },
    ]});

    loadMovesetForm.body({ translate: 'skilltree.builds.load.description' });

    loadMovesetForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) loadMovesetForm.button('');

    // Get all movesets
    for (const moveset of movesets) {
        loadMovesetForm.button(moveset.replace("treebuild_", ""));
    }

    loadMovesetForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.load.exit" }]});
        }

        if (selection === 0) {
            return optionsMenu(player);
        }

        const moveset = movesets[selection - 6];
        const skillScore = player.getDynamicProperty(moveset);

        // Total up how many skills this permutation has unlocked
        const boolMap = loadSkillTree(skillScore);
        const unlockedSkillsLength = boolMap.filter(bool => (bool)).length;
        const costs = [0, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42];
        const totaledNewCost = costs.slice(0, unlockedSkillsLength).reduce((acc, val) => acc + val, 0);

        // Get the current cost of the skill tree
        const prevSkillLength = playerSkillList(player).length;
        const totaledCurrentCost = costs.slice(0, prevSkillLength).reduce((acc, val) => acc + val, 0);

        const differenceCost = totaledNewCost - totaledCurrentCost;
        if (differenceCost > player.level && !WORLD_SETTINGS.combatwrld) {
            return player.sendMessage({rawtext: [{ text: '§7' }, { translate: "skilltree_options.load.cost", with: [`${differenceCost - player.level}`] }]});
        }

        if (!WORLD_SETTINGS.combatwrld) player.addLevels(-differenceCost);

        resetPlayerEvents(player);
        player.setDynamicProperty("skillTree", skillScore);
        PLAYER_DATA.skills = playerSkillList(player);

        // Now go through the entire skill tree and run the events if they are unlocked
        const skillTree = PLAYER_DATA.elements[0].skillTree;
        const skillsArray = [];
        traverseTree(skillTree.core, skillsArray);
        skillsArray.sort((a, b) => a.index - b.index);

        const unlockMap = loadSkillTree(skillScore);
        const unlockedSkills = skillsArray.map((skill, i) => {
            return {
                ...skill,
                unlocked: unlockMap[i]
            }
        });

        for (const skill of unlockedSkills) {
            if (skill.unlocked && skill.event) player.triggerEvent(skill.event);
        }

        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "skilltree.builds.load.success", with: [moveset.replace("treebuild_", "")] }]});

        PLAYER_DATA.inMenu = false;
    });
}

const deletePresetMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const movesets = player.getDynamicPropertyIds().filter(prop => prop.startsWith("treebuild_"));
    if (movesets.length === 0) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.delete.none" }]});
        return optionsMenu(player);
    }

    const deleteMovesetForm = new ActionFormData();
    deleteMovesetForm.title({ rawtext: [
        { translate: 'skilltree.builds.delete.title' },
        { text: '§d§f' },
    ]});

    deleteMovesetForm.body({ translate: 'scroll.choose_slots.movesets.delete.description' });

    deleteMovesetForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) deleteMovesetForm.button('');

    // Get all movesets
    for (const moveset of movesets) {
        deleteMovesetForm.button(moveset.replace("treebuild_", ""));
    }

    deleteMovesetForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "skilltree.builds.delete.exit" }]});
        }

        if (selection === 0) {
            return optionsMenu(player);
        }

        const moveset = movesets[selection - 6];
        player.setDynamicProperty(moveset, undefined);
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "skilltree.builds.delete.success", with: [moveset.replace("treebuild_", "")] }]});

        PLAYER_DATA.inMenu = false;
    });
}


const reforgeConfirmation = (player, cost) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const reforgeMenu = new ActionFormData();
    reforgeMenu.title({ rawtext: [
        { translate: 'skilltree.reforge.title' },
        { text: '§d§f' },
    ]});

    reforgeMenu.body({ rawtext: [
        { text: '§p' },
        { translate: 'skilltree.reforge.confirm' },
        { text: '\n§7' },
        { translate: 'skilltree.reforge.confirm.desc' }
    ]});

    reforgeMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) reforgeMenu.button('');

    reforgeMenu.button({ translate: 'standard.buttons.confirm' });
    reforgeMenu.button({ translate: 'standard.buttons.cancel' });

    reforgeMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            showSkillTreeMenu(player);
        } else if (selection === 6) {
            const costs = [0, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42];
            const recentCost = costs.indexOf(cost);
            const totalCost = costs.slice(0, recentCost).reduce((acc, val) => acc + val, 0);
            player.addLevels(totalCost);


            player.setDynamicProperty("skillTree", 1);
            resetPlayerEvents(player);
            PLAYER_DATA.skills = playerSkillList(player);

            fixMoveset(player);

            loadMoveset(player);
            sidebar(player, PLAYER_DATA);

            player.sendMessage([{ text: '§7' }, { translate: 'skilltree.reforge.success' }]);
            showSkillTreeMenu(player);
        } else {
            showSkillTreeMenu(player);
        }
    });
}


export const traverseTree = (node, buttonArray) => {
    buttonArray.push({
        id: node.id,
        index: node.index,
        name: node.name,
        description: node.description,
        texture: node.texture,
        event: node.event,
    });

    if (Object.keys(node.children).length == 0) return;
    
    for (const childKey in node.children) {
        if (node.children.hasOwnProperty(childKey)) {
            traverseTree(node.children[childKey], buttonArray);
        }
    }
}

const findNodeAndParentByIndex = (node, index, parent = null) => {
    if (node.index === index) {
        return {
            node: node,
            parent: parent
        };
    }

    if (Object.keys(node.children).length === 0) {
        return null;
    }

    for (const childKey in node.children) {
        const foundNode = findNodeAndParentByIndex(node.children[childKey], index, node);
        if (foundNode) {
            return foundNode;
        }
    }

    return null;
}

const getAllChildren = (node, childIds) => {
    if (Object.keys(node.children).length === 0) {
        childIds.push(node.id);
        return;
    }

    for (const childKey in node.children) {
        getAllChildren(node.children[childKey], childIds);
    }
}

export const playerSkillList = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const skillTree = PLAYER_DATA.elements[0].skillTree;

    const skillsArray = [];
    traverseTree(skillTree.core, skillsArray);
    skillsArray.sort((a, b) => a.index - b.index);

    const skillScore = player.getDynamicProperty("skillTree") || 1;
    const unlockMap = loadSkillTree(skillScore);

    const skills = skillsArray.map((skill, i) => {
        return {
            ...skill,
            unlocked: unlockMap[i]
        }
    });

    const unlockedSkills = skills.filter(skill => skill.unlocked);
    return unlockedSkills.map(skill => skill.id);
}


const confirmUnlock = (player, skill, cost, unlockMap, index) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    const unlockMenu = new ActionFormData();
    unlockMenu.title({ rawtext: [
        { translate: 'skilltree.unlock.title' },
        { text: '§d§f' },
    ]});

    unlockMenu.body({ rawtext: [
        { text: '§p' },
        { translate: 'skilltree.unlock.confirm' },
        { text: '\n§7' },
        { translate: 'skilltree.unlock.confirm.desc', with: [`${cost}`] },
        { text: '\n\n§p' },
        skill.name,
        { text: '\n§7' },
        ...skill.description.map((desc) => { return {rawtext: [ desc, { text: ' ' } ]} }),
    ]});

    unlockMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) unlockMenu.button('');

    unlockMenu.button({ translate: 'standard.buttons.confirm' });
    unlockMenu.button({ translate: 'standard.buttons.cancel' });

    unlockMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return showSkillTreeMenu(player);

        if (selection === 0) {
            showSkillTreeMenu(player);
        } else if (selection === 6) {

            if (player.level < cost && !WORLD_SETTINGS.combatwrld) {
                return showSkillTreeMenu(player, { translate: 'skilltree.unlock.not_enough' });
            }

            if (!WORLD_SETTINGS.combatwrld) player.addLevels(-cost);

            // For the moves that have events
            if (skill.event) player.triggerEvent(skill.event);

            // Unlock the skill
            unlockMap[index] = true;
            const newSave = saveSkillTree(unlockMap);
            player.setDynamicProperty("skillTree", newSave);

            PLAYER_DATA.skills = playerSkillList(player);

            return showSkillTreeMenu(player);
        } else {
            showSkillTreeMenu(player);
        }
    });
};

export const showSkillTreeMenu = (player, message) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    if (PLAYER_DATA.elementMap.length === 0) {
        player.sendMessage([{ text: '§c' }, { translate: 'scroll.choose_element.error' }]);
        PLAYER_DATA.inMenu = false;
        if (PLAYER_DATA.lastMenu) {
            return PLAYER_DATA.lastMenu(player);
        }
        return chooseBendingMenu(player);
    }

    PLAYER_DATA.lastMenu = showSkillTreeMenu;

    const skillTreeMenu = new ActionFormData()
    skillTreeMenu.title({ rawtext: [
        { translate: 'skilltree.title' },
        { text: `§s§t${(message) ? '§c' : ''}` },
    ] });

    if (message) {
        skillTreeMenu.body({ rawtext: [
            { text: '§c' },
            message
        ]});
    }

    skillTreeMenu.button('', 'textures/ui/avatar/avatar_logo');
    skillTreeMenu.button('', 'textures/ui/avatar/movesets');
    skillTreeMenu.button('§p', 'textures/ui/avatar/skill_tree');
    skillTreeMenu.button('', 'textures/ui/avatar/info');
    skillTreeMenu.button('', 'textures/ui/avatar/teams');
    skillTreeMenu.button('', 'textures/ui/settings_glyph_color_2x') ;

    skillTreeMenu.button('Info')
    skillTreeMenu.button('Options')
    skillTreeMenu.button('Reforge')

    const skillTree = PLAYER_DATA.elements[0].skillTree;

    const skillsArray = [];
    traverseTree(skillTree.core, skillsArray);
    skillsArray.sort((a, b) => a.index - b.index);

    const skillScore = player.getDynamicProperty("skillTree") || 1;
    const unlockMap = loadSkillTree(skillScore);

    const skills = skillsArray.map((skill, i) => {
        return {
            ...skill,
            unlocked: unlockMap[i]
        }
    });

    const unlockedSkills = skills.filter(skill => skill.unlocked).length;
    const costs = [0, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42];
    const cost = costs[unlockedSkills] || costs[costs.length - 1];

    // For each of the skills, make sure we don't have the other siblings unlocked, and if we do, permenantly lock them
    for (const skill of skills) {
        if (skill.id === 'core') continue;
        if (WORLD_SETTINGS.sklltree) break;

        const parent = findNodeAndParentByIndex(skillTree.core, skill.index).parent;
        const siblings = Object.values(parent.children);

        // Is the other sibling unlocked?
        let permLocked = false;
        for (const sibling of siblings) {
            if (sibling.id === skill.id) {
                continue;
            } 
            const siblingIndex = skills.findIndex(skill => skill.id === sibling.id);
            if (skills[siblingIndex].unlocked) {
                permLocked = true;
                break;
            }
        }

        if (parent.id != 'core' && permLocked) {
            // Get the children of the 'skill' and lock them
            const childIds = []
            getAllChildren(parent.children[skill.id], childIds);

            for (const childId of childIds) {
                const childIndex = skills.findIndex(skill => skill.id === childId);
                if (childIndex === -1) {
                    continue;
                }

                skills[childIndex].permLocked = true;
            }

            skill.permLocked = true;
            
            continue;
        }
    }

    for (const skill of skills) {
        let costSpecialText = { translate: 'skilltree.cost', with: [`${player.level}/${cost}`]}

        if (skill.permLocked) {
            costSpecialText = { translate: 'skilltree.perm_locked' };
        }

        if (WORLD_SETTINGS.combatwrld) {
            costSpecialText = { translate: 'skilltree.cost.free' };
        }

        if (skill.id === 'core' || skill.unlocked) {
            costSpecialText = { translate: 'skilltree.cost.unlocked' };
        }

        skillTreeMenu.button({ rawtext: [
            { text: '§b' },
            skill.name,
            { text: '\n§8' },
            costSpecialText,
            { text: '§7§o' },
            ...skill.description.map((desc) => { return {rawtext: [ { text: '\n' }, desc]} })
        ]}, `${skill.texture}${skill.unlocked ? '' : '_locked'}`);
    }

    skillTreeMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        if (selection === 6) {
            return infoMenu(player);
        } else if (selection === 7) {
            return optionsMenu(player);
        } else if (selection === 8) {
            return reforgeConfirmation(player, cost);
        }

        const selectedSkill = skills[selection - 9];
        
        if (selectedSkill.unlocked) {
            return showSkillTreeMenu(player, { translate: 'skilltree.already_unlocked' });
        }

        if (selectedSkill.permLocked) {
            return showSkillTreeMenu(player, { translate: 'skilltree.perm_locked_message' });
        }

        const parent = findNodeAndParentByIndex(skillTree.core, selectedSkill.index).parent;
        if (parent) {
            const parentIndex = skills.findIndex(skill => skill.id === parent.id);
            if (!skills[parentIndex].unlocked) {
                return showSkillTreeMenu(player, { translate: 'skilltree.parent_not_unlocked' });
            }
        }

        return confirmUnlock(player, selectedSkill, cost, unlockMap, selection - 9);
    });
};