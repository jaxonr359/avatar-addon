import Dash from './moves/Dash.js';
import Rewind from './moves/Rewind.js';
import Boomerang from './moves/Boomerang.js';
import Truesight from './moves/Truesight.js';

import { nonbenderRuntime } from './runtimes/main.js';
import { skillTree } from './trees/main.js';

export const nonbender = {
    // Visual stuff
    name: { translate: 'elements.nonbender.short' },
    short: { translate: 'elements.nonbender.short' },
    description: { translate: 'elements.nonbender.description' },
    breakdown: { translate: 'elements.nonbender.breakdown' },

    color: '§7',
    icon: 'textures/ui/avatar/nonbender.png',

    chiCode: 'nb',
    chiCodeOverflow: 'ng',

    // Gameplay stuff
    type: 'nonbender',
    moves: [
        Dash,
        Rewind,
        Boomerang,
        Truesight,
    ],
    skillTree: skillTree,
    runtime: nonbenderRuntime,
};