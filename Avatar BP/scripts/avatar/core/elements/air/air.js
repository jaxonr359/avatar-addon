import AirBlast from './moves/AirBlast.js';
import AirLaunch from './moves/AirLaunch.js';
import AirRush from './moves/AirRush.js';
import AirBall from './moves/AirBall.js';
import AirLeap from './moves/AirLeap.js';
import AirShockwave from './moves/AirShockwave.js';
import AirSlam from './moves/AirSlam.js';
import AirScooter from './moves/AirScooter.js';
import WallShot from './moves/WallShot.js';
import AirSniper from './moves/AirSniper.js';
import Puff from './moves/Puff.js';
import AirTornado from './moves/Tornado.js';
import ScorpionStrike from './moves/ScorpionStrike.js';
import Artillery from './moves/Artillery.js';
import AirPull from './moves/AirPull.js';
import AirSpirit from './moves/AirSpirit.js';

import { airRuntime } from './runtimes/main.js';
import { skillTree } from './trees/main.js';

export const air = {
    // Visual stuff
    name: { translate: 'elements.air.name' },
    short: { translate: 'elements.air.short' },
    description: { translate: 'elements.air.description' },
    breakdown: { translate: 'elements.air.breakdown' },

    color: '§b',
    icon: 'textures/ui/avatar/air.png',

    chiCode: 'ar',
    chiCodeOverflow: 'ag',

    // Gameplay stuff
    type: 'air',
    moves: [
        AirBlast,
        AirLaunch,
        AirShockwave,
        AirLeap,
        AirPull,
        AirRush,
        AirSlam,
        AirTornado,
        AirScooter,
        Artillery,
        AirBall,
        AirSniper,

        WallShot, // Skill Tree
        Puff, // Skill Tree
        ScorpionStrike, // Skill Tree
        AirSpirit, // Skill Tree
    ],

    runtime: airRuntime,
    skillTree: skillTree,
};