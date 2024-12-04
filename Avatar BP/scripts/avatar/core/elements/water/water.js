import Torrent from './moves/Torrent.js';
import IceBigSpike from './moves/IceBigSpike.js';
import TidalSlice from './moves/TidalSlice.js';
import Geyser from './moves/Geyser.js';
import Gush from './moves/Gush.js';
import Jetstream from './moves/Jetstream.js';
import FrostWalker from './moves/FrostWalker.js';
import IceThrow from './moves/IceThrow.js';
import IceSpikes from './moves/IceSpikes.js';
import IceSpikeLine from './moves/IceSpikeLine.js';
import Splash from './moves/Splash.js';
import FrostBreath from './moves/FrostBreath.js';
import VineHook from './moves/VineHook.js';
import VineGrapple from './moves/VineGrapple.js';
import Hydroshock from './moves/Hydroshock.js';
import FocusHeal from './moves/FocusHeal.js';
import HealingCloud from './moves/HealingCloud.js';
import BloodBending from './moves/BloodBending.js';

import { waterRuntime } from './runtimes/main.js';
import { skillTree } from './trees/main.js';

export const water = {
    // Visual stuff
    name: { translate: 'elements.water.name' },
    short: { translate: 'elements.water.short' },
    description: { translate: 'elements.water.description' },
    breakdown: { translate: 'elements.water.breakdown' },

    color: '§3',
    icon: 'textures/ui/avatar/water.png',

    chiCode: 'wt',
    chiCodeOverflow: 'wg',

    // Gameplay stuff
    type: 'water',
    moves: [
        Torrent,
        IceBigSpike,
        TidalSlice,
        Geyser,
        Gush,
        Jetstream,
        FrostWalker,
        IceThrow,
        IceSpikes,
        IceSpikeLine,
        Splash,

        FrostBreath, // Skill Tree
        VineHook, // Skill Tree
        VineGrapple, // Skill Tree
        Hydroshock, // Skill Tree
        FocusHeal, // Skill Tree
        HealingCloud, // Skill Tree
        BloodBending // Skill Tree
    ],
    runtime: waterRuntime,
    skillTree: skillTree
};