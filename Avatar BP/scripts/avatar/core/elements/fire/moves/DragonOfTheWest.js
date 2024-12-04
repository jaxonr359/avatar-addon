import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage } from "../../../../utils.js";

const map2 = new MolangVariableMap();

const move = {
    name: { translate: 'elements.fire.moves.dragonofthewest.name' },
    description: { translate: 'elements.fire.moves.dragonofthewest.description' },

    cost: 4,
    cooldown: 10,
    type: 'duration',

    id: 36,

    damage: {
        base: 18,
        multiplied: 12
    },

    skill_required: 'dragon_of_the_west',

    start(player, PLAYER_DATA) {
        PLAYER_DATA.dimension.playSound("avatar.air_rush", player.location, { volume: 0.1, pitch: 1 - Math.random() * 0.2 });
    },
    end(player, PLAYER_DATA) {
        player.runCommand("stopsound @s avatar.air_rush");
        PLAYER_DATA.dimension.playSound("avatar.air_rush_end", player.location, { volume: 0.7, pitch: 0.8 });
    },
    activate(player, PLAYER_DATA) {
        player.addEffect("slow_falling", 120, { amplifier: 255, showParticles: false });

        const headloc = player.getHeadLocation();
        const virdir = PLAYER_DATA.viewDir;
        map2.setVector3("variable.plane", virdir);
        PLAYER_DATA.dimension.spawnParticle("a:dragonwest", calcVectorOffset(player, 0, 0, 1, virdir, headloc), map2);

        for (let i = 1; i < 22; i++) {
            const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: calcVectorOffset(player, 0, 0, i), maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTags: ["bending_dmg_off"] })];
            for (const entity of nearbyEntities) {
                applyBendingDamage(player, entity, 4, 0, false, true);
                try {
                    entity.applyKnockback(virdir.x, virdir.z, i/8, virdir.y/2);
                } catch (error) {
                    try {
                        entity.applyImpulse({ x: virdir.x * 0.05, y: virdir.y * 0.05, z: virdir.z * 0.05 });
                    } catch (error) {}
                }
            }
        }
    }
}

export default move;