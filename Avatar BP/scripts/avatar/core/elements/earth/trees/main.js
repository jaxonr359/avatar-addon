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
            natural_affinity: {
                id: 'natural_affinity',
                name: { translate: 'skilltree.natural_affinity' },
                description: [
                    { translate: 'skilltree.natural_affinity.desc.1' },
                    { translate: 'skilltree.natural_affinity.desc.2' },
                    { translate: 'skilltree.natural_affinity.desc.3' }
                ],
                texture: 'textures/ui/skill_tree/natural_affinity',
                index: 20,
                event: 'a:set_contact_damage_off',
                children: {
                    fortunate_fists: {
                        id: 'fortunate_fists',
                        name: { translate: 'skilltree.fortunate_fists' },
                        description: [
                            { translate: 'skilltree.fortunate_fists.desc.1' },
                            { translate: 'skilltree.fortunate_fists.desc.2' }
                        ],
                        texture: 'textures/ui/skill_tree/fortunate_fists',
                        index: 23,
                        children: {
                            butter_barrage: {
                                id: 'butter_barrage',
                                name: { translate: 'skilltree.butter_barrage' },
                                description: [
                                    { translate: 'skilltree.butter_barrage.desc.1' },
                                    { translate: 'skilltree.butter_barrage.desc.2' },
                                    { translate: 'skilltree.butter_barrage.desc.3' },
                                    { translate: 'skilltree.butter_barrage.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/butter_barrage',
                                index: 16,
                                children: {}
                            },
                            vein_miner: {
                                id: 'vein_miner',
                                name: { translate: 'skilltree.vein_miner' },
                                description: [
                                    { translate: 'skilltree.vein_miner.desc.1' },
                                    { translate: 'skilltree.vein_miner.desc.2' },
                                    { translate: 'skilltree.vein_miner.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/vein_miner',
                                index: 27,
                                children: {}
                            }
                        }
                    },
                    earth_spike_line: {
                        id: 'earth_spike_line',
                        name: { translate: 'skilltree.earth_spike_line' },
                        description: [
                            { translate: 'skilltree.earth_spike_line.desc.1' },
                            { translate: 'skilltree.earth_spike_line.desc.2' },
                            { translate: 'skilltree.earth_spike_line.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/earth_spike_line',
                        index: 11,
                        children: {
                            neutral_jing: {
                                id: 'neutral_jing',
                                name: { translate: 'skilltree.neutral_jing' },
                                description: [
                                    { translate: 'skilltree.neutral_jing.desc.1' },
                                    { translate: 'skilltree.neutral_jing.desc.2' },
                                    { translate: 'skilltree.neutral_jing.desc.3' },
                                    { translate: 'skilltree.neutral_jing.desc.4' }
                                ],
                                texture: 'textures/ui/skill_tree/neutral_jing',
                                index: 25,
                                children: {}
                            }
                        }
                    }
                }
            },
            earth_rend: {
                id: 'earth_rend',
                name: { translate: 'skilltree.earth_rend' },
                description: [
                    { translate: 'skilltree.earth_rend.desc.1' },
                    { translate: 'skilltree.earth_rend.desc.2' },
                    { translate: 'skilltree.earth_rend.desc.3' }
                ],
                texture: 'textures/ui/skill_tree/earth_rend',
                index: 10,
                children: {
                    earthquake: {
                        id: 'earthquake',
                        name: { translate: 'skilltree.earthquake' },
                        description: [
                            { translate: 'skilltree.earthquake.desc.1' },
                            { translate: 'skilltree.earthquake.desc.2' },
                            { translate: 'skilltree.earthquake.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/earthquake',
                        index: 22,
                        children: {
                            seismic_sense: {
                                id: 'seismic_sense',
                                name: { translate: 'skilltree.seismic_sense' },
                                description: [
                                    { translate: 'skilltree.seismic_sense.desc.1' },
                                    { translate: 'skilltree.seismic_sense.desc.2' },
                                    { translate: 'skilltree.seismic_sense.desc.3' }
                                ],
                                texture: 'textures/ui/skill_tree/seismic_sense',
                                index: 24,
                                children: {}
                            }
                        }
                    },
                    earth_headbutt: {
                        id: 'earth_headbutt',
                        name: { translate: 'skilltree.earth_headbutt' },
                        description: [
                            { translate: 'skilltree.earth_headbutt.desc.1' },
                            { translate: 'skilltree.earth_headbutt.desc.2' },
                            { translate: 'skilltree.earth_headbutt.desc.3' }
                        ],
                        texture: 'textures/ui/skill_tree/earth_headbutt',
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