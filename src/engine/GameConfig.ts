export const DEFAULT_STARTING_CURRENCY = 150;
export const MIN_STARTING_CURRENCY = 25;
export const MAX_STARTING_CURRENCY = 9999;

export const MIN_SLOTS = 1;
export const MAX_SLOTS = 12;

export const CONFIG_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const BULK_FALLBACK_KEY = '*';

export const DEFAULT_LEVEL_STARTING_CURRENCY: Record<number, number> = {
  1: 150,
  2: 250,
  3: 350,
  4: 500,
  5: 650,
  6: 800,
  7: 1000,
  8: 1200,
  9: 1400,
  10: 1600
};

const CURRENCY_STORAGE_KEY = 'ragnarok_level_starting_currency';
const SLOTS_STORAGE_KEY = 'ragnarok_level_slots';
export const INFINITE_LEVELS_STORAGE_KEY = 'ragnarok_level_infinite_resources';

/**
 * Returns default slot limit for a given level.
 * Level 1: 4, Level 2: 5, Level 3: 6, Level 4: 7, Level 5: 8, Level 6: 9, Level 7+: 10
 */
export function getDefaultSlotLimit(level: number): number {
  return Math.min(10, Math.max(3, level + 3));
}

/**
 * Returns default starting currency for a given level.
 * Level 1: 150, Level 2: 250, Level 3: 350, Level 4: 500, Level 5: 650,
 * Level 6: 800, Level 7: 1000, Level 8: 1200, Level 9: 1400, Level 10: 1600
 */
export function getDefaultStartingCurrency(level: number): number {
  const lvl = Math.round(level);
  if (lvl in DEFAULT_LEVEL_STARTING_CURRENCY) {
    return DEFAULT_LEVEL_STARTING_CURRENCY[lvl];
  }
  if (lvl < 1) return DEFAULT_LEVEL_STARTING_CURRENCY[1];
  return Math.min(MAX_STARTING_CURRENCY, 1600 + (lvl - 10) * 200);
}

const memoryCache: Record<string, any> = {};

function getStoredObject<T>(key: string): Record<string, T> {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key];
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryCache[key] = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  memoryCache[key] = {};
  return memoryCache[key];
}

function setStoredObject<T>(key: string, obj: Record<string, T>): void {
  memoryCache[key] = obj;
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && memoryCache[e.key] !== undefined) {
      delete memoryCache[e.key];
    }
  });
}

/**
 * Get starting currency for a specific level.
 */
export function getStartingCurrencyForLevel(level: number): number {
  const map = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const key = Math.round(level).toString();
  const val = key in map ? map[key] : map[BULK_FALLBACK_KEY];
  if (typeof val === 'number' && !isNaN(val) && val >= MIN_STARTING_CURRENCY) {
    return Math.min(MAX_STARTING_CURRENCY, Math.max(MIN_STARTING_CURRENCY, Math.round(val)));
  }
  return getDefaultStartingCurrency(level);
}

/**
 * Save starting currency for a specific level.
 * Setting a numeric starting currency clears infinite resources mode for that level.
 */
export function setStartingCurrencyForLevel(level: number, amount: number): void {
  const map = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const clamped = Math.min(MAX_STARTING_CURRENCY, Math.max(MIN_STARTING_CURRENCY, Math.round(amount)));
  const lvl = Math.round(level);
  const key = lvl.toString();
  delete map[BULK_FALLBACK_KEY];
  map[key] = clamped;
  setStoredObject(CURRENCY_STORAGE_KEY, map);

  const iMap = getStoredObject<boolean>(INFINITE_LEVELS_STORAGE_KEY);
  const hadInfinite = Boolean(iMap[key] ?? iMap[BULK_FALLBACK_KEY]);
  if (hadInfinite) {
    delete iMap[BULK_FALLBACK_KEY];
    delete iMap[key];
    setStoredObject(INFINITE_LEVELS_STORAGE_KEY, iMap);
    notifyInfiniteResourcesChange(lvl, false);
  }

  notifyConfigChange(lvl);
}

/**
 * Save starting currency across all levels in bulk.
 * Clears infinite resources mode for all levels.
 */
export function setStartingCurrencyForAllLevels(amount: number): void {
  const map = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const clamped = Math.min(MAX_STARTING_CURRENCY, Math.max(MIN_STARTING_CURRENCY, Math.round(amount)));
  for (const lvl of CONFIG_LEVELS) {
    map[lvl.toString()] = clamped;
  }
  map[BULK_FALLBACK_KEY] = clamped;
  setStoredObject(CURRENCY_STORAGE_KEY, map);

  const iMap = getStoredObject<boolean>(INFINITE_LEVELS_STORAGE_KEY);
  if (Object.keys(iMap).length > 0) {
    setStoredObject(INFINITE_LEVELS_STORAGE_KEY, {});
    notifyInfiniteResourcesChange(undefined, false);
  }

  notifyConfigChange();
}

/**
 * Adjust starting currency by a relative delta across all levels in bulk.
 * Clears infinite resources mode for all levels.
 */
export function adjustStartingCurrencyForAllLevels(delta: number): void {
  const map = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const nextValues: number[] = [];
  for (const lvl of CONFIG_LEVELS) {
    const cur = getStartingCurrencyForLevel(lvl);
    const clamped = Math.min(MAX_STARTING_CURRENCY, Math.max(MIN_STARTING_CURRENCY, Math.round(cur + delta)));
    map[lvl.toString()] = clamped;
    nextValues.push(clamped);
  }
  if (nextValues.every(v => v === nextValues[0])) {
    map[BULK_FALLBACK_KEY] = nextValues[0];
  } else {
    delete map[BULK_FALLBACK_KEY];
  }
  setStoredObject(CURRENCY_STORAGE_KEY, map);

  const iMap = getStoredObject<boolean>(INFINITE_LEVELS_STORAGE_KEY);
  if (Object.keys(iMap).length > 0) {
    setStoredObject(INFINITE_LEVELS_STORAGE_KEY, {});
    notifyInfiniteResourcesChange(undefined, false);
  }

  notifyConfigChange();
}

/**
 * Get squad slot limit for a specific level.
 */
export function getSlotLimitForLevel(level: number): number {
  const map = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const key = Math.round(level).toString();
  const val = key in map ? map[key] : map[BULK_FALLBACK_KEY];
  if (typeof val === 'number' && !isNaN(val) && val >= MIN_SLOTS) {
    return Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, Math.round(val)));
  }
  return getDefaultSlotLimit(level);
}

/**
 * Save squad slot limit for a specific level.
 */
export function setSlotLimitForLevel(level: number, slots: number): void {
  const map = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const clamped = Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, Math.round(slots)));
  const lvl = Math.round(level);
  delete map[BULK_FALLBACK_KEY];
  map[lvl.toString()] = clamped;
  setStoredObject(SLOTS_STORAGE_KEY, map);
  notifyConfigChange(lvl);
}

/**
 * Save squad slot limit across all levels in bulk.
 */
export function setSlotLimitForAllLevels(slots: number): void {
  const map = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const clamped = Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, Math.round(slots)));
  for (const lvl of CONFIG_LEVELS) {
    map[lvl.toString()] = clamped;
  }
  map[BULK_FALLBACK_KEY] = clamped;
  setStoredObject(SLOTS_STORAGE_KEY, map);
  notifyConfigChange();
}

/**
 * Adjust squad slot limit by a relative delta across all levels in bulk.
 */
export function adjustSlotLimitForAllLevels(delta: number): void {
  const map = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const nextValues: number[] = [];
  for (const lvl of CONFIG_LEVELS) {
    const cur = getSlotLimitForLevel(lvl);
    const clamped = Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, Math.round(cur + delta)));
    map[lvl.toString()] = clamped;
    nextValues.push(clamped);
  }
  if (nextValues.every(v => v === nextValues[0])) {
    map[BULK_FALLBACK_KEY] = nextValues[0];
  } else {
    delete map[BULK_FALLBACK_KEY];
  }
  setStoredObject(SLOTS_STORAGE_KEY, map);
  notifyConfigChange();
}

/**
 * Check if a level has customized settings.
 */
export function isLevelCustomized(level: number): boolean {
  const lvl = Math.round(level);
  return getInfiniteResourcesForLevel(lvl) ||
         getStartingCurrencyForLevel(lvl) !== getDefaultStartingCurrency(lvl) ||
         getSlotLimitForLevel(lvl) !== getDefaultSlotLimit(lvl);
}

/**
 * Reset a single level's settings to default.
 */
export function resetLevelConfig(level: number): void {
  const cMap = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const sMap = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const iMap = getStoredObject<boolean>(INFINITE_LEVELS_STORAGE_KEY);
  const lvl = Math.round(level);
  const key = lvl.toString();
  const hadInfinite = getInfiniteResourcesForLevel(lvl);
  delete cMap[BULK_FALLBACK_KEY];
  delete sMap[BULK_FALLBACK_KEY];
  delete iMap[BULK_FALLBACK_KEY];
  delete cMap[key];
  delete sMap[key];
  delete iMap[key];
  setStoredObject(CURRENCY_STORAGE_KEY, cMap);
  setStoredObject(SLOTS_STORAGE_KEY, sMap);
  setStoredObject(INFINITE_LEVELS_STORAGE_KEY, iMap);
  if (hadInfinite) {
    notifyInfiniteResourcesChange(lvl, false);
  }
  notifyConfigChange(lvl);
}

/**
 * Reset all levels' settings to default.
 */
export function resetAllLevelConfigs(): void {
  delete memoryCache[CURRENCY_STORAGE_KEY];
  delete memoryCache[SLOTS_STORAGE_KEY];
  delete memoryCache[INFINITE_LEVELS_STORAGE_KEY];
  delete memoryCache[INFINITE_RESOURCES_STORAGE_KEY];
  try {
    localStorage.removeItem(CURRENCY_STORAGE_KEY);
    localStorage.removeItem(SLOTS_STORAGE_KEY);
    localStorage.removeItem(INFINITE_LEVELS_STORAGE_KEY);
    localStorage.removeItem(INFINITE_RESOURCES_STORAGE_KEY);
  } catch (e) {}
  notifyInfiniteResourcesChange(undefined, false);
  notifyConfigChange();
}

function notifyConfigChange(level?: number) {
  window.dispatchEvent(new CustomEvent('levelconfigchanged', { detail: { level } }));
}

function notifyInfiniteResourcesChange(level: number | undefined, enabled: boolean) {
  window.dispatchEvent(new CustomEvent('infiniteresourcessettingchanged', {
    detail: { level, enabled }
  }));
}

export const INFINITE_RESOURCES_STORAGE_KEY = 'ragnarok_infinite_resources';

/**
 * Check if infinite resources mode is enabled for a specific level.
 */
export function getInfiniteResourcesForLevel(level: number): boolean {
  const iMap = getStoredObject<boolean>(INFINITE_LEVELS_STORAGE_KEY);
  const key = Math.round(level).toString();
  if (key in iMap) {
    return Boolean(iMap[key]);
  }
  return Boolean(iMap[BULK_FALLBACK_KEY]);
}

/**
 * Set infinite resources mode for a specific level.
 */
export function setInfiniteResourcesForLevel(level: number, enabled: boolean): void {
  const iMap = getStoredObject<boolean>(INFINITE_LEVELS_STORAGE_KEY);
  const lvl = Math.round(level);
  const key = lvl.toString();
  delete iMap[BULK_FALLBACK_KEY];
  if (enabled) {
    iMap[key] = true;
  } else {
    delete iMap[key];
  }
  setStoredObject(INFINITE_LEVELS_STORAGE_KEY, iMap);
  notifyInfiniteResourcesChange(lvl, enabled);
  notifyConfigChange(lvl);
}

/**
 * Set infinite resources mode across all levels in bulk.
 */
export function setInfiniteResourcesForAllLevels(enabled: boolean): void {
  const nextMap: Record<string, boolean> = {};
  if (enabled) {
    for (const lvl of CONFIG_LEVELS) {
      nextMap[lvl.toString()] = true;
    }
    nextMap[BULK_FALLBACK_KEY] = true;
  }
  setStoredObject(INFINITE_LEVELS_STORAGE_KEY, nextMap);
  notifyInfiniteResourcesChange(undefined, enabled);
  notifyConfigChange();
}

/**
 * Copy a single level's configuration (starting currency, infinite state, and squad slots) to all levels.
 */
export function applyLevelConfigToAllLevels(sourceLevel: number): void {
  const lvl = Math.round(sourceLevel);
  const currency = getStartingCurrencyForLevel(lvl);
  const isInfinite = getInfiniteResourcesForLevel(lvl);
  const slots = getSlotLimitForLevel(lvl);

  const cMap = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const sMap = getStoredObject<number>(SLOTS_STORAGE_KEY);
  for (const targetLvl of CONFIG_LEVELS) {
    cMap[targetLvl.toString()] = currency;
    sMap[targetLvl.toString()] = slots;
  }
  cMap[BULK_FALLBACK_KEY] = currency;
  sMap[BULK_FALLBACK_KEY] = slots;
  setStoredObject(CURRENCY_STORAGE_KEY, cMap);
  setStoredObject(SLOTS_STORAGE_KEY, sMap);

  const nextIMap: Record<string, boolean> = {};
  if (isInfinite) {
    for (const targetLvl of CONFIG_LEVELS) {
      nextIMap[targetLvl.toString()] = true;
    }
    nextIMap[BULK_FALLBACK_KEY] = true;
  }
  setStoredObject(INFINITE_LEVELS_STORAGE_KEY, nextIMap);

  notifyInfiniteResourcesChange(undefined, isInfinite);
  notifyConfigChange();
}

/**
 * Check if infinite resources mode is enabled (for a given level, defaults to level 1).
 */
export function getInfiniteResources(level: number = 1): boolean {
  return getInfiniteResourcesForLevel(level);
}

/**
 * Set infinite resources mode (for a given level, defaults to level 1).
 */
export function setInfiniteResources(enabled: boolean, level: number = 1): void {
  setInfiniteResourcesForLevel(level, enabled);
}

export type ForeignUnitsMode = 'allow' | 'disable' | 'limited';

export const ALLOW_FOREIGN_UNITS_STORAGE_KEY = 'ragnarok_allow_foreign_units';
export const FOREIGN_UNITS_MODE_STORAGE_KEY = 'ragnarok_foreign_units_mode';
export const LIMITED_FOREIGN_WORLDS_STORAGE_KEY = 'ragnarok_limited_foreign_worlds';

export const DEFAULT_FOREIGN_UNITS_MODE: ForeignUnitsMode = 'disable';

export const ALL_WORLD_IDS: string[] = [
  'asgard',
  'vanaheim',
  'midgard',
  'svartalfheim',
  'jotunheim',
  'niflheim',
  'muspelheim',
  'helheim',
  'alfheim'
];

/**
 * Get current policy for foreign units when defending the home world:
 * - 'allow': all foreign realm defenders permitted
 * - 'disable': foreign realm defenders disabled (only native home world defenders)
 * - 'limited': defenders from selected foreign realms permitted
 */
export function getForeignUnitsMode(): ForeignUnitsMode {
  if (memoryCache[FOREIGN_UNITS_MODE_STORAGE_KEY] !== undefined) {
    return memoryCache[FOREIGN_UNITS_MODE_STORAGE_KEY];
  }
  try {
    const mode = localStorage.getItem(FOREIGN_UNITS_MODE_STORAGE_KEY) as ForeignUnitsMode | null;
    if (mode === 'allow' || mode === 'disable' || mode === 'limited') {
      memoryCache[FOREIGN_UNITS_MODE_STORAGE_KEY] = mode;
      return mode;
    }
    const legacy = localStorage.getItem(ALLOW_FOREIGN_UNITS_STORAGE_KEY);
    if (legacy !== null) {
      const legacyMode = legacy === 'true' ? 'allow' : 'disable';
      memoryCache[FOREIGN_UNITS_MODE_STORAGE_KEY] = legacyMode;
      return legacyMode;
    }
  } catch (e) {}
  memoryCache[FOREIGN_UNITS_MODE_STORAGE_KEY] = DEFAULT_FOREIGN_UNITS_MODE;
  return DEFAULT_FOREIGN_UNITS_MODE;
}

/**
 * Save foreign units policy ('allow' | 'disable' | 'limited').
 */
export function setForeignUnitsMode(mode: ForeignUnitsMode): void {
  memoryCache[FOREIGN_UNITS_MODE_STORAGE_KEY] = mode;
  delete memoryCache[ALLOW_FOREIGN_UNITS_STORAGE_KEY];
  try {
    localStorage.setItem(FOREIGN_UNITS_MODE_STORAGE_KEY, mode);
    localStorage.setItem(ALLOW_FOREIGN_UNITS_STORAGE_KEY, mode === 'allow' ? 'true' : 'false');
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('foreignunitssettingchanged', {
    detail: { mode, allowed: mode === 'allow', limitedWorlds: getLimitedForeignWorlds() }
  }));
}

/**
 * Backward-compatible helper for boolean checks.
 */
export function getAllowForeignUnits(): boolean {
  return getForeignUnitsMode() === 'allow';
}

/**
 * Backward-compatible helper for boolean setter.
 */
export function setAllowForeignUnits(allowed: boolean): void {
  setForeignUnitsMode(allowed ? 'allow' : 'disable');
}

/**
 * Get list of world IDs allowed when in 'limited' mode.
 * Defaults to all nine realms if not customized yet.
 */
export function getLimitedForeignWorlds(): string[] {
  if (memoryCache[LIMITED_FOREIGN_WORLDS_STORAGE_KEY] !== undefined) {
    return memoryCache[LIMITED_FOREIGN_WORLDS_STORAGE_KEY];
  }
  try {
    const raw = localStorage.getItem(LIMITED_FOREIGN_WORLDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryCache[LIMITED_FOREIGN_WORLDS_STORAGE_KEY] = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  memoryCache[LIMITED_FOREIGN_WORLDS_STORAGE_KEY] = [...ALL_WORLD_IDS];
  return memoryCache[LIMITED_FOREIGN_WORLDS_STORAGE_KEY];
}

/**
 * Save list of world IDs allowed in 'limited' mode.
 */
export function setLimitedForeignWorlds(worldIds: string[]): void {
  memoryCache[LIMITED_FOREIGN_WORLDS_STORAGE_KEY] = worldIds;
  try {
    localStorage.setItem(LIMITED_FOREIGN_WORLDS_STORAGE_KEY, JSON.stringify(worldIds));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('foreignunitssettingchanged', {
    detail: { mode: getForeignUnitsMode(), allowed: getForeignUnitsMode() === 'allow', limitedWorlds: worldIds }
  }));
}

/**
 * Check if a specific world is allowed in 'limited' mode.
 */
export function isForeignWorldAllowedInLimited(worldId: string): boolean {
  const allowedList = getLimitedForeignWorlds();
  return allowedList.includes(worldId.toLowerCase().trim());
}
