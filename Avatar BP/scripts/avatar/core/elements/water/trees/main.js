export const skillTree = {
    core: {
        id: 'core',
        name: { translate: 'skilltree.core' },
        description: [
            { translate: 'skilltree.core.desc.1' },
            { translate: 'skilltree.core.desc.2' }
        ],
        texture: 'textures/ui/skill_tree/core',
        index: 9,
        children: {
            warriors_spirit: {
                id: 'warriors_spirit',
                name: { translate: 'skilltree.warriors_spirit' },
                description: [
                    { translate: 'skilltree.warriors_spirit.desc.1' },
                    { translate: 'skilltree.warriors_spirit.desc.2' }
                ],
                texture: 'textures/ui/skill_tree/warriors_spirit',
                index: 13,
                children: {
                    warriors_spirit_plus: {
                        id: 'warriors_spirit_plus',
                        name: { translate: 'skilltree.warriors_spirit_plus' },
                        description: [
                            { translate: 'skilltree.warriors_spirit_plus.desc.1' },
                            { translate: 'skilltree.warriors_spirit_plus.desc.2' }
                        ],
                        texture: 'textures/ui/skill_tree/warriors_spirit_plus',
                        index: 17,
                        children: {}
                    }
                }
            },
            bending_resistance: {
                id: 'bending_resistance',
                name: { translate: 'skilltree.bending_resistance' },
                description: [
                    { translate: 'skilltree.bending_resistance.desc.1' },
                    { translate: 'skilltree.bending_resistance.desc.2' }
                ],
                texture: 'textures/ui/skill_tree/bending_resistance',
                index: 18,
                children: {
                    bending_resistance_plus: {
                        id: 'bending_resistance_plus',
                        name: { translate: 'skilltree.bending_resistance_plus' },
                        description: [
                            { translate: 'skilltree.bending_resistance_plus.desc.1' },
                            { translate: 'skilltree.bending_resistance_plus.desc.2' },
                            { translate: 'skilltree.bending_resistance_plus.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/bending_resistance_plus',
                        index: 21,
                        children: {}
                    }
                }
            },
            chi_infusion: {
                id: 'chi_infusion',
                name: { translate: 'skilltree.chi_infusion' },
                description: [
                    { translate: 'skilltree.chi_infusion.desc.1' },
                    { translate: 'skilltree.chi_infusion.desc.2' }
                ],
                texture: 'textures/ui/skill_tree/chi_infusion',
                index: 12,
                children: {
                    chi_infusion_plus: {
                        id: 'chi_infusion_plus',
                        name: { translate: 'skilltree.chi_infusion_plus' },
                        description: [
                            { translate: 'skilltree.chi_infusion_plus.desc.1' },
                            { translate: 'skilltree.chi_infusion_plus.desc.2' }
                        ],
                        texture: 'textures/ui/skill_tree/chi_infusion_plus',
                        index: 15,
                        children: {}
                    }
                }
            },
            icy_aura: {
                id: 'icy_aura',
                name: { translate: 'skilltree.icy_aura' },
                description: [
                    { translate: 'skilltree.icy_aura.desc.1' },
                    { translate: 'skilltree.icy_aura.desc.2' },
                    { translate: 'skilltree.icy_aura.desc.3' }
                ],
                texture: 'textures/ui/skill_tree/icy_aura',
                index: 20,
                event: 'a:set_contact_damage_off',
                children: {
                    frost_breath: {
                        id: 'frost_breath',
                        name: { translate: 'skilltree.frost_breath' },
                        description: [
                            { translate: 'skilltree.frost_breath.desc.1' },
                            { translate: 'skilltree.frost_breath.desc.2' },
                            { translate: 'skilltree.frost_breath.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/frost_breath',
                        index: 23,
                        children: {
                            healing_cloud: {
                                id: 'healing_cloud',
                                name: { translate: 'skilltree.healing_cloud' },
                                description: [
                                    { translate: 'skilltree.healing_cloud.desc.1' },
                                    { translate: 'skilltree.healing_cloud.desc.2' },
                                    { translate: 'skilltree.healing_cloud.desc.3' },
                                    { translate: 'skilltree.healing_cloud.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/healing_cloud',
                                index: 16,
                                children: {}
                            },
                            focused_healing: {
                                id: 'focused_healing',
                                name: { translate: 'skilltree.focused_healing' },
                                description: [
                                    { translate: 'skilltree.focused_healing.desc.1' },
                                    { translate: 'skilltree.focused_healing.desc.2' }
                                ],
                                texture: 'textures/ui/skill_tree/focused_healing',
                                index: 27,
                                children: {}
                            }
                        }
                    },
                    moisture_drain: {
                        id: 'moisture_drain',
                        name: { translate: 'skilltree.moisture_drain' },
                        description: [
                            { translate: 'skilltree.moisture_drain.desc.1' },
                            { translate: 'skilltree.moisture_drain.desc.2' },
                            { translate: 'skilltree.moisture_drain.desc.3' },
                            { translate: 'skilltree.moisture_drain.desc.4' }
                        ],
                        texture: 'textures/ui/skill_tree/moisture_drain',
                        index: 11,
                        children: {
                            bloodbending: {
                                id: 'bloodbending',
                                name: { translate: 'skilltree.bloodbending' },
                                description: [
                                    { translate: 'skilltree.bloodbending.desc.1' },
                                    { translate: 'skilltree.bloodbending.desc.2' },
                                    { translate: 'skilltree.bloodbending.desc.3' },
                                    { translate: 'skilltree.bloodbending.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/bloodbending',
                                index: 25,
                                children: {}
                            }
                        }
                    }
                }
            },
            water_jet_rush: {
                id: 'water_jet_rush',
                name: { translate: 'skilltree.water_jet_rush' },
                description: [
                    { translate: 'skilltree.water_jet_rush.desc.1' },
                    { translate: 'skilltree.water_jet_rush.desc.2' },
                    { translate: 'skilltree.water_jet_rush.desc.3' },
                    { translate: 'skilltree.water_jet_rush.desc.4' }
                ],
                texture: 'textures/ui/skill_tree/water_jet_rush',
                index: 10,
                children: {
                    fire_extinguisher: {
                        id: 'fire_extinguisher',
                        name: { translate: 'skilltree.fire_extinguisher' },
                        description: [
                            { translate: 'skilltree.fire_extinguisher.desc.1' },
                            { translate: 'skilltree.fire_extinguisher.desc.2' },
                            { translate: 'skilltree.fire_extinguisher.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/fire_extinguisher',
                        index: 22,
                        children: {
                            waterwash: {
                                id: 'waterwash',
                                name: { translate: 'skilltree.waterwash' },
                                description: [
                                    { translate: 'skilltree.waterwash.desc.1' },
                                    { translate: 'skilltree.waterwash.desc.2' },
                                    { translate: 'skilltree.waterwash.desc.3' },
                                    { translate: 'skilltree.waterwash.desc.4' },
                                    { translate: 'skilltree.waterwash.desc.5' }
                                ],
                                texture: 'textures/ui/skill_tree/waterwash',
                                index: 24,
                                children: {}
                            }
                        }
                    },
                    vine_hook: {
                        id: 'vine_hook',
                        name: { translate: 'skilltree.vine_hook' },
                        description: [
                            { translate: 'skilltree.vine_hook.desc.1' },
                            { translate: 'skilltree.vine_hook.desc.2' },
                            { translate: 'skilltree.vine_hook.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/vine_hook',
                        index: 19,
                        children: {
                            hydroshock: {
                                id: 'hydroshock',
                                name: { translate: 'skilltree.hydroshock' },
                                description: [
                                    { translate: 'skilltree.hydroshock.desc.1' },
                                    { translate: 'skilltree.hydroshock.desc.2' },
                                    { translate: 'skilltree.hydroshock.desc.3' },
                                    { translate: 'skilltree.hydroshock.desc.4' },
                                    { translate: 'skilltree.hydroshock.desc.5' }
                                ],
                                texture: 'textures/ui/skill_tree/hydroshock',
                                index: 26,
                                children: {}
                            },
                            vine_grapple: {
                                id: 'vine_grapple',
                                name: { translate: 'skilltree.vine_grapple' },
                                description: [
                                    { translate: 'skilltree.vine_grapple.desc.1' },
                                    { translate: 'skilltree.vine_grapple.desc.2' },
                                    { translate: 'skilltree.vine_grapple.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/vine_grapple',
                                index: 14,
                                children: {}
                            }
                        }
                    }
                }
            }
        }
    }
}