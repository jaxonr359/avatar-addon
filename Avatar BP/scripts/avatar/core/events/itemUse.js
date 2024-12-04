import { Player, ItemStack } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "../../index.js";
import { autoSmeltItems } from "../../utils.js";

import { chooseBendingMenu } from "../scroll/chooseBending.js";

const waterCup = new ItemStack("a:water_cup");

const nonScrollOperations = (itemStack, source) => {
	const PLAYER_DATA = PLAYER_DATA_MAP[source.id];
	const selectedSlot = source.selectedSlotIndex;

	PLAYER_DATA.rightClick = 5;
	PLAYER_DATA.rightClickSlot = selectedSlot;

    const elements = PLAYER_DATA.elements.map(element => element.type);
	const container = source.getComponent('inventory').container;

	const typeId = itemStack.typeId;
	const amount = itemStack.amount;

	if (autoSmeltItems[typeId] && elements.includes("fire") && PLAYER_DATA.skills.includes("hot_handed")) {
		source.dimension.spawnParticle('a:fire_blast_pop', source.location);
		source.dimension.playSound("avatar.fire_blast", source.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 });
		return container.setItem(selectedSlot, new ItemStack(autoSmeltItems[typeId], amount));
	}

	if (typeId === "a:empty_cup") {
		const ray = source.getBlockFromViewDirection({ includeLiquidBlocks: true, maxDistance: 8 });
		if (ray && ray.block.typeId ===  "minecraft:water") {
			if (source.getGameMode() != "creative") {
				if (amount > 1) {
					container.setItem(selectedSlot, new ItemStack("a:empty_cup", itemStack.amount - 1));	
				} else {
					container.setItem(selectedSlot, undefined);
				}
			}

			if (container.emptySlotsCount > 0) {
				container.addItem(waterCup);
			} else {
				source.dimension.spawnItem(waterCup, source.location);
			}
		}
	}

	if (typeId === "a:water_cup" || typeId === "minecraft:potion") {
		PLAYER_DATA.waterLoaded = 6;
	}
};

export function itemUse(eventData) {
    const { itemStack, source } = eventData;

	// Checks if the user of the item is a player, which apparently needs to be done lol
    if (!(source instanceof Player)) return;

	// Just checks for non-scroll stuff
	if (itemStack.typeId != "a:bending_scroll") return nonScrollOperations(itemStack, source);

	const PLAYER_DATA = PLAYER_DATA_MAP[source.id];
	if (!PLAYER_DATA.lastMenu) {
		return chooseBendingMenu(source);
	} else {
		return PLAYER_DATA.lastMenu(source);
	}
}