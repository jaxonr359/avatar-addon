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
            twinkle_toes: {
                id: 'twinkle_toes',
                name: { translate: 'skilltree.twinkle_toes' },
                description: [
                    { translate: 'skilltree.twinkle_toes.desc.1' },
                    { translate: 'skilltree.twinkle_toes.desc.2' },
                    { translate: 'skilltree.twinkle_toes.desc.3' }
                ],
                texture: 'textures/ui/skill_tree/twinkle_toes',
                index: 20,
                event: 'a:set_trigger_skulk_off',
                children: {
                    lightning_sweep: {
                        id: 'lightning_sweep',
                        name: { translate: 'skilltree.lightning_sweep' },
                        description: [
                            { translate: 'skilltree.lightning_sweep.desc.1' },
                            { translate: 'skilltree.lightning_sweep.desc.2' },
                            { translate: 'skilltree.lightning_sweep.desc.3' },
                            { translate: 'skilltree.lightning_sweep.desc.4' }
                        ],
                        texture: 'textures/ui/skill_tree/lightning_sweep',
                        index: 23,
                        children: {
                            electroshock: {
                                id: 'electroshock',
                                name: { translate: 'skilltree.electroshock' },
                                description: [
                                    { translate: 'skilltree.electroshock.desc.1' },
                                    { translate: 'skilltree.electroshock.desc.2' },
                                    { translate: 'skilltree.electroshock.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/lightning_discharge',
                                index: 16,
                                children: {}
                            },
                            thunderclap: {
                                id: 'thunderclap',
                                name: { translate: 'skilltree.thunderclap' },
                                description: [
                                    { translate: 'skilltree.thunderclap.desc.1' },
                                    { translate: 'skilltree.thunderclap.desc.2' },
                                    { translate: 'skilltree.thunderclap.desc.3' },
                                    { translate: 'skilltree.thunderclap.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/thunderclap',
                                index: 27,
                                children: {}
                            }
                        }
                    },
                    double_jump: {
                        id: 'double_jump',
                        name: { translate: 'skilltree.double_jump' },
                        description: [
                            { translate: 'skilltree.double_jump.desc.1' },
                            { translate: 'skilltree.double_jump.desc.2' },
                            { translate: 'skilltree.double_jump.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/double_jump',
                        index: 11,
                        children: {
                            wind_dash: {
                                id: 'wind_dash',
                                name: { translate: 'skilltree.wind_dash' },
                                description: [
                                    { translate: 'skilltree.wind_dash.desc.1' },
                                    { translate: 'skilltree.wind_dash.desc.2' },
                                    { translate: 'skilltree.wind_dash.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/air_dash',
                                index: 25,
                                children: {}
                            }
                        }
                    }
                }
            },
            airflow: {
                id: 'airflow',
                name: { translate: 'skilltree.airflow' },
                description: [
                    { translate: 'skilltree.airflow.desc.1' },
                    { translate: 'skilltree.airflow.desc.2' }
                ],
                texture: 'textures/ui/skill_tree/airflow',
                index: 10,
                children: {
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
                        index: 22,
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
                                index: 24,
                                children: {}
                            }
                        }
                    },
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
                        index: 19,                   
                        children: {
                            magma_surge: {
                                id: 'magma_surge',
                                name: { translate: 'skilltree.magma_surge' },
                                description: [
                                    { translate: 'skilltree.magma_surge.desc.1' },
                                    { translate: 'skilltree.magma_surge.desc.2' },
                                    { translate: 'skilltree.magma_surge.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/magma_surge',
                                index: 26,
                                children: {}
                            },
                            metal_hook: {
                                id: 'metal_hook',
                                name: { translate: 'skilltree.metal_hook' },
                                description: [
                                    { translate: 'skilltree.metal_hook.desc.1' },
                                    { translate: 'skilltree.metal_hook.desc.2' },
                                    { translate: 'skilltree.metal_hook.desc.3' },
                                    { translate: 'skilltree.metal_hook.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/metal_hook',
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