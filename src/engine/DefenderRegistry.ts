export type DefenderCategory = 'plants' | 'towers' | 'dwarves' | 'allies';

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
    icon: '🌿',
    subtitle: 'Living floral spirits nurtured by the roots of Yggdrasil',
    color: '#4caf50',
    badgeBg: 'rgba(76, 175, 80, 0.18)',
    badgeBorder: 'rgba(76, 175, 80, 0.45)'
  },
  towers: {
    id: 'towers',
    name: 'Bastions & Towers',
    icon: '🏰',
    subtitle: 'Ancient runic fortifications, barriers and offensive spires',
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)'
  },
  dwarves: {
    id: 'dwarves',
    name: 'Dwarven Artificers',
    icon: '⚒️',
    subtitle: 'Svartalfheim siege engineering, catapults and black powder explosives',
    color: '#ea580c',
    badgeBg: 'rgba(234, 88, 12, 0.18)',
    badgeBorder: 'rgba(234, 88, 12, 0.45)'
  },
  allies: {
    id: 'allies',
    name: 'Realm Helpers',
    icon: '✨',
    subtitle: 'Divine celestial champions and mystical spirits from across the Nine Realms',
    color: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    badgeBorder: 'rgba(168, 85, 247, 0.45)'
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
  hotkey?: string;
}

export const DEFENDERS_LIST: DefenderInfo[] = [
  // 🌿 Category: Sacred Plants
  {
    id: 'sunflower',
    name: 'Solflower',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 50,
    icon: '🌻',
    desc: 'Yggdrasil sun-blossom that channels +25 radiant Sol energy every 10 seconds.',
    tooltip: 'Solflower: Essential economy generator producing golden Sol energy over time.',
    role: 'Energy Generation',
    origin: 'Midgard'
  },
  {
    id: 'peashooter',
    name: 'Peashooter',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 100,
    icon: '🟢',
    desc: 'Kinetic seedling that rapidly fires mystic energy orbs at approaching invaders.',
    tooltip: 'Peashooter: Reliable ranged attacker firing mystic orbs down the row.',
    role: 'Ranged DPS',
    origin: 'Vanaheim'
  },
  {
    id: 'repeater',
    name: 'Repeater',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 200,
    icon: '🌿',
    desc: 'Ancient twin-stem flora that rapidly launches twin kinetic projectiles in succession.',
    tooltip: 'Repeater: Heavy ranged attacker firing two projectiles per volley.',
    role: 'Heavy Barrage',
    origin: 'Vanaheim'
  },
  {
    id: 'chomper',
    name: 'Chomper',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 150,
    icon: '🪴',
    desc: 'Carnivorous underworld vine that lunges to devour a nearby invader whole in one bite.',
    tooltip: 'Chomper: Devours tough enemies instantly, but takes time to chew and digest.',
    role: 'Burst Devour',
    origin: 'Helheim'
  },

  // 🏰 Category: Bastions & Towers
  {
    id: 'wallnut',
    name: 'Rune Bastion',
    category: 'towers',
    categoryName: 'Fortification',
    cost: 50,
    icon: '🛡️',
    desc: 'Petrified runestone barrier with colossal vitality (4000 HP) that blocks advancing hordes.',
    tooltip: 'Rune Bastion (Wall-nut): High-health defensive barricade to buy time for your line.',
    role: 'Defensive Barricade',
    origin: 'Jötunheim'
  },
  {
    id: 'torchwood',
    name: 'Fire Spire',
    category: 'towers',
    categoryName: 'Fortification',
    cost: 175,
    icon: '🔥',
    desc: 'Blazing beacon tower that ignites passing projectiles into devastating fireballs dealing double damage.',
    tooltip: 'Fire Spire (Torchwood): Ignites kinetic projectiles into blazing fireballs for massive bonus damage.',
    role: 'Damage Amplifier',
    origin: 'Muspelheim'
  },
  {
    id: 'potatomine',
    name: 'Rune Mine',
    category: 'towers',
    categoryName: 'Fortification',
    cost: 25,
    icon: '🥔',
    desc: 'Subterranean glyph trap. Takes 14 seconds to prime, then detonates for 1800 contact damage.',
    tooltip: 'Rune Mine: Low-cost explosive trap. Arms underground and eliminates the first enemy that steps on it.',
    role: 'Ambush Trap',
    origin: 'Svartalfheim'
  },

  // ⚒️ Category: Dwarven Artificers
  {
    id: 'kernelpult',
    name: 'Dwarven Catapult',
    category: 'dwarves',
    categoryName: 'Dwarven Siege',
    cost: 100,
    icon: '🌽',
    desc: 'Artisan dwarven trebuchet that lobs projectiles over barriers and hurls sticky butter that immobilizes foes.',
    tooltip: 'Dwarven Catapult (Kernel-pult): Arcing siege weapon that damages and temporarily paralyzes targets.',
    role: 'Lob & Paralyze',
    origin: 'Svartalfheim'
  },
  {
    id: 'cherrybomb',
    name: 'Forge Blaster',
    category: 'dwarves',
    categoryName: 'Dwarven Siege',
    cost: 150,
    icon: '🍒',
    desc: 'Concentrated dwarven black-powder charge that detonates instantly in a devastating 3x3 radius.',
    tooltip: 'Forge Blaster (Cherry Bomb): Instant area-of-effect blast that clears tight clusters of monsters.',
    role: 'Area Demolition',
    origin: 'Svartalfheim'
  },
  {
    id: 'jalapeno',
    name: 'Forge Dragonfire',
    category: 'dwarves',
    categoryName: 'Dwarven Siege',
    cost: 125,
    icon: '🔥',
    desc: 'Unleashes Nidavellir blast furnace dragonfire, incinerating all invaders across an entire lane for 1000 damage.',
    tooltip: 'Forge Dragonfire: Instant row cleanser that obliterates every invader in the chosen lane.',
    role: 'Lane Annihilation',
    origin: 'Svartalfheim'
  },

  // ✨ Category: Realm Helpers
  {
    id: 'snowpea',
    name: 'Frost Sprite',
    category: 'allies',
    categoryName: 'Realm Helper',
    cost: 175,
    icon: '❄️',
    desc: 'Ethereal frost spirit from Niflheim whose icy shards pierce invaders and slow their movement by 50%.',
    tooltip: 'Frost Sprite (Snow Pea): Fires slowing frost shards that cut enemy advance speed in half.',
    role: 'Frost & Slow',
    origin: 'Niflheim'
  },
  {
    id: 'einherjar',
    name: 'Asgard Einherjar',
    category: 'allies',
    categoryName: 'Realm Helper',
    cost: 225,
    icon: '⚡',
    desc: 'Valhalla celestial champion hurled from Asgard, casting radiant light spears that deal 45 damage per strike.',
    tooltip: 'Asgard Einherjar: Elite celestial champion with higher health and lethal radiant lances.',
    role: 'Celestial Champion',
    origin: 'Asgard'
  }
];

export const DEFENDERS_MAP: Record<string, DefenderInfo> = DEFENDERS_LIST.reduce((acc, def) => {
  acc[def.id] = def;
  return acc;
}, {} as Record<string, DefenderInfo>);

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
  return Math.min(10, Math.max(3, level + 3));
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
