import { skillTree } from './trees/main.js';

export const avatar = {
    // Visual stuff
    name: { translate: 'elements.avatar.short' },
    short: { translate: 'elements.avatar.short' },
    description: { translate: 'elements.avatar.description' },
    breakdown: { translate: 'elements.avatar.breakdown' },

    color: '§g',
    icon: 'textures/ui/avatar/avatar.png',

    chiCode: 'av',
    chiCodeOverflow: 'vg',

    // Gameplay stuff
    type: 'avatar',
    moves: [], // avatar has no moves
    skillTree: skillTree,
    runtime: () => {},
};