import { system } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";

async function forceShow(player, form, timeout = Infinity) {
    const startTick = system.currentTick;
    while ((system.currentTick - startTick) < timeout) {
        const response = await (form.show(player));
        if (response.cancelationReason !== FormCancelationReason.UserBusy) {
            return response;
        }
    };
};

export const startTutorial = async (player, index = 1) => {
    if (index >= 23) {
        return;
    }

    const form = new ActionFormData();
    form.title({
        rawtext: [
            { "text": "§t§f" },
            { translate: `tutorial.main.${index}` },
        ]
    })

    form.button({
        rawtext: [
            { translate: `tutorial.main.continue` },
        ]
    });

    if (index === 1) {
        player.runCommand("clear @s a:bending_scroll -1");
        player.runCommand('give @s a:bending_scroll 1 0 {"minecraft:keep_on_death":{},"minecraft:item_lock":{"mode":"lock_in_inventory"}}');    
    }

    const response = await forceShow(player, form);
    const { selection } = response;
    if (selection === undefined) return;
    if (selection === 0) startTutorial(player, index + 1);
}