import {
  DEFENDERS_LIST,
  DEFENDERS_MAP,
  CATEGORIES,
  type DefenderCategory,
  getDefenderSlotLimit,
  getRecommendedLoadout,
  getSavedLoadout,
  saveLoadout
} from './DefenderRegistry';
import { SoundManager } from './SoundManager';
import { t } from '../i18n';

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

  private currentOptions: SelectionModalOptions | null = null;
  private selected: string[] = [];
  private limit: number = 4;
  private activeCategory: 'all' | DefenderCategory = 'all';

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
      SoundManager.getInstance().playPlant();
      saveLoadout(this.selected);
      const chosen = [...this.selected];
      this.close();
      this.currentOptions?.onConfirm(chosen);
    });

    // Category Tabs Switching
    if (this.tabsContainerEl) {
      const tabButtons = this.tabsContainerEl.querySelectorAll('.cat-tab');
      tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const cat = (target.dataset.cat || 'all') as 'all' | DefenderCategory;
          this.activeCategory = cat;
          tabButtons.forEach(b => b.classList.remove('active'));
          target.classList.add('active');
          SoundManager.getInstance().playClick();
          this.renderGrid();
        });
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.close();
        this.currentOptions?.onCancel?.();
      }
    });
  }

  public open(options: SelectionModalOptions) {
    this.currentOptions = options;
    this.limit = getDefenderSlotLimit(options.level);

    if (options.initialSelected && options.initialSelected.length > 0) {
      this.selected = options.initialSelected.slice(0, this.limit);
    } else {
      this.selected = getSavedLoadout(options.level);
    }

    // Ensure we don't exceed the limit
    if (this.selected.length > this.limit) {
      this.selected = this.selected.slice(0, this.limit);
    }

    // Reset active category to 'all'
    this.activeCategory = 'all';
    if (this.tabsContainerEl) {
      const tabButtons = this.tabsContainerEl.querySelectorAll('.cat-tab');
      tabButtons.forEach(b => {
        if (b.getAttribute('data-cat') === 'all') {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    // Update level badge
    if (this.levelBadgeEl) {
      this.levelBadgeEl.textContent = `${t('level')} ${options.level}`;
    }

    this.render();

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  public close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
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
      if (unitId && DEFENDERS_MAP[unitId]) {
        const unit = DEFENDERS_MAP[unitId];
        token.className = 'slot-token filled';
        token.title = `${unit.name} (${unit.categoryName}) — Click to remove`;
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
        token.title = `Slot ${i + 1} (Empty)`;
        token.innerHTML = `<span class="slot-num">${i + 1}</span>`;
      }
      this.slotsPreviewEl.appendChild(token);
    }
  }

  private renderGrid() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    const isFull = this.selected.length >= this.limit;

    const categoriesToRender: DefenderCategory[] =
      this.activeCategory === 'all'
        ? (['plants', 'towers', 'dwarves', 'allies'] as DefenderCategory[])
        : [this.activeCategory];

    categoriesToRender.forEach(catKey => {
      const meta = CATEGORIES[catKey];
      const units = DEFENDERS_LIST.filter(d => d.category === catKey);
      if (units.length === 0) return;

      const section = document.createElement('section');
      section.className = `roster-section section-${catKey}`;

      // Section Header Banner
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `
        <div class="section-title-group">
          <span class="section-icon">${meta.icon}</span>
          <div>
            <h3 class="section-title">${t(`cat_${catKey}_title`) || meta.name}</h3>
            <p class="section-subtitle">${t(`cat_${catKey}_sub`) || meta.subtitle}</p>
          </div>
        </div>
        <span class="section-badge" style="border-color:${meta.badgeBorder}; background:${meta.badgeBg}; color:${meta.color};">
          ${units.length} ${t('available') || 'Available'}
        </span>
      `;
      section.appendChild(header);

      // Section Cards Container
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'section-cards-grid';

      units.forEach(def => {
        const isSelected = this.selected.includes(def.id);
        const slotIdx = isSelected ? this.selected.indexOf(def.id) + 1 : 0;
        const isDisabled = !isSelected && isFull;

        const card = document.createElement('div');
        card.className = `roster-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled-cap' : ''}`;
        card.dataset.unit = def.id;
        card.dataset.category = def.category;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.title = def.tooltip;

        card.innerHTML = `
          ${isSelected ? `<span class="card-slot-badge">#${slotIdx}</span>` : ''}
          <div class="card-check">✓</div>

          <div class="card-top-row">
            <div class="card-icon-frame" style="border-color:${meta.badgeBorder}">
              <span class="card-icon">${def.icon}</span>
            </div>
            <div class="card-identity">
              <span class="card-name">${def.name}</span>
              <span class="card-origin">✦ ${def.origin}</span>
            </div>
            <div class="card-cost" title="Sol Energy Cost">
              <span class="sun-icon">☀️</span> ${def.cost}
            </div>
          </div>

          <div class="card-role-row">
            <span class="role-pill" style="border-color:${meta.badgeBorder}; background:${meta.badgeBg}; color:${meta.color};">
              ${def.role}
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
