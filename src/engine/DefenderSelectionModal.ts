import {
  DEFENDERS_MAP,
  CATEGORIES,
  type WorldId,
  getDefenderSlotLimit,
  getBestPossibleMixLoadout,
  getSquadSynergies,
  type SquadMixPreset,
  getSavedLoadout,
  saveLoadout,
  getLocalizedDefender,
  getDefenderInfo,
  getDefendersListForRealm,
  getDefendersGroupedByWorld,
  getWorldMeta,
  isCurrencyProducer,
  isDefenderAllowedInRealm
} from './DefenderRegistry';
import { getForeignUnitsMode, getLimitedForeignWorlds, isForeignWorldAllowedInLimited } from './GameConfig';
import { ForeignWorldsModal } from './ForeignWorldsModal';
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
  private bestMixBtn: HTMLElement | null;
  private mixPresetsBtn: HTMLElement | null;
  private mixPresetsMenu: HTMLElement | null;
  private synergyBarEl: HTMLElement | null;
  private synergyTokensListEl: HTMLElement | null;
  private synergyScoreBadgeEl: HTMLElement | null;
  private toastEl: HTMLElement | null;
  private toastTimeout: any = null;
  private clearBtn: HTMLElement | null;
  private confirmBtn: HTMLElement | null;
  private confirmPillEl: HTMLElement | null;
  private tabsContainerEl: HTMLElement | null;
  private foreignUnitsBadgeEl: HTMLElement | null;

  // Warning Modal Elements
  private warningModalEl: HTMLElement | null;
  private warningBackdropEl: HTMLElement | null;
  private closeWarningBtn: HTMLElement | null;
  private warningProceedBtn: HTMLElement | null;
  private warningAdjustBtn: HTMLElement | null;
  private warningTitleEl: HTMLElement | null;
  private warningDescEl: HTMLElement | null;
  private warningSlotStripEl: HTMLElement | null;

  private warningState = { isIncomplete: false, isMissingProducer: false };

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
    this.bestMixBtn = document.getElementById('best-mix-btn');
    this.mixPresetsBtn = document.getElementById('mix-presets-btn');
    this.mixPresetsMenu = document.getElementById('mix-presets-menu');
    this.synergyBarEl = document.getElementById('squad-synergy-bar');
    this.synergyTokensListEl = this.synergyBarEl?.querySelector('#synergy-tokens-list') || document.getElementById('synergy-tokens-list');
    this.synergyScoreBadgeEl = this.synergyBarEl?.querySelector('#synergy-score-badge') || document.getElementById('synergy-score-badge');
    this.toastEl = document.getElementById('squad-toast');
    this.clearBtn = document.getElementById('clear-roster-btn');
    this.confirmBtn = document.getElementById('confirm-defenders-btn');
    this.confirmPillEl = document.getElementById('confirm-slots-pill');
    this.tabsContainerEl = document.getElementById('category-tabs');
    this.foreignUnitsBadgeEl = document.getElementById('foreign-units-rule-badge');

    this.warningModalEl = document.getElementById('squad-warning-modal');
    this.warningBackdropEl = this.warningModalEl?.querySelector('.squad-warning-backdrop') || null;
    this.closeWarningBtn = document.getElementById('close-warning-btn');
    this.warningProceedBtn = document.getElementById('warning-proceed-btn');
    this.warningAdjustBtn = document.getElementById('warning-adjust-btn');
    this.warningTitleEl = document.getElementById('squad-warning-title') || (this.warningModalEl?.querySelector('.warning-title') as HTMLElement) || null;
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

    this.bestMixBtn?.addEventListener('click', () => {
      this.applyMixPreset('best');
    });

    this.mixPresetsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundManager.getInstance().playClick();
      this.togglePresetsMenu();
    });

    this.mixPresetsMenu?.querySelectorAll<HTMLElement>('.preset-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const preset = (item.dataset.preset as SquadMixPreset) || 'best';
        this.applyMixPreset(preset);
        this.closePresetsMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (this.mixPresetsMenu && !this.mixPresetsMenu.classList.contains('hidden')) {
        const target = e.target as HTMLElement;
        if (!target.closest('.best-mix-action-group')) {
          this.closePresetsMenu();
        }
      }
    });

    this.autoPickBtn?.addEventListener('click', () => {
      if (!this.currentOptions) return;
      this.applyMixPreset('balanced');
    });

    this.clearBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.selected = [];
      this.render();
    });

    this.confirmBtn?.addEventListener('click', () => {
      if (this.selected.length === 0) return;
      const producerAvailable = this.isCurrencyProducerAvailable();
      const hasProducer = this.hasSelectedCurrencyProducer();
      const isMissingProducer = producerAvailable && !hasProducer;
      const isIncomplete = this.selected.length < this.limit;

      if (isIncomplete || isMissingProducer) {
        this.openWarningModal(isIncomplete, isMissingProducer);
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
        if (this.mixPresetsMenu && !this.mixPresetsMenu.classList.contains('hidden')) {
          this.closePresetsMenu();
          return;
        }
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

    this.foreignUnitsBadgeEl?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      if (getForeignUnitsMode() === 'limited') {
        ForeignWorldsModal.getInstance()?.open();
      } else {
        (window as any).__openSettings?.();
      }
    });

    window.addEventListener('foreignunitssettingchanged', () => {
      if (this.currentOptions) {
        const realm = this.currentOptions.realm;
        if (getForeignUnitsMode() !== 'allow') {
          this.selected = this.selected.filter(id => isDefenderAllowedInRealm(id, realm));
        }
      }
      this.renderWorldTabs();
      this.updateModalHeaderAndButton();
      if (this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.render();
      }
    });
  }

  private hasSelectedCurrencyProducer(): boolean {
    const currentRealm = this.currentOptions?.realm || 'midgard';
    return this.selected.some(id => {
      const unit = getDefenderInfo(id, currentRealm) || DEFENDERS_MAP[id];
      return unit && isCurrencyProducer(unit);
    });
  }

  private isCurrencyProducerAvailable(): boolean {
    const currentRealm = this.currentOptions?.realm || 'midgard';
    const defendersList = getDefendersListForRealm(currentRealm);
    return defendersList.some(def => isCurrencyProducer(def));
  }

  private openWarningModal(isIncomplete: boolean = false, isMissingProducer: boolean = false) {
    SoundManager.getInstance().playClick();
    this.warningState = { isIncomplete, isMissingProducer };
    this.updateWarningModalContent();
    this.warningModalEl?.classList.remove('hidden');
  }

  private updateWarningModalContent() {
    const { isIncomplete, isMissingProducer } = this.warningState;
    const currentRealm = this.currentOptions?.realm || 'midgard';
    const currency = getRealmCurrency(currentRealm);
    const currencyName = getRealmCurrencyName(currentRealm);
    const defendersList = getDefendersListForRealm(currentRealm);
    const sampleProducer = defendersList.find(d => isCurrencyProducer(d));
    const sampleProducerName = sampleProducer ? sampleProducer.name : (t('def_sunflower_name') || 'Solflower');

    if (this.warningTitleEl) {
      if (isMissingProducer && !isIncomplete) {
        this.warningTitleEl.textContent = t('noProducerTitle') || 'No Producing Units';
      } else if (isMissingProducer && isIncomplete) {
        this.warningTitleEl.textContent = t('squadWarningTitle') || 'Squad Warning';
      } else {
        this.warningTitleEl.textContent = t('squadIncompleteTitle') || 'Incomplete Squad';
      }
    }

    if (this.warningDescEl) {
      if (isMissingProducer && !isIncomplete) {
        const template = t('noProducerWarning') || 'You have not selected any {currency} producing units (such as {producer}). Without generating {currencyName}, you will struggle to summon reinforcements as the battle progresses! Are you sure you want to proceed?';
        this.warningDescEl.innerHTML = template
          .replace('{currency}', `<strong class="hl-currency">${currency.symbol}</strong>`)
          .replace('{currencyName}', `<strong class="hl-currency">${currencyName}</strong>`)
          .replace('{producer}', `<strong class="hl-slot">${sampleProducerName}</strong>`);
      } else if (isMissingProducer && isIncomplete) {
        const template = t('noProducerAndIncompleteWarning') || 'Your squad has empty slots and NO {currency} producing units selected! Without generating {currencyName}, deploying new defenses will be extremely difficult. Are you sure you want to proceed?';
        this.warningDescEl.innerHTML = template
          .replace('{current}', `<strong class="hl-slot">${this.selected.length}</strong>`)
          .replace('{max}', `<strong class="hl-slot">${this.limit}</strong>`)
          .replace('{currency}', `<strong class="hl-currency">${currency.symbol}</strong>`)
          .replace('{currencyName}', `<strong class="hl-currency">${currencyName}</strong>`);
      } else {
        const template = t('squadIncompleteWarning') || 'Your squad only has {current} of {max} defenders selected. Are you sure you want to march into battle without a full roster?';
        this.warningDescEl.innerHTML = template
          .replace('{current}', `<strong class="hl-slot">${this.selected.length}</strong>`)
          .replace('{max}', `<strong class="hl-slot">${this.limit}</strong>`);
      }
    }

    if (this.warningSlotStripEl) {
      this.warningSlotStripEl.innerHTML = '';
      for (let i = 0; i < this.limit; i++) {
        const pill = document.createElement('div');
        const unitId = this.selected[i];
        if (unitId && DEFENDERS_MAP[unitId]) {
          const unit = getDefenderInfo(unitId, currentRealm) || DEFENDERS_MAP[unitId];
          const isCurrency = isCurrencyProducer(unit);
          pill.className = `slot-pill filled ${isCurrency ? 'is-currency-producer' : ''}`;
          pill.innerHTML = `<span>${unit.icon}</span> <span>${unit.name}</span>${isCurrency ? ' <span class="pill-coin-pip">🪙</span>' : ''}`;
        } else {
          pill.className = 'slot-pill empty';
          pill.innerHTML = `<span>⭕</span> <span>${t('slotEmpty')}</span>`;
        }
        this.warningSlotStripEl.appendChild(pill);
      }

      if (isMissingProducer) {
        const callout = document.createElement('div');
        callout.className = 'warning-producer-callout';
        callout.innerHTML = `
          <span class="callout-icon">⚠️</span>
          <span class="callout-text">
            <strong>${t('noProducerAlert') || 'Missing Currency Producer'}</strong>: ${currency.symbol} ${currencyName} (+25 / 10s)
          </span>
        `;
        this.warningSlotStripEl.appendChild(callout);
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
    const mode = getForeignUnitsMode();

    if (mode === 'disable') {
      this.activeWorldFilter = 'all';
      this.tabsContainerEl.style.display = 'none';
      return;
    }
    this.tabsContainerEl.style.display = 'flex';

    // All Worlds Tab
    const allTab = document.createElement('button');
    allTab.className = `cat-tab ${this.activeWorldFilter === 'all' ? 'active' : ''}`;
    allTab.dataset.world = 'all';
    const totalAvailableCount = mode === 'allow'
      ? defendersList.length
      : defendersList.filter(d => isDefenderAllowedInRealm(d.id, currentRealm)).length;
    allTab.innerHTML = `
      <span class="tab-icon">🌐</span>
      <span class="tab-label">${t('allWorlds') || 'All Worlds'}</span>
      <span class="tab-count">${totalAvailableCount}</span>
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
      const allowedCountInGroup = group.defenders.filter(d => isDefenderAllowedInRealm(d.id, currentRealm)).length;
      const isLockedTab = !group.isHomeWorld && allowedCountInGroup === 0;
      const btn = document.createElement('button');
      btn.className = `cat-tab ${group.isHomeWorld ? 'home-tab' : ''} ${isLockedTab ? 'foreign-locked-tab' : ''} ${this.activeWorldFilter === world.id ? 'active' : ''}`;
      btn.dataset.world = world.id;
      btn.style.setProperty('--world-color', world.color);
      const worldName = t(`world_${world.id}`) || world.name;
      const availableUnitsCount = isLockedTab ? 0 : allowedCountInGroup;
      btn.innerHTML = `
        <span class="tab-icon">${world.icon}</span>
        <span class="tab-label">${worldName}${group.isHomeWorld ? ' 🛡️' : (isLockedTab ? ' 🔒' : '')}</span>
        <span class="tab-count">${availableUnitsCount}</span>
      `;
      if (isLockedTab) {
        btn.title = t('foreignUnitRestrictedTooltip') || 'Foreign defenders restricted when defending the home world';
      }
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
      const realmNameStr = options.realm || 'svartalfheim';
      const levelNum = options.level ?? 1;
      if (options.city) {
        const cityKey = `loc_${options.city.replace(/-/g, '_')}_name`;
        const transCity = t(cityKey);
        const cityFormatted = transCity !== cityKey ? transCity : options.city.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
        this.levelBadgeEl.textContent = `${cityFormatted} · ${t('level')} ${levelNum}`;
      } else {
        const realmKey = `world_${realmNameStr}`;
        const transRealm = t(realmKey);
        const realmFormatted = transRealm !== realmKey ? transRealm : realmNameStr.replace(/\b\w/g, c => c.toUpperCase());
        this.levelBadgeEl.textContent = `${realmFormatted} · ${t('level')} ${levelNum}`;
      }
    }

    const confirmBtnText = this.confirmBtn?.querySelector('.btn-text');
    if (confirmBtnText) {
      confirmBtnText.textContent = options.isMidGame ? (t('updateSquad') || 'Update Squad ⚔️') : (t('toBattle') || 'To Battle ⚔️');
    }

    const bestMixText = this.bestMixBtn?.querySelector('.btn-text');
    if (bestMixText) {
      bestMixText.textContent = t('bestPossibleMix') || 'Best Possible Mix';
    }

    const autoPickText = this.autoPickBtn?.querySelector('.btn-text');
    if (autoPickText) {
      autoPickText.textContent = t('balancedSquad') || 'Balanced Squad';
    }

    const clearText = this.clearBtn?.querySelector('.btn-text');
    if (clearText) {
      clearText.textContent = t('clearRoster') || 'Clear';
    }

    if (this.mixPresetsMenu) {
      const bestName = this.mixPresetsMenu.querySelector('[data-preset="best"] .preset-name');
      if (bestName) bestName.textContent = t('presetBestName') || 'Best Possible Mix';
      const bestDesc = this.mixPresetsMenu.querySelector('[data-preset="best"] .preset-desc');
      if (bestDesc) bestDesc.textContent = t('presetBestDesc') || 'Ideal synergy of Economy, Tank, DPS & CC';

      const heavyName = this.mixPresetsMenu.querySelector('[data-preset="heavy_attack"] .preset-name');
      if (heavyName) heavyName.textContent = t('presetHeavyName') || 'Heavy Firepower';
      const heavyDesc = this.mixPresetsMenu.querySelector('[data-preset="heavy_attack"] .preset-desc');
      if (heavyDesc) heavyDesc.textContent = t('presetHeavyDesc') || 'Maximum sustained DPS, fireballs & explosive burst';

      const fortName = this.mixPresetsMenu.querySelector('[data-preset="fortified"] .preset-name');
      if (fortName) fortName.textContent = t('presetFortifiedName') || 'Fortified Bastion';
      const fortDesc = this.mixPresetsMenu.querySelector('[data-preset="fortified"] .preset-desc');
      if (fortDesc) fortDesc.textContent = t('presetFortifiedDesc') || 'High HP stone walls, icy slow & paralyzing butter';

      const balName = this.mixPresetsMenu.querySelector('[data-preset="balanced"] .preset-name');
      if (balName) balName.textContent = t('presetBalancedName') || 'Balanced Squad';
      const balDesc = this.mixPresetsMenu.querySelector('[data-preset="balanced"] .preset-desc');
      if (balDesc) balDesc.textContent = t('presetBalancedDesc') || 'Standard versatile defensive loadout';
    }

    if (this.foreignUnitsBadgeEl) {
      const mode = getForeignUnitsMode();
      if (mode === 'allow') {
        this.foreignUnitsBadgeEl.className = 'foreign-units-rule-badge is-allowed';
        this.foreignUnitsBadgeEl.innerHTML = `
          <span class="badge-icon">⚔️</span>
          <span class="badge-text">${t('foreignUnitsAllowedBadge') || 'Foreign Units: Allowed'}</span>
        `;
        this.foreignUnitsBadgeEl.title = t('foreignUnitsSubtitle') || 'Foreign realm defenders allowed during home world defense';
      } else if (mode === 'limited') {
        const limitedWorlds = getLimitedForeignWorlds();
        this.foreignUnitsBadgeEl.className = 'foreign-units-rule-badge is-limited';
        this.foreignUnitsBadgeEl.innerHTML = `
          <span class="badge-icon">⚖️</span>
          <span class="badge-text">${t('foreignUnitsLimitedBadge') || 'Foreign Units: Limited'} (${limitedWorlds.length} ${t('realms') || 'Realms'})</span>
        `;
        this.foreignUnitsBadgeEl.title = t('foreignWorldsModalSubtitle') || 'Click to customize allowed foreign realms';
      } else {
        this.foreignUnitsBadgeEl.className = 'foreign-units-rule-badge is-restricted';
        this.foreignUnitsBadgeEl.innerHTML = `
          <span class="badge-icon">🔒</span>
          <span class="badge-text">${t('foreignUnitsRestrictedBadge') || 'Foreign Units: Disabled'}</span>
        `;
        this.foreignUnitsBadgeEl.title = t('foreignUnitRestrictedTooltip') || 'Foreign defenders restricted when defending the home world';
      }
    }
  }

  public open(options: SelectionModalOptions) {
    this.currentOptions = options;
    this.limit = getDefenderSlotLimit(options.level);

    if (options.initialSelected && options.initialSelected.length > 0) {
      this.selected = options.initialSelected.slice(0, this.limit);
    } else {
      this.selected = getSavedLoadout(options.level, options.realm);
    }

    if (getForeignUnitsMode() !== 'allow') {
      this.selected = this.selected.filter(id => isDefenderAllowedInRealm(id, options.realm));
    }

    if (this.selected.length === 0) {
      this.selected = getBestPossibleMixLoadout(options.level, options.realm);
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
    this.closePresetsMenu();
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
    const currentRealm = this.currentOptions?.realm || 'midgard';
    if (!isDefenderAllowedInRealm(id, currentRealm)) {
      SoundManager.getInstance().playExplosion();
      return;
    }
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
      const isMissingProducer = this.isCurrencyProducerAvailable() && !this.hasSelectedCurrencyProducer();
      this.confirmPillEl.textContent = `${this.selected.length}/${this.limit} ${t('slotsSelected')}`;
      (this.confirmBtn as HTMLButtonElement).disabled = this.selected.length === 0;
      if (isMissingProducer && this.selected.length > 0) {
        this.confirmBtn.title = t('noProducerAlert') || 'Warning: Missing Currency Producer';
      } else {
        this.confirmBtn.title = '';
      }
    }

    // Render Equipped Slot Preview
    this.renderEquippedSlots();

    // Render Grid with categorized sections
    this.renderGrid();

    // Render Tactical Synergy Breakdown Bar
    this.renderSynergyBar();
  }

  private applyMixPreset(preset: SquadMixPreset = 'best') {
    if (!this.currentOptions) return;
    SoundManager.getInstance().playPlant();
    this.selected = getBestPossibleMixLoadout(this.currentOptions.level, this.currentOptions.realm, preset);

    let toastMsg = t('bestMixApplied') || '⚡ Best Possible Mix Applied!';
    if (preset === 'heavy_attack') {
      toastMsg = `⚔️ ${t('presetHeavyName') || 'Heavy Firepower'} Applied!`;
    } else if (preset === 'fortified') {
      toastMsg = `🛡️ ${t('presetFortifiedName') || 'Fortified Bastion'} Applied!`;
    } else if (preset === 'balanced') {
      toastMsg = `⚖️ ${t('presetBalancedName') || 'Balanced Squad'} Applied!`;
    }

    this.showToast(toastMsg);
    this.render();
  }

  private togglePresetsMenu() {
    if (!this.mixPresetsMenu) return;
    const isHidden = this.mixPresetsMenu.classList.contains('hidden');
    if (isHidden) {
      this.mixPresetsMenu.classList.remove('hidden');
      this.mixPresetsBtn?.setAttribute('aria-expanded', 'true');
    } else {
      this.mixPresetsMenu.classList.add('hidden');
      this.mixPresetsBtn?.setAttribute('aria-expanded', 'false');
    }
  }

  private closePresetsMenu() {
    this.mixPresetsMenu?.classList.add('hidden');
    this.mixPresetsBtn?.setAttribute('aria-expanded', 'false');
  }

  private showToast(msg: string) {
    if (!this.toastEl) return;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove('hidden');
    this.toastTimeout = setTimeout(() => {
      this.toastEl?.classList.add('hidden');
    }, 2400);
  }

  private renderSynergyBar() {
    if (!this.synergyTokensListEl || !this.currentOptions) return;
    const currentRealm = this.currentOptions.realm || 'midgard';
    const report = getSquadSynergies(this.selected, currentRealm);

    if (this.synergyScoreBadgeEl) {
      this.synergyScoreBadgeEl.textContent = `${report.synergyScore}%`;
      if (report.synergyScore >= 100) {
        this.synergyScoreBadgeEl.classList.add('is-perfect');
      } else {
        this.synergyScoreBadgeEl.classList.remove('is-perfect');
      }
    }

    this.synergyTokensListEl.innerHTML = `
      <div class="synergy-chip ${report.hasEconomy ? 'is-active' : 'is-inactive'}" title="${report.hasEconomy ? 'Produces realm currency (+25/10s)' : 'Missing currency producer!'}">
        <span class="chip-icon">🪙</span>
        <span class="chip-label">${t('synergyEconomy') || 'Economy'}</span>
        <span class="chip-check">${report.hasEconomy ? '✓' : '✕'}</span>
      </div>
      <div class="synergy-chip ${report.hasTank ? 'is-active' : 'is-inactive'}" title="${report.hasTank ? 'Frontline wall/stalling defense' : 'No defensive walls or mines!'}">
        <span class="chip-icon">🛡️</span>
        <span class="chip-label">${t('synergyDefense') || 'Defense'}</span>
        <span class="chip-check">${report.hasTank ? '✓' : '✕'}</span>
      </div>
      <div class="synergy-chip ${report.hasDPS ? 'is-active' : 'is-inactive'}" title="${report.hasDPS ? 'Continuous ranged firepower' : 'No ranged DPS units!'}">
        <span class="chip-icon">🏹</span>
        <span class="chip-label">${t('synergyDPS') || 'Ranged DPS'}</span>
        <span class="chip-check">${report.hasDPS ? '✓' : '✕'}</span>
      </div>
      <div class="synergy-chip ${report.hasCrowdControl ? 'is-active' : 'is-inactive'}" title="${report.hasCrowdControl ? 'Slowing frost or butter stun' : 'No crowd control slows/stuns!'}">
        <span class="chip-icon">❄️</span>
        <span class="chip-label">${t('synergyCrowdControl') || 'Crowd Control'}</span>
        <span class="chip-check">${report.hasCrowdControl ? '✓' : '✕'}</span>
      </div>
      <div class="synergy-chip ${report.hasBurstAOE ? 'is-active' : 'is-inactive'}" title="${report.hasBurstAOE ? 'Instant emergency blast demolition' : 'No emergency area clear!'}">
        <span class="chip-icon">💥</span>
        <span class="chip-label">${t('synergyBurst') || 'Area Blast'}</span>
        <span class="chip-check">${report.hasBurstAOE ? '✓' : '✕'}</span>
      </div>
      ${report.hasFlameBoost ? `
        <div class="synergy-chip is-bonus" title="Torchwood ignites repeater/peashooter projectiles into 2x damage fireballs!">
          <span class="chip-icon">🔥</span>
          <span class="chip-label">${t('synergyFlameBoost') || 'Flame Boost'}</span>
          <span class="chip-check">2x</span>
        </div>
      ` : ''}
      ${report.hasFreezeCombo ? `
        <div class="synergy-chip is-bonus" title="Snow Pea slow + Kernel-Pult butter stun combo creates impenetrable crowd control!">
          <span class="chip-icon">🧊</span>
          <span class="chip-label">${t('synergyFreezeCombo') || 'Freeze & Stun'}</span>
          <span class="chip-check">✦</span>
        </div>
      ` : ''}
    `;
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

        const isCurrency = isCurrencyProducer(unit);
        token.className = `slot-token filled ${isCurrency ? 'is-currency-producer' : ''}`;
        token.title = `${unit.name} (${worldName} · ${categoryLabel}) — ${t('clickToRemove')}`;
        token.style.borderColor = isCurrency ? '#ffd700' : worldMeta.badgeBorder;
        token.innerHTML = `
          <span class="token-icon">${unit.icon}</span>
          ${isCurrency ? `<span class="token-coin-pip" title="${t('producesCurrency') || 'Produces Currency'}">🪙</span>` : ''}
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
    const mode = getForeignUnitsMode();

    groupsToRender.forEach(group => {
      const world = group.world;
      const units = group.defenders;
      if (units.length === 0) return;

      const isForeignRealm = !group.isHomeWorld;
      const isWorldAllowed = mode === 'allow' || (mode === 'limited' && isForeignWorldAllowedInLimited(world.id));
      const isRealmLocked = isForeignRealm && !isWorldAllowed;

      const section = document.createElement('section');
      section.className = `roster-section section-world section-${world.id} ${group.isHomeWorld ? 'is-home-realm' : ''} ${isRealmLocked ? 'is-foreign-restricted' : ''}`;
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
              ${group.isHomeWorld
                ? `<span class="section-home-badge">🛡️ ${t('hostRealmDefenses') || 'Host realm'}</span>`
                : (isRealmLocked ? `<span class="section-foreign-badge">🔒 ${t('foreignRealmRestricted') || 'Foreign realm · Restricted'}</span>` : '')
              }
            </div>
            <p class="section-subtitle">${localizedWorldSub}</p>
          </div>
        </div>
        <span class="section-badge ${isRealmLocked ? 'is-locked-badge' : ''}" style="border-color:${world.badgeBorder}; background:${world.badgeBg}; color:${world.color};">
          ${isRealmLocked ? `0 / ${units.length} ${t('available') || 'Available'}` : `${units.length} ${t('available') || 'Available'}`}
        </span>
      `;
      section.appendChild(header);

      // Section Cards Container
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'section-cards-grid';

      units.forEach(rawDef => {
        const def = getLocalizedDefender(rawDef, currentRealm);
        const isAllowed = isDefenderAllowedInRealm(def.id, currentRealm);
        const isSelected = this.selected.includes(def.id);
        const slotIdx = isSelected ? this.selected.indexOf(def.id) + 1 : 0;
        const isDisabled = (!isSelected && isFull) || !isAllowed;
        const isForeignLocked = !isAllowed;

        const isCurrency = isCurrencyProducer(def);
        const currency = getRealmCurrency(currentRealm);
        const currencyName = getRealmCurrencyName(currentRealm);
        const catKey = def.category;
        const catMeta = CATEGORIES[catKey];
        const catName = isCurrency
          ? (t('cat_economy_title') || 'Economy')
          : (t(`cat_${catKey}_title`) || catMeta?.name || def.categoryName);

        const card = document.createElement('div');
        card.className = `roster-card ${isCurrency ? 'is-currency-producer' : ''} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled-cap' : ''} ${isForeignLocked ? 'foreign-locked' : ''} card-world-${world.id}`;
        card.dataset.unit = def.id;
        card.dataset.world = world.id;
        card.dataset.category = def.category;
        if (isCurrency) {
          card.dataset.currencyProducer = 'true';
        }
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', isForeignLocked ? '-1' : '0');
        card.title = isForeignLocked
          ? `${def.name} (${localizedWorldName}) — ${t('foreignUnitRestrictedTooltip') || 'Foreign defender restricted when defending the home world. Enable in Settings to unlock.'}`
          : def.tooltip;

        card.innerHTML = `
          ${isForeignLocked ? `
            <div class="card-foreign-lock-tag" title="${t('foreignUnitRestrictedTooltip') || 'Foreign defender restricted when defending the home world'}">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">${t('foreignUnitLocked') || 'Foreign Realm'}</span>
            </div>
          ` : ''}
          ${isSelected ? `<span class="card-slot-badge">#${slotIdx}</span>` : ''}
          <div class="card-check">✓</div>

          ${isCurrency ? `
            <div class="currency-producer-badge-header">
              <span class="currency-pip-glow">🪙</span>
              <span class="currency-tag-text">${currencyName} ${t('currencyProducer') || 'Producer'}</span>
              <span class="currency-rate">+25 / 10s</span>
            </div>
          ` : ''}

          <div class="card-top-row">
            <div class="card-icon-frame" style="border-color:${isCurrency ? '#ffd700' : world.badgeBorder}">
              <span class="card-icon">${def.icon}</span>
            </div>
            <div class="card-identity">
              <span class="card-name">${def.name}</span>
              <span class="card-origin" style="color:${world.color}">✦ ${def.origin}</span>
            </div>
            <div class="card-cost ${isCurrency ? 'currency-producer-cost' : ''}" title="${currencyName} Cost">
              <span class="currency-icon">${currency.symbol}</span> ${def.cost}
            </div>
          </div>

          <div class="card-role-row">
            <span class="role-pill ${isCurrency ? 'role-pill-currency' : ''}" style="border-color:${isCurrency ? '#ffd700' : world.badgeBorder}; background:${isCurrency ? 'rgba(255, 215, 0, 0.14)' : world.badgeBg}; color:${isCurrency ? '#ffd700' : world.color};">
              ${def.role}
            </span>
            <span class="category-mini-pill ${isCurrency ? 'cat-economy' : `cat-${catKey}`}">
              ${isCurrency ? '🪙' : (catKey === 'plants' ? '🌿' : '🏰')} ${catName}
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
