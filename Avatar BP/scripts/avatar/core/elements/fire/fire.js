import FlameShot from './moves/FlameShot.js';
import FlameWave from './moves/FlameWave.js';
import FlashFire from './moves/FlashFire.js';
import FireLeap from './moves/FireLeap.js';
import FireBoosters from './moves/FireBoosters.js';
import FireCharge from './moves/FireCharge.js';
import FireSpread from './moves/FireSpread.js';
import FireJump from './moves/FireJump.js';
import Fireball from './moves/Fireball.js';
import ScorpionSting from './moves/ScorpionSting.js';
import BounceBlast from './moves/BounceBlast.js';
import DragonStrike from './moves/DragonStrike.js';
import DragonOfTheWest from './moves/DragonOfTheWest.js';
import DeathSlam from './moves/DeathSlam.js';
import FlameAura from './moves/FlameAura.js';
import LightningBurst from './moves/LightningBurst.js';
import LightningSweep from './moves/LightningSweep.js';
import Electroshock from './moves/Electroshock.js';
import Thunderclap from './moves/Thunderclap.js';

import CombustionBeam from './moves/CombustionBeam.js';

import { fireRuntime } from './runtimes/main.js';
import { skillTree } from './trees/main.js';

export const fire = {
    // Visual stuff
    name: { translate: 'elements.fire.name' },
    short: { translate: 'elements.fire.short' },
    description: { translate: 'elements.fire.description' },
    breakdown: { translate: 'elements.fire.breakdown' },

    color: '§6',
    icon: 'textures/ui/avatar/fire.png',

    chiCode: 'fr',
    chiCodeOverflow: 'fg',

    // Gameplay stuff
    type: 'fire',
    moves: [
        FlameShot,
        FireSpread,
        FlameWave,
        FlashFire,
        FireLeap,
        FireBoosters,
        FireCharge,
        FireJump,
        Fireball,
        ScorpionSting,
        BounceBlast,
        DragonStrike,
        DragonOfTheWest, // Skill Tree
        DeathSlam, // Skill Tree
        FlameAura, // Skill Tree
        CombustionBeam, // Skill Tree
        LightningBurst, // Skill Tree
        LightningSweep, // Skill Tree
        Electroshock, // Skill Tree
        Thunderclap // Skill Tree
    ],
    skillTree: skillTree,
    runtime: fireRuntime,
};