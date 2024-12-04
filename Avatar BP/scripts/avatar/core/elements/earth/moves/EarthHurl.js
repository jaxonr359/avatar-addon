import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, createShockwave } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.earth.moves.earthhurl.name' },
    description: { translate: 'elements.earth.moves.earthhurl.description' },

    cost: 50,
    cooldown: 10,
    type: 'standard',

    id: 19,

    damage: {
        base: 4,
        multiplied: 24
    },

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.earth.pull");
        PLAYER_DATA.leftClick = false;
        const dirtBlock = PLAYER_DATA.dimension.spawnEntity('a:dirt_block', calcVectorOffset(player, 0, 0.3, 1));
        dirtBlock.addEffect("invisibility", 100, { showParticles: false });

        if (PLAYER_DATA.settings.showStatusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.activate_punch' }]);

        PLAYER_DATA.dimension.playSound("avatar.rock_collect", player.location, { volume: 0.1, pitch: 1 + Math.random() * 0.2 });

        let currentTick = 0;
        let launched = false;
        let animStarted = false;
        let viewDir;
        let lastLoc = player.location;
        let endRuntime = false;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 180) {
                dirtBlock.triggerEvent("minecraft:explode");
                return system.clearRun(sched_ID);
            }

            const valid = dirtBlock.isValid();

            if (valid && !animStarted) {
                delayedFunc(player, () => {
                    if (!dirtBlock.isValid()) return;
                    dirtBlock.removeEffect("invisibility");
                    player.runCommand("camerashake add @a[r=5] 0.4 0.6 positional");
                    dirtBlock.playAnimation("animation.earth.grow", { blendOutTime: 5 });
                }, 10);
                animStarted = true;
            }

            if (valid && !launched) {
                PLAYER_DATA.cooldown = 20;

                // Dirt block follow mode
                const followLoc = calcVectorOffset(player, 0, 1, 2);
                dirtBlock.teleport(followLoc, { facingLocation: player.location, dimension: PLAYER_DATA.dimension });
            }


            if (valid && launched) {
                lastLoc = dirtBlock.location;
            } else if (!valid) {
                PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", lastLoc);
                createShockwave(player, lastLoc, (6 + PLAYER_DATA.levelFactor * 20), 6, 2);
                PLAYER_DATA.cooldown = 20;
                return system.clearRun(sched_ID);
            }

            if (!launched && currentTick > 20 && (currentTick > 80 || PLAYER_DATA.leftClick)) {
                viewDir = PLAYER_DATA.viewDir;
                player.playAnimation("animation.earth.landing");

                launched = true;
                PLAYER_DATA.cooldown = 20;

                PLAYER_DATA.dimension.playSound("avatar.rock_punch", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 });
            }

            if (launched) {
                const loc = dirtBlock.location;

                dirtBlock.teleport(calcVectorOffset(dirtBlock, 0, 0, 2, viewDir), { dimension: PLAYER_DATA.dimension });
                dirtBlock.dimension.spawnParticle("a:earth_sprint", loc);

                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, viewDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                const entities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 1.5, excludeNames: [player.name], excludeTypes: ["item", "a:dirt_block"], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] })];

                if (entities.length > 0 || endRuntime) {
                    dirtBlock.triggerEvent("minecraft:instant_despawn");

                    PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
                    createShockwave(player, loc, (4 + PLAYER_DATA.levelFactor * 24), 6, 2);
                    return system.clearRun(sched_ID);
                };
            }
        });
    }
}

export default move;