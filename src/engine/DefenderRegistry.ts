import { t } from '../i18n';

export type DefenderCategory = 'plants' | 'towers';

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
    name: 'Towers',
    icon: '🏰',
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
  {
    id: 'snowpea',
    name: 'Frost Sprite',
    category: 'plants',
    categoryName: 'Sacred Flora',
    cost: 175,
    icon: '❄️',
    desc: 'Ethereal frost spirit from Niflheim whose icy shards pierce invaders and slow their movement by 50%.',
    tooltip: 'Frost Sprite (Snow Pea): Fires slowing frost shards that cut enemy advance speed in half.',
    role: 'Frost & Slow',
    origin: 'Niflheim'
  },

  // 🏰 Category: Towers
  {
    id: 'wallnut',
    name: 'Rune Bastion',
    category: 'towers',
    categoryName: 'Tower',
    cost: 50,
    icon: '🏰',
    desc: 'Fortified Norse stone bastion tower with colossal vitality (4000 HP) that blocks advancing hordes.',
    tooltip: 'Rune Bastion: High-health fortress bastion tower to buy crucial time for your defense line.',
    role: 'Defensive Bastion',
    origin: 'Jötunheim'
  },
  {
    id: 'torchwood',
    name: 'Fire Spire',
    category: 'towers',
    categoryName: 'Tower',
    cost: 175,
    icon: '🗼',
    desc: 'Blazing arcane beacon spire tower that ignites passing projectiles into devastating fireballs dealing double damage.',
    tooltip: 'Fire Spire: Arcane beacon tower that ignites projectiles into blazing fireballs for massive bonus damage.',
    role: 'Damage Amplifier',
    origin: 'Muspelheim'
  },
  {
    id: 'potatomine',
    name: 'Rune Mine',
    category: 'towers',
    categoryName: 'Tower',
    cost: 25,
    icon: '🪨',
    desc: 'Subterranean runic ward monolith tower. Takes 14 seconds to arm, then detonates for 1800 contact damage.',
    tooltip: 'Rune Mine: Low-cost runic ward tower. Arms underground and eliminates the first enemy that steps on it.',
    role: 'Ambush Ward',
    origin: 'Svartalfheim'
  },
  {
    id: 'kernelpult',
    name: 'Dwarven Catapult',
    category: 'towers',
    categoryName: 'Tower',
    cost: 100,
    icon: '⚙️',
    desc: 'Artisan dwarven siege catapult tower that lobs runic boulders and adhesive pitch flasks that immobilize foes.',
    tooltip: 'Dwarven Catapult: Artillery siege tower that lobs heavy boulders and paralyzing adhesive pitch.',
    role: 'Siege Artillery',
    origin: 'Svartalfheim'
  },
  {
    id: 'cherrybomb',
    name: 'Forge Blaster',
    category: 'towers',
    categoryName: 'Tower',
    cost: 150,
    icon: '💣',
    desc: 'Heavy dwarven magma blast ordnance turret that detonates instantly in a devastating 3x3 radius.',
    tooltip: 'Forge Blaster: Instant area-of-effect blast ordnance turret that obliterates tight enemy clusters.',
    role: 'Area Demolition',
    origin: 'Svartalfheim'
  },
  {
    id: 'jalapeno',
    name: 'Forge Dragonfire',
    category: 'towers',
    categoryName: 'Tower',
    cost: 125,
    icon: '🔥',
    desc: 'Unleashes Nidavellir blast furnace dragonfire, incinerating all invaders across an entire lane for 1000 damage.',
    tooltip: 'Forge Dragonfire: Instant row cleanser that obliterates every invader in the chosen lane.',
    role: 'Lane Annihilation',
    origin: 'Svartalfheim'
  },
  {
    id: 'einherjar',
    name: 'Asgard Einherjar',
    category: 'towers',
    categoryName: 'Tower',
    cost: 225,
    icon: '⚡',
    desc: 'Celestial Asgardian watchtower manned by an elite Einherjar champion casting radiant light spears.',
    tooltip: 'Asgard Einherjar: Celestial watchtower with an elite Asgardian warrior casting lethal radiant lances.',
    role: 'Celestial Watchtower',
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

export function getLocalizedDefender(def: DefenderInfo): DefenderInfo {
  const nameKey = `def_${def.id}_name`;
  const descKey = `def_${def.id}_desc`;
  const tooltipKey = `def_${def.id}_tooltip`;
  const roleKey = `def_${def.id}_role`;
  const originKey = `world_${def.origin.toLowerCase()}`;
  const catKey = `cat_${def.category}_title`;

  const name = t(nameKey) !== nameKey ? t(nameKey) : def.name;
  const desc = t(descKey) !== descKey ? t(descKey) : def.desc;
  const tooltip = t(tooltipKey) !== tooltipKey ? t(tooltipKey) : def.tooltip;
  const role = t(roleKey) !== roleKey ? t(roleKey) : def.role;
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

export function getLocalizedDefendersList(): DefenderInfo[] {
  return DEFENDERS_LIST.map(getLocalizedDefender);
}

export function getLocalizedDefendersMap(): Record<string, DefenderInfo> {
  const map: Record<string, DefenderInfo> = {};
  for (const def of DEFENDERS_LIST) {
    map[def.id] = getLocalizedDefender(def);
  }
  return map;
}

export function getDefenderInfo(id: string): DefenderInfo | undefined {
  const base = DEFENDERS_MAP[id];
  if (!base) return undefined;
  return getLocalizedDefender(base);
}
