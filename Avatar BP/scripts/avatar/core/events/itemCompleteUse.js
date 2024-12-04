import { Player, ItemStack } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "../../index.js";

export function itemCompleteUse(eventData) {
    const { itemStack, source } = eventData;
	
	// Checks if the user of the item is a player, which apparently needs to be done lol
    if (!(source instanceof Player)) return;

    const PLAYER_DATA = PLAYER_DATA_MAP[source.id];

    PLAYER_DATA.holdingBow = false;

    const emptyCup = new ItemStack("a:empty_cup");
    if (itemStack.typeId.includes("tea")) source.getComponent('inventory').container.setItem(source.selectedSlotIndex, emptyCup);
    switch (itemStack.typeId) {
        case "a:water_cup":
            source.getComponent('inventory').container.setItem(source.selectedSlotIndex, emptyCup);
            break;
        case "a:jasmine_tea":
            source.addEffect("regeneration", 300, { amplifier: 3, showParticles: false });
            break;
        case "a:spirit_tea":
        case "a:nomad_tea":
            source.addEffect("slow_falling", 700, { amplifier: 1, showParticles: false });
            source.addEffect("jump_boost", 500, { amplifier: 3, showParticles: false });
            source.addEffect("speed", 500, { amplifier: 2, showParticles: false });
            break;
        case "a:ginger_tea":
        case "a:ginseng_tea":
        case "a:oolong_tea":
            source.addEffect("absorption", 6000, { amplifier: 2, showParticles: false });
            break;
        case "a:chi_tea":
            PLAYER_DATA.chi = Math.min(PLAYER_DATA.chi + 50, 100);
            source.removeEffect("slowness");
            source.removeEffect("weakness");
            PLAYER_DATA.dimension.spawnParticle("a:chi_tea", source.location);
            break;
        case "a:red_blooded_nephew_tea":
            if (Math.random() > 0.5) {
                source.addEffect("strength", 220, { amplifier: 2, showParticles: false });
            } else {
                source.addEffect("weakness", 320, { amplifier: 5, showParticles: false });
            }
            break;
        case "a:white_jade_tea":
            source.addEffect("fatal_poison", 640, { amplifier: 1, showParticles: false });
            break;
        case "a:white_dragon_tea":
            source.removeEffect("fatal_poison");
            source.addEffect("regeneration", 5000, { amplifier: 1, showParticles: false });
            source.addEffect("absorption", 5000, { amplifier: 1, showParticles: false });
            break;
    }
}