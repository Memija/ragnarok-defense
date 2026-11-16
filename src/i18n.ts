export type SupportedLang = 'en' | 'de' | 'id' | 'bs' | 'pl' | 'sr-Cyrl';

export const SUPPORTED_LANGS: readonly SupportedLang[] = ['en', 'de', 'id', 'bs', 'pl', 'sr-Cyrl'];

export function isSupportedLang(lang: string | null | undefined): lang is SupportedLang {
  return Boolean(lang && (SUPPORTED_LANGS as readonly string[]).includes(lang));
}

export const translations: Record<string, Record<string, string>> = {
  en: {
    foreignUnitsTitle: 'Defending Home World',
    foreignUnitsSubtitle: 'Foreign realm defenders allowed during home world defense',
    foreignUnitsAllow: 'Allow',
    foreignUnitsDisable: 'Disable',
    foreignUnitsLimited: 'Limited',
    configureForeignUnits: 'Customize Troops',
    configureForeignWorlds: 'Customize Realms',
    foreignWorldsModalTitle: 'Allowed Foreign Realms',
    foreignWorldsModalSubtitle: 'Select which foreign realms can lend their warriors when defending the home world',
    foreignWorldsSelectedLabel: 'Allowed Realms:',
    foreignTroopsModalTitle: 'Allowed Foreign Troops',
    foreignTroopsModalSubtitle: 'Select which foreign realm troops can be summoned when defending the home world',
    foreignTroopsSelectedLabel: 'Allowed Troops:',
    foreignUnitsAllowedBadge: 'Foreign Units: Allowed',
    foreignUnitsRestrictedBadge: 'Foreign Units: Disabled',
    foreignUnitsLimitedBadge: 'Foreign Units: Limited',
    foreignUnitsEnabled: 'Allowed',
    foreignUnitsDisabled: 'Disabled',
    foreignUnitLocked: 'Foreign Unit (Restricted)',
    foreignUnitRestrictedTooltip: 'Foreign defenders restricted when defending the home world',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    saveAndApply: 'Save & Apply',
    title: 'Ragnarök Defense',
    mainTitle: 'Ragnarök Defense',
    mainSubtitle: '❄ Defend Yggdrasil against Fimbulwinter ❄',
    sun: 'Sun',
    level: 'Level',
    dig: 'Dig',
    version: 'Version',
    language: 'Language',
    theme: 'Theme',
    themeLight: '☀️ Light Mode',
    themeDark: '🌙 Dark Mode',
    themeSystem: '💻 System Theme',
    returnToYggdrasil: 'Return to Yggdrasil',
    returnToYggdrasilTooltip: 'Return to Yggdrasil World Tree',
    returnToRealms: 'Return to Realm Selection',
    realms: 'Realms',
    locked: 'Locked',
    gameSettings: 'Game Settings',
    toggleSound: 'Toggle Sound (M)',
    muteSound: 'Mute Sound',
    unmuteSound: 'Unmute Sound',
    muteSoundShortcut: 'Mute Sound (M)',
    unmuteSoundShortcut: 'Unmute Sound (M)',
    masterVolume: 'Master Volume',
    masterVolumeDesc: 'Sound effects & synthesizer volume',
    settings: 'Settings',
    settingsCategories: 'Settings Categories',
    tabAudioDisplay: 'Audio & Display',
    tabRealmDefense: 'Realm Defense',
    tabLevelRules: 'Level Rules',
    toggleTheme: 'Toggle Theme',
    switchToLightMode: 'Switch to Light Mode',
    switchToDarkMode: 'Switch to Dark Mode',
    switchToSystemTheme: 'Switch to System Theme',
    foreignUnitsPolicy: 'Foreign Units Policy',
    foreignUnitsDisableTooltip: 'Disable foreign units (Native defenders only)',
    foreignUnitsLimitedTooltip: 'Allow custom selected foreign units',
    foreignUnitsAllowTooltip: 'Allow all foreign units',
    close: 'Close',
    closeSettings: 'Close Settings',
    levelConfigTitle: 'Level Parameters',
    levelConfigSubtitle: 'Set starting currency and squad slots per level',
    infiniteResources: 'Infinite Resources',
    infiniteResourcesTitle: 'Infinite Resources',
    infiniteResourcesSubtitle: 'Unlimited realm currency and unrestricted deployment',
    infinite: 'Infinite',
    infiniteActive: 'Unlimited',
    enabled: 'Enabled',
    disabled: 'Disabled',
    startingCurrency: 'Starting Currency',
    decreaseCurrency: 'Decrease currency',
    increaseCurrency: 'Increase currency',
    squadSlots: 'Squad Slots',
    decreaseSlots: 'Decrease slots',
    increaseSlots: 'Increase slots',
    slotActive: 'Active',
    resetLevel: 'Reset Level',
    resetLevelTooltip: 'Reset level to default',
    resetAllLevels: 'Reset All',
    resetAllLevelsTooltip: 'Reset all levels to default',
    defaultLabel: 'Default',
    customLabel: 'Custom',
    mixedLabel: 'Mixed',
    allLevelsPill: 'All',
    allLevels: 'All Levels',
    allLevelsPillTooltip: 'Configure all levels in bulk',
    applyToAllLevels: 'Apply to All',
    applyToAllLevelsTooltip: 'Copy this level\'s parameters to all levels',
    slotPartial: 'Varies by level',
    setSlotsTooltip: 'Set to {count} slots',
    slotsCount: '{count} Slots',
    world_asgard: 'Asgard',
    world_midgard: 'Midgard',
    world_svartalfheim: 'Svartalfheim',
    world_alfheim: 'Alfheim',
    world_vanaheim: 'Vanaheim',
    world_jotunheim: 'Jotunheim',
    world_niflheim: 'Niflheim',
    world_muspelheim: 'Muspelheim',
    world_helheim: 'Helheim',
    world_svartalfheim_sub: 'Great Subterranean Forges',
    world_vanaheim_sub: 'Wild Primordial Sanctuary',
    world_asgard_sub: 'Golden City of the Gods',
    world_midgard_sub: 'Heart of the World Tree',
    world_jotunheim_sub: 'Barren Glacial Peaks',
    world_niflheim_sub: 'Primordial Frozen Mist',
    world_muspelheim_sub: 'Domain of Lord Surtr',
    world_helheim_sub: 'Silent Obsidian Domain',
    world_alfheim_sub: 'Luminous Fairy Meadows',
    realm_asgard: 'Realm of the Aesir',
    realm_alfheim: 'Realm of Light Elves',
    realm_vanaheim: 'Realm of Nature',
    realm_svartalfheim: 'Realm of Dwarves',
    realm_midgard: 'Realm of Mortals',
    realm_jotunheim: 'Realm of Frost Giants',
    realm_niflheim: 'Realm of Ice and Mist',
    realm_muspelheim: 'Realm of Fire',
    realm_helheim: 'Realm of the Dead',
    currency_asgard: 'Draupnir Gold',
    currency_midgard: 'Hacksilver',
    currency_svartalfheim: 'Dwarven Ingots',
    currency_alfheim: 'Sunstones',
    currency_vanaheim: 'Golden Amber',
    currency_jotunheim: 'Rime Shards',
    currency_niflheim: 'Mist Crystals',
    currency_muspelheim: 'Fire Embers',
    currency_helheim: 'Soul Obols',
    unlocked: 'Unlocked',
    prologue: 'Prologue',
    defense_mandate: 'Defense Mandate',
    commence_defense: 'Commence Defense',
    sealed_prerequisite: 'Secure {city} to unseal',
    return_to_map: '« Realm Map',
    play_again: 'Play Again',
    strongholds_unsealed: '{unlocked} / {total} Strongholds',
    level_abbr: 'Level',
    threat_normal: 'Normal',
    threat_hard: 'Hard',
    threat_extreme: 'Extreme',
    threat_nightmare: 'Nightmare',
    chapter_i: 'Chapter I',
    chapter_ii: 'Chapter II',
    chapter_iii: 'Chapter III',
    chapter_iv: 'Chapter IV',
    chapter_v: 'Chapter V',
    chapter_vi: 'Chapter VI',
    chapter_vii: 'Chapter VII',
    loc_althjofs_wheel_sub: 'Dwarven Watermill · Outer Canal',
    loc_andvaris_falls_chapter: 'Chapter II',
    loc_andvaris_falls_sub: 'Mystical Waterfall Cavern',
    loc_andvaris_falls_desc: 'Subterranean rapids plunging into crystal chasms. Waterborne raiders and serpent beasts contest the passage to the cursed gold hoards. Hold the slippery stone bridge chokepoint before the waterways are overrun.',
    loc_andvaris_falls_objective: 'Hold the central bridge against 7 waves of aquatic fiends.',
    loc_ivaldis_workshop_chapter: 'Chapter III',
    loc_ivaldis_workshop_sub: 'Arcane Runecraft Sanctum',
    loc_ivaldis_workshop_desc: 'The sacred craft enclave of the Sons of Ivaldi where legendary relics like Gungnir were forged. Corrupted shadow fiends swarm the crystal anvil chambers attempting to desecrate the divine armories.',
    loc_ivaldis_workshop_objective: 'Safeguard the forge hall across 8 waves of shadow fiends.',
    loc_jarnsmida_quarry_chapter: 'Chapter IV',
    loc_jarnsmida_quarry_sub: 'Terraced Iron Pit',
    loc_jarnsmida_quarry_desc: 'A colossal circular quarry carved in descending terraces. Armored iron-eaters and heavy siege trolls have smashed the railway lines and storm the lifts toward the inner halls.',
    loc_jarnsmida_quarry_objective: 'Hold the spiral stone terraces against 9 siege waves.',
    loc_dvalins_depths_chapter: 'Chapter V',
    loc_dvalins_depths_sub: 'Primordial Geode Shafts',
    loc_dvalins_depths_desc: 'The colossal primordial geode mines of dwarf lord Dvalin. Vast timbered mine shafts plunge into glowing crystal chasms where ancient subterranean horrors have awakened.',
    loc_dvalins_depths_objective: 'Eliminate 10 waves of subterranean crystal horrors.',
    loc_sindris_forge_chapter: 'Chapter VI',
    loc_sindris_forge_sub: 'Legendary Dragonfire Armory',
    loc_sindris_forge_desc: 'Twin blast furnaces roaring day and night with divine dragonfire. Elite flame drakes and apocalyptic fiends launch an all-out assault on the divine armories.',
    loc_sindris_forge_objective: 'Protect the sacred furnaces through 11 extreme assault waves.',
    loc_nidavellir_chapter: 'Chapter VII',
    loc_nidavellir_sub: 'The Royal Dwarven Citadel',
    loc_nidavellir_desc: 'The great subterranean capital fortress. Massive stone keeps, fortified bastions, and the golden throne of Brokkr and Eitri face the final apocalyptic horde of Ragnarök.',
    loc_nidavellir_objective: 'Survive 12 nightmare waves to defend the dwarven throne.',
    loc_althjofs_wheel_name: "Althjof's Wheel",
    loc_andvaris_falls_name: "Andvari's Falls",
    loc_ivaldis_workshop_name: "Ivaldi's Workshop",
    loc_jarnsmida_quarry_name: "Jarnsmida Quarry",
    loc_dvalins_depths_name: "Dvalin's Depths",
    loc_sindris_forge_name: "Sindri's Forge",
    loc_nidavellir_name: "Nidavellir",
    loc_althjofs_wheel_desc: "Deep within the subterranean waterways of Svartalfheim, the colossal Great Wheel of master artisan Althjof churns the canal torrents to power the royal foundries of Nidavellir.\n\nAs the tremors of Ragnarök reverberate across the roots of Yggdrasil, an ominous advance threatens to breach the outer river gates. The dwarven architects have called upon you to secure the waterways and hold the threshold.",
    loc_althjofs_wheel_objective: "Hold the outer canal waterways and safeguard Althjof's Great Wheel from ruin.",
    chooseDefenders: 'Choose Your Defenders',
    chooseDefendersSubtitle: 'Assemble your battle squad based on available level slots',
    squadCapacity: 'Squad Capacity',
    slotsSelected: 'Selected',
    toBattle: 'To Battle ⚔️',
    updateSquad: 'Update Squad ⚔️',
    balancedSquad: 'Balanced Squad',
    bestPossibleMix: 'Best Possible Mix',
    bestMixApplied: '⚡ Best Possible Mix Applied!',
    presetBestName: 'Best Possible Mix',
    presetBestDesc: 'Ideal synergy of Economy, Defense, Ranged Attack & Crowd Control',
    presetHeavyName: 'Heavy Firepower',
    presetHeavyDesc: 'Maximum sustained damage, fireballs & explosive burst',
    presetFortifiedName: 'Fortified Bastion',
    presetFortifiedDesc: 'High health stone walls, icy slow & paralyzing butter',
    presetBalancedName: 'Balanced Squad',
    presetBalancedDesc: 'Standard versatile defensive loadout',
    tag_best: 'Optimal',
    tag_heavy_attack: 'Attack',
    tag_fortified: 'Defense',
    tag_balanced: 'Balanced',
    synergyEconomy: 'Economy',
    synergyDefense: 'Defense',
    synergyDPS: 'Ranged Attack',
    synergyCrowdControl: 'Crowd Control',
    synergyBurst: 'Area Blast',
    synergyFlameBoost: 'Flame Synergy',
    synergyFreezeCombo: 'Freeze & Stun',
    synergyEconomyActiveTooltip: 'Produces realm currency (+25 every 10 seconds)',
    synergyEconomyInactiveTooltip: 'Missing currency producer!',
    synergyDefenseActiveTooltip: 'Frontline defensive wall or trap protection',
    synergyDefenseInactiveTooltip: 'No defensive walls or mines selected!',
    synergyDPSActiveTooltip: 'Continuous ranged firepower',
    synergyDPSInactiveTooltip: 'No ranged attack units selected!',
    synergyCrowdControlActiveTooltip: 'Slowing frost or immobilizing pitch',
    synergyCrowdControlInactiveTooltip: 'No crowd control slowing or stunning units!',
    synergyBurstActiveTooltip: 'Instant emergency area blast demolition',
    synergyBurstInactiveTooltip: 'No emergency area blast units!',
    synergyFlameBoostTooltip: 'Fire Spire ignites passing projectiles into fireballs dealing double damage!',
    synergyFreezeComboTooltip: 'Frost Sprite slow combined with Dwarven Catapult stun creates impenetrable crowd control!',
    currencyRate: '+25 / 10 seconds',
    currencyCostTooltip: '{currency} Cost',
    tacticalSquadPresets: 'Tactical Squad Presets',
    cancelSelection: 'Cancel Selection',
    closeWarning: 'Close Warning',
    squadSynergy: 'Squad Synergy:',
    squadSynergyOptimal: 'Optimal Squad Synergy',
    clearRoster: 'Clear',
    rosterCleared: 'Squad Cleared',
    alreadyEquipped: 'Already Equipped',
    applied: 'Applied',
    squadCapacityFullToast: 'Squad capacity full ({max}/{max})! Click an equipped defender above to remove.',
    foreignUnitRestrictedToast: '🔒 {name} is restricted to its home realm in Settings',
    roster: 'Roster',
    defenders: 'Defenders',
    currentRealm: 'Current Realm',
    maxDefendersReached: 'Maximum defenders reached for this level',
    selectAtLeastOne: 'Select at least one defender to enter battle!',
    clickToRemove: 'Click to remove',
    slot: 'Slot',
    slotEmpty: 'Empty',
    allWorlds: 'All Worlds',
    hostRealmDefenses: 'Host realm',
    foreignRealmRestricted: 'Foreign Realm · Restricted',
    catAll: 'All Roster',
    catPlants: 'Plants',
    catTowers: 'Towers',
    cat_plants_title: 'Sacred Plants',
    cat_plants_sub: 'Flora nurtured by the roots of Yggdrasil with natural vitality',
    cat_towers_title: 'Towers',
    cat_towers_sub: 'Runic fortifications, defensive spires, and reinforced bastions',
    cat_siege_title: 'Siege',
    cat_ordnance_title: 'Ordnance',
    cat_economy_title: 'Economy',
    cat_economy_sub: 'Generates essential realm currency over time to fund your defenses',
    currencyProducer: 'Producer',
    producesCurrency: 'Generates Realm Currency',
    available: 'Available',
    remove: 'Remove',
    demolish_tooltip: 'Demolish: Clear a defender to free up battlefield space',
    squadIncompleteTitle: 'Incomplete Squad',
    squadIncompleteWarning: 'Your squad only has {current} of {max} defenders selected. Are you sure you want to march into battle without a full roster?',
    noProducerTitle: 'No Producing Units',
    squadWarningTitle: 'Squad Warning',
    noProducerWarning: 'You have not selected any {currency} producing units (such as {producer}). Without generating {currencyName}, you will struggle to summon reinforcements as the battle progresses! Are you sure you want to proceed?',
    noProducerAndIncompleteWarning: 'Your squad has empty slots and NO {currency} producing units selected! Without generating {currencyName}, deploying new defenses will be extremely difficult. Are you sure you want to proceed?',
    noProducerAlert: 'Missing Currency Producer',
    proceedAnyway: 'Continue Anyway',
    adjustSquad: 'Adjust Squad',
    def_sunflower_name: 'Solflower',
    def_sunflower_desc: 'Yggdrasil sun-blossom that channels +25 native realm currency every 10 seconds.',
    def_sunflower_tooltip: 'Solflower: Essential economy generator producing native realm currency over time.',
    def_sunflower_role: 'Economy Generator',
    def_sunflower_midgard_name: 'Solflower',
    def_sunflower_midgard_desc: 'Yggdrasil sun-blossom that channels +25 Hacksilver every 10 seconds.',
    def_sunflower_midgard_tooltip: 'Solflower: Essential economy generator producing golden Hacksilver over time.',
    def_sunflower_midgard_role: 'Solar Flora',
    def_sunflower_asgard_name: 'Draupnir Font',
    def_sunflower_asgard_desc: 'Celestial Aesir font blessed by Odin that drips +25 Draupnir Gold every 10 seconds.',
    def_sunflower_asgard_tooltip: 'Draupnir Font: Sacred celestial pedestal multiplying Draupnir Gold over time.',
    def_sunflower_asgard_role: 'Celestial Shrine',
    def_sunflower_svartalfheim_name: 'Forge Bellows',
    def_sunflower_svartalfheim_desc: 'Geothermal dwarven crucible and bellows casting +25 Dwarven Ingots every 10 seconds.',
    def_sunflower_svartalfheim_tooltip: 'Forge Bellows: Subterranean smelting furnace producing Dwarven Ingots over time.',
    def_sunflower_svartalfheim_role: 'Smelting Foundry',
    def_sunflower_alfheim_name: 'Sunstone Prism',
    def_sunflower_alfheim_desc: 'Luminous crystalline lotus refracting aurora rays into +25 Sunstones every 10 seconds.',
    def_sunflower_alfheim_tooltip: 'Sunstone Prism: Luminous crystalline lotus condensing Sunstones over time.',
    def_sunflower_alfheim_role: 'Crystal Condenser',
    def_sunflower_vanaheim_name: 'Amber Sapling',
    def_sunflower_vanaheim_desc: 'Sacred Yggdrasil sapling from Freyja’s groves weeping +25 Golden Amber every 10 seconds.',
    def_sunflower_vanaheim_tooltip: 'Amber Sapling: Blessed golden tree sprout producing Golden Amber over time.',
    def_sunflower_vanaheim_role: 'Living Grove',
    def_sunflower_jotunheim_name: 'Rime Geyser',
    def_sunflower_jotunheim_desc: 'Glacial Utgard ice monolith venting blizzard energy into +25 Rime Shards every 10 seconds.',
    def_sunflower_jotunheim_tooltip: 'Rime Geyser: Frozen elemental monolith producing Rime Shards over time.',
    def_sunflower_jotunheim_role: 'Glacial Obelisk',
    def_sunflower_niflheim_name: 'Hvergelmir Well',
    def_sunflower_niflheim_desc: 'Primordial dark-slate well tapping ancient springs to distill +25 Mist Crystals every 10 seconds.',
    def_sunflower_niflheim_tooltip: 'Hvergelmir Well: Primordial vapor shrine distilling Mist Crystals over time.',
    def_sunflower_niflheim_role: 'Vapor Shrine',
    def_sunflower_muspelheim_name: 'Magma Font',
    def_sunflower_muspelheim_desc: 'Obsidian brazier brimming with Surtr’s magma that manifests +25 Fire Embers every 10 seconds.',
    def_sunflower_muspelheim_tooltip: 'Magma Font: Volcanic fire cauldron forging Fire Embers over time.',
    def_sunflower_muspelheim_role: 'Molten Brazier',
    def_sunflower_helheim_name: 'Soul Beacon',
    def_sunflower_helheim_desc: 'Chained underworld cemetery lantern gathering departed spirits for +25 Soul Obols every 10 seconds.',
    def_sunflower_helheim_tooltip: 'Soul Beacon: Spectral underworld lantern collecting Soul Obols over time.',
    def_sunflower_helheim_role: 'Spirit Beacon',
    def_peashooter_name: 'Peashooter',
    def_peashooter_desc: 'Kinetic seedling that rapidly fires mystic energy orbs at approaching invaders.',
    def_peashooter_tooltip: 'Peashooter: Reliable ranged attacker firing mystic orbs down the row.',
    def_peashooter_role: 'Ranged Attacker',
    def_repeater_name: 'Repeater',
    def_repeater_desc: 'Ancient twin-stem flora that rapidly launches twin kinetic projectiles in succession.',
    def_repeater_tooltip: 'Repeater: Heavy ranged attacker firing two projectiles per volley.',
    def_repeater_role: 'Heavy Barrage',
    def_chomper_name: 'Chomper',
    def_chomper_desc: 'Carnivorous underworld vine that lunges to devour a nearby invader whole in one bite.',
    def_chomper_tooltip: 'Chomper: Devours tough enemies instantly, but takes time to chew and digest.',
    def_chomper_role: 'Burst Devour',
    def_snowpea_name: 'Frost Sprite',
    def_snowpea_desc: 'Glacial spirit that fires freezing frost crystals, slowing enemy movement by 50%.',
    def_snowpea_tooltip: 'Frost Sprite: Fires icy shards that slow and cripple approaching invaders.',
    def_snowpea_role: 'Crowd Control',
    def_wallnut_name: 'Rune Bastion',
    def_wallnut_desc: 'Heavily fortified stone tower clad in Norse Odal runes, enduring massive enemy assaults.',
    def_wallnut_tooltip: 'Rune Bastion: Sturdy stone fortification tower with high defensive vitality.',
    def_wallnut_role: 'Defensive Bastion',
    def_torchwood_name: 'Fire Spire',
    def_torchwood_desc: 'Arcane obsidian spire that ignites passing projectiles into flaming fury for double damage.',
    def_torchwood_tooltip: 'Fire Spire: Arcane fire spire amplifying and igniting passing projectiles.',
    def_torchwood_role: 'Fire Amplification',
    def_potatomine_name: 'Rune Mine',
    def_potatomine_desc: 'Subterranean runic ward mine that arms over 14 seconds and vaporizes invaders on contact.',
    def_potatomine_tooltip: 'Rune Mine: Subterranean runic ward mine that erupts on enemy contact.',
    def_potatomine_role: 'Runic Trap',
    def_kernelpult_name: 'Dwarven Catapult',
    def_kernelpult_desc: 'Heavy siege engine lobbing crushing runic boulders and sticky pitch flasks that pin enemies.',
    def_kernelpult_tooltip: 'Dwarven Catapult: Heavy dwarven siege engine hurling boulders and tar.',
    def_kernelpult_role: 'Siege Artillery',
    def_cherrybomb_name: 'Forge Blaster',
    def_cherrybomb_desc: 'Magma ordnance charge that detonates instantly in a devastating 3x3 explosive cataclysm.',
    def_cherrybomb_tooltip: 'Forge Blaster: High-yield magma explosive charge detonating in a 3x3 blast.',
    def_cherrybomb_role: 'High-Yield Magma',
    def_jalapeno_name: 'Forge Dragonfire',
    def_jalapeno_desc: 'Channels a searing thermal line of dragonfire incinerating an entire row of invaders.',
    def_jalapeno_tooltip: 'Forge Dragonfire: Unleashes an incinerating column of fire down the whole lane.',
    def_jalapeno_role: 'Dragonfire Line',
    def_einherjar_name: 'Asgard Einherjar',
    def_einherjar_desc: 'Elevated celestial champion standing atop a marble watchtower, cleaving enemies with Gungnir.',
    def_einherjar_tooltip: 'Asgard Einherjar: Celestial champion atop a watchtower delivering devastating melee strikes.',
    def_einherjar_role: 'Celestial Sentinel',
    emergency_defense_title_ready: '🌊 Hydraulic Torrent Ram',
    emergency_defense_title_discharged: '✕ Torrent Ram (Discharged)',
    emergency_defense_status_armed: 'Emergency Lane Defense · Armed',
    emergency_defense_status_spent: 'Emergency defense spent for this row',
    action_plant: '✦ Plant {name} ✦',
    action_build: '✦ Build {name} ✦',
    plant: 'Plant',
    build: 'Build',
    occupied: 'Occupied',
    wave_header: 'ᚹ ᚨ ᚡ ᛖ   ·   Wave {current}',
    wave_warning_header: 'ᚠ ᛁ ᛗ ᛒ ᚢ ᛚ ᚹ ᛁ ᚾ ᛏ ᛖ ᚱ   ·   Wave {current}',
    wave_scout_call: '⚔️ Enemy Scout Approaching! ⚔️',
    wave_standard_call: '⚔️ Enemy Wave Advancing ({count}) ⚔️',
    wave_major_call: '⚔️ A Large Wave of Enemies Approaches! ⚔️',
    wave_final_call: '❄️ Fimbulwinter Deepens — No Force Can Stop the Winter! ❄️',
    defeat_title: 'Fimbulwinter Claims the Realm',
    defeat_winter_sub: 'No defense — nor boundless wealth — can stop the Great Winter.',
    defeat_stats: 'Waves Endured: {waves}  ·  Invaders Felled: {kills}'
  }
};

export const ratatoskrQuotes: Record<string, string[]> = {
  en: [
    '❄ Fimbulwinter is here!',
    '🌰 Got an acorn for me?',
    '✦ I speak for Yggdrasil!',
    '✧ The Frost Giants stir!',
    '⚔ Defend the Nine Realms!',
    '🐿️ Scurry, scurry, scurry!',
    '✦ Whispers from the crown!',
    '❄ The cold winds howl!',
    '✧ Keep your guard up!',
    '🌰 Foraging for winter!'
  ]
};

const pendingLoads: Partial<Record<SupportedLang, Promise<void>>> = {};

export async function ensureLocaleLoaded(lang: string): Promise<void> {
  if (!isSupportedLang(lang) || lang === 'en' || translations[lang]) {
    return;
  }
  if (pendingLoads[lang]) {
    return pendingLoads[lang];
  }
  const loadPromise = (async () => {
    let mod: { dict: Record<string, string>; quotes: string[] };
    switch (lang) {
      case 'de':
        mod = await import('./locales/de');
        break;
      case 'id':
        mod = await import('./locales/id');
        break;
      case 'bs':
        mod = await import('./locales/bs');
        break;
      case 'pl':
        mod = await import('./locales/pl');
        break;
      case 'sr-Cyrl':
        mod = await import('./locales/sr-Cyrl');
        break;
    }
    translations[lang] = mod.dict;
    ratatoskrQuotes[lang] = mod.quotes;
  })().finally(() => {
    delete pendingLoads[lang];
  });
  pendingLoads[lang] = loadPromise;
  return loadPromise;
}

let cachedCurrentLang: SupportedLang = 'en';

export function detectLang(): SupportedLang {
  if (typeof document !== 'undefined') {
    const docLang = document.body?.dataset?.lang || document.documentElement?.lang;
    if (isSupportedLang(docLang)) return docLang;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('ragnarok_lang');
      if (isSupportedLang(saved)) return saved;
    } catch (_) {}
  }
  return 'en';
}

cachedCurrentLang = detectLang();

if (typeof window !== 'undefined') {
  window.addEventListener('languagechange', (e: any) => {
    const lang = e?.detail?.lang;
    if (isSupportedLang(lang)) {
      cachedCurrentLang = lang;
    } else {
      cachedCurrentLang = detectLang();
    }
  });
}

export function setCurrentLang(lang: SupportedLang): void {
  if (isSupportedLang(lang)) {
    cachedCurrentLang = lang;
  }
}

export function getCurrentLang(): SupportedLang {
  return cachedCurrentLang;
}

export function t(key: string, lang?: string): string {
  const current = lang || cachedCurrentLang;
  const dict = translations[current] || translations['en'];
  return dict[key] || translations['en']?.[key] || key;
}

export function getRatatoskrQuotes(lang?: string): string[] {
  const current = lang || getCurrentLang();
  return ratatoskrQuotes[current] || ratatoskrQuotes['en'];
}
