import { world } from "@minecraft/server";
import { playerRuntime } from "./player/runtime.js";

import { calculateDistance, magnitude } from "../utils.js";

import { ALL_PROJECTILES } from "../index.js";

export const runtime = () => {
    for (const player of world.getPlayers()) {
        try {
            playerRuntime(player);
        } catch (error) {};
        //playerRuntime(player);
    };
    
    // Find out if the projectiles are close to each other
    for (const projectile of Object.values(ALL_PROJECTILES)) {
        if (projectile.watchForIds.length === 0) continue;
        for (const watchForID of projectile.watchForIds) {
            const watchForProjectile = ALL_PROJECTILES[watchForID];
            if (watchForProjectile === undefined) continue;

            if (calculateDistance(projectile.loc, watchForProjectile.loc) < 2) {
                projectile.collision = true;
                watchForProjectile.collision = true;

                // So we can 'simulate' complex interactions (water + fire = steam), we trade the projectile types
                const projectileType = projectile.type;
                projectile.type = watchForProjectile.type
                watchForProjectile.type = projectileType;
            };
        };
    };
};