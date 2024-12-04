import { system, world } from "@minecraft/server";

import { scriptEvent } from "./core/events/scriptEvent.js";
import { playerBreakBlock } from "./core/events/playerBreakBlock.js";
import { itemUse } from "./core/events/itemUse.js";
import { itemCompleteUse } from "./core/events/itemCompleteUse.js";
import { entityHurt } from "./core/events/entityHurt.js";
import { playerDimensionChange } from "./core/events/playerDimensionChange.js";
import { entityHitEntity } from "./core/events/entityHitEntity.js";
import { itemStartUse } from "./core/events/itemStartUse.js";
import { itemReleaseUse } from "./core/events/itemReleaseUse.js";
import { entityHitBlock } from "./core/events/entityHitBlock.js";

import { runtime } from "./core/runtime.js";

export const ALL_PROJECTILES = {};
export const PLAYER_DATA_MAP = {};
export const WORLD_SETTINGS = {};

world.beforeEvents.playerBreakBlock.subscribe(v => playerBreakBlock(v));

system.afterEvents.scriptEventReceive.subscribe(v => scriptEvent(v));

world.afterEvents.itemUse.subscribe(v => itemUse(v));
world.afterEvents.itemCompleteUse.subscribe(v => itemCompleteUse(v));
world.afterEvents.entityHurt.subscribe(v => entityHurt(v));
world.afterEvents.playerDimensionChange.subscribe(v => playerDimensionChange(v));
world.afterEvents.entityHitEntity.subscribe(v => entityHitEntity(v));
world.afterEvents.itemStartUse.subscribe(v => itemStartUse(v));
world.afterEvents.itemReleaseUse.subscribe(v => itemReleaseUse(v));
world.afterEvents.itemStopUse.subscribe(v => itemReleaseUse(v));
world.afterEvents.entityHitBlock.subscribe(v => entityHitBlock(v));

system.run(function runnable() { 
    system.run(runnable);
    runtime();
});