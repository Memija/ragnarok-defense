const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Ragnarok Defense',
    sun: 'Sun',
    level: 'Level',
    dig: 'DIG',
    version: 'Version',
  },
  de: {
    title: 'Ragnarök Verteidigung',
    sun: 'Sonne',
    level: 'Level',
    dig: 'GRABEN',
    version: 'Version',
  }
};

export function initUI() {
  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsModal = document.getElementById('settings-modal');

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });
  }

  const themeToggleBtn = document.getElementById('theme-toggle');

  // Theme Toggling
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme;
      if (currentTheme === 'light') {
        document.body.dataset.theme = 'dark';
        themeToggleBtn.textContent = '☀️ Light Mode';
        themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        document.body.dataset.theme = 'light';
        themeToggleBtn.textContent = '🌙 Dark Mode';
        themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    });
  }

  // Custom Select (i18n)
  const customSelect = document.getElementById('lang-select');
  if (customSelect) {
    const selected = customSelect.querySelector('.select-selected') as HTMLElement;
    const itemsList = customSelect.querySelector('.select-items') as HTMLElement;
    const items = itemsList.querySelectorAll('div');

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
        itemsList.classList.add('select-hide');
        
        // Translate
        const dict = translations[lang] || translations['en'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (key && dict[key]) {
            el.textContent = dict[key];
          }
        });
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      itemsList.classList.add('select-hide');
    });
  }
}
