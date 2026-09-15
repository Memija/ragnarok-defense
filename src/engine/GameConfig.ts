export const DEFAULT_STARTING_CURRENCY = 1000;
export const MIN_STARTING_CURRENCY = 25;
export const MAX_STARTING_CURRENCY = 9999;

export const MIN_SLOTS = 1;
export const MAX_SLOTS = 12;

const CURRENCY_STORAGE_KEY = 'ragnarok_level_starting_currency';
const SLOTS_STORAGE_KEY = 'ragnarok_level_slots';

/**
 * Returns default slot limit for a given level.
 * Level 1: 4, Level 2: 5, Level 3: 6, Level 4: 7, Level 5: 8, Level 6: 9, Level 7+: 10
 */
export function getDefaultSlotLimit(level: number): number {
  return Math.min(10, Math.max(3, level + 3));
}

/**
 * Returns default starting currency for a given level.
 */
export function getDefaultStartingCurrency(_level: number): number {
  return DEFAULT_STARTING_CURRENCY;
}

function getStoredObject<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {}
  return {};
}

function setStoredObject<T>(key: string, obj: Record<string, T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {}
}

/**
 * Get starting currency for a specific level.
 */
export function getStartingCurrencyForLevel(level: number): number {
  const map = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const val = map[level.toString()];
  if (typeof val === 'number' && !isNaN(val) && val >= MIN_STARTING_CURRENCY) {
    return Math.min(MAX_STARTING_CURRENCY, Math.max(MIN_STARTING_CURRENCY, Math.round(val)));
  }
  return getDefaultStartingCurrency(level);
}

/**
 * Save starting currency for a specific level.
 */
export function setStartingCurrencyForLevel(level: number, amount: number): void {
  const map = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const clamped = Math.min(MAX_STARTING_CURRENCY, Math.max(MIN_STARTING_CURRENCY, Math.round(amount)));
  map[level.toString()] = clamped;
  setStoredObject(CURRENCY_STORAGE_KEY, map);
  notifyConfigChange(level);
}

/**
 * Get squad slot limit for a specific level.
 */
export function getSlotLimitForLevel(level: number): number {
  const map = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const val = map[level.toString()];
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
  map[level.toString()] = clamped;
  setStoredObject(SLOTS_STORAGE_KEY, map);
  notifyConfigChange(level);
}

/**
 * Check if a level has customized settings.
 */
export function isLevelCustomized(level: number): boolean {
  const cMap = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const sMap = getStoredObject<number>(SLOTS_STORAGE_KEY);
  const key = level.toString();
  return (key in cMap && cMap[key] !== getDefaultStartingCurrency(level)) ||
         (key in sMap && sMap[key] !== getDefaultSlotLimit(level));
}

/**
 * Reset a single level's settings to default.
 */
export function resetLevelConfig(level: number): void {
  const cMap = getStoredObject<number>(CURRENCY_STORAGE_KEY);
  const sMap = getStoredObject<number>(SLOTS_STORAGE_KEY);
  delete cMap[level.toString()];
  delete sMap[level.toString()];
  setStoredObject(CURRENCY_STORAGE_KEY, cMap);
  setStoredObject(SLOTS_STORAGE_KEY, sMap);
  notifyConfigChange(level);
}

/**
 * Reset all levels' settings to default.
 */
export function resetAllLevelConfigs(): void {
  try {
    localStorage.removeItem(CURRENCY_STORAGE_KEY);
    localStorage.removeItem(SLOTS_STORAGE_KEY);
  } catch (e) {}
  notifyConfigChange();
}

function notifyConfigChange(level?: number) {
  window.dispatchEvent(new CustomEvent('levelconfigchanged', { detail: { level } }));
}
