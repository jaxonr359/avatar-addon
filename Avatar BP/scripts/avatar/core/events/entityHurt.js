import { Player } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "../../index.js";
import { delayedFunc } from "../../utils.js";

const resetCauses = [
    "entityAttack",
    "entityExplosion",
    "projectile",
    "ramAttack",
    "blockExplosion"
]

export function entityHurt(eventData) {
    const { hurtEntity, damageSource, damage } = eventData;
    if (!(hurtEntity instanceof Player)) return;

    const health = hurtEntity.getComponent("health");
    const dealer = damageSource.damagingEntity;
    const cause = damageSource.cause;

    const HURT_PLAYER_DATA = PLAYER_DATA_MAP[hurtEntity.id];
    if (!HURT_PLAYER_DATA) return;

    if (resetCauses.includes(cause)) {
        HURT_PLAYER_DATA.combo = 0;
    }

    if (HURT_PLAYER_DATA.skills.includes("waterwash") && HURT_PLAYER_DATA.lastTakenDamage > Date.now() && HURT_PLAYER_DATA.waterLoaded > 0) {
        hurtEntity.removeEffect("resistance");
        HURT_PLAYER_DATA.lastTakenDamage = Date.now() + 10000;
        HURT_PLAYER_DATA.waterLoaded = 0;
    }

    if (HURT_PLAYER_DATA.skills.includes("fire_extinguisher") && (damageSource.cause === "fire" || damageSource.cause === "fireTick")) {
        hurtEntity.addEffect("fire_resistance", 100, { amplifier: 1, showParticles: false });
        
        hurtEntity.runCommand("fill ~5~5~5 ~-5~-5~-5 air replace fire");
        const nearbyEntities = HURT_PLAYER_DATA.dimension.getEntities({ location: hurtEntity.location, maxDistance: 6 });
        for (const entity of nearbyEntities) {
            entity.extinguishFire();
        }

        hurtEntity.dimension.spawnParticle(`a:water_wave`, hurtEntity.location);
    }
    

    if (health.currentValue > 0 || !health) return;

    const deathsCount = hurtEntity.getDynamicProperty("deaths") || 0;
    hurtEntity.setDynamicProperty("deaths", deathsCount + 1);

    delayedFunc(hurtEntity, () => {
        hurtEntity.inputPermissions.movementEnabled = true;
    }, 20);

    if (dealer instanceof Player) {
        const killsCount = dealer.getDynamicProperty("kills") || 0;
        dealer.setDynamicProperty("kills", killsCount + 1);
    }
}