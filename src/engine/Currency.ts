import { t } from '../i18n';

export interface RealmCurrency {
  id: string;
  nameKey: string;
  defaultName: string;
  symbol: string;
  color: string;
  glowColor: string;
  particleColor: string;
  lore: string;
}

export const REALM_CURRENCIES: Record<string, RealmCurrency> = {
  midgard: {
    id: 'midgard',
    nameKey: 'currency_midgard',
    defaultName: 'Hacksilver',
    symbol: '🪙',
    color: '#e2e8f0',
    glowColor: 'rgba(226, 232, 240, 0.6)',
    particleColor: '#cbd5e1',
    lore: 'Cut silver bullion, ingots, and sheared arm-rings traded by mortals of Midgard.'
  },
  asgard: {
    id: 'asgard',
    nameKey: 'currency_asgard',
    defaultName: 'Draupnir Gold',
    symbol: '👑',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    particleColor: '#fde047',
    lore: 'Pure celestial gold dripped from Odin\'s enchanted arm-ring Draupnir.'
  },
  svartalfheim: {
    id: 'svartalfheim',
    nameKey: 'currency_svartalfheim',
    defaultName: 'Dwarven Ingots',
    symbol: '⚒️',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    particleColor: '#fb923c',
    lore: 'Tempered metal bars and molten aurum from the royal foundries of Nidavellir.'
  },
  alfheim: {
    id: 'alfheim',
    nameKey: 'currency_alfheim',
    defaultName: 'Sunstones',
    symbol: '💠',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    particleColor: '#7dd3fc',
    lore: 'Radiant crystalline sunstones (Sólarsteinn) capturing pure celestial starlight.'
  },
  vanaheim: {
    id: 'vanaheim',
    nameKey: 'currency_vanaheim',
    defaultName: 'Golden Amber',
    symbol: '🔶',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    particleColor: '#fbbf24',
    lore: 'Petrified sacred tree resin and tears of red gold shed in Freyja\'s groves.'
  },
  jotunheim: {
    id: 'jotunheim',
    nameKey: 'currency_jotunheim',
    defaultName: 'Rime Shards',
    symbol: '❄️',
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.6)',
    particleColor: '#67e8f9',
    lore: 'Primeval glacial ice chiselled from the highest frost giant peaks of Utgard.'
  },
  niflheim: {
    id: 'niflheim',
    nameKey: 'currency_niflheim',
    defaultName: 'Mist Crystals',
    symbol: '🌫️',
    color: '#cffafe',
    glowColor: 'rgba(207, 250, 254, 0.6)',
    particleColor: '#e0f2fe',
    lore: 'Condensed ethereal vapor drawn from the venomous primordial spring Hvergelmir.'
  },
  muspelheim: {
    id: 'muspelheim',
    nameKey: 'currency_muspelheim',
    defaultName: 'Fire Embers',
    symbol: '🔥',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    particleColor: '#f87171',
    lore: 'Everlasting burning coals forged within the cosmic infernos of Lord Surtr.'
  },
  helheim: {
    id: 'helheim',
    nameKey: 'currency_helheim',
    defaultName: 'Soul Obols',
    symbol: '💀',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    particleColor: '#d8b4fe',
    lore: 'Obsidian funerary tokens offered to ferry departed souls across the river Gjöll.'
  }
};

/**
 * Get currency metadata for a specific realm. Defaults to Midgard.
 */
export function getRealmCurrency(realm: string = 'midgard'): RealmCurrency {
  const normalized = (realm || 'midgard').toLowerCase().trim();
  return REALM_CURRENCIES[normalized] || REALM_CURRENCIES.midgard;
}

/**
 * Get the localized display name of a realm's currency.
 */
export function getRealmCurrencyName(realm: string = 'midgard', lang?: string): string {
  const currency = getRealmCurrency(realm);
  const localized = t(currency.nameKey, lang);
  return localized !== currency.nameKey ? localized : currency.defaultName;
}
