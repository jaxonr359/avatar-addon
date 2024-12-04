import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, delayedFunc, calculateDistance, applyBendingDamage } from "../../../../utils.js";

const getBlock = (player, location, searchHeight = 4, iter = 0) => {
    if (iter >= 8) return;

    // Find the highest block at the given x and z coordinates
    const below = player.dimension.getTopmostBlock({ x: location.x, z: location.z }, location.y + searchHeight);
    if (!below) return;

    // Now, we actually want to target the block above the highest block
    const block = below.above();
    if (block.y < location.y - 5) return;
    if (!block || !block.isAir) return getBlock(player, location, searchHeight - 2, iter + 1);

    return { x: block.x, y: block.y, z: block.z };
}

const preFireRuntime = (player) => {
    const loc1 = getBlock(player, calcVectorOffset(player, 0, 0, 5));
    if (!loc1) return [null, null, null, null, null];

    const loc2 = getBlock(player, { x: loc1.x, y: loc1.y, z: loc1.z + 1 });
    const loc3 = getBlock(player, { x: loc1.x, y: loc1.y, z: loc1.z - 1 });
    const loc4 = getBlock(player, { x: loc1.x + 1, y: loc1.y, z: loc1.z });
    const loc5 = getBlock(player, { x: loc1.x - 1, y: loc1.y, z: loc1.z });

    const locs = [loc1, loc2, loc3, loc4, loc5];
    for (const loc of locs) {
        if (!loc) continue;
        player.spawnParticle("a:highlight", { x: loc.x + 0.5, y: loc.y + 0.03, z: loc.z + 0.5 });
    }

    return locs;
}

const postFireRuntime = (player, locs, timer, dimension) => {
    const center = locs[0];
    if (!center) return;

    const entities = [...dimension.getEntities({ location: center, maxDistance: 4, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
    for (const entity of entities) {
        try {
            entity.applyKnockback(0, 0, 0, 2.3);
            
            delayedFunc(player, () => {
                applyBendingDamage(player, entity, 10, 0);
            }, 2);
        } catch (error) {
            try {
                entity.applyImpulse({ x: 0, y: 0.5, z: 0 });
            } catch (error) {}
        }
    }
    
    const factor = Math.floor(timer/1);
    
    for (const loc of locs) {
        if (!loc) continue;
        if (loc != center && factor > 1) continue;

        const typeId = "minecraft:packed_ice";
        const block = dimension.getBlock(loc).above(factor);
        if (!block || !block.isAir) continue;

        block.setType(typeId);

        delayedFunc(player, () => {
            if (!block.isAir && (block.typeId === typeId)) block.setType("minecraft:air");
        }, 80 - factor * 4);
    }
}

const move = {
    name: { translate: 'elements.water.moves.icebigspike.name' },
    description: { translate: 'elements.water.moves.icebigspike.description' },

    cost: 35,
    cooldown: 10,
    type: 'standard',

    id: 64,

    damage: {
        base: 10,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        if (PLAYER_DATA.waterLoaded < 1) return player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_water' }]);
        PLAYER_DATA.waterLoaded -= 1;

        const statusMessages = PLAYER_DATA.settings.showStatusMessages;
        if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.activate_sneak' }]);

        let timer = 0;
        let state = 0; // 0 = pre, 1 = post
        let locs = [];
        let currentTick = 0;
        const dimension = PLAYER_DATA.dimension;
        const sched_ID = system.runInterval(function tick() {
            // In case of errors
            currentTick++;
            if (currentTick > 180 || timer > 4) {
                return system.clearRun(sched_ID);
            }

            if (state === 0) locs = preFireRuntime(player);
            if (currentTick < 10) return PLAYER_DATA.doubleSneakTimer = 0;

            PLAYER_DATA.cooldown = 20;
            if ((PLAYER_DATA.doubleSneakTimer > 0 || currentTick > 100) && state === 0) {
                state = 1;
                timer = 0;

                player.playAnimation("animation.earth.landing");

                // Return if every item in the array is null
                const length = locs.filter(loc => loc).length;
                if (length === 0) {
                    if (statusMessages) player.sendMessage([{ text: '§7' }, { translate: 'elements.water.message.no_blocks' }]);
                    return system.clearRun(sched_ID);
                }

                PLAYER_DATA.dimension.playSound("avatar.earth_big_spike", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.5 });

                player.runCommand(`camerashake add @a[r=12] 0.2 0.6 positional`);

                delayedFunc(player, () => {
                    player.runCommand(`camerashake add @a[r=12] 0.1 0.5 positional`);
                    PLAYER_DATA.dimension.playSound("avatar.earth_raise", player.location, { volume: 0.2, pitch: 1 + Math.random() * 0.1 });
                }, 68);
            }

            if (state === 1) {
                if (!locs || locs.length === 0 || !locs[0]) return system.clearRun(sched_ID);
                if (locs[0] && calculateDistance(player.location, locs[0]) < 1.9) {
                    player.applyKnockback(0, 0, 0, 2.4);
                    player.addEffect("slow_falling", 160, { showParticles: false });

                    let currentTick = 0;
                    const sched_ID = system.runInterval(function tick() {
                        currentTick++;
                        if (currentTick > 15) return system.clearRun(sched_ID);
                    }, 1);
                }

                postFireRuntime(player, locs, timer, dimension);
                timer++;
            }
        });
    }
}

export default move;