import {
  DEFENDERS_MAP,
  CATEGORIES,
  type WorldId,
  getDefenderSlotLimit,
  getRecommendedLoadout,
  getSavedLoadout,
  saveLoadout,
  getLocalizedDefender,
  getDefenderInfo,
  getDefendersListForRealm,
  getDefendersGroupedByWorld,
  getWorldMeta
} from './DefenderRegistry';
import { SoundManager } from './SoundManager';
import { t } from '../i18n';
import { getRealmCurrency, getRealmCurrencyName } from './Currency';

export interface SelectionModalOptions {
  realm: string;
  city?: string;
  level: number;
  initialSelected?: string[];
  isMidGame?: boolean;
  onConfirm: (selectedDefenders: string[]) => void;
  onCancel?: () => void;
}

export class DefenderSelectionModal {
  private modalEl: HTMLElement | null;
  private backdropEl: HTMLElement | null;
  private closeBtn: HTMLElement | null;
  private gridEl: HTMLElement | null;
  private slotsPreviewEl: HTMLElement | null;
  private capacityCountEl: HTMLElement | null;
  private levelBadgeEl: HTMLElement | null;
  private autoPickBtn: HTMLElement | null;
  private clearBtn: HTMLElement | null;
  private confirmBtn: HTMLElement | null;
  private confirmPillEl: HTMLElement | null;
  private tabsContainerEl: HTMLElement | null;

  // Warning Modal Elements
  private warningModalEl: HTMLElement | null;
  private warningBackdropEl: HTMLElement | null;
  private closeWarningBtn: HTMLElement | null;
  private warningProceedBtn: HTMLElement | null;
  private warningAdjustBtn: HTMLElement | null;
  private warningDescEl: HTMLElement | null;
  private warningSlotStripEl: HTMLElement | null;

  private currentOptions: SelectionModalOptions | null = null;
  private selected: string[] = [];
  private limit: number = 4;
  private activeWorldFilter: 'all' | WorldId = 'all';

  constructor() {
    this.modalEl = document.getElementById('defender-modal');
    this.backdropEl = this.modalEl?.querySelector('.defender-modal-backdrop') || null;
    this.closeBtn = document.getElementById('close-defender-btn');
    this.gridEl = document.getElementById('defender-grid');
    this.slotsPreviewEl = document.getElementById('equipped-slots-preview');
    this.capacityCountEl = document.getElementById('capacity-count');
    this.levelBadgeEl = document.getElementById('capacity-level-badge');
    this.autoPickBtn = document.getElementById('auto-pick-btn');
    this.clearBtn = document.getElementById('clear-roster-btn');
    this.confirmBtn = document.getElementById('confirm-defenders-btn');
    this.confirmPillEl = document.getElementById('confirm-slots-pill');
    this.tabsContainerEl = document.getElementById('category-tabs');

    this.warningModalEl = document.getElementById('squad-warning-modal');
    this.warningBackdropEl = this.warningModalEl?.querySelector('.squad-warning-backdrop') || null;
    this.closeWarningBtn = document.getElementById('close-warning-btn');
    this.warningProceedBtn = document.getElementById('warning-proceed-btn');
    this.warningAdjustBtn = document.getElementById('warning-adjust-btn');
    this.warningDescEl = document.getElementById('squad-warning-desc');
    this.warningSlotStripEl = document.getElementById('warning-slot-strip');

    this.bindEvents();
  }

  private bindEvents() {
    this.closeBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.close();
      this.currentOptions?.onCancel?.();
    });

    this.backdropEl?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.close();
      this.currentOptions?.onCancel?.();
    });

    this.autoPickBtn?.addEventListener('click', () => {
      if (!this.currentOptions) return;
      SoundManager.getInstance().playClick();
      this.selected = getRecommendedLoadout(this.currentOptions.level);
      this.render();
    });

    this.clearBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.selected = [];
      this.render();
    });

    this.confirmBtn?.addEventListener('click', () => {
      if (this.selected.length === 0) return;
      if (this.selected.length < this.limit) {
        this.openWarningModal();
      } else {
        this.proceedToBattle();
      }
    });

    this.closeWarningBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.closeWarningModal();
    });

    this.warningBackdropEl?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.closeWarningModal();
    });

    this.warningAdjustBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.closeWarningModal();
    });

    this.warningProceedBtn?.addEventListener('click', () => {
      this.proceedToBattle();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.warningModalEl && !this.warningModalEl.classList.contains('hidden')) {
          this.closeWarningModal();
          return;
        }
        if (this.modalEl && !this.modalEl.classList.contains('hidden')) {
          this.close();
          this.currentOptions?.onCancel?.();
        }
      }
    });

    window.addEventListener('languagechange', () => {
      this.renderWorldTabs();
      this.updateModalHeaderAndButton();
      if (this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.render();
      }
      if (this.warningModalEl && !this.warningModalEl.classList.contains('hidden')) {
        this.updateWarningModalContent();
      }
    });
  }

  private openWarningModal() {
    SoundManager.getInstance().playClick();
    this.updateWarningModalContent();
    this.warningModalEl?.classList.remove('hidden');
  }

  private updateWarningModalContent() {
    if (this.warningDescEl) {
      const template = t('squadIncompleteWarning') || 'Your squad only has {current} of {max} defenders selected. Are you sure you want to march into battle without a full roster?';
      this.warningDescEl.innerHTML = template
        .replace('{current}', `<strong class="hl-slot">${this.selected.length}</strong>`)
        .replace('{max}', `<strong class="hl-slot">${this.limit}</strong>`);
    }

    if (this.warningSlotStripEl) {
      this.warningSlotStripEl.innerHTML = '';
      for (let i = 0; i < this.limit; i++) {
        const pill = document.createElement('div');
        const unitId = this.selected[i];
        if (unitId && DEFENDERS_MAP[unitId]) {
          const unit = getDefenderInfo(unitId) || DEFENDERS_MAP[unitId];
          pill.className = 'slot-pill filled';
          pill.innerHTML = `<span>${unit.icon}</span> <span>${unit.name}</span>`;
        } else {
          pill.className = 'slot-pill empty';
          pill.innerHTML = `<span>⭕</span> <span>${t('slotEmpty')}</span>`;
        }
        this.warningSlotStripEl.appendChild(pill);
      }
    }
  }

  private closeWarningModal() {
    this.warningModalEl?.classList.add('hidden');
  }

  private proceedToBattle() {
    SoundManager.getInstance().playPlant();
    saveLoadout(this.selected);
    const chosen = [...this.selected];
    this.closeWarningModal();
    this.close();
    this.currentOptions?.onConfirm(chosen);
  }

  private renderWorldTabs() {
    if (!this.tabsContainerEl) return;
    this.tabsContainerEl.innerHTML = '';
    const currentRealm = this.currentOptions?.realm || 'midgard';
    const defendersList = getDefendersListForRealm(currentRealm);
    const groups = getDefendersGroupedByWorld(currentRealm);

    // All Worlds Tab
    const allTab = document.createElement('button');
    allTab.className = `cat-tab ${this.activeWorldFilter === 'all' ? 'active' : ''}`;
    allTab.dataset.world = 'all';
    allTab.innerHTML = `
      <span class="tab-icon">🌐</span>
      <span class="tab-label">${t('allWorlds') || 'All Worlds'}</span>
      <span class="tab-count">${defendersList.length}</span>
    `;
    allTab.addEventListener('click', () => {
      this.activeWorldFilter = 'all';
      this.updateActiveTabStyles();
      SoundManager.getInstance().playClick();
      this.renderGrid();
    });
    this.tabsContainerEl.appendChild(allTab);

    // World Tabs (Active Home Realm first!)
    groups.forEach(group => {
      const world = group.world;
      const btn = document.createElement('button');
      btn.className = `cat-tab ${group.isHomeWorld ? 'home-tab' : ''} ${this.activeWorldFilter === world.id ? 'active' : ''}`;
      btn.dataset.world = world.id;
      btn.style.setProperty('--world-color', world.color);
      const worldName = t(`world_${world.id}`) || world.name;
      btn.innerHTML = `
        <span class="tab-icon">${world.icon}</span>
        <span class="tab-label">${worldName}${group.isHomeWorld ? ' 🛡️' : ''}</span>
        <span class="tab-count">${group.defenders.length}</span>
      `;
      btn.addEventListener('click', () => {
        this.activeWorldFilter = world.id;
        this.updateActiveTabStyles();
        SoundManager.getInstance().playClick();
        this.renderGrid();
      });
      this.tabsContainerEl?.appendChild(btn);
    });
  }

  private updateActiveTabStyles() {
    if (!this.tabsContainerEl) return;
    const tabs = this.tabsContainerEl.querySelectorAll<HTMLElement>('.cat-tab');
    tabs.forEach(tab => {
      const world = tab.dataset.world;
      if (world === this.activeWorldFilter) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  private updateModalHeaderAndButton() {
    if (!this.currentOptions) return;
    const options = this.currentOptions;
    if (this.levelBadgeEl) {
      if (options.city) {
        const cityKey = `loc_${options.city.replace(/-/g, '_')}_name`;
        const transCity = t(cityKey);
        const cityFormatted = transCity !== cityKey ? transCity : options.city.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
        this.levelBadgeEl.textContent = `${cityFormatted} · ${t('level')} ${options.level}`;
      } else {
        const realmKey = `world_${options.realm}`;
        const transRealm = t(realmKey);
        const realmFormatted = transRealm !== realmKey ? transRealm : options.realm.replace(/\b\w/g, c => c.toUpperCase());
        this.levelBadgeEl.textContent = `${realmFormatted} · ${t('level')} ${options.level}`;
      }
    }

    const confirmBtnText = this.confirmBtn?.querySelector('.btn-text');
    if (confirmBtnText) {
      confirmBtnText.textContent = options.isMidGame ? (t('updateSquad') || 'Update Squad ⚔️') : (t('toBattle') || 'To Battle ⚔️');
    }
  }

  public open(options: SelectionModalOptions) {
    this.currentOptions = options;
    this.limit = getDefenderSlotLimit(options.level);

    if (options.initialSelected && options.initialSelected.length > 0) {
      this.selected = options.initialSelected.slice(0, this.limit);
    } else {
      this.selected = getSavedLoadout(options.level);
    }

    if (this.selected.length === 0) {
      this.selected = getRecommendedLoadout(options.level);
    }

    // Ensure we don't exceed the limit
    if (this.selected.length > this.limit) {
      this.selected = this.selected.slice(0, this.limit);
    }

    // Reset active world filter to 'all'
    this.activeWorldFilter = 'all';
    this.renderWorldTabs();
    this.updateModalHeaderAndButton();
    this.render();

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }

    if (options.isMidGame) {
      const game = (window as any).__getGame?.();
      if (game && typeof game.pause === 'function') {
        game.pause();
      }
    }
  }

  public close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    if (this.currentOptions?.isMidGame) {
      const game = (window as any).__getGame?.();
      if (game && typeof game.resume === 'function') {
        game.resume();
      }
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.focus();
  }

  private toggleDefender(id: string) {
    const idx = this.selected.indexOf(id);
    if (idx !== -1) {
      // Deselect
      this.selected.splice(idx, 1);
      SoundManager.getInstance().playClick();
    } else {
      // Select if not at limit
      if (this.selected.length < this.limit) {
        this.selected.push(id);
        SoundManager.getInstance().playClick();
      } else {
        // At limit feedback
        SoundManager.getInstance().playExplosion();
        return;
      }
    }
    this.render();
  }

  private render() {
    // Update capacity count
    if (this.capacityCountEl) {
      this.capacityCountEl.textContent = `${this.selected.length} / ${this.limit}`;
    }

    // Update confirm button
    if (this.confirmBtn && this.confirmPillEl) {
      this.confirmPillEl.textContent = `${this.selected.length}/${this.limit} ${t('slotsSelected')}`;
      (this.confirmBtn as HTMLButtonElement).disabled = this.selected.length === 0;
    }

    // Render Equipped Slot Preview
    this.renderEquippedSlots();

    // Render Grid with categorized sections
    this.renderGrid();
  }

  private renderEquippedSlots() {
    if (!this.slotsPreviewEl) return;
    this.slotsPreviewEl.innerHTML = '';

    for (let i = 0; i < this.limit; i++) {
      const token = document.createElement('div');
      const unitId = this.selected[i];
      const currentRealm = this.currentOptions?.realm || 'midgard';
      if (unitId && (DEFENDERS_MAP[unitId] || unitId === 'sunflower' || unitId.startsWith('sunflower_'))) {
        const unit = getDefenderInfo(unitId, currentRealm) || DEFENDERS_MAP[unitId];
        const categoryLabel = t(`cat_${unit.category}_title`) || (unit.category === 'plants' ? t('catPlants') : t('catTowers'));
        const worldMeta = getWorldMeta(unit.world);
        const worldName = t(`world_${worldMeta.id}`) || worldMeta.name;

        token.className = 'slot-token filled';
        token.title = `${unit.name} (${worldName} · ${categoryLabel}) — ${t('clickToRemove')}`;
        token.style.borderColor = worldMeta.badgeBorder;
        token.innerHTML = `
          <span class="token-icon">${unit.icon}</span>
          <span class="slot-num">${i + 1}</span>
          <span class="token-remove-hint">✕</span>
        `;
        token.addEventListener('click', () => {
          this.toggleDefender(unitId);
        });
      } else {
        token.className = 'slot-token empty';
        token.title = `${t('slot')} ${i + 1} (${t('slotEmpty')})`;
        token.innerHTML = `<span class="slot-num">${i + 1}</span>`;
      }
      this.slotsPreviewEl.appendChild(token);
    }
  }

  private renderGrid() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    const isFull = this.selected.length >= this.limit;
    const currentRealm = this.currentOptions?.realm || 'midgard';

    const allGroups = getDefendersGroupedByWorld(currentRealm);
    const groupsToRender = this.activeWorldFilter === 'all'
      ? allGroups
      : allGroups.filter(g => g.world.id === this.activeWorldFilter);

    groupsToRender.forEach(group => {
      const world = group.world;
      const units = group.defenders;
      if (units.length === 0) return;

      const section = document.createElement('section');
      section.className = `roster-section section-world section-${world.id} ${group.isHomeWorld ? 'is-home-realm' : ''}`;
      section.style.setProperty('--world-accent', world.color);
      section.style.setProperty('--world-border', world.badgeBorder);
      section.style.setProperty('--world-bg', world.badgeBg);

      const localizedWorldName = t(`world_${world.id}`) || world.name;
      const localizedWorldSub = t(`realm_${world.id}`) || world.sub;

      // Section Header Banner
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `
        <div class="section-title-group">
          <div class="section-icon-frame" style="border-color:${world.badgeBorder}; background:${world.badgeBg};">
            <span class="section-rune">${world.rune}</span>
            <span class="section-icon">${world.icon}</span>
          </div>
          <div>
            <div class="section-title-line">
              <h3 class="section-title" style="color:${world.color};">${localizedWorldName}</h3>
              ${group.isHomeWorld ? `<span class="section-home-badge">🛡️ ${t('hostRealmDefenses') || 'Host Realm'}</span>` : ''}
            </div>
            <p class="section-subtitle">${localizedWorldSub}</p>
          </div>
        </div>
        <span class="section-badge" style="border-color:${world.badgeBorder}; background:${world.badgeBg}; color:${world.color};">
          ${units.length} ${t('available') || 'Available'}
        </span>
      `;
      section.appendChild(header);

      // Section Cards Container
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'section-cards-grid';

      units.forEach(rawDef => {
        const def = getLocalizedDefender(rawDef, currentRealm);
        const isSelected = this.selected.includes(def.id);
        const slotIdx = isSelected ? this.selected.indexOf(def.id) + 1 : 0;
        const isDisabled = !isSelected && isFull;

        const card = document.createElement('div');
        card.className = `roster-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled-cap' : ''} card-world-${world.id}`;
        card.dataset.unit = def.id;
        card.dataset.world = world.id;
        card.dataset.category = def.category;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.title = def.tooltip;

        const currency = getRealmCurrency(currentRealm);
        const currencyName = getRealmCurrencyName(currentRealm);
        const catKey = def.category;
        const catMeta = CATEGORIES[catKey];
        const catName = t(`cat_${catKey}_title`) || catMeta?.name || def.categoryName;

        card.innerHTML = `
          ${isSelected ? `<span class="card-slot-badge">#${slotIdx}</span>` : ''}
          <div class="card-check">✓</div>

          <div class="card-top-row">
            <div class="card-icon-frame" style="border-color:${world.badgeBorder}">
              <span class="card-icon">${def.icon}</span>
            </div>
            <div class="card-identity">
              <span class="card-name">${def.name}</span>
              <span class="card-origin" style="color:${world.color}">✦ ${def.origin}</span>
            </div>
            <div class="card-cost" title="${currencyName} Cost">
              <span class="currency-icon">${currency.symbol}</span> ${def.cost}
            </div>
          </div>

          <div class="card-role-row">
            <span class="role-pill" style="border-color:${world.badgeBorder}; background:${world.badgeBg}; color:${world.color};">
              ${def.role}
            </span>
            <span class="category-mini-pill cat-${catKey}">
              ${catKey === 'plants' ? '🌿' : '🏰'} ${catName}
            </span>
          </div>

          <p class="card-desc">${def.desc}</p>
        `;

        card.addEventListener('click', () => {
          this.toggleDefender(def.id);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleDefender(def.id);
          }
        });

        cardsGrid.appendChild(card);
      });

      section.appendChild(cardsGrid);
      this.gridEl?.appendChild(section);
    });
  }
}
