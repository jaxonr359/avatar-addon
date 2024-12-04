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
            hot_handed: {
                id: 'hot_handed',
                name: { translate: 'skilltree.hot_handed' },
                description: [
                    { translate: 'skilltree.hot_handed.desc.1' },
                    { translate: 'skilltree.hot_handed.desc.2' },
                    { translate: 'skilltree.hot_handed.desc.3' }
                ],
                texture: 'textures/ui/skill_tree/hot_handed',
                index: 20,
                children: {
                    firey_disposition: {
                        id: 'firey_disposition',
                        name: { translate: 'skilltree.firey_disposition' },
                        description: [
                            { translate: 'skilltree.firey_disposition.desc.1' },
                            { translate: 'skilltree.firey_disposition.desc.2' }
                        ],
                        texture: 'textures/ui/skill_tree/firey_disposition',
                        index: 23,
                        children: {
                            death_slam: {
                                id: 'death_slam',
                                name: { translate: 'skilltree.death_slam' },
                                description: [
                                    { translate: 'skilltree.death_slam.desc.1' },
                                    { translate: 'skilltree.death_slam.desc.2' },
                                    { translate: 'skilltree.death_slam.desc.3' },
                                    { translate: 'skilltree.death_slam.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/death_slam',
                                index: 16,
                                children: {}
                            },
                            flame_aura: {
                                id: 'flame_aura',
                                name: { translate: 'skilltree.flame_aura' },
                                description: [
                                    { translate: 'skilltree.flame_aura.desc.1' },
                                    { translate: 'skilltree.flame_aura.desc.2' },
                                    { translate: 'skilltree.flame_aura.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/magma_surge',
                                index: 27,
                                children: {}
                            }
                        }
                    },
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
                        index: 11,
                        children: {
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
                                index: 25,
                                children: {}
                            }
                        }
                    }
                }
            },
            fast_footed: {
                id: 'fast_footed',
                name: { translate: 'skilltree.fast_footed' },
                description: [
                    { translate: 'skilltree.airflow.desc.1' },
                    { translate: 'skilltree.airflow.desc.2' }
                ],
                texture: 'textures/ui/skill_tree/fast_footed',
                index: 10,
                children: {
                    lightning_burst: {
                        id: 'lightning_burst',
                        name: { translate: 'skilltree.lightning_burst' },
                        description: [
                            { translate: 'skilltree.lightning_burst.desc.1' },
                            { translate: 'skilltree.lightning_burst.desc.2' },
                            { translate: 'skilltree.lightning_burst.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/lightning_burst',
                        index: 22,
                        children: {
                            lightning_discharge: {
                                id: 'electroshock',
                                name: { translate: 'skilltree.electroshock' },
                                description: [
                                    { translate: 'skilltree.electroshock.desc.1' },
                                    { translate: 'skilltree.electroshock.desc.2' },
                                    { translate: 'skilltree.electroshock.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/lightning_discharge',
                                index: 24,
                                children: {}
                            }
                        }
                    },
                    hot_blooded: {
                        id: 'hot_blooded',
                        name: { translate: 'skilltree.hot_blooded' },
                        description: [
                            { translate: 'skilltree.hot_blooded.desc.1' },
                            { translate: 'skilltree.hot_blooded.desc.2' }
                        ],
                        texture: 'textures/ui/skill_tree/hot_blooded',
                        index: 19,
                        children: {
                            dragon_of_the_west: {
                                id: 'dragon_of_the_west',
                                name: { translate: 'skilltree.dragon_of_the_west' },
                                description: [
                                    { translate: 'skilltree.dragon_of_the_west.desc.1' },
                                    { translate: 'skilltree.dragon_of_the_west.desc.2' },
                                    { translate: 'skilltree.dragon_of_the_west.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/dragon_of_the_west',
                                index: 26,
                                children: {}
                            },
                            combustion_beam: {
                                id: 'combustion_beam',
                                name: { translate: 'skilltree.combustion_beam' },
                                description: [
                                    { translate: 'skilltree.combustion_beam.desc.1' },
                                    { translate: 'skilltree.combustion_beam.desc.2' },
                                    { translate: 'skilltree.combustion_beam.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/combustion_beam',
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