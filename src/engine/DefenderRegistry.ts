import { t } from '../i18n';
import { DEFENDER_ICONS } from './DefenderIcons';
import { getSlotLimitForLevel } from './GameConfig';

export type DefenderCategory = 'plants' | 'towers';

export type WorldId =
  | 'svartalfheim'
  | 'vanaheim'
  | 'asgard'
  | 'midgard'
  | 'jotunheim'
  | 'niflheim'
  | 'muspelheim'
  | 'helheim'
  | 'alfheim';

export interface WorldMeta {
  id: WorldId;
  name: string;
  title: string;
  sub: string;
  icon: string;
  rune: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const WORLDS: Record<WorldId, WorldMeta> = {
  svartalfheim: {
    id: 'svartalfheim',
    name: 'Svartalfheim',
    title: 'Realm of Dwarves',
    sub: 'Great Subterranean Forges',
    icon: '⚒️',
    rune: 'ᚲ',
    color: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.18)',
    badgeBorder: 'rgba(249, 115, 22, 0.45)'
  },
  vanaheim: {
    id: 'vanaheim',
    name: 'Vanaheim',
    title: 'Realm of Nature',
    sub: 'Wild Primordial Sanctuary',
    icon: '🌿',
    rune: 'ᚹ',
    color: '#4ade80',
    badgeBg: 'rgba(74, 222, 128, 0.18)',
    badgeBorder: 'rgba(74, 222, 128, 0.45)'
  },
  asgard: {
    id: 'asgard',
    name: 'Asgard',
    title: 'Realm of the Aesir',
    sub: 'Golden City of the Gods',
    icon: '⚡',
    rune: 'ᚨ',
    color: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.18)',
    badgeBorder: 'rgba(251, 191, 36, 0.45)'
  },
  midgard: {
    id: 'midgard',
    name: 'Midgard',
    title: 'Realm of Mortals',
    sub: 'Heart of the World Tree',
    icon: '🌱',
    rune: 'ᛗ',
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)'
  },
  jotunheim: {
    id: 'jotunheim',
    name: 'Jötunheim',
    title: 'Realm of Frost Giants',
    sub: 'Barren Glacial Peaks',
    icon: '❄️',
    rune: 'ᚦ',
    color: '#22d3ee',
    badgeBg: 'rgba(34, 211, 238, 0.18)',
    badgeBorder: 'rgba(34, 211, 238, 0.45)'
  },
  niflheim: {
    id: 'niflheim',
    name: 'Niflheim',
    title: 'Realm of Ice and Mist',
    sub: 'Primordial Frozen Mist',
    icon: '🌫️',
    rune: 'ᛁ',
    color: '#a5f3fc',
    badgeBg: 'rgba(165, 243, 252, 0.18)',
    badgeBorder: 'rgba(165, 243, 252, 0.45)'
  },
  muspelheim: {
    id: 'muspelheim',
    name: 'Muspelheim',
    title: 'Realm of Fire',
    sub: 'Domain of Lord Surtr',
    icon: '🔥',
    rune: 'ᛊ',
    color: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    badgeBorder: 'rgba(239, 68, 68, 0.45)'
  },
  helheim: {
    id: 'helheim',
    name: 'Helheim',
    title: 'Realm of the Dead',
    sub: 'Silent Obsidian Domain',
    icon: '💀',
    rune: 'ᚺ',
    color: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.18)',
    badgeBorder: 'rgba(148, 163, 184, 0.45)'
  },
  alfheim: {
    id: 'alfheim',
    name: 'Alfheim',
    title: 'Realm of Light Elves',
    sub: 'Luminous Fairy Meadows',
    icon: '✨',
    rune: 'ᛉ',
    color: '#f472b6',
    badgeBg: 'rgba(244, 114, 182, 0.18)',
    badgeBorder: 'rgba(244, 114, 182, 0.45)'
  }
};

export interface CategoryMeta {
  id: DefenderCategory;
  name: string;
  icon: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const CATEGORIES: Record<DefenderCategory, CategoryMeta> = {
  plants: {
    id: 'plants',
    name: 'Sacred Plants',
    icon: DEFENDER_ICONS.cat_plants,
    subtitle: 'Living floral spirits nurtured by the roots of Yggdrasil',
    color: '#4caf50',
    badgeBg: 'rgba(76, 175, 80, 0.18)',
    badgeBorder: 'rgba(76, 175, 80, 0.45)'
  },
  towers: {
    id: 'towers',
    name: 'Towers',
    icon: DEFENDER_ICONS.cat_towers,
    subtitle: 'Ancient runic fortifications, artillery, spires, and bastions',
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)'
  }
};

export interface DefenderInfo {
  id: string;
  name: string;
  category: DefenderCategory;
  categoryName: string;
  cost: number;
  icon: string;
  desc: string;
  tooltip: string;
  role: string;
  origin: string;
  world: WorldId;
  hotkey?: string;
}

export const REALM_SUNFLOWERS: Record<string, DefenderInfo> = {
  midgard: {
    id: 'sunflower',
    name: 'Solflower',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower,
    desc: 'Yggdrasil sun-blossom that channels +25 radiant Hacksilver every 10 seconds.',
    tooltip: 'Solflower: Essential economy generator producing golden Hacksilver over time.',
    role: 'Solar Flora',
    origin: 'Midgard',
    world: 'midgard'
  },
  asgard: {
    id: 'sunflower_asgard',
    name: 'Draupnir Font',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_asgard,
    desc: 'Celestial Aesir font blessed by Odin that drips +25 Draupnir Gold every 10 seconds.',
    tooltip: 'Draupnir Font: Sacred celestial pedestal multiplying Draupnir Gold over time.',
    role: 'Celestial Shrine',
    origin: 'Asgard',
    world: 'asgard'
  },
  svartalfheim: {
    id: 'sunflower_svartalfheim',
    name: 'Forge Bellows',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_svartalfheim,
    desc: 'Geothermal dwarven crucible and bellows casting +25 Dwarven Ingots every 10 seconds.',
    tooltip: 'Forge Bellows: Subterranean smelting furnace producing Dwarven Ingots over time.',
    role: 'Smelting Foundry',
    origin: 'Svartalfheim',
    world: 'svartalfheim'
  },
  alfheim: {
    id: 'sunflower_alfheim',
    name: 'Sunstone Prism',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_alfheim,
    desc: 'Luminous crystalline lotus refracting aurora rays into +25 Sunstones every 10 seconds.',
    tooltip: 'Sunstone Prism: Luminous crystalline lotus condensing Sunstones over time.',
    role: 'Crystal Condenser',
    origin: 'Alfheim',
    world: 'alfheim'
  },
  vanaheim: {
    id: 'sunflower_vanaheim',
    name: 'Amber Sapling',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_vanaheim,
    desc: 'Sacred Yggdrasil sapling from Freyja’s groves weeping +25 Golden Amber every 10 seconds.',
    tooltip: 'Amber Sapling: Blessed golden tree sprout producing Golden Amber over time.',
    role: 'Living Grove',
    origin: 'Vanaheim',
    world: 'vanaheim'
  },
  jotunheim: {
    id: 'sunflower_jotunheim',
    name: 'Rime Geyser',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_jotunheim,
    desc: 'Glacial Utgard ice monolith venting blizzard energy into +25 Rime Shards every 10 seconds.',
    tooltip: 'Rime Geyser: Frozen elemental monolith producing Rime Shards over time.',
    role: 'Glacial Obelisk',
    origin: 'Jötunheim',
    world: 'jotunheim'
  },
  niflheim: {
    id: 'sunflower_niflheim',
    name: 'Hvergelmir Well',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_niflheim,
    desc: 'Primordial dark-slate well tapping ancient springs to distill +25 Mist Crystals every 10 seconds.',
    tooltip: 'Hvergelmir Well: Primordial vapor shrine distilling Mist Crystals over time.',
    role: 'Vapor Shrine',
    origin: 'Niflheim',
    world: 'niflheim'
  },
  muspelheim: {
    id: 'sunflower_muspelheim',
    name: 'Magma Font',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_muspelheim,
    desc: 'Obsidian brazier brimming with Surtr’s magma that manifests +25 Fire Embers every 10 seconds.',
    tooltip: 'Magma Font: Volcanic fire cauldron forging Fire Embers over time.',
    role: 'Molten Brazier',
    origin: 'Muspelheim',
    world: 'muspelheim'
  },
  helheim: {
    id: 'sunflower_helheim',
    name: 'Soul Beacon',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower_helheim,
    desc: 'Chained underworld cemetery lantern gathering departed spirits for +25 Soul Obols every 10 seconds.',
    tooltip: 'Soul Beacon: Spectral underworld lantern collecting Soul Obols over time.',
    role: 'Spirit Beacon',
    origin: 'Helheim',
    world: 'helheim'
  }
};

export function getSunflowerForRealm(realm?: string): DefenderInfo {
  const norm = (realm || 'midgard').toLowerCase().trim();
  return REALM_SUNFLOWERS[norm] || REALM_SUNFLOWERS.midgard;
}

export const DEFENDERS_LIST: DefenderInfo[] = [
  // 🌿 Category: Sacred Plants
  {
    id: 'sunflower',
    name: 'Solflower',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 50,
    icon: DEFENDER_ICONS.sunflower,
    desc: 'Yggdrasil sun-blossom that channels +25 radiant Hacksilver every 10 seconds.',
    tooltip: 'Solflower: Essential economy generator producing golden Hacksilver over time.',
    role: 'Solar Flora',
    origin: 'Midgard',
    world: 'midgard'
  },
  {
    id: 'peashooter',
    name: 'Peashooter',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 100,
    icon: DEFENDER_ICONS.peashooter,
    desc: 'Kinetic seedling that rapidly fires mystic energy orbs at approaching invaders.',
    tooltip: 'Peashooter: Reliable ranged attacker firing mystic orbs down the row.',
    role: 'Ranged DPS',
    origin: 'Vanaheim',
    world: 'vanaheim'
  },
  {
    id: 'repeater',
    name: 'Repeater',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 200,
    icon: DEFENDER_ICONS.repeater,
    desc: 'Ancient twin-stem flora that rapidly launches twin kinetic projectiles in succession.',
    tooltip: 'Repeater: Heavy ranged attacker firing two projectiles per volley.',
    role: 'Heavy Barrage',
    origin: 'Vanaheim',
    world: 'vanaheim'
  },
  {
    id: 'chomper',
    name: 'Chomper',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 150,
    icon: DEFENDER_ICONS.chomper,
    desc: 'Carnivorous underworld vine that lunges to devour a nearby invader whole in one bite.',
    tooltip: 'Chomper: Devours tough enemies instantly, but takes time to chew and digest.',
    role: 'Burst Devour',
    origin: 'Helheim',
    world: 'helheim'
  },
  {
    id: 'snowpea',
    name: 'Frost Sprite',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 175,
    icon: DEFENDER_ICONS.snowpea,
    desc: 'Ethereal frost spirit from Niflheim whose icy shards pierce invaders and slow their movement by 50%.',
    tooltip: 'Frost Sprite (Snow Pea): Fires slowing frost shards that cut enemy advance speed in half.',
    role: 'Frost & Slow',
    origin: 'Niflheim',
    world: 'niflheim'
  },

  // 🏰 Category: Towers
  {
    id: 'wallnut',
    name: 'Rune Bastion',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: DEFENDER_ICONS.wallnut,
    desc: 'Fortified Norse stone bastion tower with colossal vitality (4000 HP) that blocks advancing hordes.',
    tooltip: 'Rune Bastion: High-health fortress bastion tower to buy crucial time for your defense line.',
    role: 'Defensive Bastion',
    origin: 'Jötunheim',
    world: 'jotunheim'
  },
  {
    id: 'torchwood',
    name: 'Fire Spire',
    category: 'towers',
    categoryName: 'Tower',
    cost: 175,
    icon: DEFENDER_ICONS.torchwood,
    desc: 'Blazing arcane beacon spire tower that ignites passing projectiles into devastating fireballs dealing double damage.',
    tooltip: 'Fire Spire: Arcane beacon tower that ignites projectiles into blazing fireballs for massive bonus damage.',
    role: 'Damage Amplifier',
    origin: 'Muspelheim',
    world: 'muspelheim'
  },
  {
    id: 'potatomine',
    name: 'Rune Mine',
    category: 'towers',
    categoryName: 'Tower',
    cost: 25,
    icon: DEFENDER_ICONS.potatomine,
    desc: 'Subterranean runic ward monolith tower. Takes 14 seconds to arm, then detonates for 1800 contact damage.',
    tooltip: 'Rune Mine: Low-cost runic ward tower. Arms underground and eliminates the first enemy that steps on it.',
    role: 'Ambush Ward',
    origin: 'Svartalfheim',
    world: 'svartalfheim'
  },
  {
    id: 'kernelpult',
    name: 'Dwarven Catapult',
    category: 'towers',
    categoryName: 'Tower',
    cost: 100,
    icon: DEFENDER_ICONS.kernelpult,
    desc: 'Artisan dwarven siege catapult tower that lobs runic boulders and adhesive pitch flasks that immobilize foes.',
    tooltip: 'Dwarven Catapult: Artillery siege tower that lobs heavy boulders and paralyzing adhesive pitch.',
    role: 'Siege Artillery',
    origin: 'Svartalfheim',
    world: 'svartalfheim'
  },
  {
    id: 'cherrybomb',
    name: 'Forge Blaster',
    category: 'towers',
    categoryName: 'Tower',
    cost: 150,
    icon: DEFENDER_ICONS.cherrybomb,
    desc: 'Heavy dwarven magma blast ordnance turret that detonates instantly in a devastating 3x3 radius.',
    tooltip: 'Forge Blaster: Instant area-of-effect blast ordnance turret that obliterates tight enemy clusters.',
    role: 'Area Demolition',
    origin: 'Svartalfheim',
    world: 'svartalfheim'
  },
  {
    id: 'jalapeno',
    name: 'Forge Dragonfire',
    category: 'towers',
    categoryName: 'Tower',
    cost: 125,
    icon: DEFENDER_ICONS.jalapeno,
    desc: 'Unleashes Nidavellir blast furnace dragonfire, incinerating all invaders across an entire lane for 1000 damage.',
    tooltip: 'Forge Dragonfire: Instant row cleanser that obliterates every invader in the chosen lane.',
    role: 'Lane Annihilation',
    origin: 'Svartalfheim',
    world: 'svartalfheim'
  },
  {
    id: 'einherjar',
    name: 'Asgard Einherjar',
    category: 'towers',
    categoryName: 'Tower',
    cost: 225,
    icon: DEFENDER_ICONS.einherjar,
    desc: 'Celestial Asgardian watchtower manned by an elite Einherjar champion casting radiant light spears.',
    tooltip: 'Asgard Einherjar: Celestial watchtower with an elite Asgardian warrior casting lethal radiant lances.',
    role: 'Celestial Watchtower',
    origin: 'Asgard',
    world: 'asgard'
  }
];

export const DEFENDERS_MAP: Record<string, DefenderInfo> = {
  ...DEFENDERS_LIST.reduce((acc, def) => {
    acc[def.id] = def;
    return acc;
  }, {} as Record<string, DefenderInfo>),
  ...Object.values(REALM_SUNFLOWERS).reduce((acc, def) => {
    acc[def.id] = def;
    return acc;
  }, {} as Record<string, DefenderInfo>),
  sunflower_midgard: REALM_SUNFLOWERS.midgard
};

export const CITY_LEVELS: Record<string, number> = {
  'althjofs-wheel': 1,
  'andvaris-falls': 2,
  'ivaldis-workshop': 3,
  'jarnsmida-quarry': 4,
  'dvalins-depths': 5,
  'sindris-forge': 6,
  'nidavellir': 7
};

/**
 * Calculates squad capacity based on player level.
 * Level 1: 4
 * Level 2: 5
 * Level 3: 6
 * Level 4: 7
 * Level 5: 8
 * Level 6: 9
 * Level 7+: 10 (Up to 10 out of 12 available defenders)
 */
export function getDefenderSlotLimit(level: number): number {
  return getSlotLimitForLevel(level);
}

const PRIORITY_ORDER = [
  'sunflower',
  'peashooter',
  'wallnut',
  'potatomine',
  'snowpea',
  'repeater',
  'kernelpult',
  'chomper',
  'cherrybomb',
  'einherjar',
  'torchwood',
  'jalapeno'
];

export function getRecommendedLoadout(level: number): string[] {
  const limit = getDefenderSlotLimit(level);
  return PRIORITY_ORDER.slice(0, limit);
}

export function getSavedLoadout(level: number): string[] {
  const limit = getDefenderSlotLimit(level);
  try {
    const raw = localStorage.getItem('ragnarok_selected_defenders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(id => DEFENDERS_MAP[id]);
        if (valid.length > 0) {
          if (valid.length < limit) {
            for (const rec of PRIORITY_ORDER) {
              if (!valid.includes(rec)) {
                valid.push(rec);
                if (valid.length >= limit) break;
              }
            }
          }
          return valid.slice(0, limit);
        }
      }
    }
  } catch (e) {}
  return getRecommendedLoadout(level);
}

export function saveLoadout(defenders: string[]) {
  try {
    localStorage.setItem('ragnarok_selected_defenders', JSON.stringify(defenders));
  } catch (e) {}
}

export function getLocalizedDefender(def: DefenderInfo, realm?: string): DefenderInfo {
  const isSunflower = def.id === 'sunflower' || def.id.startsWith('sunflower_');
  const effectiveRealm = realm ? realm.toLowerCase().trim() : (def.origin ? def.origin.toLowerCase().trim() : 'midgard');

  const nameKey = isSunflower ? `def_sunflower_${effectiveRealm}_name` : `def_${def.id}_name`;
  const descKey = isSunflower ? `def_sunflower_${effectiveRealm}_desc` : `def_${def.id}_desc`;
  const tooltipKey = isSunflower ? `def_sunflower_${effectiveRealm}_tooltip` : `def_${def.id}_tooltip`;
  const roleKey = isSunflower ? `def_sunflower_${effectiveRealm}_role` : `def_${def.id}_role`;
  const originKey = `world_${def.origin.toLowerCase()}`;
  const catKey = `cat_${def.category}_title`;

  let name = t(nameKey) !== nameKey ? t(nameKey) : def.name;
  if (name === nameKey) {
    name = t(`def_${def.id}_name`) !== `def_${def.id}_name` ? t(`def_${def.id}_name`) : def.name;
  }
  let desc = t(descKey) !== descKey ? t(descKey) : def.desc;
  if (desc === descKey) {
    desc = t(`def_${def.id}_desc`) !== `def_${def.id}_desc` ? t(`def_${def.id}_desc`) : def.desc;
  }
  let tooltip = t(tooltipKey) !== tooltipKey ? t(tooltipKey) : def.tooltip;
  if (tooltip === tooltipKey) {
    tooltip = t(`def_${def.id}_tooltip`) !== `def_${def.id}_tooltip` ? t(`def_${def.id}_tooltip`) : def.tooltip;
  }
  let role = t(roleKey) !== roleKey ? t(roleKey) : def.role;
  if (role === roleKey) {
    role = t(`def_${def.id}_role`) !== `def_${def.id}_role` ? t(`def_${def.id}_role`) : def.role;
  }
  const origin = t(originKey) !== originKey ? t(originKey) : def.origin;
  const categoryName = t(catKey) !== catKey ? t(catKey) : def.categoryName;

  return {
    ...def,
    name,
    desc,
    tooltip,
    role,
    origin,
    categoryName
  };
}

export function getDefendersListForRealm(realm?: string): DefenderInfo[] {
  const normRealm = (realm || 'midgard').toLowerCase().trim() as WorldId;
  const realmSunflower = getSunflowerForRealm(normRealm);
  const contextualSunflower: DefenderInfo = {
    ...realmSunflower,
    id: 'sunflower',
    world: normRealm
  };
  return DEFENDERS_LIST.map(def => {
    if (def.id === 'sunflower') {
      return contextualSunflower;
    }
    return def;
  });
}

export function getLocalizedDefendersList(realm?: string): DefenderInfo[] {
  const list = realm ? getDefendersListForRealm(realm) : DEFENDERS_LIST;
  return list.map(d => getLocalizedDefender(d, realm));
}

export function getLocalizedDefendersMap(realm?: string): Record<string, DefenderInfo> {
  const map: Record<string, DefenderInfo> = {};
  const list = realm ? getDefendersListForRealm(realm) : DEFENDERS_LIST;
  for (const def of list) {
    map[def.id] = getLocalizedDefender(def, realm);
  }
  return map;
}

export function getDefenderInfo(id: string, realm?: string): DefenderInfo | undefined {
  let base: DefenderInfo | undefined;
  if (id === 'sunflower' || id.startsWith('sunflower_')) {
    if (realm) {
      base = { ...getSunflowerForRealm(realm), id };
    } else if (id.startsWith('sunflower_')) {
      const targetRealm = id.replace('sunflower_', '');
      base = { ...getSunflowerForRealm(targetRealm), id };
    } else {
      base = DEFENDERS_MAP[id] || REALM_SUNFLOWERS.midgard;
    }
  } else {
    base = DEFENDERS_MAP[id];
  }
  if (!base) return undefined;
  return getLocalizedDefender(base, realm);
}

export interface WorldDefendersGroup {
  world: WorldMeta;
  defenders: DefenderInfo[];
  isHomeWorld: boolean;
}

export function getWorldMeta(worldId?: string): WorldMeta {
  const norm = (worldId || 'midgard').toLowerCase().trim() as WorldId;
  return WORLDS[norm] || WORLDS.midgard;
}

export function getDefendersGroupedByWorld(realm?: string): WorldDefendersGroup[] {
  const normRealm = (realm || 'midgard').toLowerCase().trim() as WorldId;
  const defendersList = getDefendersListForRealm(normRealm);

  const groupsMap = new Map<WorldId, DefenderInfo[]>();
  for (const def of defendersList) {
    const wId = (def.world || def.origin.toLowerCase()) as WorldId;
    if (!groupsMap.has(wId)) {
      groupsMap.set(wId, []);
    }
    groupsMap.get(wId)!.push(def);
  }

  // Canonical ordering of Nine Realms across Yggdrasil
  const canonicalOrder: WorldId[] = [
    'svartalfheim',
    'vanaheim',
    'asgard',
    'midgard',
    'jotunheim',
    'muspelheim',
    'niflheim',
    'helheim',
    'alfheim'
  ];

  // Reorder so that the active defending realm (Home Realm) appears first!
  const orderedWorldIds: WorldId[] = [
    normRealm,
    ...canonicalOrder.filter(id => id !== normRealm)
  ];

  const result: WorldDefendersGroup[] = [];
  for (const wId of orderedWorldIds) {
    const units = groupsMap.get(wId);
    if (units && units.length > 0) {
      result.push({
        world: WORLDS[wId] || {
          id: wId,
          name: wId.replace(/\b\w/g, c => c.toUpperCase()),
          title: `Realm of ${wId}`,
          sub: '',
          icon: '✦',
          rune: 'ᛟ',
          color: '#ffd700',
          badgeBg: 'rgba(255, 215, 0, 0.18)',
          badgeBorder: 'rgba(255, 215, 0, 0.45)'
        },
        defenders: units,
        isHomeWorld: wId === normRealm
      });
    }
  }

  return result;
}
