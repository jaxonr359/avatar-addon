import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP, WORLD_SETTINGS } from "../../index.js";

import { chooseSettingsMenu } from "./chooseSettings.js";
import { parseMenu } from "../../utils.js";
import { reload, reset } from "../player/setup.js";
import { elements } from "../elements/import.js";
import { fixMoveset } from "./chooseSlots.js";
import { loadMoveset } from "../player/load.js";

const worldSettingsDefaults = {
    enabled: 1, // 1 = enabled, 0 = disabled (int)
    bending: 0, // 0 = chosen bending, 1 = randomized bending
    avatar: 1, // 1 = enabled for all, 0 = disabled for all (int)
    lvlspd: 1, // 0-3, (float)
    sethme: 1, // 1 = enabled, 0 = disabled (int)
    sklltree: 0, // 0 = not fully unlockable, 1 = fully unlockable (int)
    choicefinl: 0, // 0 = not final, 1 = final (int)
    chispd: 1, // 0-3, (float)
    border: 0, // 1 = enabled, 0 = disabled (int)
    bordersz: 20000, // 0-500 000 (int)
    centerloc: { x: 0, y: 0, z: 0 }, // (object)
    nobendingzones: [], // (array)
    bannedmoves: [], // (array)
    combatwrld: 0, // 1 = enabled, 0 = disabled (int)
}

export const refreshWorldSettings = () => {
    const worldSettings = world.getDynamicProperty("worldSettings");
    if (!worldSettings) {
        world.setDynamicProperty("worldSettings", JSON.stringify(worldSettingsDefaults));
        for (const key in worldSettingsDefaults) {
            WORLD_SETTINGS[key] = worldSettingsDefaults[key];
        }
    } else {
        const settings = JSON.parse(worldSettings);
        for (const key in settings) {
            WORLD_SETTINGS[key] = settings[key];
        }

        WORLD_SETTINGS.centerloc = world.getDefaultSpawnLocation();

        const rawZones = world.getDynamicProperty("noBendingZones");
        const zones = rawZones ? JSON.parse(rawZones) : [];
        WORLD_SETTINGS.noBendingZones = zones;

        const rawMoves = world.getDynamicProperty("bannedMoves");
        const moves = rawMoves ? JSON.parse(rawMoves) : [];
        WORLD_SETTINGS.bannedmoves = moves;
    }
};

const createNoBendingZoneMenu = (player) => {
    const MAX_ZONES = 16;
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeMoveset = new ModalFormData();
    makeMoveset.title({ rawtext: [
        { text: '§m§f' },
        { translate: 'scroll.no_bending_zones.create.title' },
    ]});

    makeMoveset.textField({ translate: 'scroll.no_bending_zones.create.description' }, { translate: 'scroll.no_bending_zones.create.placeholder' });
 
    makeMoveset.slider({ rawtext: [
        { translate: 'scroll.no_bending_zones.create.radius' },
        { text: `\n§7` },
        { translate: 'scroll.no_bending_zones.create.radius_desc' },
        { text: ` ` },
        { translate: 'scroll.no_bending_zones.create.radius_prefix' }
    ]}, 16, 512, 8, 32);

    makeMoveset.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.create.exit" }]});
            return noBendingZonesMenu(player);
        }
        
        const [ name, radius ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.create.tooshort", with: [`${MIN_LENGTH}`] }]});
            return createMovesetMenu(player);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.create.toolong", with: [`${MAX_LENGTH}`] }]});
            return createMovesetMenu(player);
        }

        const rawZones = world.getDynamicProperty("noBendingZones");
        const zones = rawZones ? JSON.parse(rawZones) : [];
   
        if (zones.length > MAX_ZONES) {
            PLAYER_DATA.inMenu = false;
            return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.create.toomany", with: [`${MAX_ZONES}`] }]});
        }

        const { x, y, z } = player.location;
        const zone = {
            n: name,
            c: { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) },
            r: radius
        }

        zones.push(zone);
        world.setDynamicProperty("noBendingZones", JSON.stringify(zones));
        refreshWorldSettings();

        player.sendMessage({rawtext: [{ text: '§a' }, { translate: "scroll.no_bending_zones.create.success", with: [name] }]});

        PLAYER_DATA.inMenu = false;
    });
};

const editZoneMenu = (player, zones, index) => {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeMoveset = new ModalFormData();
    makeMoveset.title({ rawtext: [
        { translate: 'scroll.no_bending_zones.create.title' },
        { text: '§m§f' },
    ]});

    makeMoveset.textField({ translate: 'scroll.no_bending_zones.edit.description' }, zones[index].n || '');
 
    makeMoveset.slider({ rawtext: [
        { translate: 'scroll.no_bending_zones.create.radius' },
        { text: `\n§7` },
        { translate: 'scroll.no_bending_zones.edit.radius_desc' },
        { text: ` ` },
        { translate: 'scroll.no_bending_zones.create.radius_prefix' }
    ]}, 16, 512, 8, zones[index].r);

    makeMoveset.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.edit.exit" }]});
            return noBendingZonesMenu(player);
        }
        
        const [ name, radius ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.create.tooshort", with: [`${MIN_LENGTH}`] }]});
            return createMovesetMenu(player);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.no_bending_zones.create.toolong", with: [`${MAX_LENGTH}`] }]});
            return createMovesetMenu(player);
        }

        const zone = {
            n: name,
            c: zones[index].c,
            r: radius
        }

        zones[index] = zone;
        world.setDynamicProperty("noBendingZones", JSON.stringify(zones));
        refreshWorldSettings();

        player.sendMessage({rawtext: [{ text: '§a' }, { translate: "scroll.no_bending_zones.edit.success", with: [name] }]});

        PLAYER_DATA.inMenu = false;
    });
}

const editNoBendingZoneMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const rawZones = world.getDynamicProperty("noBendingZones");
    const zones = rawZones ? JSON.parse(rawZones) : [];

    const editZone = new ActionFormData();
    editZone.title({ rawtext: [
        { translate: 'scroll.no_bending_zones.create.title' },
        { text: '§d§f' },
    ]});

    editZone.body({ translate: 'scroll.no_bending_zones.select.description' });

    editZone.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) editZone.button('');

    for (let i = 0; i < zones.length; i++) {
        const zone = zones[i];
        editZone.button(zone.n);
    }

    editZone.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) return noBendingZonesMenu(player);

        const zone = zones[selection - 6];
        if (!zone) return editNoBendingZoneMenu(player);

        editZoneMenu(player, zones, selection - 6);
    });
};

const deleteNoBendingZoneMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const rawZones = world.getDynamicProperty("noBendingZones");
    const zones = rawZones ? JSON.parse(rawZones) : [];

    const deleteZone = new ActionFormData();
    deleteZone.title({ rawtext: [
        { translate: 'scroll.no_bending_zones.create.title' },
        { text: '§d§f' },
    ]});

    deleteZone.body({ translate: 'scroll.no_bending_zones.delete.description' });

    deleteZone.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) deleteZone.button('');

    for (let i = 0; i < zones.length; i++) {
        const zone = zones[i];
        deleteZone.button(zone.n);
    }

    deleteZone.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) return noBendingZonesMenu(player);

        const zone = zones[selection - 6];
        if (!zone) return deleteNoBendingZoneMenu(player);

        zones.splice(selection - 6, 1);

        world.setDynamicProperty("noBendingZones", JSON.stringify(zones));
        player.sendMessage({rawtext: [{ text: '§a' }, { translate: "scroll.no_bending_zones.delete.success", with: [zone.n] }]});
        refreshWorldSettings();

        PLAYER_DATA.inMenu = false;
    });
};

const noBendingZonesMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const noBendingZones = {
        title: { translate: `scroll.no_bending_zones.create.title` },
        body: { translate: "scroll.admin.world.no_bending_zones.description" },
        type: "action",
        content: [
            {
                title: { translate: "scroll.admin.world.no_bending_zones.create" },
                icon: "textures/ui/avatar/credits.png",
                action: () => {
                    createNoBendingZoneMenu(player);
                }
            },
            {
                title: { translate: "scroll.admin.world.no_bending_zones.edit" },
                icon: "textures/ui/avatar/info.png",
                action: () => {
                    editNoBendingZoneMenu(player);
                }
            },
            {
                title: { translate: "scroll.admin.world.no_bending_zones.delete" },
                icon: "textures/ui/avatar/delete.png",
                action: () => {
                    deleteNoBendingZoneMenu(player);
                }
            }
        ],
        back: () => {
            adminMenu(player);
        }
    };

    parseMenu(player, noBendingZones);
}

const worldBorderMenu = (player) => {
    const worldSettings = world.getDynamicProperty("worldSettings");
    if (!worldSettings) {
        world.setDynamicProperty("worldSettings", JSON.stringify(worldSettingsDefaults));
        for (const key in worldSettingsDefaults) {
            WORLD_SETTINGS[key] = worldSettingsDefaults[key];
        }

        WORLD_SETTINGS.centerloc = world.getDefaultSpawnLocation();
    }

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = false;

    const worldSet = JSON.parse(world.getDynamicProperty("worldSettings"));

    const borderSettings = {
		title: { translate: `scroll.settings.advanced.title` },
		type: "modal",
		content: [
			{
				title: { translate: "scroll.admin.world.world_border.enabled" },
				type: "toggle",
				data: {
					condition: Boolean(worldSet.border)
				},
				update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
					const prevSetting = Boolean(worldSettings.border);
					if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
						player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.worldborder_changed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
					}

                    worldSettings.border = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));    
                    
                    worldSettings.centerloc = world.getDefaultSpawnLocation();
                    refreshWorldSettings();
				}
			},
            {
                title: { translate: "scroll.admin.world.world_border.size" },
                type: "slider",
                data: {
                    value: worldSet.bordersz,
                    min: 100,
                    max: 500000,
                    step: 50,
                    description: { translate: "scroll.admin.world.world_border.size_desc" },
                    valuePrefix: { translate: "scroll.admin.world.world_border.size_prefix" }
                },
                update(value) { 
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = worldSettings.bordersz;

                    if (prevSetting !== value && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.worldborder_changed_size", with: [`${value}`] }]});
                    }

                    worldSettings.bordersz = value;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    
                    worldSettings.centerloc = world.getDefaultSpawnLocation();
                    refreshWorldSettings();
                }
            }
		]
	};


    parseMenu(player, borderSettings, adminMenu);
};

const loadElement = (player, element) => {
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
        player.dimension.spawnParticle(`a:choose_air`, player.location);
        player.dimension.spawnParticle(`a:choose_water`, player.location);
        player.dimension.spawnParticle(`a:choose_earth`, player.location);
        player.dimension.spawnParticle(`a:choose_fire`, player.location);

        reset(player);

        PLAYER_DATA.elements = [elements.avatar, elements.air, elements.water, elements.earth, elements.fire];
        PLAYER_DATA.elementMap = PLAYER_DATA.elements.map(element => element.type);
        player.setDynamicProperty("elements", JSON.stringify(PLAYER_DATA.elementMap));

        reload(player);
    }
}

const editPlayerStyle = (player, target) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const editPlayerStyle = new ActionFormData();

    editPlayerStyle.title({ rawtext: [
        { text: '§d§f' },
        { translate: 'scroll.admin.player.style' }
    ]});
    editPlayerStyle.body({ translate: 'scroll.admin.player.style_description' });

    editPlayerStyle.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) editPlayerStyle.button('');

    for (const element of Object.values(elements)) {
        if (PLAYER_DATA.elementMap.includes(element.type)) {
            editPlayerStyle.button({ rawtext: [
                { text: '§p' },
                element.short,
            ]}, element.icon);
            continue;
        }
        editPlayerStyle.button(element.short, element.icon);
    }

    editPlayerStyle.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return editPlayerMenu(player, target);

        const element = Object.values(elements)[selection - 6];
        if (!element) return editPlayerStyle(player, target);

        loadElement(target, element);
        PLAYER_DATA.inMenu = false;
    });
}

const editPlayerLevel = (player, target) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const TARGET_DATA = PLAYER_DATA_MAP[target.id];
    if (!TARGET_DATA) return;

    const editLevel = {
        title: { translate: `scroll.admin.player.level.title` },
        type: "modal",
        content: [
            {
                title: { translate: "scroll.admin.player.level.level" },
                type: "slider",
                data: {
                    value: TARGET_DATA.level,
                    min: 1,
                    max: 100,
                    step: 1,
                    description: { translate: "scroll.admin.player.level.level_desc" },
                    valuePrefix: { translate: "scroll.admin.player.level.level_prefix" }
                },
                update(value) {
                    const prevSetting = TARGET_DATA.level;

                    TARGET_DATA.level = value;
                    PLAYER_DATA.levelFactor = PLAYER_DATA.level / 100;
                    player.setDynamicProperty("level", PLAYER_DATA.level);
                    player.setDynamicProperty("subLevel", 0);

                    if (prevSetting !== value && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.level_changed", with: [`${value}`] }]});
                    }
                }
            }
        ]
    }

    const returnWorkaround = () => {
        PLAYER_DATA.inMenu = false;
        editPlayerMenu(player, target);
    }

    parseMenu(player, editLevel, returnWorkaround);
}

const editPlayerMenu = (player, target) => {
    const editPlayerSettings = {
		title: { translate: `scroll.admin.player.title` },
		body: { translate: "scroll.admin.player.description" },
		type: "action",
		content: [
			{
				title: { translate: "scroll.admin.player.style" },
				icon: "textures/ui/avatar/avatar_logo.png",
				action: () => {
					editPlayerStyle(player, target);
				}
			},
			{
				title: { translate: "scroll.admin.player.level" },
				icon: "textures/ui/avatar/info.png",
				action: () => {
					editPlayerLevel(player, target);
				}
			},
            {
                title: { translate: "scroll.admin.player.see_inventory" },
                icon: "textures/ui/avatar/credits.png",
                action: () => {
                    const container = target.getComponent('inventory').container;
                    const items = [];
                    for (let i = 0; i < container.size; i++) {
                        if (container.getItem(i)) {
                            const o = container.getItem(i);
                            items.push({ text: `§r${i+1}: ${o.typeId.replace("minecraft:", "").replace("a:", "")} x${o.amount}§r\n` });
                        }
                    }
                    
                    player.sendMessage({rawtext: [
                        { text: '§f---------------------\n§e' },
                        { translate: 'scroll.admin.player.see_inventory.title', with: [target.name] },
                        { text: '§r\n' },
                        ...items,
                        { text: '§f---------------------' }
                    ]});
                }
            },
            {
                title: { translate: "scroll.admin.player.ender_chest_wipe" },
                icon: "textures/ui/avatar/echest.png",
                action: () => {
                   player.sendMessage({ translate: 'scroll.admin.player.ender_chest_wipe.success', with: [target.name] });

                    for (let i = 0; i < 30; i++) {
                        target.runCommand(`replaceitem entity @s slot.enderchest ${i} air`);
                    }
                }
            },
            {
                title: { translate: "scroll.admin.player.reset" },
                icon: "textures/ui/avatar/delete.png",
                action: () => {
                    reset(target);
                    player.sendMessage({rawtext: [{ text: '§7' }, { translate: 'scroll.admin.player.reset.success', with: [target.name] }]});
                }
            }
            
		],
        back: () => {
            playerSettings(player);
        }
	};

    parseMenu(player, editPlayerSettings);
}

const playerSettings = (player, start = 0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const memberMenu = new ActionFormData();
    memberMenu.title({ rawtext: [
        { translate: 'scroll.admin.player.title' },
        { text: '§d§f' },
    ]});
    memberMenu.body({ translate: 'scroll.admin.player.description' });
    memberMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) memberMenu.button('');

    const players = world.getAllPlayers();

    if (start > players.length) start = 0;

    for (let i = 0; i < 10; i++) {
        const player = players[i + start];
        if (!player) break;
        memberMenu.button(player.name);
    }

    if (players.length > 10) memberMenu.button({ translate: 'standard.buttons.next' });
    if (start > 0) memberMenu.button({ translate: 'standard.buttons.back' });

    memberMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return adminMenu(player);
       
        const removeFrom = (players.length - start - 10) < 0 ? players.length - start - 10 : 0;

        if (selection === 16 + removeFrom) return playerSettings(player, start + 10);
        if (selection === 17 + removeFrom) return playerSettings(player, start - 10);

        const selectedPlayer = players[selection - 6];
        if (!selectedPlayer) return playerSettings(player);

        editPlayerMenu(player, selectedPlayer);
        PLAYER_DATA.inMenu = false;
    });
};

const banMovesMenu = (player, page = 0) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const moves = [];
    for (const element of Object.values(elements)) {
        for (const move of element.moves) {
            moves.push(move);
        }
    }

    const bannedMovesRaw = world.getDynamicProperty("bannedMoves");
    const bannedMoves = bannedMovesRaw ? JSON.parse(bannedMovesRaw) : [];

    const start = page * 10;

    const banMoves = new ActionFormData();
    banMoves.title({ rawtext: [
        { translate: 'scroll.admin.world.ban_moves' },
        { text: '§d§f' },
    ]});

    banMoves.body({ translate: 'scroll.admin.world.ban_moves_description' });

    banMoves.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) banMoves.button('');

    for (let i = 0; i < 10; i++) {
        const move = moves[i + start];
        if (!move) break;

        if (bannedMoves.includes(move.id)) {
            banMoves.button({ rawtext: [
                { text: '§c' },
                move.name
            ]});
            continue;
        }

        banMoves.button(move.name.translate);
    }

    if (moves.length - start > 10) banMoves.button({ translate: 'standard.buttons.next' });
    if (page > 0) banMoves.button({ translate: 'standard.buttons.back' });

    banMoves.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return adminMenu(player);
       
        const removeFrom = (moves.length - start - 10) < 0 ? moves.length - start - 10 : 0;

        if (selection === 16 + removeFrom) {
            if (moves.length - start <= 10) return banMovesMenu(player, page - 1);
            return banMovesMenu(player, page + 1);
        }
        if (selection === 17 + removeFrom) {
            return banMovesMenu(player, page - 1);
        }

        const move = moves[(selection - 6) + start];
        if (!move) return banMovesMenu(player);

        const rawMoves = world.getDynamicProperty("bannedMoves");
        const bannedMoves = rawMoves ? JSON.parse(rawMoves) : [];

        if (bannedMoves.includes(move.id)) {
            bannedMoves.splice(bannedMoves.indexOf(move.id), 1);
            player.sendMessage({rawtext: [{ text: '§a' }, { translate: "scroll.admin.world.ban_moves.unbanned", with: {rawtext: [move.name]} }]});
        } else {
            bannedMoves.push(move.id);
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.admin.world.ban_moves.banned", with: {rawtext: [move.name]} }]});
        }

        world.setDynamicProperty("bannedMoves", JSON.stringify(bannedMoves));
        refreshWorldSettings();

        for (const player of world.getAllPlayers()) {
            fixMoveset(player);
            loadMoveset(player);
        }

        banMovesMenu(player, page);
    });
};

export const adminMenu = (player) => {
    if (!(player.isOp() || player.hasTag("staff"))) return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.admin.no_permission" }]});

	const PLAYER_DATA = PLAYER_DATA_MAP[player.id];

	const worldSettings = {
		title: { translate: `scroll.admin.world.title` },
		body: { translate: "scroll.admin.world.description" },
		type: "action",
		content: [
			{
				title: { translate: "scroll.admin.world.basic" },
				icon: "textures/ui/avatar/mobile.png",
				action: () => {
					parseMenu(player, basicWorldSettings);
				}
			},
			{
				title: { translate: "scroll.admin.world.ban_moves" },
				icon: "textures/ui/avatar/movesets.png",
				action: () => {
					banMovesMenu(player);
				}
			},
			{
				title: { translate: "scroll.admin.world.world_border" },
				icon: "textures/ui/avatar/home.png",
				action: () => {
					worldBorderMenu(player);
				}
			},
            {
                title: { translate: "scroll.admin.world.no_bending_zones" },
				icon: "textures/ui/avatar/nonbender.png",
				action: () => {
					noBendingZonesMenu(player);
				}  
            }
		],
        back: () => {
            parseMenu(player, adminSettings);
        }
	};

	const basicWorldSettings = {
		title: { translate: `scroll.admin.world.basic.title` },
		type: "modal",
		content: [
			{
				title: { translate: "scroll.admin.world.basic.bending_enabled" },
				type: "toggle",
				data: {
					condition: Boolean(WORLD_SETTINGS.enabled)
				},
				update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = Boolean(worldSettings.enabled);

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.bending_enabled", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    worldSettings.enabled = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
				}
			},
            {
				title: { translate: "scroll.admin.world.basic.set_home_enabled" },
				type: "toggle",
				data: {
					condition: Boolean(WORLD_SETTINGS.sethme)
                },
                update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = Boolean(worldSettings.sethme);

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.set_home_enabled", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    worldSettings.sethme = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
			},
            {
                title: { translate: "scroll.admin.world.basic.bending_choice_final" },
                type: "toggle",
                data: {
                    condition: Boolean(WORLD_SETTINGS.choicefinl)
                },
                update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = Boolean(worldSettings.choicefinl);

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.bending_choice_final", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    worldSettings.choicefinl = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
            },
            {
                title: { translate: "scroll.admin.world.basic.bending_choice_random" },
                type: "toggle",
                data: {
                    condition: Boolean(WORLD_SETTINGS.bending)
                },
                update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = Boolean(worldSettings.bending);

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.bending_choice_random", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    worldSettings.bending = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
            },
            {
                title: { translate: "scroll.admin.world.basic.avatar_allowed" },
                type: "toggle",
                data: {
                    condition: Boolean(WORLD_SETTINGS.avatar)
                },
                update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = Boolean(worldSettings.avatar);

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.avatar_allowed", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    worldSettings.avatar = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
            },
            {
                title: { translate: "scroll.admin.world.basic.skilltree" },
                type: "toggle",
                data: {
                    condition: Boolean(WORLD_SETTINGS.sklltree)
                },
                update(state) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = Boolean(worldSettings.sklltree);

                    if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.skilltree", with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                    }

                    worldSettings.sklltree = state ? 1 : 0;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
            },
            {
                title: { translate: "scroll.admin.world.basic.bending_speed" },
                type: "slider",
                data: {
                    value: WORLD_SETTINGS.chispd,
                    min: 0.1,
                    max: 3,
                    step: 0.1,
                    description: { translate: "scroll.admin.world.basic.bending_speed_desc" },
                    valuePrefix: { translate: "scroll.admin.world.basic.bending_speed_prefix" }
                },
                update(value) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = worldSettings.chispd;

                    if (prevSetting !== value && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.bending_speed_changed", with: [`${value.toFixed(2)}`] }]});
                    }

                    worldSettings.chispd = value;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
            },
            {
                title: { translate: "scroll.admin.world.basic.bending_level_speed" },
                type: "slider",
                data: {
                    value: WORLD_SETTINGS.lvlspd,
                    min: 0.1,
                    max: 3,
                    step: 0.1,
                    description: { translate: "scroll.admin.world.basic.bending_level_speed_desc" },
                    valuePrefix: { translate: "scroll.admin.world.basic.bending_level_speed_prefix" }
                },
                update(value) {
                    const worldSettings = JSON.parse(world.getDynamicProperty("worldSettings"));
                    const prevSetting = worldSettings.lvlspd;

                    if (prevSetting !== value && PLAYER_DATA.settings.showStatusMessages) {
                        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.settings.bending_level_speed_changed", with: [`${value.toFixed(2)}`] }]});
                    }

                    worldSettings.lvlspd = value;
                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();
                }
            }
		]
	};

	const worldPresets = {
		title: { translate: `scroll.admin.world_presets.title` },
		body: { translate: "scroll.admin.world_presets.description" },
		type: "action",
		content: [
			{
				title: { translate: "scroll.admin.world_presets.standard" },
				icon: "textures/ui/avatar/avatar_logo.png",
				action: () => {
					parseMenu(player, standardPreset);
				}
			},
			{
				title: { translate: "scroll.admin.world_presets.pvp" },
				icon: "textures/ui/avatar/pvp.png",
				action: () => {
                    parseMenu(player, pvpPreset);
				}
			},
			{
				title: { translate: "scroll.admin.world_presets.server" },
				icon: "textures/ui/avatar/inventory.png",
				action: () => {
                    parseMenu(player, serverPreset);
				}
			}
		],
        back: () => {
            parseMenu(player, adminSettings);
        }
	};

	const standardPreset = {
		title: { translate: `scroll.admin.world_presets.standard.title` },
		body: { translate: "scroll.admin.world_presets.standard.description" },
		type: "action",
		content: [
			{
				title: { translate: "scroll.admin.world_presets.use" },
				icon: "textures/ui/avatar/avatar_logo.png",
				action: () => {
                    const worldSettingsRaw = world.getDynamicProperty("worldSettings");
                    const worldSettings = worldSettingsRaw ? JSON.parse(worldSettingsRaw) : {};

                    for (const key in worldSettingsDefaults) {
                        worldSettings[key] = worldSettingsDefaults[key];
                    }

                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();

                    player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.admin.world_presets.standard.success" }]});
				}
			}
		],
        back: () => {
            parseMenu(player, worldPresets);
        }
	};

    const pvpPreset = {
        title: { translate: `scroll.admin.world_presets.pvp.title` },
        body: { translate: "scroll.admin.world_presets.pvp.description" },
        type: "action",
        content: [
            {
                title: { translate: "scroll.admin.world_presets.use" },
                icon: "textures/ui/avatar/avatar_logo.png",
                action: () => {
                    const worldSettingsRaw = world.getDynamicProperty("worldSettings");
                    const worldSettings = worldSettingsRaw ? JSON.parse(worldSettingsRaw) : {};

                    worldSettings.enabled = 1;
                    worldSettings.combatwrld = 1;
                    worldSettings.bending = 0;
                    worldSettings.choicefinl = 0;
                    worldSettings.avatar = 0;
                    worldSettings.sklltree = 1;
                    worldSettings.chispd = 1;
                    worldSettings.lvlspd = 0;
                    worldSettings.sethme = 0;
                    worldSettings.bordersz = 250;
                    worldSettings.border = 1;

                    for (const player of world.getAllPlayers()) {
                        const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
                        PLAYER_DATA.level = 100;
                        PLAYER_DATA.levelFactor = 1;
                        player.setDynamicProperty("level", PLAYER_DATA.level);
                        player.setDynamicProperty("subLevel", 0);

                        fixMoveset(player);
                        loadMoveset(player);
                    }

                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();

                    player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.admin.world_presets.pvp.success" }]});
                }
            }
        ],
        back: () => {
            parseMenu(player, worldPresets);
        }
    };

    const serverPreset = {
        title: { translate: `scroll.admin.world_presets.server.title` },
        body: { translate: "scroll.admin.world_presets.server.description" },
        type: "action",
        content: [
            {
                title: { translate: "scroll.admin.world_presets.use" },
                icon: "textures/ui/avatar/avatar_logo.png",
                action: () => {
                    const worldSettingsRaw = world.getDynamicProperty("worldSettings");
                    const worldSettings = worldSettingsRaw ? JSON.parse(worldSettingsRaw) : {};

                    worldSettings.enabled = 1;
                    worldSettings.combatwrld = 0;
                    worldSettings.bending = 0;
                    worldSettings.choicefinl = 0;
                    worldSettings.avatar = 0;
                    worldSettings.sklltree = 0;
                    worldSettings.chispd = 1;
                    worldSettings.lvlspd = 0.6;
                    worldSettings.sethme = 1;
                    worldSettings.bordersz = 100000;
                    worldSettings.border = 1;

                    for (const player of world.getAllPlayers()) {
                        const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
                        PLAYER_DATA.level = 100;
                        PLAYER_DATA.levelFactor = 1;
                        player.setDynamicProperty("level", PLAYER_DATA.level);
                        player.setDynamicProperty("subLevel", 0);

                        fixMoveset(player);
                        loadMoveset(player);
                    }

                    world.setDynamicProperty("worldSettings", JSON.stringify(worldSettings));
                    refreshWorldSettings();

                    player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.admin.world_presets.server.success" }]});
                }
            }
        ],
        back: () => {
            parseMenu(player, worldPresets);
        }
    };

	const adminSettings = {
		title: { translate: `scroll.admin.title` },
		body: { translate: "scroll.admin.description" },
		type: "action",
		content: [
			{
				title: { translate: "scroll.admin.edit_player" },
				icon: "textures/ui/avatar/credits.png",
				action: () => {
					playerSettings(player);
				}
			},
			{
				title: { translate: "scroll.admin.edit_world" },
				icon: "textures/ui/avatar/home.png",
				action: () => {
					parseMenu(player, worldSettings);
				}
			},
			{
				title: { translate: "scroll.admin.world_presets" },
				icon: "textures/ui/avatar/info.png",
				action: () => {
					parseMenu(player, worldPresets);
				}
			}
		],
        back: () => {
            chooseSettingsMenu(player);
        }
	}

	parseMenu(player, adminSettings);
};