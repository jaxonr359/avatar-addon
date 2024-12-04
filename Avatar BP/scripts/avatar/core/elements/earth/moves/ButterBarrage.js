import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, createShockwave } from "../../../../utils.js";

const move = {
    name: { translate: 'elements.earth.moves.butterbarrage.name' },
    description: { translate: 'elements.earth.moves.butterbarrage.description' },

    cost: 50,
    cooldown: 30,
    type: 'standard',

    id: 16,

    damage: {
        base: 4,
        multiplied: 4
    },

    skill_required: 'butter_barrage',

    activate(player, PLAYER_DATA) {
        player.playAnimation("animation.earth.pull");
        PLAYER_DATA.leftClick = false;

        const initDir = PLAYER_DATA.viewDir;
        const viewDir = { x: initDir.x, y: 0, z: initDir.z };
        
        const offsets = [
            { x: 0.9, y: 1.5, z: 1 },
            { x: 0.4, y: 1, z: 1.3 },
            { x: -0.4, y: 1, z: 1.3 },
            { x: -0.9, y: 1.5, z: 1 }
        ]

        // Our dirt blocks, but higher up so they don't flash into existence and then vanish again before the invisibility effect is applied
        const projectiles = [...Array(4)].map((_, i) => {
            return PLAYER_DATA.dimension.spawnEntity('a:dirt_block_small', calcVectorOffset(player, offsets[i].x, offsets[i].y + 10, offsets[i].z, viewDir));
        });

        // Used for tracking stuff like "has been launched"
        const projectileAuxData = [
            {
                launched: false,
                direction: { x: 0, y: 0, z: 0 },
                skip: false
            },
            {
                launched: false,
                direction: { x: 0, y: 0, z: 0 },
                skip: false
            },
            {
                launched: false,
                direction: { x: 0, y: 0, z: 0 },
                skip: false
            },
            {
                launched: false,
                direction: { x: 0, y: 0, z: 0 },
                skip: false
            }
        ];

        for (const projectile of projectiles) projectile.addEffect("invisibility", 100, { showParticles: false });

        if (PLAYER_DATA.settings.showStatusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.earth.message.activate_punch' }]);

        PLAYER_DATA.dimension.playSound("avatar.rock_collect", player.location, { volume: 0.1, pitch: 1 + Math.random() * 0.5 });

        let currentTick = 0;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 180) {
                return system.clearRun(sched_ID);
            }

            PLAYER_DATA.cooldown = 10;

            const viewDir = PLAYER_DATA.viewDir;
            const travelDir = { x: viewDir.x, y: 0, z: viewDir.z };

            // Teleport each dirt block to their respective locations
            for (const i in projectiles) {
                const projectile = projectiles[i];

                if (projectileAuxData[i].skip || !projectile || !projectile.isValid()) {
                    if (projectileAuxData[i].skip) continue;
                    projectileAuxData[i].skip = true;
                    
                    const loc = projectileAuxData[i].location;
                    if (loc) PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
                    createShockwave(player, loc, (4 + PLAYER_DATA.levelFactor * 4), 6, 2);

                    continue;
                }

                if (projectileAuxData[i].launched) {
                    const direction = projectileAuxData[i].direction;
                    const loc = calcVectorOffset(projectile, 0, 0, 2, direction, projectile.location);
                    projectile.teleport(loc);

                    projectileAuxData[i].location = loc;

                    const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, viewDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 2.2 });
                    const entities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 2, excludeNames: [player.name], excludeTypes: ["item", "a:dirt_block_small"], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] })];
    
                    PLAYER_DATA.dimension.spawnParticle("a:earth_small_trail", loc);

                    if (entities.length > 0 || rayCast) {
                        projectile.triggerEvent("minecraft:instant_despawn");
    
                        PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
                        createShockwave(player, loc, (4 + PLAYER_DATA.levelFactor * 4), 3, 2);
                    };
                } else {
                    const offset = offsets[i];
                    const loc = calcVectorOffset(player, offset.x, offset.y, offset.z, travelDir);
                    projectile.teleport(loc);
                }
            }

            if (currentTick > 0 && currentTick < 5) {
                for (const projectile of projectiles) {
                    projectile.removeEffect("invisibility");
                    projectile.playAnimation("animation.earth.grow", { blendOutTime: 1 });
                }
            }

            if ((PLAYER_DATA.leftClick && currentTick > 5) || currentTick > 70) {
                currentTick = Math.min(currentTick, 30);
                PLAYER_DATA.leftClick = false;
                
                // Launch the dirt blocks, in order, for each click
                // Use the aux data to track which dirt block we're launching, and which ones have already been launched
                for (let i = 0; i < 4; i++) {
                    const auxData = projectileAuxData[i];
                    if (!auxData.launched) {
                        auxData.launched = true;

                        PLAYER_DATA.dimension.playSound("avatar.rock_punch", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.7 });

                        // Direction show be the view direction, but with a slight offset towards the center since the dirt blocks are slightly offset
                        auxData.direction = { x: viewDir.x, y: 0, z: viewDir.z };
                        auxData.direction = { x: auxData.direction.x * 0.7, y: viewDir.y * 0.8, z: auxData.direction.z * 0.7 };

                        break;
                    }
                }
            }

            // If all dirt blocks has been destroyed, end the runtime
            if (projectileAuxData.every(data => data.skip)) {
                return system.clearRun(sched_ID);
            }
        });
    }
}

export default move;