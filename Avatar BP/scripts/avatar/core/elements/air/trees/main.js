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
                    air_puff: {
                        id: 'air_puff',
                        name: { translate: 'skilltree.air_puff' },
                        description: [
                            { translate: 'skilltree.air_puff.desc.1' },
                            { translate: 'skilltree.air_puff.desc.2' },
                            { translate: 'skilltree.air_puff.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/air_puff',
                        index: 23,
                        children: {
                            air_cushion: {
                                id: 'air_cushion',
                                name: { translate: 'skilltree.air_cushion' },
                                description: [
                                    { translate: 'skilltree.air_cushion.desc.1' },
                                    { translate: 'skilltree.air_cushion.desc.2' }
                                ],
                                texture: 'textures/ui/skill_tree/air_cushion',
                                index: 16,
                                children: {},
                                event: 'a:set_fall_damage_off'
                            },
                            wall_shot: {
                                id: 'wall_shot',
                                name: { translate: 'skilltree.wall_shot' },
                                description: [
                                    { translate: 'skilltree.wall_shot.desc.1' },
                                    { translate: 'skilltree.wall_shot.desc.2' },
                                    { translate: 'skilltree.wall_shot.desc.3' },
                                    { translate: 'skilltree.wall_shot.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/wall_shot',
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
                    scorpion_strike: {
                        id: 'scorpion_strike',
                        name: { translate: 'skilltree.scorpion_strike' },
                        description: [
                            { translate: 'skilltree.scorpion_strike.desc.1' },
                            { translate: 'skilltree.scorpion_strike.desc.2' },
                            { translate: 'skilltree.scorpion_strike.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/scorpion_strike',
                        index: 22,
                        children: {
                            whirlwind_redirection: {
                                id: 'whirlwind_redirection',
                                name: { translate: 'skilltree.whirlwind_redirection' },
                                description: [
                                    { translate: 'skilltree.whirlwind_redirection.desc.1' },
                                    { translate: 'skilltree.whirlwind_redirection.desc.2' },
                                    { translate: 'skilltree.whirlwind_redirection.desc.3' },
                                    { translate: 'skilltree.whirlwind_redirection.desc.4' },
                                    { translate: 'skilltree.whirlwind_redirection.desc.5' }
                                ],
                                texture: 'textures/ui/skill_tree/whirlwind_redirection',
                                index: 24,
                                children: {}
                            }
                        }
                    },
                    peaceful_presence: {
                        id: 'peaceful_presence',
                        name: { translate: 'skilltree.peaceful_presence' },
                        description: [
                            { translate: 'skilltree.peaceful_presence.desc.1' },
                            { translate: 'skilltree.peaceful_presence.desc.2' },
                            { translate: 'skilltree.peaceful_presence.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/peaceful_presence',
                        index: 19,
                        event: 'a:no_mob_agro',
                        children: {
                            onion_and_banana_juice: {
                                id: 'onion_and_banana_juice',
                                name: { translate: 'skilltree.onion_and_banana_juice' },
                                description: [
                                    { translate: 'skilltree.onion_and_banana_juice.desc.1' },
                                    { translate: 'skilltree.onion_and_banana_juice.desc.2' },
                                    { translate: 'skilltree.onion_and_banana_juice.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/onion_and_banana_juice',
                                index: 26,
                                event: 'a:no_hunger',
                                children: {}
                            },
                            air_spirit: {
                                id: 'air_spirit',
                                name: { translate: 'skilltree.air_spirit' },
                                description: [
                                    { translate: 'skilltree.air_spirit.desc.1' },
                                    { translate: 'skilltree.air_spirit.desc.2' },
                                    { translate: 'skilltree.air_spirit.desc.3' },
                                    { translate: 'skilltree.air_spirit.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/air_spirit',
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