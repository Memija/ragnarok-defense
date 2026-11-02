import { SoundManager } from './engine/SoundManager';
import { translations, t, setCurrentLang, type SupportedLang } from './i18n';
import {
  CONFIG_LEVELS,
  getStartingCurrencyForLevel,
  setStartingCurrencyForLevel,
  setStartingCurrencyForAllLevels,
  adjustStartingCurrencyForAllLevels,
  getSlotLimitForLevel,
  setSlotLimitForLevel,
  setSlotLimitForAllLevels,
  adjustSlotLimitForAllLevels,
  isLevelCustomized,
  resetLevelConfig,
  resetAllLevelConfigs,
  MIN_STARTING_CURRENCY,
  MAX_STARTING_CURRENCY,
  MIN_SLOTS,
  MAX_SLOTS,
  getForeignUnitsMode,
  setForeignUnitsMode,
  type ForeignUnitsMode,
  getInfiniteResourcesForLevel,
  setInfiniteResourcesForLevel,
  setInfiniteResourcesForAllLevels,
  applyLevelConfigToAllLevels
} from './engine/GameConfig';
import { ForeignWorldsModal } from './engine/ForeignWorldsModal';

export function initUI() {
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundManager = SoundManager.getInstance();

  const volumeSlider = document.getElementById('master-volume-slider') as HTMLInputElement | null;
  const volumePercentDisplay = document.getElementById('volume-percent-display');
  const volumeMuteBtn = document.getElementById('volume-mute-btn');

  const updateSoundUI = () => {
    const isMuted = soundManager.isMuted;
    const volPct = Math.round(soundManager.volume * 100);
    const lang = document.body.dataset.lang || localStorage.getItem('ragnarok_lang') || 'en';

    if (soundToggleBtn) {
      soundToggleBtn.classList.toggle('is-muted', isMuted);
      soundToggleBtn.setAttribute('title', isMuted ? t('unmuteSoundShortcut', lang) : t('muteSoundShortcut', lang));
      soundToggleBtn.setAttribute('aria-label', isMuted ? t('unmuteSound', lang) : t('muteSound', lang));
    }

    if (volumeMuteBtn) {
      volumeMuteBtn.classList.toggle('is-muted', isMuted);
      volumeMuteBtn.setAttribute('title', isMuted ? t('unmuteSound', lang) : t('muteSound', lang));
      volumeMuteBtn.setAttribute('aria-label', isMuted ? t('unmuteSound', lang) : t('muteSound', lang));
    }

    if (volumeSlider) {
      volumeSlider.value = isMuted ? '0' : volPct.toString();
      volumeSlider.style.setProperty('--vol-percent', `${isMuted ? 0 : volPct}%`);
    }

    if (volumePercentDisplay) {
      volumePercentDisplay.textContent = isMuted ? '0%' : `${volPct}%`;
    }
  };

  if (soundToggleBtn) {
    updateSoundUI();
    soundToggleBtn.addEventListener('click', () => {
      soundManager.toggleMute();
      if (!soundManager.isMuted) {
        soundManager.playClick();
      }
      updateSoundUI();
    });
  }

  if (volumeMuteBtn) {
    volumeMuteBtn.addEventListener('click', () => {
      soundManager.toggleMute();
      if (!soundManager.isMuted) {
        soundManager.playClick();
      }
      updateSoundUI();
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      const pct = parseInt(volumeSlider.value, 10);
      if (soundManager.isMuted && pct > 0) {
        soundManager.toggleMute();
      }
      soundManager.setVolume(pct / 100);
      updateSoundUI();
    });
  }

  // Keyboard shortcut 'm' for mute
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      soundManager.toggleMute();
      if (!soundManager.isMuted) {
        soundManager.playClick();
      }
      updateSoundUI();
    }
  });

  // Settings Category Tabs
  const settingsTabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.settings-nav-tabs .settings-tab-btn'));
  const settingsTabPanes = Array.from(document.querySelectorAll<HTMLElement>('.settings-body .settings-tab-pane'));

  const activateSettingsTab = (targetTab: string) => {
    settingsTabButtons.forEach(b => {
      const isActive = b.dataset.tab === targetTab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    settingsTabPanes.forEach(pane => {
      const paneTab = pane.id.replace('pane-', '');
      const isActive = paneTab === targetTab;
      pane.classList.toggle('active', isActive);
    });
  };

  settingsTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (!targetTab) return;
      soundManager.playClick();
      activateSettingsTab(targetTab);
    });
  });

  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const doneSettingsBtn = document.getElementById('done-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const modalBackdrop = settingsModal?.querySelector('.settings-modal-backdrop');

  let closeTimeout: number | null = null;
  let applyFeedbackTimeout: number | null = null;
  let currentSettingsLevel: number | 'all' = 1;
  let updateLevelSettingsUI: () => void = () => {};
  let updateForeignUnitsUI: () => void = () => {};
  let closeLanguageDropdown: () => void = () => {};

  const openSettings = (initialTab?: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    soundManager.playClick();
    const game = (window as any).__getGame?.();
    if (game && typeof game.pause === 'function') {
      game.pause();
    }
    const defenderSelectionModal = (window as any).__defenderSelectionModal;
    const modalLevel = defenderSelectionModal?.getActiveLevel?.();
    if (typeof modalLevel === 'number' && currentSettingsLevel !== 'all') {
      currentSettingsLevel = Math.min(10, Math.max(1, modalLevel));
    } else if (game && typeof game.level === 'number' && currentSettingsLevel !== 'all') {
      currentSettingsLevel = Math.min(10, Math.max(1, game.level));
    }
    if (typeof initialTab === 'string' && initialTab) {
      activateSettingsTab(initialTab);
    }
    updateSoundUI();
    updateLevelSettingsUI();
    updateForeignUnitsUI();
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
    if (typeof closeLanguageDropdown === 'function') {
      closeLanguageDropdown();
    }
    soundManager.playClick();
    if (settingsModal) {
      settingsModal.classList.add('hidden');
      settingsModal.style.pointerEvents = 'none';
      settingsModal.style.display = 'none';
      settingsModal.style.visibility = 'hidden';
      settingsModal.setAttribute('aria-hidden', 'true');
    }
    const defenderModalEl = document.getElementById('defender-modal');
    const isDefenderModalOpen = defenderModalEl && !defenderModalEl.classList.contains('hidden');
    const game = (window as any).__getGame?.();
    if (game && typeof game.resume === 'function' && !isDefenderModalOpen) {
      game.resume();
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.focus();
  };

  (window as any).__closeSettings = closeSettings;
  (window as any).__openSettings = openSettings;

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
      const foreignModalEl = document.getElementById('foreign-worlds-modal');
      if (foreignModalEl && !foreignModalEl.classList.contains('hidden')) {
        return;
      }
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
    window.dispatchEvent(new CustomEvent('ragnarok-theme-changed', {
      detail: { activeTheme: document.body.dataset.activeTheme }
    }));
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
    let ariaLabel = dict['switchToLightMode'] || dict['toggleTheme'] || 'Toggle Theme';
    if (theme === 'light') {
      text = dict['themeLight'];
      ariaLabel = dict['switchToDarkMode'] || dict['toggleTheme'] || 'Toggle Theme';
    } else if (theme === 'dark') {
      text = dict['themeDark'];
      ariaLabel = dict['switchToSystemTheme'] || dict['toggleTheme'] || 'Toggle Theme';
    }

    btn.setAttribute('aria-label', ariaLabel);

    const innerSpan = btn.querySelector('.theme-btn-text');
    if (innerSpan) {
      innerSpan.textContent = text;
    } else {
      btn.textContent = text;
    }
  };

  const applyLanguage = (lang: string) => {
    setCurrentLang(lang as SupportedLang);
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

    updateSoundUI();
    updateLevelSettingsUI();
    updateForeignUnitsUI();

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
      } else if (currentTheme === 'system') {
        document.body.dataset.theme = 'light';
      } else {
        document.body.dataset.theme = 'dark';
      }
      
      localStorage.setItem('ragnarok_theme', document.body.dataset.theme);
      updateThemeButtonText(themeToggleBtn, document.body.dataset.theme, getDict());
      applyTheme();
    });
  }

  // Foreign Worlds Modal Instance
  const foreignWorldsModal = new ForeignWorldsModal();
  (window as any).__foreignWorldsModal = foreignWorldsModal;
  (window as any).__openForeignWorldsModal = () => foreignWorldsModal.open();
  (window as any).__foreignTroopsModal = foreignWorldsModal;
  (window as any).__openForeignTroopsModal = () => foreignWorldsModal.open();

  // Foreign Units Policy Controls in Settings
  const segmentedOptions = Array.from(document.querySelectorAll<HTMLButtonElement>('.foreign-units-segmented .segmented-opt'));
  const configureForeignUnitsBtn = document.getElementById('configure-foreign-units-btn') as HTMLButtonElement | null;

  updateForeignUnitsUI = () => {
    const mode = getForeignUnitsMode();
    segmentedOptions.forEach(opt => {
      const optMode = opt.dataset.mode;
      const isActive = optMode === mode;
      opt.classList.toggle('active', isActive);
      opt.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    if (configureForeignUnitsBtn) {
      const isLimited = mode === 'limited';
      configureForeignUnitsBtn.style.display = isLimited ? 'inline-flex' : 'none';
      configureForeignUnitsBtn.classList.toggle('is-active-limited', isLimited);
    }
  };

  segmentedOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const mode = (opt.dataset.mode || 'disable') as ForeignUnitsMode;
      soundManager.playClick();
      setForeignUnitsMode(mode);
      updateForeignUnitsUI();
      if (mode === 'limited') {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        foreignWorldsModal.open();
      } else {
        if (foreignWorldsModal.isOpen()) {
          foreignWorldsModal.close();
        }
        const defenderModalEl = document.getElementById('defender-modal');
        if (defenderModalEl && !defenderModalEl.classList.contains('hidden')) {
          if (closeTimeout) {
            clearTimeout(closeTimeout);
          }
          closeTimeout = window.setTimeout(() => {
            closeSettings();
            closeTimeout = null;
          }, 180);
        }
      }
    });
  });

  if (configureForeignUnitsBtn) {
    configureForeignUnitsBtn.addEventListener('click', () => {
      soundManager.playClick();
      foreignWorldsModal.open();
    });
  }

  updateForeignUnitsUI();
  window.addEventListener('foreignunitssettingchanged', updateForeignUnitsUI);

  const infiniteCurrencyBadge = document.getElementById('infinite-currency-badge');

  window.addEventListener('infiniteresourcessettingchanged', () => {
    updateLevelSettingsUI();
  });
  window.addEventListener('levelconfigchanged', () => {
    updateLevelSettingsUI();
  });

  // Custom Select (i18n)
  const customSelect = document.getElementById('lang-select');
  const savedLang = localStorage.getItem('ragnarok_lang') || 'en';

  if (customSelect) {
    const selected = customSelect.querySelector('.select-selected') as HTMLElement;
    const itemsList = customSelect.querySelector('.select-items') as HTMLElement;
    const items = itemsList.querySelectorAll('div');
    const parentRow = customSelect.closest('.settings-row');

    closeLanguageDropdown = () => {
      itemsList.classList.add('select-hide');
      customSelect.classList.remove('is-open');
      parentRow?.classList.remove('is-open');
      selected?.classList.remove('select-arrow-active');
    };

    const toggleLanguageDropdown = () => {
      const isHidden = itemsList.classList.contains('select-hide');
      if (isHidden) {
        itemsList.classList.remove('select-hide');
        customSelect.classList.add('is-open');
        parentRow?.classList.add('is-open');
        selected?.classList.add('select-arrow-active');
      } else {
        closeLanguageDropdown();
      }
    };

    const syncSelectedLangOption = (activeLang: string) => {
      items.forEach(opt => {
        opt.classList.toggle('is-selected', (opt as HTMLElement).dataset.lang === activeLang);
      });
    };

    // Restore saved language selection in dropdown UI
    if (savedLang) {
      const savedOption = customSelect.querySelector(`[data-lang="${savedLang}"]`) as HTMLElement;
      if (savedOption && selected) {
        selected.innerHTML = savedOption.innerHTML;
        selected.dataset.lang = savedLang;
      }
      syncSelectedLangOption(savedLang);
    }

    applyLanguage(savedLang);

    selected.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      toggleLanguageDropdown();
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const lang = target.dataset.lang || 'en';
        
        // Update selected display
        selected.innerHTML = target.innerHTML;
        selected.dataset.lang = lang;
        syncSelectedLangOption(lang);
        closeLanguageDropdown();
        
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
      closeLanguageDropdown();
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
  const applyAllLevelsBtn = document.getElementById('apply-all-levels-btn') as HTMLButtonElement | null;
  const resetCurrentLevelBtn = document.getElementById('reset-current-level-btn') as HTMLButtonElement | null;
  const resetAllLevelsBtn = document.getElementById('reset-all-levels-btn') as HTMLButtonElement | null;

  updateLevelSettingsUI = () => {
    const lang = document.body.dataset.lang || 'en';
    const isBulkAll = currentSettingsLevel === 'all';
    const anyCustomized = CONFIG_LEVELS.some(lvl => isLevelCustomized(lvl));

    // Update level selector pills (All + 1..10)
    levelPillButtons.forEach(pill => {
      const rawLevel = pill.dataset.level || '1';
      if (rawLevel === 'all') {
        const isCurrent = isBulkAll;
        pill.classList.toggle('active', isCurrent);
        pill.classList.toggle('customized', anyCustomized);
        pill.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        const allLabel = t('allLevels', lang);
        pill.setAttribute('aria-label', allLabel);
        pill.title = t('allLevelsPillTooltip', lang);
      } else {
        const lvl = parseInt(rawLevel, 10);
        const isCurrent = !isBulkAll && lvl === currentSettingsLevel;
        pill.classList.toggle('active', isCurrent);
        const lvlIsCustom = isLevelCustomized(lvl);
        pill.classList.toggle('customized', lvlIsCustom);
        pill.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        const lvlLabel = `${t('level', lang)} ${lvl}`;
        pill.setAttribute('aria-label', lvlLabel);
        pill.title = lvlIsCustom ? `${lvlLabel} (${t('customLabel', lang)})` : lvlLabel;
      }
    });

    if (isBulkAll) {
      const currencies = CONFIG_LEVELS.map(lvl => getStartingCurrencyForLevel(lvl));
      const infinites = CONFIG_LEVELS.map(lvl => getInfiniteResourcesForLevel(lvl));
      const slotsList = CONFIG_LEVELS.map(lvl => getSlotLimitForLevel(lvl));

      const allInfinite = infinites.every(Boolean);
      const noneInfinite = infinites.every(v => !v);
      const someInfinite = !allInfinite && !noneInfinite;
      const uniformCurrency = noneInfinite && currencies.every(c => c === currencies[0]) ? currencies[0] : null;
      const minCurrency = Math.min(...currencies);
      const maxCurrency = Math.max(...currencies);

      const uniformSlots = slotsList.every(s => s === slotsList[0]) ? slotsList[0] : null;
      const minSlots = Math.min(...slotsList);
      const maxSlots = Math.max(...slotsList);
      const isUniformAll = (allInfinite || uniformCurrency !== null) && uniformSlots !== null;

      if (levelIndicator) {
        let badgeClass = 'is-default';
        let badgeTag = t('defaultLabel', lang);
        if (anyCustomized) {
          if (isUniformAll) {
            badgeClass = 'is-custom';
            badgeTag = t('customLabel', lang);
          } else {
            badgeClass = 'is-mixed';
            badgeTag = t('mixedLabel', lang);
          }
        }
        levelIndicator.innerHTML = `
          <span class="lvl-title">${t('allLevels', lang)}</span>
          <span class="cfg-badge ${badgeClass}">${badgeTag}</span>
        `;
      }

      if (applyAllLevelsBtn) {
        applyAllLevelsBtn.classList.add('hidden');
      }
      if (resetCurrentLevelBtn) {
        resetCurrentLevelBtn.textContent = t('resetAllLevels', lang);
        resetCurrentLevelBtn.title = t('resetAllLevelsTooltip', lang);
      }

      if (currencyInput) {
        if (allInfinite) {
          currencyInput.type = 'text';
          currencyInput.placeholder = '';
          currencyInput.value = '∞';
          currencyInput.disabled = true;
        } else if (uniformCurrency !== null) {
          currencyInput.type = 'number';
          currencyInput.disabled = false;
          currencyInput.placeholder = '';
          currencyInput.value = uniformCurrency.toString();
        } else {
          currencyInput.type = 'number';
          currencyInput.disabled = false;
          currencyInput.value = '';
          currencyInput.placeholder = someInfinite
            ? `${minCurrency}–∞`
            : (minCurrency === maxCurrency ? `${minCurrency}` : `${minCurrency}–${maxCurrency}`);
        }
      }

      if (currencyMinusBtn) {
        currencyMinusBtn.disabled = allInfinite || currencies.every((c, idx) => infinites[idx] || c <= MIN_STARTING_CURRENCY);
      }
      if (currencyPlusBtn) {
        currencyPlusBtn.disabled = allInfinite || currencies.every((c, idx) => infinites[idx] || c >= MAX_STARTING_CURRENCY);
      }
      if (infiniteCurrencyBadge) {
        infiniteCurrencyBadge.classList.toggle('hidden', !allInfinite);
      }

      presetPills.forEach(pill => {
        const amtStr = pill.dataset.amount;
        if (amtStr === 'infinite') {
          pill.classList.toggle('active', allInfinite);
          pill.setAttribute('aria-pressed', allInfinite ? 'true' : 'false');
        } else {
          const amt = parseInt(amtStr || '0', 10);
          const isActive = !allInfinite && uniformCurrency !== null && amt === uniformCurrency;
          pill.classList.toggle('active', isActive);
          pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        }
      });

      if (slotsDisplay) {
        const formatStr = t('slotsCount', lang);
        const countLabel = uniformSlots !== null ? uniformSlots.toString() : `${minSlots}–${maxSlots}`;
        slotsDisplay.textContent = formatStr.replace('{count}', countLabel);
      }
      if (slotsMinusBtn) {
        slotsMinusBtn.disabled = slotsList.every(s => s <= MIN_SLOTS);
      }
      if (slotsPlusBtn) {
        slotsPlusBtn.disabled = slotsList.every(s => s >= MAX_SLOTS);
      }

      if (slotPipsContainer) {
        slotPipsContainer.innerHTML = '';
        for (let i = 1; i <= MAX_SLOTS; i++) {
          const pip = document.createElement('button');
          pip.type = 'button';
          const stateClass = i <= minSlots ? 'active' : (i <= maxSlots ? 'partial' : 'empty');
          const statusLabel = i <= minSlots
            ? t('slotActive', lang)
            : (i <= maxSlots ? t('slotPartial', lang) : t('locked', lang));
          const setActionLabel = t('setSlotsTooltip', lang).replace('{count}', i.toString());
          pip.className = `slot-pip ${stateClass}`;
          pip.title = `${t('slot', lang)} ${i} (${statusLabel}) — ${setActionLabel}`;
          pip.setAttribute('aria-label', setActionLabel);
          pip.innerHTML = `<span class="pip-num">${i}</span>`;
          pip.addEventListener('click', () => {
            soundManager.playClick();
            setSlotLimitForAllLevels(i);
            updateLevelSettingsUI();
          });
          slotPipsContainer.appendChild(pip);
        }
      }
      return;
    }

    const activeLevel = currentSettingsLevel as number;
    const currentCurrency = getStartingCurrencyForLevel(activeLevel);
    const currentSlots = getSlotLimitForLevel(activeLevel);
    const customized = isLevelCustomized(activeLevel);

    // Update level indicator header
    if (levelIndicator) {
      const customTag = customized ? t('customLabel', lang) : t('defaultLabel', lang);
      levelIndicator.innerHTML = `
        <span class="lvl-title">${t('level', lang)} ${activeLevel}</span>
        <span class="cfg-badge ${customized ? 'is-custom' : 'is-default'}">${customTag}</span>
      `;
    }

    if (applyAllLevelsBtn) {
      applyAllLevelsBtn.classList.remove('hidden');
      if (!applyAllLevelsBtn.classList.contains('is-applied')) {
        applyAllLevelsBtn.textContent = t('applyToAllLevels', lang);
      }
      applyAllLevelsBtn.title = t('applyToAllLevelsTooltip', lang);
    }
    if (resetCurrentLevelBtn) {
      resetCurrentLevelBtn.textContent = t('resetLevel', lang);
      resetCurrentLevelBtn.title = t('resetLevelTooltip', lang);
    }

    // Update currency input & presets (per-level infinite resources)
    const isInfinite = getInfiniteResourcesForLevel(activeLevel);
    if (currencyInput) {
      currencyInput.placeholder = '';
      if (isInfinite) {
        currencyInput.type = 'text';
        currencyInput.value = '∞';
        currencyInput.disabled = true;
      } else {
        currencyInput.type = 'number';
        currencyInput.disabled = false;
        currencyInput.value = currentCurrency.toString();
      }
    }
    if (currencyMinusBtn) {
      currencyMinusBtn.disabled = isInfinite || currentCurrency <= MIN_STARTING_CURRENCY;
    }
    if (currencyPlusBtn) {
      currencyPlusBtn.disabled = isInfinite || currentCurrency >= MAX_STARTING_CURRENCY;
    }
    if (infiniteCurrencyBadge) {
      infiniteCurrencyBadge.classList.toggle('hidden', !isInfinite);
    }

    presetPills.forEach(pill => {
      const amtStr = pill.dataset.amount;
      if (amtStr === 'infinite') {
        pill.classList.toggle('active', isInfinite);
        pill.setAttribute('aria-pressed', isInfinite ? 'true' : 'false');
      } else {
        const amt = parseInt(amtStr || '0', 10);
        const isActive = !isInfinite && amt === currentCurrency;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
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
        const pip = document.createElement('button');
        pip.type = 'button';
        const isActive = i <= currentSlots;
        const setActionLabel = t('setSlotsTooltip', lang).replace('{count}', i.toString());
        pip.className = `slot-pip ${isActive ? 'active' : 'empty'}`;
        pip.title = `${t('slot', lang)} ${i} (${isActive ? t('slotActive', lang) : t('locked', lang)}) — ${setActionLabel}`;
        pip.setAttribute('aria-label', setActionLabel);
        pip.innerHTML = `<span class="pip-num">${i}</span>`;
        pip.addEventListener('click', () => {
          soundManager.playClick();
          setSlotLimitForLevel(activeLevel, i);
          updateLevelSettingsUI();
        });
        slotPipsContainer.appendChild(pip);
      }
    }
  };

  // Attach event listeners for level settings
  levelPillButtons.forEach(pill => {
    pill.addEventListener('click', () => {
      const rawLevel = pill.dataset.level || '1';
      const nextSelection: number | 'all' = rawLevel === 'all' ? 'all' : parseInt(rawLevel, 10);
      if (nextSelection !== currentSettingsLevel) {
        soundManager.playClick();
        currentSettingsLevel = nextSelection;
        updateLevelSettingsUI();
      }
    });
  });

  if (currencyMinusBtn) {
    currencyMinusBtn.addEventListener('click', () => {
      soundManager.playClick();
      if (currentSettingsLevel === 'all') {
        adjustStartingCurrencyForAllLevels(-50);
      } else {
        const cur = getStartingCurrencyForLevel(currentSettingsLevel);
        setStartingCurrencyForLevel(currentSettingsLevel, Math.max(MIN_STARTING_CURRENCY, cur - 50));
      }
      updateLevelSettingsUI();
    });
  }

  if (currencyPlusBtn) {
    currencyPlusBtn.addEventListener('click', () => {
      soundManager.playClick();
      if (currentSettingsLevel === 'all') {
        adjustStartingCurrencyForAllLevels(50);
      } else {
        const cur = getStartingCurrencyForLevel(currentSettingsLevel);
        setStartingCurrencyForLevel(currentSettingsLevel, Math.min(MAX_STARTING_CURRENCY, cur + 50));
      }
      updateLevelSettingsUI();
    });
  }

  if (currencyInput) {
    const handleCurrencyCommit = () => {
      let val = parseInt(currencyInput.value, 10);
      if (currentSettingsLevel === 'all') {
        if (!isNaN(val)) {
          setStartingCurrencyForAllLevels(val);
        }
        updateLevelSettingsUI();
        return;
      }
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
      const amtStr = pill.dataset.amount;
      if (amtStr === 'infinite') {
        if (currentSettingsLevel === 'all') {
          const allInfinite = CONFIG_LEVELS.every(lvl => getInfiniteResourcesForLevel(lvl));
          setInfiniteResourcesForAllLevels(!allInfinite);
        } else {
          const nextInfinite = !getInfiniteResourcesForLevel(currentSettingsLevel);
          setInfiniteResourcesForLevel(currentSettingsLevel, nextInfinite);
        }
        updateLevelSettingsUI();
      } else {
        const amt = parseInt(amtStr || '0', 10);
        if (amt > 0) {
          if (currentSettingsLevel === 'all') {
            setStartingCurrencyForAllLevels(amt);
          } else {
            setStartingCurrencyForLevel(currentSettingsLevel, amt);
          }
          updateLevelSettingsUI();
        }
      }
    });
  });

  if (slotsMinusBtn) {
    slotsMinusBtn.addEventListener('click', () => {
      soundManager.playClick();
      if (currentSettingsLevel === 'all') {
        adjustSlotLimitForAllLevels(-1);
        updateLevelSettingsUI();
      } else {
        const cur = getSlotLimitForLevel(currentSettingsLevel);
        if (cur > MIN_SLOTS) {
          setSlotLimitForLevel(currentSettingsLevel, cur - 1);
          updateLevelSettingsUI();
        }
      }
    });
  }

  if (slotsPlusBtn) {
    slotsPlusBtn.addEventListener('click', () => {
      soundManager.playClick();
      if (currentSettingsLevel === 'all') {
        adjustSlotLimitForAllLevels(1);
        updateLevelSettingsUI();
      } else {
        const cur = getSlotLimitForLevel(currentSettingsLevel);
        if (cur < MAX_SLOTS) {
          setSlotLimitForLevel(currentSettingsLevel, cur + 1);
          updateLevelSettingsUI();
        }
      }
    });
  }

  if (applyAllLevelsBtn) {
    applyAllLevelsBtn.addEventListener('click', () => {
      if (currentSettingsLevel === 'all') return;
      soundManager.playClick();
      applyLevelConfigToAllLevels(currentSettingsLevel);
      const lang = document.body.dataset.lang || 'en';
      applyAllLevelsBtn.classList.add('is-applied');
      applyAllLevelsBtn.textContent = `✓ ${t('applied', lang)}`;
      if (applyFeedbackTimeout) {
        clearTimeout(applyFeedbackTimeout);
      }
      applyFeedbackTimeout = window.setTimeout(() => {
        applyAllLevelsBtn.classList.remove('is-applied');
        const curLang = document.body.dataset.lang || 'en';
        applyAllLevelsBtn.textContent = t('applyToAllLevels', curLang);
        applyFeedbackTimeout = null;
      }, 1200);
      updateLevelSettingsUI();
    });
  }

  if (resetCurrentLevelBtn) {
    resetCurrentLevelBtn.addEventListener('click', () => {
      soundManager.playClick();
      if (currentSettingsLevel === 'all') {
        resetAllLevelConfigs();
      } else {
        resetLevelConfig(currentSettingsLevel);
      }
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


