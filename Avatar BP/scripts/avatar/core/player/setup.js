import { world } from "@minecraft/server";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";

import { elements } from "../elements/import.js";
import { loadMoveset } from "./load.js";

import { playerSkillList } from "../scroll/skillTree.js";

import { sidebar } from "./hud.js";
import { delayedFunc } from "../../utils.js";
import { fixMoveset } from "../scroll/chooseSlots.js";
import { refreshWorldSettings } from "../scroll/adminSettings.js";

export const setup = (player) => {
    PLAYER_DATA_MAP[player.id] = {
        bender: true,
        enabled: true,

        chi: 100,
        cooldown: 0,

        level: 1,
        levelFactor: 1/100,
        skillTree: 1,

        elements: [],
        elementMap: [],

        skills: [],

        moveset: [
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null },
            { style: null, index: null }
        ],

        trueMoveset: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        bindings: [0, 0, 0, 0, 0, 0, 0, 0, 0],

        teamId: undefined,
        teleportRequests: [],

        // Water stuff
        inWater: false,
        waterLoaded: 6,

        // Overflow combo feature
        combo: 0,
        lastHit: Date.now(),
        overflow: 0,
        
        // Storing loaded components
        health: undefined,

        // For duration type moves
        currentDurationMove: null,
        currentDurationMoveTimer: 0,

        charge: 0,
        selectedChargeSlot: undefined,

        sneak: false,
        wasSneaking: false,
        doubleSneakTimer: 0,
        isJumping: false,
        doubleJump: false,
        leftClick: false,
        rightClick: 0,
        rightClickSlot: 0,

        // HUD
        waitUntilZero: false,
        pauseChibar: false,
        sidebarRefreshed: false,
        lastChatMsg: Date.now(),
        inMenu: false,

        // Settings
        settings: {
            enabledBending: true,
            showStatusMessages: true,
            showHudElements: true,
            showSidebar: true,
            showDamageDebug: false,
            doubleSneakTimer: 20,
            aimAssistStrength: 10
        }
    };

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    // Get saved settings if they exist
    const settings = player.getDynamicProperty("settings");
    if (settings) {
        const parsedSettings = JSON.parse(settings);
        for (const key in parsedSettings) {
            PLAYER_DATA.settings[key] = parsedSettings[key];
        }
    } else {
        player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
    }

    // Get saved level if it exists
    const level = player.getDynamicProperty("level");
    if (level) {
        PLAYER_DATA.level = level;
        PLAYER_DATA.levelFactor = level/100;
    } else {
        player.setDynamicProperty("level", PLAYER_DATA.level);
    }

    // Get the saved elements
    const elementTypes = player.getDynamicProperty("elements");
    if (elementTypes) {
        // Strings of all the elements
        const parsedElements = JSON.parse(elementTypes);
        for (let i = 0; i < parsedElements.length; i++) {
            const elementType = parsedElements[i];
            if (elementType) {
                PLAYER_DATA.elements.push(elements[elementType]);
            }
        }
    }

    // For shortform element references
    PLAYER_DATA.elementMap = PLAYER_DATA.elements.map(element => element.type);

    // Get the saved moveset
    const moveset = player.getDynamicProperty("moveset");
    if (moveset) {
        const parsedMoveset = JSON.parse(moveset);
        for (let i = 0; i < parsedMoveset.length; i++) {
            const move = parsedMoveset[i];
            if (move) {
                PLAYER_DATA.moveset[i] = move;
            }
        }
    }

    // Get the saved bindings
    const bindings = player.getDynamicProperty("bindings");
    if (bindings) {
        const parsedBindings = JSON.parse(bindings);
        for (let i = 0; i < parsedBindings.length; i++) {
            const binding = parsedBindings[i];
            if (binding) {
                PLAYER_DATA.bindings[i] = binding;
            }
        }
    }

    // Get the saved skillTree value
    const skillTreeNum = player.getDynamicProperty("skillTree");
    if (skillTreeNum) {
        PLAYER_DATA.skillTree = skillTreeNum;
    }

    if (PLAYER_DATA.elementMap.length > 0) {
        // Load the skill tree
        PLAYER_DATA.skills = playerSkillList(player);

        // Load the 'hard' moveset
        // *explain this later
        loadMoveset(player);

        // Set the sidebar and set to wait for the first movement to refresh
        sidebar(player, PLAYER_DATA);
        PLAYER_DATA.pauseChibar = true;
    }

    // If the player is joining for the first time, get their join date
    const joinDate = player.getDynamicProperty("joinDate");
    if (!joinDate) {
        const now = Date.now();
        player.setDynamicProperty("joinDate", now);
        console.log(`UpdateDB firstJoin ${player.id} ${player.name} ${now}`);
    }

    // These are in case players log out during a move
    PLAYER_DATA.reflectDamage = null;

    // These are for the team system
    const allIds = world.getDynamicPropertyIds();
    const allTeams = allIds.filter(id => id.startsWith("team_")).map(id => JSON.parse(world.getDynamicProperty(id)));

    for (const team of allTeams) {
        for (const member of team.members) {
            if (member.id === player.id) {
                PLAYER_DATA.teamId = team.ownerId;
                break;
            }
        }
    }

    // Load the world settings
    const rawWorldSettings = world.getDynamicProperty("worldSettings");
    if (rawWorldSettings) {
        const worldSettings = JSON.parse(rawWorldSettings);
        if (worldSettings) {
            for (const key in worldSettings) {
                WORLD_SETTINGS[key] = worldSettings[key];
            }
    
            WORLD_SETTINGS.centerloc = world.getDefaultSpawnLocation();
    
            const rawZones = world.getDynamicProperty("noBendingZones");
            const zones = rawZones ? JSON.parse(rawZones) : [];
            WORLD_SETTINGS.noBendingZones = zones;
    
            const rawMoves = world.getDynamicProperty("bannedMoves");
            const moves = rawMoves ? JSON.parse(rawMoves) : [];
            WORLD_SETTINGS.bannedmoves = moves;
    
            if (WORLD_SETTINGS.combatwrld) {
                PLAYER_DATA.level = 100;
                PLAYER_DATA.levelFactor = 1;
                player.setDynamicProperty("level", PLAYER_DATA.level);
                player.setDynamicProperty("subLevel", 0);
    
                fixMoveset(player);
                loadMoveset(player);
            }
        } else {
            refreshWorldSettings();
        }
    } else {
        refreshWorldSettings();
    }

    player.runCommand('gamerule showtags false');

    // Some bugs / awkwardness with logging out during moves can be fixed here
    delayedFunc(player, () => {
        if (!player.inputPermissions.movementEnabled) player.inputPermissions.movementEnabled = true;
    }, 3);

    if (player.getDynamicProperty("combat_timer") > 0) {
        player.kill();
        player.sendMessage([{ text: '§c' }, { translate: 'status_message.combat_logged' }]);
        PLAYER_DATA.combatTimer = undefined;
        player.setDynamicProperty("combat_timer", undefined);
    }

    // Load the health component
    // Causes issues so it's last
    PLAYER_DATA.health = player.getComponent("minecraft:health");
};

export const reset = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    PLAYER_DATA.bender = true;
    PLAYER_DATA.enabled = true;

    PLAYER_DATA.chi = 100;
    PLAYER_DATA.cooldown = 0;

    PLAYER_DATA.level = 1;
    PLAYER_DATA.levelFactor = 1/100;
    PLAYER_DATA.skillTree = 1;

    PLAYER_DATA.elements = [];
    PLAYER_DATA.elementMap = [];
    PLAYER_DATA.skills = [];
    PLAYER_DATA.moveset = [
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null },
        { style: null, index: null }
    ];
    PLAYER_DATA.trueMoveset = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
    ];
    PLAYER_DATA.bindings = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];

    player.setDynamicProperty("elements", undefined);
    player.setDynamicProperty("moveset", undefined);
    player.setDynamicProperty("bindings", undefined);
    player.setDynamicProperty("skillTree", 1);
    player.setDynamicProperty("level", 1);

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

export const reload = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

    PLAYER_DATA.elementMap = PLAYER_DATA.elements.map(element => element.type);
    if (PLAYER_DATA.elements.length === 0) return;

    PLAYER_DATA.bender = true;
    PLAYER_DATA.enabled = true;

    // Get the saved elements
    const elementTypes = player.getDynamicProperty("elements");
    if (elementTypes) {
        PLAYER_DATA.elements = [];
        // Strings of all the elements
        const parsedElements = JSON.parse(elementTypes);
        for (let i = 0; i < parsedElements.length; i++) {
            const elementType = parsedElements[i];
            if (elementType) {
                PLAYER_DATA.elements.push(elements[elementType]);
            }
        }
    }

    // Get the saved moveset
    const moveset = player.getDynamicProperty("moveset");
    if (moveset) {
        const parsedMoveset = JSON.parse(moveset);
        for (let i = 0; i < parsedMoveset.length; i++) {
            const move = parsedMoveset[i];
            if (move) {
                PLAYER_DATA.moveset[i] = move;
            }
        }
    }

    // Get the saved bindings
    const bindings = player.getDynamicProperty("bindings");
    if (bindings) {
        const parsedBindings = JSON.parse(bindings);
        for (let i = 0; i < parsedBindings.length; i++) {
            const binding = parsedBindings[i];
            if (binding) {
                PLAYER_DATA.bindings[i] = binding;
            }
        }
    }

    PLAYER_DATA.skills = playerSkillList(player);
    loadMoveset(player);
    sidebar(player, PLAYER_DATA);
    PLAYER_DATA.pauseChibar = true;

    delayedFunc(player, () => {
        PLAYER_DATA.inMenu = false;
    }, 3);
}