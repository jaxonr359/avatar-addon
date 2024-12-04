import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP } from "../../index.js";

import { delayedFunc, parseMenu } from "../../utils.js";

import { chooseBendingMenu } from "./chooseBending.js";
import { chooseSlotsMenu } from "./chooseSlots.js";
import { showSkillTreeMenu } from "./skillTree.js";
import { statsInfoMenu } from "./statsInfo.js";
import { sidebar } from "../player/hud.js";
import { teamsMenu } from "./teams.js";

import { adminMenu } from "./adminSettings.js";

const quickSettingsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = false;
    const quickSettings = {
		title: { translate: `scroll.settings.quick.title` },
		type: "modal",
		content: [
			{
				title: { translate: "scroll.settings.quick.enable_bending" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.enabledBending
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.enabledBending;
					PLAYER_DATA.settings.enabledBending = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.bending_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
			{
				title: { translate: "scroll.settings.quick.status_messages" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.showStatusMessages
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.showStatusMessages;
					PLAYER_DATA.settings.showStatusMessages = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.status_messages_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
			{
				title : { translate: "scroll.settings.quick.show_hud" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.showHudElements
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.showHudElements;
					PLAYER_DATA.settings.showHudElements = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.hud_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
			{
				title : { translate: "scroll.settings.quick.show_sidebar" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.showSidebar
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.showSidebar;
					PLAYER_DATA.settings.showSidebar = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.sidebar_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    PLAYER_DATA.inMenu = true;
					PLAYER_DATA.pauseChibar = true;
					PLAYER_DATA.sidebarRefreshed = false;

                    sidebar(player, PLAYER_DATA);

                    delayedFunc(player, () => {
                        PLAYER_DATA.inMenu = false;
                    }, 3)

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			}
		]
	};

    parseMenu(player, quickSettings, chooseSettingsMenu);
};

const advancedSettingsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = false;
    const quickSettings = {
		title: { translate: `scroll.settings.advanced.title` },
		type: "modal",
		content: [
			{
				title: { translate: "scroll.settings.quick.enable_bending" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.enabledBending
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.enabledBending;
					PLAYER_DATA.settings.enabledBending = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.bending_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
			{
				title: { translate: "scroll.settings.quick.status_messages" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.showStatusMessages
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.showStatusMessages;
					PLAYER_DATA.settings.showStatusMessages = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.status_messages_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
			{
				title : { translate: "scroll.settings.quick.show_hud" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.showHudElements
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.showHudElements;
					PLAYER_DATA.settings.showHudElements = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.hud_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
			{
				title : { translate: "scroll.settings.quick.show_sidebar" },
				type: "toggle",
				data: {
					condition: PLAYER_DATA.settings.showSidebar
				},
				update(state) {
					const prevSetting = PLAYER_DATA.settings.showSidebar;
					PLAYER_DATA.settings.showSidebar = state;

					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.sidebar_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    PLAYER_DATA.inMenu = true;
					PLAYER_DATA.pauseChibar = true;
					PLAYER_DATA.sidebarRefreshed = false;

                    sidebar(player, PLAYER_DATA);

                    delayedFunc(player, () => {
                        PLAYER_DATA.inMenu = false;
                    }, 3)

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
            {
                title: { translate: "scroll.settings.advanced.show_damage_debug" },
                type: "toggle",
                data: {
                    condition: PLAYER_DATA.settings.showDamageDebug
                },
                update(state) {
                    const prevSetting = PLAYER_DATA.settings.showDamageDebug;
                    PLAYER_DATA.settings.showDamageDebug = state;

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.advanced.show_damage_debug_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
                }
            },
			{
				title: { translate: "scroll.settings.quick.double_sneak_time" },
				type: "slider",
				data: {
					value: PLAYER_DATA.settings.doubleSneakTimer,
					min: 10,
					max: 150,
					step: 1,
					description: { translate: "scroll.settings.quick.double_sneak_time_desc" },
					valuePrefix: { translate: "scroll.settings.quick.double_sneak_time_prefix" }
				},
				update(value) {
					const prevSetting = PLAYER_DATA.settings.doubleSneakTimer;
					PLAYER_DATA.settings.doubleSneakTimer = value;

					if (prevSetting !== value && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.quick.double_sneak_time_changed", with: [`${value}`] }]});
					}

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
				}
			},
            {
                title: { translate: "scroll.settings.advanced.aim_assist_strength" },
                type: "slider",
                data: {
                    value: PLAYER_DATA.settings.aimAssistStrength,
                    min: 0,
                    max: 100,
                    step: 1,
                    description: { translate: "scroll.settings.advanced.aim_assist_strength_desc" },
                    valuePrefix: { translate: "scroll.settings.quick.double_sneak_time_prefix" }
                },
                update(value) {
                    const prevSetting = PLAYER_DATA.settings.aimAssistStrength;
                    PLAYER_DATA.settings.aimAssistStrength = value;

                    if (prevSetting !== value && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.advanced.aim_assist_strength_changed", with: [`${value}`] }]});
                    }

                    player.setDynamicProperty("settings", JSON.stringify(PLAYER_DATA.settings));
                }
            }
		]
	};

    parseMenu(player, quickSettings, chooseSettingsMenu);
};

const adminSettingsMenu = (player) => {
    adminMenu(player);
};

const viewUpdate = (player, update) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const viewUpdateForm = new ActionFormData();
    viewUpdateForm.title({ rawtext: [
        { translate: 'scroll.updates.version', with: { rawtext: [{ text: update.version }] } },
        { text: '§d§f' },
    ]});

    viewUpdateForm.body({ rawtext: [
        { text: '§p' },
        { translate: 'scroll.updates.version.short' },
        { text: ': §7' },
        { text: update.version },
        { text: '\n\n§p' },
        { translate: 'scroll.updates.date' },
        { text: ': §7' },
        update.date,
        { text: '\n\n§p' },
        { translate: 'scroll.updates.notes' },
        { text: ': \n§7' },
        ...update.notes,
        { text: '\n\n§p' },
        { translate: 'scroll.updates.changes' },
        { text: ': §7' },
        ...update.changes.map((change, i) => ({ rawtext: [{ text: `\n - ` }, change] }))
    ]});

    viewUpdateForm.button('Back', 'textures/ui/avatar/back');

    viewUpdateForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            updateLogsMenu(player);
        }

        PLAYER_DATA.inMenu = false;
    });
}

const updateLogsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const updatesForm = new ActionFormData();
    updatesForm.title({ rawtext: [
        { translate: 'scroll.updates.title' },
        { text: '§d§f' },
    ]});

    updatesForm.button('Back', 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) updatesForm.button('');

    const updates = [
        {
            version: '1.0.0',
            date: { text: '2024-11-10' },
            notes: [
                { translate: 'scroll.updates.notes.1' }
            ],
            changes: [
                { translate: 'scroll.updates.changes.1' }
            ]
        },
        {
            version: '1.0.1',
            date: { translate: 'scroll.updates.unreleased' },
            notes: [
                { translate: 'scroll.updates.notes.2' }
            ],
            changes: [
                { translate: 'scroll.updates.changes.2' }
            ]
        }
    ];

    for (const update of updates) {
        updatesForm.button({ rawtext: [
            { text: '' },
            { translate: 'scroll.updates.version', with: { rawtext: [{ text: update.version }] } },
        ]});
    }
    
    updatesForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            chooseSettingsMenu(player);
        }

        const update = updates[selection - 6];
        if (update === undefined) return PLAYER_DATA.inMenu = false;

        viewUpdate(player, update);

        PLAYER_DATA.inMenu = false;
    });
}

const creditsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    
    const creditsForm = new ActionFormData();
    creditsForm.title({ rawtext: [
        { translate: 'scroll.credits.title' },
        { text: '§d§f' },
    ]});

    const people = {
        author: [
            'GlitchyTurtle32'
        ],
        contributors: [
            'Theorist',
            'iHeroic',
            'Sir Jackster'
        ],
        translators: [
            'GlitchyTurtle32',
            'theoneloading'
        ],
        special_thanks: [
            'IBk',
            'DeathBot',
            'Flame',
            'r4isen1920',
            'Bushy',
            'zackeryruin',
            'itzmeserpent',
            'crusaderlady',
            'ButterJaffa',
            'John',
            'Apple Slice',
            'jal191209'
        ],
        patrons: [
            'DeathBot',
            'zackeryruin',
            'Hype7828',
            'Chakurow',
            'Jhonnyredman',
            'Jp123nona',
            'Kobethatboy',
            'Stewie6408',
            'craigthecreature',
            'soma4811',
            'chakuro',
            'Stewie',
            'Bushy',
            'DracoRex1912',
            'avariss',
            'rattenkönig',
            'lfun 621',
            'Syafiq Zamri',
            'Jhonny Gray',
            'Epic Gaming Warrior',
            'Malachi',
            'Kalvin Cronin-Green',
            'Frosty',
            'ShinyStarles',
            'Steeltaysirtm',
            'JDEE 008',
            'Captain AJ4145',
            'BorderlifeGames',
        ],
        beta: [
            'DeathBot',
            'theman0fmanynames',
            'IBk',
            'itzmeserpent',
            'jal191209',
            'j3ll04',
            'galaxy__g',
            'yusufgamer0920',
            'zackeryruin',
            'wild0938',
            'whitedevil06',
            'monarch252764',
            'sleepyisbatman'
        ]
    }

    creditsForm.body({ rawtext: [
        { text: '§p' },
        { translate: 'scroll.credits.author' },
        { text: '\n§7'},
        { text: people.author.join('\n') },
        { text: '\n\n§p' },
        { translate: 'scroll.credits.contributors' },
        { text: '\n§7' },
        { text: people.contributors.join('\n') },
        { text: '\n\n§p' },
        { translate: 'scroll.credits.translators' },
        { text: '\n§7' },
        { text: people.translators.join('\n') },
        { text: '\n\n§p' },
        { translate: 'scroll.credits.special_thanks' },
        { text: '\n§7' },
        { text: people.special_thanks.join('\n') },
        { text: '\n\n§p' },
        { translate: 'scroll.credits.patrons' },
        { text: '\n§7' },
        { text: people.patrons.join('\n') },
        { text: '\n\n§p' },
        { translate: 'scroll.credits.beta' },
        { text: '\n§7' },
        { text: people.beta.join('\n') },
    ]})

    creditsForm.button('Back', 'textures/ui/avatar/back');

    creditsForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            chooseSettingsMenu(player);
        }
    });
};

export const chooseSettingsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = chooseSettingsMenu;

    const settingsMenu = new ActionFormData()
    settingsMenu.title('Settings§d§f')
    settingsMenu.body('Pick a category to edit!');
    
    settingsMenu.button('', 'textures/ui/avatar/avatar_logo');
    settingsMenu.button('', 'textures/ui/avatar/movesets');
    settingsMenu.button('', 'textures/ui/avatar/skill_tree');
    settingsMenu.button('', 'textures/ui/avatar/info');
    settingsMenu.button('', 'textures/ui/avatar/teams');
    settingsMenu.button('§p', 'textures/ui/settings_glyph_color_2x') ;

    settingsMenu.button('Quick Settings', 'textures/ui/avatar/ping')
    settingsMenu.button('Advanced Settings', 'textures/ui/avatar/inventory')
    settingsMenu.button('Admin Settings', 'textures/ui/avatar/runcode')
    settingsMenu.button('Credits', 'textures/ui/avatar/credits')

    settingsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        const settingsMenus = [quickSettingsMenu, advancedSettingsMenu, adminSettingsMenu, creditsMenu];
        settingsMenus[selection - 6](player);

        PLAYER_DATA.inMenu = false;
    });
}