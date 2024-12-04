import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage } from "../../../../utils.js";

const map = new MolangVariableMap();

const move = {
    name: { translate: 'elements.air.moves.puff.name' },
    description: { translate: 'elements.air.moves.puff.description' },

    cost: 4,
    cooldown: 10,
    type: 'duration',

    skill_required: 'air_puff',

    id: 12,

    damage: {
        base: 0,
        multiplied: 0
    },

    start(player, PLAYER_DATA) {
        PLAYER_DATA.dimension.playSound("avatar.air_rush", player.location, { volume: 0.1, pitch: 1 - Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        player.runCommand("stopsound @s avatar.air_rush");
        PLAYER_DATA.dimension.playSound("avatar.air_rush_end", player.location, { volume: 0.7, pitch: 0.8 });
    },
    activate(player, PLAYER_DATA) {
        player.addEffect("slow_falling", 120, { amplifier: 255, showParticles: false });

        const map2 = new MolangVariableMap();
        const headloc = player.getHeadLocation();
        const virdir = PLAYER_DATA.viewDir;
        map2.setVector3("variable.plane", virdir);
        const direction = (PLAYER_DATA.sneak && PLAYER_DATA.currentDurationMoveTimer > 4) ? -1 : 1;

        if (direction === -1) {
            map2.setVector3("variable.plane", { x: virdir.x * -1, y: virdir.y * -1, z: virdir.z * -1 });
            PLAYER_DATA.dimension.spawnParticle("a:blow", calcVectorOffset(player, 0, 0, 16, virdir, headloc), map2);
        } else {
            PLAYER_DATA.dimension.spawnParticle("a:blow", calcVectorOffset(player, 0, 0, 1, virdir, headloc), map2);
        }

        for (let i = 1; i < 22; i++) {
            const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: calcVectorOffset(player, 0, 0, i), maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] })];
            for (const entity of nearbyEntities) {
                try {
                    entity.applyKnockback(virdir.x, virdir.z, i/8 * direction, virdir.y/2 * direction);
                } catch (error) {
                    try {
                        entity.applyImpulse({ x: virdir.x * 0.05 * direction, y: virdir.y * 0.05 * direction, z: virdir.z * 0.05 * direction });
                    } catch (error) {}
                }
            }
        }
    }
}

export default move;