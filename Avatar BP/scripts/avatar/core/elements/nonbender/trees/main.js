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
            fast_footed: {
                id: 'fast_footed',
                name: { translate: 'skilltree.fast_footed' },
                description: [
                    { translate: 'skilltree.airflow.desc.1' },
                    { translate: 'skilltree.airflow.desc.2' }
                ],
                texture: 'textures/ui/skill_tree/air_dash',
                index: 20,
                event: 'a:set_trigger_skulk_off',
                children: {
                    twinkle_toes: {
                        id: 'twinkle_toes',
                        name: { translate: 'skilltree.light_footed' },
                        description: [
                            { translate: 'skilltree.twinkle_toes.desc.1' },
                            { translate: 'skilltree.twinkle_toes.desc.2' },
                            { translate: 'skilltree.twinkle_toes.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/twinkle_toes',
                        index: 23,
                        children: {
                            adrenaline: {
                                id: 'adrenaline',
                                name: { translate: 'skilltree.adrenaline' },
                                description: [
                                    { translate: 'skilltree.adrenaline.desc.1' },
                                    { translate: 'skilltree.adrenaline.desc.2' }
                                ],
                                texture: 'textures/ui/skill_tree/adrenaline',
                                index: 16,
                                children: {}
                            },
                            perseverance: {
                                id: 'perseverance',
                                name: { translate: 'skilltree.perseverance' },
                                description: [
                                    { translate: 'skilltree.perseverance.desc.1' },
                                    { translate: 'skilltree.perseverance.desc.2' }
                                ],
                                texture: 'textures/ui/skill_tree/perseverance',
                                index: 27,
                                children: {}
                            }
                        }
                    },
                    rewind: {
                        id: 'rewind',
                        name: { translate: 'skilltree.rewind' },
                        description: [
                            { translate: 'skilltree.rewind.desc.1' },
                            { translate: 'skilltree.rewind.desc.2' },
                            { translate: 'skilltree.rewind.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/rewind',
                        index: 11,
                        children: {
                            boomerang: {
                                id: 'boomerang',
                                name: { translate: 'skilltree.boomerang' },
                                description: [
                                    { translate: 'skilltree.boomerang.desc.1' },
                                    { translate: 'skilltree.boomerang.desc.2' },
                                    { translate: 'skilltree.boomerang.desc.3' },
                                    { translate: 'skilltree.boomerang.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/boomerang',
                                index: 25,
                                children: {}
                            }
                        }
                    }
                }
            },
            chi_blocking: {
                id: 'chi_blocking',
                name: { translate: 'skilltree.chi_blocking' },
                description: [
                    { translate: 'skilltree.chi_blocking.desc.1' },
                    { translate: 'skilltree.chi_blocking.desc.2' },
                    { translate: 'skilltree.chi_blocking.desc.3' },
                    { translate: 'skilltree.chi_blocking.desc.4' }
                ],
                texture: 'textures/ui/skill_tree/chi_blocking',
                index: 10,
                children: {
                    dash: {
                        id: 'dash',
                        name: { translate: 'skilltree.dash' },
                        description: [
                            { translate: 'skilltree.dash.desc.1' },
                            { translate: 'skilltree.dash.desc.2' },
                            { translate: 'skilltree.dash.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/dash',
                        index: 22,
                        children: {
                            truesight: {
                                id: 'truesight',
                                name: { translate: 'skilltree.truesight' },
                                description: [
                                    { translate: 'skilltree.truesight.desc.1' },
                                    { translate: 'skilltree.truesight.desc.2' },
                                    { translate: 'skilltree.truesight.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/truesight',
                                index: 24,
                                children: {}
                            }
                        }
                    },
                    hot_blooded: {
                        id: 'hot_blooded',
                        name: { translate: 'skilltree.medicine' },
                        description: [
                            { translate: 'skilltree.medicine.desc.1' },
                            { translate: 'skilltree.medicine.desc.2' }
                        ],
                        texture: 'textures/ui/skill_tree/medicine_2',
                        index: 19,
                        children: {
                            sustenance: {
                                id: 'sustenance',
                                name: { translate: 'skilltree.sustenance' },
                                description: [
                                    { translate: 'skilltree.sustenance.desc.1' },
                                    { translate: 'skilltree.sustenance.desc.2' }
                                ],
                                texture: 'textures/ui/skill_tree/sustenance',
                                index: 26,
                                event: 'a:no_hunger',
                                children: {}
                            },
                            endurance: {
                                id: 'endurance',
                                name: { translate: 'skilltree.endurance' },
                                description: [
                                    { translate: 'skilltree.endurance.desc.1' },
                                    { translate: 'skilltree.endurance.desc.2' }
                                ],
                                texture: 'textures/ui/skill_tree/endurance',
                                index: 14,
                                event: 'a:set_fall_damage_off',
                                children: {}
                            }
                        }
                    }
                }
            }
        }
    }
}