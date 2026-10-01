import { t } from '../i18n';
import {
  getLimitedForeignWorlds,
  setLimitedForeignWorlds,
  ALL_WORLD_IDS
} from './GameConfig';
import {
  WORLDS,
  type WorldMeta,
  type WorldId,
  DEFENDERS_LIST,
  getLocalizedDefender
} from './DefenderRegistry';
import { SoundManager } from './SoundManager';

export class ForeignWorldsModal {
  private static instance: ForeignWorldsModal | null = null;

  private modalEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private doneBtn: HTMLElement | null = null;
  private selectAllBtn: HTMLElement | null = null;
  private deselectAllBtn: HTMLElement | null = null;
  private gridEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;

  private selectedWorldIds: Set<string> = new Set();
  private worlds: WorldMeta[] = [];

  constructor() {
    this.modalEl = document.getElementById('foreign-worlds-modal');
    this.backdropEl = this.modalEl?.querySelector('.foreign-worlds-backdrop') || null;
    this.closeBtn = document.getElementById('close-foreign-worlds-btn');
    this.doneBtn = document.getElementById('done-foreign-worlds-btn');
    this.selectAllBtn = document.getElementById('select-all-foreign-worlds-btn');
    this.deselectAllBtn = document.getElementById('deselect-all-foreign-worlds-btn');
    this.gridEl = document.getElementById('foreign-worlds-grid');
    this.countEl = document.getElementById('foreign-worlds-selected-count');

    this.worlds = Object.values(WORLDS);

    this.bindEvents();
    ForeignWorldsModal.instance = this;
  }

  public static getInstance(): ForeignWorldsModal | null {
    return ForeignWorldsModal.instance;
  }

  private bindEvents() {
    this.closeBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.close();
    });

    this.backdropEl?.addEventListener('click', () => {
      this.close();
    });

    this.doneBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.saveAndClose();
    });

    this.selectAllBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.selectAll();
    });

    this.deselectAllBtn?.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      this.deselectAll();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    window.addEventListener('foreignunitssettingchanged', () => {
      if (!this.isOpen()) {
        const allowed = getLimitedForeignWorlds();
        this.selectedWorldIds = new Set(allowed);
      }
    });
  }

  public isOpen(): boolean {
    return !!this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  public open() {
    if (!this.modalEl) return;
    const currentAllowed = getLimitedForeignWorlds();
    this.selectedWorldIds = new Set(currentAllowed.length > 0 ? currentAllowed : ALL_WORLD_IDS);

    this.render();
    this.modalEl.classList.remove('hidden');
    this.modalEl.classList.add('active');
    document.body.classList.add('foreign-worlds-modal-open');
  }

  public close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    this.modalEl.classList.remove('active');
    document.body.classList.remove('foreign-worlds-modal-open');
  }

  public saveAndClose() {
    setLimitedForeignWorlds(Array.from(this.selectedWorldIds));
    this.close();
  }

  private selectAll() {
    this.worlds.forEach(w => this.selectedWorldIds.add(w.id));
    this.updateCardStates();
    this.updateCount();
  }

  private deselectAll() {
    this.selectedWorldIds.clear();
    this.updateCardStates();
    this.updateCount();
  }

  private updateCount() {
    if (this.countEl) {
      this.countEl.textContent = `${this.selectedWorldIds.size} / ${this.worlds.length}`;
    }
  }

  private updateCardStates() {
    if (!this.gridEl) return;
    const cards = this.gridEl.querySelectorAll<HTMLElement>('.world-select-card');
    cards.forEach(card => {
      const worldId = card.dataset.worldId;
      if (!worldId) return;
      const isSelected = this.selectedWorldIds.has(worldId);
      card.classList.toggle('is-selected', isSelected);
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      const checkIcon = card.querySelector('.checkbox-indicator');
      if (checkIcon) {
        checkIcon.textContent = isSelected ? '✓' : '';
      }
    });
  }

  private getTroopsForWorld(worldId: WorldId): string[] {
    const list = DEFENDERS_LIST.filter(def => {
      const defWorld = (def.world || def.origin.toLowerCase().trim()) as WorldId;
      return defWorld === worldId && !def.isCurrencyProducer && def.id !== 'sunflower';
    });
    return list.map(d => getLocalizedDefender(d).name);
  }

  private render() {
    this.updateCount();
    if (!this.gridEl) return;

    this.gridEl.innerHTML = '';

    for (const world of this.worlds) {
      const isSelected = this.selectedWorldIds.has(world.id);
      const worldName = t(`world_${world.id}`) || world.name;
      const worldTitle = t(`realm_${world.id}`) || world.title;
      const troops = this.getTroopsForWorld(world.id);
      const troopsText = troops.length > 0
        ? troops.join(', ')
        : (world.id === 'midgard' ? 'Solflower' : (world.id === 'alfheim' ? 'Sunstone Prism' : (t('sacredSanctuary') || 'Realm Defenders')));

      const card = document.createElement('div');
      card.className = `world-select-card ${isSelected ? 'is-selected' : ''}`;
      card.dataset.worldId = world.id;
      card.setAttribute('role', 'checkbox');
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      card.setAttribute('tabindex', '0');
      card.style.setProperty('--world-color', world.color);
      card.style.setProperty('--world-bg', world.badgeBg);
      card.style.setProperty('--world-border', world.badgeBorder);

      card.innerHTML = `
        <div class="card-checkbox">
          <span class="checkbox-indicator">${isSelected ? '✓' : ''}</span>
        </div>
        <div class="world-avatar-frame">
          <span class="world-icon">${world.icon}</span>
          <span class="world-rune-sub">${world.rune}</span>
        </div>
        <div class="world-info">
          <div class="world-header">
            <span class="world-name">${worldName}</span>
            <span class="world-badge-tag">${worldTitle}</span>
          </div>
          <div class="world-subdesc">${world.sub}</div>
          <div class="world-troops-preview">
            <span class="troops-tag-icon">⚔️</span>
            <span class="troops-list-text">${troopsText}</span>
          </div>
        </div>
      `;

      const toggleSelection = () => {
        SoundManager.getInstance().playClick();
        if (this.selectedWorldIds.has(world.id)) {
          this.selectedWorldIds.delete(world.id);
        } else {
          this.selectedWorldIds.add(world.id);
        }
        const nowSelected = this.selectedWorldIds.has(world.id);
        card.classList.toggle('is-selected', nowSelected);
        card.setAttribute('aria-checked', nowSelected ? 'true' : 'false');
        const checkIcon = card.querySelector('.checkbox-indicator');
        if (checkIcon) {
          checkIcon.textContent = nowSelected ? '✓' : '';
        }
        this.updateCount();
      };

      card.addEventListener('click', toggleSelection);
      card.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleSelection();
        }
      });

      this.gridEl.appendChild(card);
    }
  }
}
