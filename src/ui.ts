import { SoundManager } from './engine/SoundManager';
import { translations, t } from './i18n';
import {
  getStartingCurrencyForLevel,
  setStartingCurrencyForLevel,
  getSlotLimitForLevel,
  setSlotLimitForLevel,
  isLevelCustomized,
  resetLevelConfig,
  resetAllLevelConfigs,
  MIN_STARTING_CURRENCY,
  MAX_STARTING_CURRENCY,
  MIN_SLOTS,
  MAX_SLOTS
} from './engine/GameConfig';

export function initUI() {
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundManager = SoundManager.getInstance();

  if (soundToggleBtn) {
    const updateSoundIcon = () => {
      soundToggleBtn.innerHTML = `
        <span class="sound-icon">${soundManager.isMuted ? '🔇' : '🔊'}</span>
        <span class="settings-pulse"></span>
      `;
    };
    updateSoundIcon();

    soundToggleBtn.addEventListener('click', () => {
      soundManager.toggleMute();
      if (!soundManager.isMuted) {
        soundManager.playClick();
      }
      updateSoundIcon();
    });
  }

  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const doneSettingsBtn = document.getElementById('done-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const modalBackdrop = settingsModal?.querySelector('.settings-modal-backdrop');

  let closeTimeout: number | null = null;
  let currentSettingsLevel: number = 1;
  let updateLevelSettingsUI: () => void = () => {};

  const openSettings = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    soundManager.playClick();
    const game = (window as any).__getGame?.();
    if (game && typeof game.pause === 'function') {
      game.pause();
    }
    if (game && typeof game.level === 'number') {
      currentSettingsLevel = Math.min(10, Math.max(1, game.level));
    }
    updateLevelSettingsUI();
    if (settingsModal) {
      settingsModal.classList.remove('hidden');
      settingsModal.style.pointerEvents = 'auto';
      settingsModal.style.display = 'flex';
      settingsModal.style.visibility = 'visible';
      settingsModal.setAttribute('aria-hidden', 'false');
    }
  };

  const closeSettings = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    soundManager.playClick();
    if (settingsModal) {
      settingsModal.classList.add('hidden');
      settingsModal.style.pointerEvents = 'none';
      settingsModal.style.display = 'none';
      settingsModal.style.visibility = 'hidden';
      settingsModal.setAttribute('aria-hidden', 'true');
    }
    const game = (window as any).__getGame?.();
    if (game && typeof game.resume === 'function') {
      game.resume();
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.focus();
  };

  (window as any).__closeSettings = closeSettings;

  const toggleSettings = () => {
    if (settingsModal && !settingsModal.classList.contains('hidden')) {
      closeSettings();
    } else {
      openSettings();
    }
  };

  if (settingsBtn) {
    settingsBtn.addEventListener('click', toggleSettings);
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettings);
  }

  if (doneSettingsBtn) {
    doneSettingsBtn.addEventListener('click', closeSettings);
  }

  const leaveBattleBtn = document.getElementById('settings-leave-battle-btn');
  if (leaveBattleBtn) {
    leaveBattleBtn.addEventListener('click', () => {
      closeSettings();
      const returnBtn = document.getElementById('return-menu-btn');
      if (returnBtn) {
        returnBtn.click();
      }
    });
  }

  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal || e.target === modalBackdrop) {
        closeSettings();
      }
    });
  }

  // Keyboard shortcut (Escape to close settings)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal && !settingsModal.classList.contains('hidden')) {
      closeSettings();
    }
  });

  const themeToggleBtn = document.getElementById('theme-toggle');

  // Theme Toggling
  const savedTheme = localStorage.getItem('ragnarok_theme') || 'system';
  document.body.dataset.theme = savedTheme;

  const applyTheme = () => {
    let theme = document.body.dataset.theme || 'system'; // default
    if (theme === 'system') {
      const prefersLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.dataset.activeTheme = prefersLight ? 'light' : 'dark';
    } else {
      document.body.dataset.activeTheme = theme;
    }
  };

  // Initial apply
  applyTheme();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (document.body.dataset.theme === 'system') {
      applyTheme();
    }
  });

  // Get currently active dictionary
  const getDict = () => {
    const lang = document.body.dataset.lang || 'en';
    return translations[lang] || translations['en'];
  };

  const updateThemeButtonText = (btn: HTMLElement, theme: string, dict: Record<string, string>) => {
    let text = dict['themeSystem'];
    if (theme === 'light') text = dict['themeLight'];
    else if (theme === 'dark') text = dict['themeDark'];

    const innerSpan = btn.querySelector('.theme-btn-text');
    if (innerSpan) {
      innerSpan.textContent = text;
    } else {
      btn.textContent = text;
    }
  };

  const applyLanguage = (lang: string) => {
    const dict = translations[lang] || translations['en'];
    document.body.dataset.lang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('ragnarok_lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key && dict[key]) {
        el.setAttribute('title', dict[key]);
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key && dict[key]) {
        el.setAttribute('aria-label', dict[key]);
      }
    });

    if (themeToggleBtn) {
      updateThemeButtonText(themeToggleBtn, document.body.dataset.theme || 'system', dict);
    }

    updateLevelSettingsUI();

    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  };

  if (themeToggleBtn) {
    const initTheme = document.body.dataset.theme || 'system';
    updateThemeButtonText(themeToggleBtn, initTheme, getDict());

    themeToggleBtn.addEventListener('click', () => {
      soundManager.playClick();
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      const currentTheme = document.body.dataset.theme || 'system';
      
      // Cycle: dark -> system -> light -> dark
      if (currentTheme === 'dark') {
        document.body.dataset.theme = 'system';
        themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
      } else if (currentTheme === 'system') {
        document.body.dataset.theme = 'light';
        themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      } else {
        document.body.dataset.theme = 'dark';
        themeToggleBtn.setAttribute('aria-label', 'Switch to System Theme');
      }
      
      localStorage.setItem('ragnarok_theme', document.body.dataset.theme);
      updateThemeButtonText(themeToggleBtn, document.body.dataset.theme, getDict());
      applyTheme();
    });
  }

  // Custom Select (i18n)
  const customSelect = document.getElementById('lang-select');
  const savedLang = localStorage.getItem('ragnarok_lang') || 'en';

  if (customSelect) {
    const selected = customSelect.querySelector('.select-selected') as HTMLElement;
    const itemsList = customSelect.querySelector('.select-items') as HTMLElement;
    const items = itemsList.querySelectorAll('div');

    // Restore saved language selection in dropdown UI
    if (savedLang) {
      const savedOption = customSelect.querySelector(`[data-lang="${savedLang}"]`) as HTMLElement;
      if (savedOption && selected) {
        selected.innerHTML = savedOption.innerHTML;
        selected.dataset.lang = savedLang;
      }
    }

    applyLanguage(savedLang);

    selected.addEventListener('click', (e) => {
      e.stopPropagation();
      itemsList.classList.toggle('select-hide');
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const lang = target.dataset.lang || 'en';
        
        // Update selected display
        selected.innerHTML = target.innerHTML;
        selected.dataset.lang = lang;
        itemsList.classList.add('select-hide');
        
        applyLanguage(lang);

        // Smoothly close settings modal after choosing a language
        if (closeTimeout) {
          clearTimeout(closeTimeout);
        }
        closeTimeout = window.setTimeout(() => {
          closeSettings();
          closeTimeout = null;
        }, 180);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      itemsList.classList.add('select-hide');
    });
  } else {
    applyLanguage(savedLang);
  }

  // Level Configuration controls in Settings
  const levelPillsContainer = document.getElementById('settings-level-pills');
  const levelPillButtons = levelPillsContainer ? Array.from(levelPillsContainer.querySelectorAll<HTMLButtonElement>('.level-pill')) : [];
  const levelIndicator = document.getElementById('config-level-indicator');
  const currencyInput = document.getElementById('level-currency-input') as HTMLInputElement | null;
  const currencyMinusBtn = document.getElementById('currency-minus-btn') as HTMLButtonElement | null;
  const currencyPlusBtn = document.getElementById('currency-plus-btn') as HTMLButtonElement | null;
  const presetPills = Array.from(document.querySelectorAll<HTMLButtonElement>('.cfg-preset-pill'));
  const slotsDisplay = document.getElementById('level-slots-display');
  const slotsMinusBtn = document.getElementById('slots-minus-btn') as HTMLButtonElement | null;
  const slotsPlusBtn = document.getElementById('slots-plus-btn') as HTMLButtonElement | null;
  const slotPipsContainer = document.getElementById('slot-pips-preview');
  const resetCurrentLevelBtn = document.getElementById('reset-current-level-btn') as HTMLButtonElement | null;
  const resetAllLevelsBtn = document.getElementById('reset-all-levels-btn') as HTMLButtonElement | null;

  updateLevelSettingsUI = () => {
    const lang = document.body.dataset.lang || 'en';
    const currentCurrency = getStartingCurrencyForLevel(currentSettingsLevel);
    const currentSlots = getSlotLimitForLevel(currentSettingsLevel);
    const customized = isLevelCustomized(currentSettingsLevel);

    // Update level selector pills
    levelPillButtons.forEach(pill => {
      const lvl = parseInt(pill.dataset.level || '1', 10);
      const isCurrent = lvl === currentSettingsLevel;
      pill.classList.toggle('active', isCurrent);
      const lvlIsCustom = isLevelCustomized(lvl);
      pill.classList.toggle('customized', lvlIsCustom);
      pill.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    });

    // Update level indicator header
    if (levelIndicator) {
      const customTag = customized ? t('customLabel', lang) : t('defaultLabel', lang);
      levelIndicator.innerHTML = `
        <span class="lvl-title">Level ${currentSettingsLevel}</span>
        <span class="cfg-badge ${customized ? 'is-custom' : 'is-default'}">${customTag}</span>
      `;
    }

    // Update currency input & presets
    if (currencyInput) {
      currencyInput.value = currentCurrency.toString();
    }
    if (currencyMinusBtn) {
      currencyMinusBtn.disabled = currentCurrency <= MIN_STARTING_CURRENCY;
    }
    if (currencyPlusBtn) {
      currencyPlusBtn.disabled = currentCurrency >= MAX_STARTING_CURRENCY;
    }

    presetPills.forEach(pill => {
      const amt = parseInt(pill.dataset.amount || '0', 10);
      pill.classList.toggle('active', amt === currentCurrency);
    });

    // Update slots display
    if (slotsDisplay) {
      const formatStr = t('slotsCount', lang);
      slotsDisplay.textContent = formatStr.replace('{count}', currentSlots.toString());
    }
    if (slotsMinusBtn) {
      slotsMinusBtn.disabled = currentSlots <= MIN_SLOTS;
    }
    if (slotsPlusBtn) {
      slotsPlusBtn.disabled = currentSlots >= MAX_SLOTS;
    }

    // Render slot visual pips (up to 12)
    if (slotPipsContainer) {
      slotPipsContainer.innerHTML = '';
      for (let i = 1; i <= MAX_SLOTS; i++) {
        const pip = document.createElement('div');
        const isActive = i <= currentSlots;
        pip.className = `slot-pip ${isActive ? 'active' : 'empty'}`;
        pip.title = `Slot ${i}${isActive ? ' (Active)' : ' (Locked)'}`;
        pip.innerHTML = `<span class="pip-num">${i}</span>`;
        slotPipsContainer.appendChild(pip);
      }
    }
  };

  // Attach event listeners for level settings
  levelPillButtons.forEach(pill => {
    pill.addEventListener('click', () => {
      const lvl = parseInt(pill.dataset.level || '1', 10);
      if (lvl !== currentSettingsLevel) {
        soundManager.playClick();
        currentSettingsLevel = lvl;
        updateLevelSettingsUI();
      }
    });
  });

  if (currencyMinusBtn) {
    currencyMinusBtn.addEventListener('click', () => {
      soundManager.playClick();
      const cur = getStartingCurrencyForLevel(currentSettingsLevel);
      setStartingCurrencyForLevel(currentSettingsLevel, Math.max(MIN_STARTING_CURRENCY, cur - 50));
      updateLevelSettingsUI();
    });
  }

  if (currencyPlusBtn) {
    currencyPlusBtn.addEventListener('click', () => {
      soundManager.playClick();
      const cur = getStartingCurrencyForLevel(currentSettingsLevel);
      setStartingCurrencyForLevel(currentSettingsLevel, Math.min(MAX_STARTING_CURRENCY, cur + 50));
      updateLevelSettingsUI();
    });
  }

  if (currencyInput) {
    const handleCurrencyCommit = () => {
      let val = parseInt(currencyInput.value, 10);
      if (isNaN(val)) {
        val = getStartingCurrencyForLevel(currentSettingsLevel);
      }
      setStartingCurrencyForLevel(currentSettingsLevel, val);
      updateLevelSettingsUI();
    };

    currencyInput.addEventListener('change', handleCurrencyCommit);
    currencyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        currencyInput.blur();
      }
    });
  }

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      soundManager.playClick();
      const amt = parseInt(pill.dataset.amount || '0', 10);
      if (amt > 0) {
        setStartingCurrencyForLevel(currentSettingsLevel, amt);
        updateLevelSettingsUI();
      }
    });
  });

  if (slotsMinusBtn) {
    slotsMinusBtn.addEventListener('click', () => {
      soundManager.playClick();
      const cur = getSlotLimitForLevel(currentSettingsLevel);
      if (cur > MIN_SLOTS) {
        setSlotLimitForLevel(currentSettingsLevel, cur - 1);
        updateLevelSettingsUI();
      }
    });
  }

  if (slotsPlusBtn) {
    slotsPlusBtn.addEventListener('click', () => {
      soundManager.playClick();
      const cur = getSlotLimitForLevel(currentSettingsLevel);
      if (cur < MAX_SLOTS) {
        setSlotLimitForLevel(currentSettingsLevel, cur + 1);
        updateLevelSettingsUI();
      }
    });
  }

  if (resetCurrentLevelBtn) {
    resetCurrentLevelBtn.addEventListener('click', () => {
      soundManager.playClick();
      resetLevelConfig(currentSettingsLevel);
      updateLevelSettingsUI();
    });
  }

  if (resetAllLevelsBtn) {
    resetAllLevelsBtn.addEventListener('click', () => {
      soundManager.playClick();
      resetAllLevelConfigs();
      updateLevelSettingsUI();
    });
  }

  // Initial call
  updateLevelSettingsUI();
}


