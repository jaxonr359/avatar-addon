import EarthHurl from './moves/EarthHurl.js';
import EarthShockwave from './moves/EarthShockwave.js';
import EarthWall from './moves/EarthWall.js';
import EarthShield from './moves/EarthShield.js';
import EarthTop from './moves/EarthTop.js';
import EarthBigSpike from './moves/EarthBigSpike.js';
import EarthPillar from './moves/EarthPillar.js';
import EarthSearch from './moves/EarthSearch.js';
import EarthRend from './moves/EarthRend.js';
import EarthSpikes from './moves/EarthSpikes.js';
import EarthSpikeLine from './moves/EarthSpikeLine.js';
import EarthHeadbutt from './moves/EarthHeadbutt.js';
import ButterBarrage from './moves/ButterBarrage.js';
import MetalHook from './moves/MetalHook.js';
import SeismicSense from './moves/SeismicSense.js';
import MagmaSurge from './moves/MagmaSurge.js';
import Earthquake from './moves/Earthquake.js';

import { earthRuntime } from './runtimes/main.js';
import { skillTree } from './trees/main.js';

export const earth = {
    // Visual stuff
    name: { translate: 'elements.earth.name' },
    short: { translate: 'elements.earth.short' },
    description: { translate: 'elements.earth.description' },
    breakdown: { translate: 'elements.earth.breakdown' },

    color: '§2',
    icon: 'textures/ui/avatar/earth.png',

    chiCode: 'et',
    chiCodeOverflow: 'eg',

    // Gameplay stuff
    type: 'earth',
    moves: [
        EarthHurl,
        EarthPillar,
        EarthWall,
        EarthSpikes,
        EarthTop,
        EarthSearch,
        EarthShield,
        EarthShockwave,
        EarthBigSpike,

        EarthRend, // Skill Tree
        EarthHeadbutt, // Skill Tree
        EarthSpikeLine, // Skill Tree

        MetalHook, // Skill Tree
        Earthquake, // Skill Tree
        ButterBarrage, // Skill Tree
        SeismicSense, // Skill Tree
        MagmaSurge, // Skill Tree
    ],

    runtime: earthRuntime,
    skillTree: skillTree,
};