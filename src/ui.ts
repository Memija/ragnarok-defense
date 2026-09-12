import { SoundManager } from './engine/SoundManager';
import { translations } from './i18n';

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
}

