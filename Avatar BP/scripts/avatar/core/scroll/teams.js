import { system, Player, ItemStack, BlockPermutation, MolangVariableMap, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PLAYER_DATA_MAP } from "../../index.js";

import { chooseBendingMenu } from "./chooseBending.js";
import { chooseSlotsMenu } from "./chooseSlots.js";
import { showSkillTreeMenu } from "./skillTree.js";
import { statsInfoMenu } from "./statsInfo.js";
import { chooseSettingsMenu } from "./chooseSettings.js";
import { parseMenu } from "../../utils.js";

const settingsMap = {
    public: {
        title: { translate: "scroll.settings.teams.public" },
        short: { translate: "scroll.settings.teams.public.short" },
        changed: "scroll.settings.quick.public_changed",
        type: "toggle"
    },
    friendlyFire: {
        title: { translate: "scroll.settings.teams.friendly_fire" },
        short: { translate: "scroll.settings.teams.friendly_fire.short" },
        changed: "scroll.settings.quick.friendly_fire_changed",
        type: "toggle"
    },
    teleports: {
        title: { translate: "scroll.settings.teams.teleports" },
        short: { translate: "scroll.settings.teams.teleports.short" },
        changed: "scroll.settings.quick.teleports_changed",
        type: "toggle"
    }
}

const createTeamMenu = (player) => {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeHome = new ModalFormData();
    makeHome.title({ rawtext: [
        { translate: 'scroll.teams.create_team.title' },
        { text: '§m§f' },
    ]});

    makeHome.textField({ translate: 'scroll.teams.create_team.description' }, { translate: 'scroll.teams.create_team.placeholder' });
    
    makeHome.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.exit" }]});
            return noTeamMenu(player);
        }

        const [ name ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.tooshort", with: [`${MIN_LENGTH}`] }]});
            return createTeamMenu(player);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.toolong", with: [`${MAX_LENGTH}`] }]});
            return createTeamMenu(player);
        }

        // Check if team already exists
        const allIds = world.getDynamicPropertyIds();
        const allTeams = allIds.filter(id => id.startsWith("team_")).map(id => JSON.parse(world.getDynamicProperty(id)));

        for (const team of allTeams) {
            if (team.name === name) {
                PLAYER_DATA.inMenu = false;
                player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.exists" }]});
                return createTeamMenu(player);
            }
        }

        const newTeam = {
            ownerId: player.id,
            ownerName: player.name,
            name,
            memberCount: 1,
            creationDate: Date.now(),
            members: [
                {
                    id: player.id,
                    name: player.name
                }
            ],
            invites: [],
            settings: {
                public: false,
                friendlyFire: true,
                teleports: true
            }
        };

        world.setDynamicProperty(`team_${player.id}`, JSON.stringify(newTeam));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.create_team.success", with: [name] } ]});

        PLAYER_DATA.teamId = player.id;
        PLAYER_DATA.inMenu = false;
    });
};

const teamNameMenu = (player, team) => {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 32;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeHome = new ModalFormData();
    makeHome.title({ rawtext: [
        { translate: 'scroll.teams.name.title' },
        { text: '§m§f' },
    ]});

    makeHome.textField({ translate: 'scroll.teams.create_team.description' }, { translate: 'scroll.teams.create_team.placeholder' });

    makeHome.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.name.exit" }]});
            return teamOwnerMenu(player, team);
        }

        const [ name ] = formValues;

        if (!name || name.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.tooshort", with: [`${MIN_LENGTH}`] }]});
            return teamNameMenu(player, team);
        } else if (name.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.toolong", with: [`${MAX_LENGTH}`] }]});
            return teamNameMenu(player, team);
        }

        // Check if team already exists
        const allIds = world.getDynamicPropertyIds();
        const allTeams = allIds.filter(id => id.startsWith("team_")).map(id => JSON.parse(world.getDynamicProperty(id)));

        for (const team of allTeams) {
            if (team.name === name) {
                PLAYER_DATA.inMenu = false;
                player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.create_team.exists" }]});
                return teamNameMenu(player, team);
            }
        }

        team.name = name;
        world.setDynamicProperty(`team_${team.ownerId}`, JSON.stringify(team));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.name.success" }]});

        PLAYER_DATA.inMenu = false;

        return teamOwnerMenu(player, team);
    });
};

const teamDescriptionMenu = (player, team) => {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 256;

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const makeHome = new ModalFormData();
    makeHome.title({ rawtext: [
        { translate: 'scroll.teams.description.title' },
        { text: '§m§f' },
    ]});

    makeHome.textField({ translate: 'scroll.teams.description.description' }, { translate: 'scroll.teams.description.placeholder' });

    makeHome.show(player).then((data) => {
        const { formValues } = data;
        if (!formValues) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.description.exit" }]});
            return teamOwnerMenu(player, team);
        }

        const [ description ] = formValues;

        if (!description || description.length < MIN_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.description.tooshort", with: [`${MIN_LENGTH}`] }]});
            return teamDescriptionMenu(player, team);
        } else if (description.length > MAX_LENGTH) {
            PLAYER_DATA.inMenu = false;
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.description.toolong", with: [`${MAX_LENGTH}`] }]});
            return teamDescriptionMenu(player, team);
        }

        team.description = description;
        world.setDynamicProperty(`team_${team.ownerId}`, JSON.stringify(team));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.description.success" }]});

        PLAYER_DATA.inMenu = false;

        return teamOwnerMenu(player, team);
    });
}

const teamTemplate = {
    ownerId: 122,
    ownerName: "Owner Name",
    name: "Team Name",
    memberCount: 32,
    creationDate: Date.now(),
    members: [
        { id: 123, name: "Member Name" }
    ],
    invites: [
        { id: 123, name: "Member Name" }
    ],
    settings: {
        public: false,
        friendlyFire: true,
        teleports: true,
    }
}

const myTeamMenu = (player, team, isOwner) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    // Refresh the team data
    team = JSON.parse(world.getDynamicProperty(`team_${team.ownerId}`));

    if (!isOwner) isOwner = team.ownerId === player.id;

    const myTeamForm = new ActionFormData();
    myTeamForm.title({ rawtext: [
        { translate: 'scroll.teams.my_team' },
        { text: '§d§f' },
    ]});

    const settingsDisplay = [];
    const teamSettings = team.settings;
    for (const setting in teamSettings) {
        const settingData = settingsMap[setting];

        settingsDisplay.push({ rawtext: [
            { text: '§7- ' },
            settingData.short,
            { text: ': ' },
            { translate: (teamSettings[setting] ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled") },
            { text: '\n' }
        ]});
    }

    const settingsText = { rawtext: [
        { text: '\n\n' },
        { translate: 'scroll.settings.teams.title' },
        { text: ':\n' },
        ...settingsDisplay
    ]};

    myTeamForm.body({ rawtext: [
        { text: '§p' },
        { text: `${team.name}§p\n` },
        { text: `§7${team.description || "N/A"}§p\n\n` },
        { translate: 'scroll.teams.my_team.team_owner' },
        { text: `: §7${team.ownerName}§p\n` },
        { translate: 'scroll.teams.my_team.team_creation_date' },
        { text: `: §7${new Date(team.creationDate).toLocaleDateString()}§p\n` },
        { translate: 'scroll.teams.my_team.team_member_count' },
        { text: `: §7${team.memberCount}§p` },
        (isOwner ? { text: '' } : settingsText)
    ]});

    myTeamForm.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) myTeamForm.button('');

    if (isOwner) {
        myTeamForm.button({ translate: 'scroll.teams.name' }, 'textures/ui/avatar/teams');
        myTeamForm.button({ translate: 'scroll.teams.description' }, 'textures/ui/avatar/info');
    } else {
        myTeamForm.button({ translate: 'scroll.teams.leave' }, 'textures/ui/avatar/delete');
    }

    myTeamForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) {
            if (isOwner) return teamOwnerMenu(player, team);
            return teamsMenu(player);
        }

        if (isOwner) {
            if (selection === 6) return teamNameMenu(player, team);
            if (selection === 7) return teamDescriptionMenu(player, team);
        } else {
            if (selection === 6) {
                team.members = team.members.filter(m => m.id !== player.id);
                team.memberCount--;
                world.setDynamicProperty(`team_${team.ownerId}`, JSON.stringify(team));

                PLAYER_DATA.teamId = undefined;                
                PLAYER_DATA.teleportRequests = [];

                player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.leave.success", with: [team.name] }]});
                return teamsMenu(player);
            }
        }

        PLAYER_DATA.inMenu = false;
    });
};

const viewMemberMenu = (player, team, member, owner = false) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    // Refresh the team data
    team = JSON.parse(world.getDynamicProperty(`team_${team.ownerId}`));

    const memberMenu = new ActionFormData();
    memberMenu.title({ rawtext: [
        { translate: 'scroll.teams.member.title' },
        { text: '§d§f' },
    ]});

    const players = world.getAllPlayers();
    const online = players.find(p => p.id === member.id);

    memberMenu.body({ rawtext: [
        { text: '§p' },
        { translate: 'scroll.teams.member.username' },
        { text: `: §7${member.name}\n§p` },
        { translate: 'scroll.teams.member.online_status' },
        { text: ': §7' },
        online ? { translate: 'scroll.teams.member.online' } : { translate: 'scroll.teams.member.offline' },
        { text: '\n\n' },
        (owner ? { translate: 'scroll.teams.member.description' } : { text: '' })
    ]});

    memberMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) memberMenu.button('');

    if (owner) {
        memberMenu.button({ translate: 'scroll.teams.member.kick' }, 'textures/ui/avatar/delete');
        memberMenu.button({ translate: 'scroll.teams.member.promote' }, 'textures/ui/avatar/mobile');
    }

    memberMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) return teamMembersMenu(player, team);
        if (selection === 6) {
            if (team.ownerId === member.id) return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.member.kick.owner" }]});

            if (online) {
                const onlinePlayer = players.find(p => p.id === member.id);
                onlinePlayer.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.member.kick.kicked", with: [team.name] }]});

                PLAYER_DATA_MAP[member.id].teamId = undefined;   
            }

            team.members = team.members.filter(m => m.id !== member.id);
            team.memberCount--;
            world.setDynamicProperty(`team_${player.id}`, JSON.stringify(team));
            player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.member.kick.success", with: [member.name] }]});
        }

        if (selection === 7) {
            if (team.ownerId === member.id) return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.member.promote.owner" }]});

            team.ownerId = member.id;
            team.ownerName = member.name;
            world.setDynamicProperty(`team_${member.id}`, JSON.stringify(team));
            world.setDynamicProperty(`team_${player.id}`, undefined);
            player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.member.promote.success", with: [member.name] }]});
        }
    });
}

const teamMembersMenu = (player, team) => {
    if (!team) return teamsMenu(player);
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    // Refresh the team data
    team = JSON.parse(world.getDynamicProperty(`team_${team.ownerId}`));

    const membersMenu = new ActionFormData();
    membersMenu.title({ rawtext: [
        { translate: 'scroll.teams.members.title' },
        { text: '§d§f' },
    ]});

    membersMenu.body({ translate: 'scroll.teams.members.description' });

    membersMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) membersMenu.button('');

    const members = team.members;
    for (const member of members) {
        membersMenu.button(member.name);
    }

    membersMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teamOwnerMenu(player, team);

        const selectedMember = members[selection - 6];
        if (!selectedMember) return teamMembersMenu(player, team);

        viewMemberMenu(player, team, selectedMember, team.ownerId === player.id);
    });
};

const sendInviteMenu = (player, team, start = 0) => {
    const MAX_MEMBERS = 16;

    if (!team) return teamsMenu(player);
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const playerSelectMenu = new ActionFormData();

    playerSelectMenu.title({ rawtext: [{ text: '§d§f' }, { translate: 'scroll.teams.invite_player.title' }]});
    playerSelectMenu.body({ translate: 'scroll.teams.invite_player.description' });

    playerSelectMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) playerSelectMenu.button('');

    const players = world.getAllPlayers();
    if (start > players.length) start = 0;

    for (let i = 0; i < 10; i++) {
        const player = players[i + start];
        if (!player) break;
        playerSelectMenu.button(player.name);
    }

    if (players.length > 10) playerSelectMenu.button({ translate: 'standard.buttons.next' });
    if (start > 0) playerSelectMenu.button({ translate: 'standard.buttons.back' });

    playerSelectMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teamInviteMenu(player, team);
       
        const removeFrom = (players.length - start - 10) < 0 ? players.length - start - 10 : 0;
        if (selection === 16 + removeFrom) return sendInviteMenu(player, team, start + 10);
        if (selection === 17 + removeFrom) return sendInviteMenu(player, team, start - 10);

        const selectedPlayer = players[selection - 6];
        if (!selectedPlayer) return sendInviteMenu(player);

        // Are they already in the team?
        for (const member of team.members) {
            if (member.id === selectedPlayer.id) {
                player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.invite.already" }]});
                return sendInviteMenu(player, team);
            }
        }

        // Are they already invited?
        for (const invite of team.invites) {
            if (invite.id === selectedPlayer.id) {
                player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.invite.already_invited" }]});
                return sendInviteMenu(player, team);
            }
        }

        // Do we already have too many members?
        if (team.memberCount >= MAX_MEMBERS) {
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.invite.full" }]});
            return sendInviteMenu(player, team);
        }

        team.invites.push({ id: selectedPlayer.id, name: selectedPlayer.name });
        world.setDynamicProperty(`team_${player.id}`, JSON.stringify(team));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.invite.success", with: [selectedPlayer.name] }]});
        selectedPlayer.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.invite.sent", with: [team.name] }]});
    });
}

const removeInvitesMenu = (player, team, start = 0) => {
    if (!team) return teamsMenu(player);
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    const playerSelectMenu = new ActionFormData();

    playerSelectMenu.title({ rawtext: [{ text: '§d§f' }, { translate: 'scroll.teams.remove_invites.title' }]});
    playerSelectMenu.body({ translate: 'scroll.teams.remove_invites.description' });

    playerSelectMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) playerSelectMenu.button('');

    const invites = team.invites;
    if (start > invites.length) start = 0;

    for (let i = 0; i < 10; i++) {
        const invite = invites[i + start];
        if (!invite) break;
        playerSelectMenu.button(invite.name);
    }

    if (invites.length > 10) playerSelectMenu.button({ translate: 'standard.buttons.next' });
    if (start > 0) playerSelectMenu.button({ translate: 'standard.buttons.back' });

    playerSelectMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teamInviteMenu(player, team);
       
        const removeFrom = (invites.length - start - 10) < 0 ? invites.length - start - 10 : 0;
        if (selection === 16 + removeFrom) return removeInvitesMenu(player, team, start + 10);
        if (selection === 17 + removeFrom) return removeInvitesMenu(player, team, start - 10);

        const selectedInvite = invites[selection - 6];
        if (!selectedInvite) return removeInvitesMenu(player);

        team.invites = invites.filter(invite => invite.id !== selectedInvite.id);
        world.setDynamicProperty(`team_${player.id}`, JSON.stringify(team));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.remove_invites.success", with: [selectedInvite.name] }]});
    });
}

const teamInviteMenu = (player, team) => {
    if (!team) return teamsMenu(player);
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const invitesMenu = new ActionFormData();
    invitesMenu.title({ rawtext: [
        { translate: 'scroll.teams.invites.title' },
        { text: '§d§f' },
    ]});

    // Refresh the team data
    team = JSON.parse(world.getDynamicProperty(`team_${team.ownerId}`));

    invitesMenu.body({ translate: 'scroll.teams.invites.description' });

    invitesMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) invitesMenu.button('');

    invitesMenu.button({ translate: 'scroll.teams.invites.invite_players' }, 'textures/ui/avatar/whitelist_add');
    invitesMenu.button({ translate: 'scroll.teams.invites.delete_invites' }, 'textures/ui/avatar/whitelist_remove');

    invitesMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) return teamOwnerMenu(player, team);
        if (selection === 6) return sendInviteMenu(player, team);
        if (selection === 7) return removeInvitesMenu(player, team);

        PLAYER_DATA.inMenu = false;
    });
};

const sendTeleportRequestMenu = (player, team) => {
    if (!team) return teamsMenu(player);
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const playerSelectMenu = new ActionFormData();
    playerSelectMenu.title({ rawtext: [{ text: '§d§f' }, { translate: 'scroll.teams.send_request.title' }]});

    playerSelectMenu.body({ translate: 'scroll.teams.send_request.description' });

    playerSelectMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) playerSelectMenu.button('');

    const teamMembers = []
    const players = world.getAllPlayers();
    for (const member of team.members) {
        const memberPlayer = players.find(p => p.id === member.id);
        if (memberPlayer) {
            playerSelectMenu.button(memberPlayer.name);
            teamMembers.push(memberPlayer);
        }
    }

    playerSelectMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teleportsMenu(player, team);

        const selectedPlayer = teamMembers[selection - 6];
        if (!selectedPlayer) return sendTeleportRequestMenu(player, team);

        if (selectedPlayer.id === player.id) return player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.send_request.self" }]});
        
        selectedPlayer.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.send_request.received", with: [player.name] }]});
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.send_request.sent", with: [selectedPlayer.name] }]});

        const TARGET_DATA = PLAYER_DATA_MAP[selectedPlayer.id];
        TARGET_DATA.teleportRequests.push({
            teamId: team.ownerId,
            senderId: player.id,
            senderName: player.name,
            timestamp: Date.now()
        });
    });
};

const acceptTeleportRequestMenu = (player, team) => {
    if (!team) return teamsMenu(player);
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const playerSelectMenu = new ActionFormData();
    playerSelectMenu.title({ rawtext: [{ text: '§d§f' }, { translate: 'scroll.teams.accept_request.title' }]});

    playerSelectMenu.body({ translate: 'scroll.teams.accept_request.description' });

    playerSelectMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) playerSelectMenu.button('');

    const teleportRequests = PLAYER_DATA.teleportRequests;
    for (const request of teleportRequests) {
        if (request.timestamp + 60000 < Date.now()) {
            PLAYER_DATA.teleportRequests = teleportRequests.filter(r => r !== request);
            continue;
        }

        const sender = world.getAllPlayers().find(p => p.id === request.senderId);
        if (sender) playerSelectMenu.button(sender.name);
    }

    playerSelectMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teleportsMenu(player, team);

        const selectedRequest = teleportRequests[selection - 6];
        if (!selectedRequest) return acceptTeleportRequestMenu(player, team);

        const sender = world.getAllPlayers().find(p => p.id === selectedRequest.senderId);
        if (!sender) return acceptTeleportRequestMenu(player, team);

        sender.teleport(player.location, { dimension: player.dimension });
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.accept_request.success", with: [sender.name] }]});
        sender.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.accept_request.success.player", with: [player.name] }]});

        PLAYER_DATA.teleportRequests = teleportRequests.filter(r => r !== selectedRequest);
    });
};

const teleportsMenu = (player, team) => {
    if (!team) return teamsMenu(player);

    if (!team.settings.teleports) {
        player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.teleports.disabled" }]});
        return teamOwnerMenu(player, team);
    }

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const teleportsMenu = new ActionFormData();
    teleportsMenu.title({ rawtext: [
        { translate: 'scroll.teams.teleports.title' },
        { text: '§d§f' },
    ]});

    // Refresh the team data
    team = JSON.parse(world.getDynamicProperty(`team_${team.ownerId}`));

    teleportsMenu.body({ translate: 'scroll.teams.teleports.description' });

    teleportsMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) teleportsMenu.button('');

    teleportsMenu.button({ translate: 'scroll.teams.teleports.send_request' }, 'textures/ui/avatar/whitelist_add');
    teleportsMenu.button({ translate: 'scroll.teams.teleports.accept_requests' }, 'textures/ui/avatar/whitelist_add');

    teleportsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0) return teamOwnerMenu(player, team);
        if (selection === 6) return sendTeleportRequestMenu(player, team);
        if (selection === 7) return acceptTeleportRequestMenu(player, team);

        PLAYER_DATA.inMenu = false;
    });
};

const teamSettingsMenu = (player, team) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const teamSettingsMenu = {
		title: { translate: `scroll.settings.teams.title` },
		type: "modal",
		content: []
	};

    const teamSettings = team.settings;
    for (const setting in teamSettings) {
        const settingData = settingsMap[setting];

        teamSettingsMenu.content.push({
            title: settingData.title,
            type: settingData.type,
            data: {
                condition: teamSettings[setting]
            },
            update(state) {
                const prevSetting = teamSettings[setting];

                teamSettings[setting] = state;
                world.setDynamicProperty(`team_${player.id}`, JSON.stringify(team));

                if (prevSetting !== state && PLAYER_DATA.settings.showStatusMessages) {
                    player.sendMessage({rawtext: [{ text: '§7' }, { translate: settingData.changed, with: { rawtext: [{ translate: state ? "scroll.settings.quick.enabled" : "scroll.settings.quick.disabled" }]}}]});
                }

                for (const member of team.members) {
                    if (PLAYER_DATA_MAP[member.id]) PLAYER_DATA_MAP[member.id].teamId = team.ownerId;
                }
            }
        });
    }

    parseMenu(player, teamSettingsMenu, teamOwnerMenu);
};

const teamDisbandMenu = (player, team) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const disbandMenu = new ActionFormData();
    disbandMenu.title({ rawtext: [
        { translate: 'scroll.teams.disband.title' },
        { text: '§d§f' },
    ]});

    // Refresh the team data
    team = JSON.parse(world.getDynamicProperty(`team_${team.ownerId}`));

    disbandMenu.body({ rawtext: [
        { text: '§p' },
        { translate: 'skilltree.reforge.confirm' },
        { text: '\n§7' },
        { translate: 'scroll.teams.disband.description' }
    ]});

    disbandMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) disbandMenu.button('');

    disbandMenu.button({ translate: 'standard.buttons.confirm' });
    disbandMenu.button({ translate: 'standard.buttons.cancel' });

    disbandMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        if (selection === 0 || selection === 7) return teamOwnerMenu(player, team);
        if (selection === 6) {
            world.setDynamicProperty(`team_${team.ownerId}`, undefined);

            PLAYER_DATA.teamId = undefined;

            const allPlayers = world.getAllPlayers();
            for (const member of team.members) {
                const memberPlayer = allPlayers.find(p => p.id === member.id);
                if (memberPlayer) {
                    const MEMBER_DATA = PLAYER_DATA_MAP[member.id];
                    memberPlayer.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.disband.member" }]});

                    MEMBER_DATA.teamId = undefined;
                    MEMBER_DATA.teleportRequests = [];
                }
            }
        }

        PLAYER_DATA.inMenu = false;
    });
};

const publicTeamsMenu = (player) => {
    // The purpose of this menu is to show all public teams
    // IE: teams that have the public setting enabled, and are not full
    // The player can then select a team to join
    // And they will be added to the team's members list

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const publicTeamsMenu = new ActionFormData();
    publicTeamsMenu.title({ rawtext: [
        { translate: 'scroll.teams.public.title' },
        { text: '§d§f' },
    ]});

    publicTeamsMenu.body({ translate: 'scroll.teams.public.description' });

    publicTeamsMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) publicTeamsMenu.button('');

    const allIds = world.getDynamicPropertyIds();
    const allTeams = allIds.filter(id => id.startsWith("team_")).map(id => JSON.parse(world.getDynamicProperty(id)));
    const publicTeams = allTeams.filter(team => team.settings.public && team.memberCount < 16);

    for (const team of publicTeams) {
        publicTeamsMenu.button(team.name);
    }

    publicTeamsMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teamsMenu(player);

        const selectedTeam = publicTeams[selection - 6];
        if (!selectedTeam) return publicTeamsMenu(player);

        if (selectedTeam.memberCount >= 16) {
            player.sendMessage({rawtext: [{ text: '§c' }, { translate: "scroll.teams.invite.full" }]});
            return publicTeamsMenu(player);
        }

        selectedTeam.memberCount++;
        selectedTeam.members.push({ id: player.id, name: player.name });
        world.setDynamicProperty(`team_${selectedTeam.ownerId}`, JSON.stringify(selectedTeam));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.joined.success", with: [selectedTeam.name] }]});

        PLAYER_DATA.teamId = selectedTeam.ownerId;

        PLAYER_DATA.inMenu = false;

        return teamsMenu(player);
    });
}

const viewInvitesMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;

    const invitesMenu = new ActionFormData();
    invitesMenu.title({ rawtext: [
        { translate: 'scroll.teams.invites.title' },
        { text: '§d§f' },
    ]});

    invitesMenu.body({ translate: 'scroll.teams.invites.description' });

    invitesMenu.button({ translate: 'standard.buttons.back' }, 'textures/ui/avatar/back');
    for (let i = 0; i < 5; i++) invitesMenu.button('');

    const allIds = world.getDynamicPropertyIds();
    const allTeams = allIds.filter(id => id.startsWith("team_")).map(id => JSON.parse(world.getDynamicProperty(id)));
    const invites = allTeams.filter(team => team.invites.some(invite => invite.id === player.id));

    for (const team of invites) {
        invitesMenu.button(team.name);
    }

    invitesMenu.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;
        if (selection === 0) return teamsMenu(player);

        const selectedTeam = invites[selection - 6];
        if (!selectedTeam) return viewInvitesMenu(player);

        selectedTeam.invites = selectedTeam.invites.filter(invite => invite.id !== player.id);
        selectedTeam.memberCount++;
        selectedTeam.members.push({ id: player.id, name: player.name });
        world.setDynamicProperty(`team_${selectedTeam.ownerId}`, JSON.stringify(selectedTeam));
        player.sendMessage({rawtext: [{ text: '§7' }, { translate: "scroll.teams.joined.success", with: [selectedTeam.name] }]});

        PLAYER_DATA.teamId = selectedTeam.ownerId;

        PLAYER_DATA.inMenu = false;

        return teamsMenu(player);
    });
}

const noTeamMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = teamsMenu;

    const teamsMenuForm = new ActionFormData();
    teamsMenuForm.title({ rawtext: [
        { translate: 'scroll.teams.title' },
        { text: '§c§b' },
    ]});

    teamsMenuForm.body({ translate: 'scroll.teams.description.base' });

    teamsMenuForm.button('', 'textures/ui/avatar/avatar_logo');
    teamsMenuForm.button('', 'textures/ui/avatar/movesets');
    teamsMenuForm.button('', 'textures/ui/avatar/skill_tree');
    teamsMenuForm.button('', 'textures/ui/avatar/info');
    teamsMenuForm.button('§p', 'textures/ui/avatar/teams');
    teamsMenuForm.button('', 'textures/ui/settings_glyph_color_2x') ;

    teamsMenuForm.button({ translate: 'scroll.teams.create' }, 'textures/ui/avatar/create');
    teamsMenuForm.button({ translate: 'scroll.teams.join' }, 'textures/ui/avatar/passives');
    teamsMenuForm.button({ translate: 'scroll.teams.invites' }, 'textures/ui/avatar/credits');

    teamsMenuForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        const options = [createTeamMenu, publicTeamsMenu, viewInvitesMenu];
        if (options[selection - 6]) return options[selection - 6](player);

        PLAYER_DATA.inMenu = false;
    });
};

const teamMemberMenu = (player, team) => {
    // If they do have a team and this was an error, it'll just loop back here anyway
    if (!team) return teamsMenu(player);

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = teamsMenu;

    const teamsMenuForm = new ActionFormData();
    teamsMenuForm.title({ rawtext: [
        { translate: 'scroll.teams.title' },
        { text: '§c§b' }
    ]});

    teamsMenuForm.button('', 'textures/ui/avatar/avatar_logo');
    teamsMenuForm.button('', 'textures/ui/avatar/movesets');
    teamsMenuForm.button('', 'textures/ui/avatar/skill_tree');
    teamsMenuForm.button('', 'textures/ui/avatar/info');
    teamsMenuForm.button('§p', 'textures/ui/avatar/teams');
    teamsMenuForm.button('', 'textures/ui/settings_glyph_color_2x');

    teamsMenuForm.button({ translate: 'scroll.teams.my_team' }, 'textures/ui/avatar/teams');
    teamsMenuForm.button({ translate: 'scroll.teams.members' }, 'textures/ui/avatar/credits');
    teamsMenuForm.button({ translate: 'scroll.teams.teleport' }, 'textures/ui/avatar/teleport');

    teamsMenuForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        const options = [myTeamMenu, teamMembersMenu, teleportsMenu];
        if (options[selection - 6]) return options[selection - 6](player, team);

        PLAYER_DATA.inMenu = false;
    });
};

const teamOwnerMenu = (player, team) => {
    // If they do have a team and this was an error, it'll just loop back here anyway
    if (!team) return teamsMenu(player);

    // If they are not the owner, they should not be here
    if (team.ownerId !== player.id) return teamMemberMenu(player, team);

    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = teamsMenu;

    const teamsMenuForm = new ActionFormData();
    teamsMenuForm.title({ rawtext: [
        { translate: 'scroll.teams.title' },
        { text: '§c§b' },
    ]});

    teamsMenuForm.body({ translate: 'scroll.teams.description.base' });

    teamsMenuForm.button('', 'textures/ui/avatar/avatar_logo');
    teamsMenuForm.button('', 'textures/ui/avatar/movesets');
    teamsMenuForm.button('', 'textures/ui/avatar/skill_tree');
    teamsMenuForm.button('', 'textures/ui/avatar/info');
    teamsMenuForm.button('§p', 'textures/ui/avatar/teams');
    teamsMenuForm.button('', 'textures/ui/settings_glyph_color_2x');

    teamsMenuForm.button({ translate: 'scroll.teams.my_team' }, 'textures/ui/avatar/teams');
    teamsMenuForm.button({ translate: 'scroll.teams.members' }, 'textures/ui/avatar/credits');
    teamsMenuForm.button({ translate: 'scroll.teams.invite' }, 'textures/ui/avatar/passives');
    teamsMenuForm.button({ translate: 'scroll.teams.teleport' }, 'textures/ui/avatar/teleport');
    teamsMenuForm.button({ translate: 'scroll.teams.settings' }, 'textures/ui/settings_glyph_color_2x');
    teamsMenuForm.button({ translate: 'scroll.teams.disband' }, 'textures/ui/avatar/delete');

    teamsMenuForm.show(player).then((data) => {
        const { selection } = data;
        if (selection === undefined) return PLAYER_DATA.inMenu = false;

        const menuActions = [chooseBendingMenu, chooseSlotsMenu, showSkillTreeMenu, statsInfoMenu, teamsMenu, chooseSettingsMenu];
        if (menuActions[selection]) return menuActions[selection](player);

        const options = [myTeamMenu, teamMembersMenu, teamInviteMenu, teleportsMenu, teamSettingsMenu, teamDisbandMenu];
        if (options[selection - 6]) return options[selection - 6](player, team);

        PLAYER_DATA.inMenu = false;
    });
};

export const teamsMenu = (player) => {
    const PLAYER_DATA = PLAYER_DATA_MAP[player.id];
    PLAYER_DATA.inMenu = true;
    PLAYER_DATA.lastMenu = teamsMenu;

    let playerIsTeamOwner = false;
    let playerIsTeamMember = false;
    let playerTeam = null;
    const allIds = world.getDynamicPropertyIds();
    const allTeams = allIds.filter(id => id.startsWith("team_")).map(id => JSON.parse(world.getDynamicProperty(id)));

    for (const team of allTeams) {
        if (team.ownerId === player.id) {
            playerIsTeamOwner = true;
            playerTeam = team;
            break;
        }

        for (const member of team.members) {
            if (member.id === player.id) {
                playerIsTeamMember = true;
                playerTeam = team;
                break;
            }
        }
    }

    if (!playerIsTeamOwner && !playerIsTeamMember) {
        return noTeamMenu(player);
    }

    if (playerIsTeamOwner) {
        return teamOwnerMenu(player, playerTeam);
    }

    if (playerIsTeamMember) {
        return teamMemberMenu(player, playerTeam);
    }
};