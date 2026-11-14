import { Grid } from './Grid';
import { Defender } from '../entities/Defender';
import { Attacker } from '../entities/Attacker';
import { Projectile } from '../entities/Projectile';
import { PeaShooter } from '../units/PeaShooter';
import { SunFlower } from '../units/SunFlower';
import { BasicZombie } from '../units/BasicZombie';
import { WallNut } from '../units/WallNut';
import { CherryBomb } from '../units/CherryBomb';
import { ConeheadZombie } from '../units/ConeheadZombie';
import { BucketheadZombie } from '../units/BucketheadZombie';
import { ParticleSystem } from './ParticleSystem';
import { Chomper } from '../units/Chomper';
import { PotatoMine } from '../units/PotatoMine';
import { SnowPea } from '../units/SnowPea';
import { Repeater } from '../units/Repeater';
import { SnowProjectile } from '../entities/SnowProjectile';
import { Valkyrie } from '../units/Valkyrie';
import { Torchwood } from '../units/Torchwood';
import { FirePea } from '../units/FirePea';
import { KernelPult } from '../units/KernelPult';
import { Einherjar } from '../units/Einherjar';
import { Butter } from '../units/Butter';
import { Troll } from '../units/Troll';
import { SmallTroll } from '../units/SmallTroll';
import { FenrirRaider } from '../units/FenrirRaider';
import { BerserkerDraugr } from '../units/BerserkerDraugr';
import { ShieldwallDraugr } from '../units/ShieldwallDraugr';
import { FlameDrake } from '../units/FlameDrake';
import { SoundManager } from './SoundManager';
import { getSavedLoadout, CITY_LEVELS, getDefenderInfo, isCurrencyProducer, isDefenderAllowedInRealm } from './DefenderRegistry';
import { DEFENDER_ICONS } from './DefenderIcons';
import { MapMenu } from './MapMenu';
import { getRealmCurrency, getRealmCurrencyName } from './Currency';
import { getStartingCurrencyForLevel, getDefaultStartingCurrency, getInfiniteResourcesForLevel } from './GameConfig';
import { t } from '../i18n';

interface WeatherParticle {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; angle: number; vAngle: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
  vy: number;
  isCritical?: boolean;
}

type WaveKind = 'scout' | 'standard' | 'major' | 'final';
type EnemyUnitKind =
  | 'basic'
  | 'small_troll'
  | 'fenrir_wolf'
  | 'conehead'
  | 'berserker'
  | 'shieldbearer'
  | 'flame_drake'
  | 'buckethead'
  | 'troll';

interface WaveSpec {
  waveNumber: number;
  count: number;
  kind: WaveKind;
}

interface QueuedWaveSpawn {
  row: number;
  unitKind: EnemyUnitKind;
  delayMs: number;
  warned?: boolean;
}

interface IncomingLaneWarning {
  row: number;
  timer: number;
  maxTimer: number;
  isHeavy: boolean;
}

type BattleDebrisKind =
  | 'bronze_cone'
  | 'iron_bucket'
  | 'tower_shield'
  | 'sword'
  | 'mace'
  | 'axe'
  | 'spear'
  | 'club'
  | 'crag_stone';

interface BattleDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  groundY: number;
  bounced: boolean;
  life: number;
  maxLife: number;
  kind: BattleDebrisKind;
}

interface DyingEnemyVisual {
  attacker: Attacker;
  timer: number;
  duration: number;
  soulX: number;
  soulY: number;
  soulColor: string;
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid: Grid;
  lastTime: number = 0;
  animationId: number = 0;
  realm: string = 'midgard';
  city?: string;
  isPaused: boolean = false;
  
  get width(): number {
    return this.grid ? this.grid.width : (this.canvas.clientWidth || 900);
  }

  get height(): number {
    return this.grid ? this.grid.height : (this.canvas.clientHeight || 500);
  }
  
  sun: number = getDefaultStartingCurrency(1);
  level: number = 1;
  selectedUnit: string | null = null;
  selectedDefenders: string[] = [];
  onPrepareNextLevel?: (realm: string, nextCity: string | undefined, nextLevel: number, previousSquad: string[]) => void;
  
  defenders: Defender[] = [];
  attackers: Attacker[] = [];
  dyingEnemies: DyingEnemyVisual[] = [];
  battleDebris: BattleDebris[] = [];
  projectiles: Projectile[] = [];
  valkyries: Valkyrie[] = [];
  valkyrieAvailable: boolean[] = [];
  odinCommandTimer: number = 0;
  
  particles: ParticleSystem = new ParticleSystem();
  weatherParticles: WeatherParticle[] = [];
  floatingTexts: FloatingText[] = [];
  floatingTextPool: FloatingText[] = [];
  attackersByRow: Attacker[][] = [[], [], [], [], []];
  defendersByRow: Defender[][] = [[], [], [], [], []];

  private cachedBgGradient: CanvasGradient | null = null;
  private cachedBgWidth: number = 0;
  private cachedBgHeight: number = 0;
  private cachedBgRealm: string = '';
  private cachedBgCity?: string;
  private cachedBgTheme: string = '';

  // Cached Castle Wall Offscreen Canvas
  private cachedCastleCanvas: HTMLCanvasElement | null = null;
  private cachedCastleDpr: number = 0;
  private cachedCastleRealm: string = '';
  private cachedCastleCity?: string;
  private cachedCastleWidth: number = 0;
  private cachedCastleHeight: number = 0;
  private cachedCastleTheme: string = '';

  // Screen shake FX
  shakeTimer: number = 0;
  shakeMagnitude: number = 0;

  // Grid hover & summoning preview
  hoverCell: { row: number; col: number } | null = null;
  mouseX: number = -1000;
  mouseY: number = -1000;

  // Wave call & warning banner state
  waveBannerTimer: number = 0;
  waveBannerMaxTimer: number = 3.2;
  waveBannerHeader: string = '';
  waveBannerText: string = '';
  waveBannerKind: WaveKind = 'standard';
  activeBannerWaveSpec: WaveSpec | null = null;
  waveAnnounced: boolean = false;

  // Multi-wave progression director
  wavePlan: WaveSpec[] = [];
  totalWaves: number = 6;
  currentWave: number = 0;
  pendingWaveSpawns: QueuedWaveSpawn[] = [];
  nextSpawnTimer: number = 0;
  interWaveTimer: number = 0;
  interWaveDuration: number = 0;
  lastSpawnRow: number = -1;
  laneWarnings: IncomingLaneWarning[] = [];

  // Game state & statistics
  gameState: 'playing' | 'victory' | 'defeat' = 'playing';
  zombiesSpawned: number = 0;
  zombiesTotal: number = 76;
  zombiesKilled: number = 0;
  victoryTimer: number = 0;
  defeatTimer: number = 0;
  
  // Cinematic Bifrost entrance transition
  realmEntranceTimer: number = 2.8;

  spawnGraceTimer: number = 32000;
  ambientCurrencyTimer: number = 4500;
  ambientCurrencyInterval: number = 8500;
  
  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    realm: string = 'midgard',
    city?: string,
    selectedDefenders?: string[],
    level?: number,
    onPrepareNextLevel?: (realm: string, nextCity: string | undefined, nextLevel: number, previousSquad: string[]) => void
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.realm = realm;
    this.city = city;
    if (level !== undefined) {
      this.level = level;
    } else if (city && CITY_LEVELS[city]) {
      this.level = CITY_LEVELS[city];
    } else {
      this.level = 1;
    }
    this.sun = getStartingCurrencyForLevel(this.level);
    this.onPrepareNextLevel = onPrepareNextLevel;
    const initialSquad = selectedDefenders && selectedDefenders.length > 0
      ? [...selectedDefenders]
      : getSavedLoadout(this.level, this.realm);
    this.selectedDefenders = initialSquad.filter(id => isDefenderAllowedInRealm(id, this.realm));
    if (this.selectedDefenders.length === 0) {
      this.selectedDefenders = getSavedLoadout(this.level, this.realm);
    }

    const cssW = canvas.clientWidth || (canvas.width / (window.devicePixelRatio || 1));
    const cssH = canvas.clientHeight || (canvas.height / (window.devicePixelRatio || 1));
    this.grid = new Grid(cssW, cssH, realm, city);

    this.initWaveDirector();
    this.ambientCurrencyTimer = 4500;

    for (let r = 0; r < this.grid.rows; r++) {
      this.valkyrieAvailable.push(true);
    }

    this.initWeather();
    this.bindEvents();
    this.updateRealmHeader();
    this.renderSidebar();
    this.updateUI();
  }

  private isDwarvenWaterwayCity(): boolean {
    return this.realm === 'svartalfheim' && (this.city === 'althjofs-wheel' || this.city === 'andvaris-falls');
  }

  private isDwarvenForgeCity(): boolean {
    return this.realm === 'svartalfheim' && !this.isDwarvenWaterwayCity();
  }

  private getDwarvenWallRunes(): string[] {
    switch (this.city) {
      case 'ivaldis-workshop':
        return ['ᛁ', 'ᚹ', 'ᚨ', 'ᛚ', 'ᛞ', 'ᛁ', 'ᛊ', 'ᛟ', 'ᚱ'];
      case 'jarnsmida-quarry':
        return ['ᛃ', 'ᚨ', 'ᚱ', 'ᚾ', 'ᛊ', 'ᛗ', 'ᛁ', 'ᛞ', 'ᚨ'];
      case 'dvalins-depths':
        return ['ᛞ', 'ᚹ', 'ᚨ', 'ᛚ', 'ᛁ', 'ᚾ', 'ᛞ', 'ᛖ', 'ᛈ'];
      case 'sindris-forge':
        return ['ᛊ', 'ᛁ', 'ᚾ', 'ᛞ', 'ᚱ', 'ᛁ', 'ᚠ', 'ᛟ', 'ᚱ'];
      default:
        return ['ᚾ', 'ᛁ', 'ᛞ', 'ᚨ', 'ᚹ', 'ᛖ', 'ᛚ', 'ᛚ', 'ᛁ', 'ᚱ'];
    }
  }

  initWeather() {
    this.weatherParticles = [];
    const count = this.realm === 'jotunheim' ? 160 : 80;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push(this.createWeatherParticle(true));
    }
  }

  setWeatherParticleProps(p: WeatherParticle, randomY = false): void {
    const w = this.width;
    const h = this.height;
    
    if (this.realm === 'jotunheim' || this.realm === 'niflheim') {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : -10;
      p.vx = -3.0 - Math.random() * 5.0;
      p.vy = 1.5 + Math.random() * 3.5;
      p.size = 1.5 + Math.random() * 3.8;
      p.alpha = 0.4 + Math.random() * 0.55;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.09;
    } else if (this.realm === 'asgard') {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : h + 10;
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = -0.6 - Math.random() * 1.2;
      p.size = 2.0 + Math.random() * 3.0;
      p.alpha = 0.3 + Math.random() * 0.5;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.03;
    } else if (this.realm === 'helheim') {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : h + 10;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = -0.5 - Math.random() * 1.5;
      p.size = 1.5 + Math.random() * 2.5;
      p.alpha = 0.2 + Math.random() * 0.4;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.02;
    } else if (this.isDwarvenWaterwayCity()) {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : h + 10;
      p.vx = (Math.random() - 0.5) * 1.8;
      p.vy = -0.8 - Math.random() * 2.2;
      p.size = 1.6 + Math.random() * 3.0;
      p.alpha = 0.25 + Math.random() * 0.45;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.04;
    } else if (this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : h + 10;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -1.2 - Math.random() * 3.5;
      p.size = 1.8 + Math.random() * 3.2;
      p.alpha = 0.4 + Math.random() * 0.5;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.05;
    } else if (this.realm === 'vanaheim' || this.realm === 'alfheim') {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : -10;
      p.vx = 0.8 + Math.random() * 1.5;
      p.vy = 0.8 + Math.random() * 1.5;
      p.size = 2.5 + Math.random() * 4.0;
      p.alpha = 0.4 + Math.random() * 0.5;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.06;
    } else {
      p.x = Math.random() * w;
      p.y = randomY ? Math.random() * h : -10;
      p.vx = 0.5 + Math.random() * 1.0;
      p.vy = 0.6 + Math.random() * 1.0;
      p.size = 1.5 + Math.random() * 2.5;
      p.alpha = 0.3 + Math.random() * 0.4;
      p.angle = Math.random() * Math.PI * 2;
      p.vAngle = (Math.random() - 0.5) * 0.04;
    }
  }

  createWeatherParticle(randomY = false): WeatherParticle {
    const p: WeatherParticle = { x: 0, y: 0, vx: 0, vy: 0, size: 0, alpha: 0, angle: 0, vAngle: 0 };
    this.setWeatherParticleProps(p, randomY);
    return p;
  }

  updateUI() {
    const isInfinite = getInfiniteResourcesForLevel(this.level);
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';
    const currency = getRealmCurrency(this.realm);
    const activeColor = isLight ? currency.lightColor : currency.color;
    const activeGlow = isLight ? currency.lightGlowColor : currency.glowColor;
    const sunCountEl = document.getElementById('sun-count');
    if (sunCountEl) {
      if (isInfinite) {
        sunCountEl.textContent = '∞';
        sunCountEl.classList.add('is-infinite-val');
      } else {
        sunCountEl.textContent = this.sun.toString();
        sunCountEl.classList.remove('is-infinite-val');
      }
      sunCountEl.style.color = activeColor;
      sunCountEl.style.textShadow = isLight ? `0 1px 4px ${activeGlow}` : `0 0 10px ${activeGlow}`;
    }
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
      levelDisplay.textContent = this.level.toString();
    }
    
    const unitCards = document.querySelectorAll('.unit-card');
    unitCards.forEach(card => {
      const el = card as HTMLElement;
      const cost = parseInt(el.dataset.cost || '0', 10);
      if (!isInfinite && this.sun < cost) {
        el.classList.add('unavailable');
        if (el.classList.contains('selected')) {
          el.classList.remove('selected');
          this.selectedUnit = null;
        }
      } else {
        el.classList.remove('unavailable');
      }
    });
  }

  addFloatingText(x: number, y: number, text: string, color: string, isCritical: boolean = false) {
    const ft = this.floatingTextPool.pop() || {
      x: 0,
      y: 0,
      text: '',
      color: '',
      alpha: 1.0,
      scale: 1.0,
      life: 0,
      maxLife: 0,
      vy: 0,
      isCritical: false
    };
    ft.x = x;
    ft.y = y;
    ft.text = text;
    ft.color = color;
    ft.alpha = 1.0;
    ft.scale = isCritical ? 1.4 : 1.0;
    ft.life = 0;
    ft.maxLife = isCritical ? 1200 : 900;
    ft.vy = isCritical ? -1.8 : -1.2;
    ft.isCritical = isCritical;
    this.floatingTexts.push(ft);
  }

  triggerScreenShake(duration: number, magnitude: number) {
    this.shakeTimer = duration;
    this.shakeMagnitude = magnitude;
  }

  triggerWaveBanner(text: string = '⚔️ Incoming Horde of Invaders ⚔️', kind: WaveKind = 'major') {
    this.activeBannerWaveSpec = null;
    this.waveBannerKind = kind;
    this.waveBannerHeader = 'ᚱ ᚨ ᚷ ᚾ ᚨ ᚱ ᛟ ᚲ   ·   ᚹ ᚨ ᚱ ᚾ ᛁ ᚾ ᚷ';
    this.waveBannerText = text;
    this.waveBannerMaxTimer = 3.5;
    this.waveBannerTimer = 3.5;
    if (kind === 'major' || kind === 'final') {
      this.triggerScreenShake(800, 8);
      SoundManager.getInstance().playWave();
    } else {
      SoundManager.getInstance().playScoutHorn();
    }
  }

  private refreshWaveBannerStrings(spec: WaveSpec) {
    const isMajorOrFinal = spec.kind === 'major' || spec.kind === 'final';
    const headerTemplate = isMajorOrFinal ? t('wave_warning_header') : t('wave_header');
    this.waveBannerHeader = headerTemplate
      .replace('{current}', spec.waveNumber.toString())
      .replace('{total}', this.totalWaves.toString());

    if (spec.kind === 'scout') {
      this.waveBannerText = t('wave_scout_call');
    } else if (spec.kind === 'major') {
      this.waveBannerText = t('wave_major_call');
    } else if (spec.kind === 'final') {
      this.waveBannerText = t('wave_final_call');
    } else {
      this.waveBannerText = t('wave_standard_call').replace('{count}', spec.count.toString());
    }
  }

  private announceWave(spec: WaveSpec) {
    this.activeBannerWaveSpec = spec;
    this.waveBannerKind = spec.kind;
    this.refreshWaveBannerStrings(spec);
    const isMajorOrFinal = spec.kind === 'major' || spec.kind === 'final';
    this.waveBannerMaxTimer = isMajorOrFinal ? 3.8 : 3.1;
    this.waveBannerTimer = this.waveBannerMaxTimer;

    if (isMajorOrFinal) {
      this.waveAnnounced = true;
      this.triggerScreenShake(spec.kind === 'final' ? 850 : 600, spec.kind === 'final' ? 8 : 6);
      SoundManager.getInstance().playWave();
    } else {
      SoundManager.getInstance().playScoutHorn();
    }
  }

  handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    const unitCards = Array.from(document.querySelectorAll('.unit-card:not(.shovel-card)')) as HTMLElement[];
    
    // Numeric hotkeys 1-9, 0
    if (/^[1-9]$/.test(key)) {
      const idx = parseInt(key, 10) - 1;
      if (idx < unitCards.length) {
        unitCards[idx].click();
      }
    } else if (key === '0') {
      if (unitCards.length >= 10) {
        unitCards[9].click();
      }
    } else if (key === 'D') {
      // Shovel hotkey
      const shovelCard = document.querySelector('.shovel-card') as HTMLElement;
      if (shovelCard) shovelCard.click();
    } else if (key === 'ESCAPE') {
      // Deselect unit
      const allCards = document.querySelectorAll('.unit-card');
      allCards.forEach(c => c.classList.remove('selected'));
      this.selectedUnit = null;
    } else if (key === 'M') {
      // Mute hotkey
      const isMuted = SoundManager.getInstance().toggleMute();
      const soundBtn = document.getElementById('sound-toggle');
      if (soundBtn) {
        soundBtn.innerHTML = `
          <span class="sound-icon">${isMuted ? '🔇' : '🔊'}</span>
          <span class="settings-pulse"></span>
        `;
      }
    }
  };

  pause() {
    this.isPaused = true;
    cancelAnimationFrame(this.animationId);
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(this.loop);
    this.draw();
    SoundManager.getInstance().resumeContext();
  }

  renderSidebar() {
    const container = document.getElementById('unit-selection');
    if (!container) return;
    container.innerHTML = '';

    const currency = getRealmCurrency(this.realm);

    this.selectedDefenders.forEach((unitId, idx) => {
      const info = getDefenderInfo(unitId, this.realm);
      if (!info) return;
      const isCurrency = isCurrencyProducer(info);
      const currencyName = getRealmCurrencyName(this.realm);
      const hotkey = idx < 9 ? (idx + 1).toString() : idx === 9 ? '0' : '';
      const card = document.createElement('div');
      card.className = `unit-card ${isCurrency ? 'is-currency-producer' : ''}`;
      card.dataset.unit = unitId;
      card.dataset.cost = info.cost.toString();
      card.dataset.tooltip = info.tooltip;

      card.innerHTML = `
        <span class="hotkey-badge">${hotkey}</span>
        ${isCurrency ? `<span class="unit-currency-badge" title="${info.name}: +25 ${currency.symbol} ${currencyName}">🪙</span>` : ''}
        <div class="card-art">
          <span class="icon">${info.icon}</span>
        </div>
        <div class="unit-name">${info.name}</div>
        <div class="cost"><span class="currency-icon">${currency.symbol}</span> ${info.cost}</div>
      `;
      container.appendChild(card);
    });

    // Demolish / Dig shovel card docked at bottom
    const shovelCard = document.createElement('div');
    shovelCard.className = 'unit-card shovel-card';
    shovelCard.dataset.unit = 'shovel';
    shovelCard.dataset.cost = '0';
    shovelCard.dataset.tooltip = t('demolish_tooltip') || 'Demolish: Clear a defender to free up battlefield space';
    shovelCard.innerHTML = `
      <span class="hotkey-badge">D</span>
      <div class="card-art">
        <span class="icon">${DEFENDER_ICONS.shovel}</span>
      </div>
      <div class="cost shovel-cost" data-i18n="remove">${t('remove')}</div>
    `;

    const shovelDock = document.getElementById('sidebar-shovel-dock');
    if (shovelDock) {
      shovelDock.innerHTML = '';
      shovelDock.appendChild(shovelCard);
    } else {
      container.appendChild(shovelCard);
    }

    this.bindUnitCardEvents();
    this.updateUI();
  }

  bindUnitCardEvents() {
    const unitCards = document.querySelectorAll('.unit-card');
    unitCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        if (target.classList.contains('unavailable')) return;
        
        SoundManager.getInstance().playClick();
        if (target.classList.contains('selected')) {
           target.classList.remove('selected');
           this.selectedUnit = null;
        } else {
           unitCards.forEach(c => c.classList.remove('selected'));
           target.classList.add('selected');
           this.selectedUnit = target.dataset.unit || null;
        }
      });
    });
  }

  startNextBattle(nextCity: string | undefined, nextLevel: number, defenders: string[]) {
    this.city = nextCity;
    this.level = nextLevel;
    this.selectedDefenders = [...defenders];
    this.restartBattle();
  }

  bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('languagechange', this.handleLanguageChange);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('click', this.handleCanvasClick);

    window.addEventListener('infiniteresourcessettingchanged', this.handleInfiniteResourcesSettingChange);
    window.addEventListener('levelconfigchanged', this.handleInfiniteResourcesSettingChange);
    window.addEventListener('ragnarok-theme-changed', this.handleThemeChange);
  }

  handleThemeChange = () => {
    this.updateRealmHeader();
    this.updateUI();
  };

  handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    const cell = this.grid.getCellFromCoordinates(this.mouseX, this.mouseY);
    this.hoverCell = cell ? { row: cell.row, col: cell.col } : null;
  };

  handleMouseLeave = () => {
    this.hoverCell = null;
    this.mouseX = -1000;
    this.mouseY = -1000;
  };

  handleCanvasClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle Victory / Defeat Button Clicks
    if (this.gameState === 'defeat' || this.gameState === 'victory') {
      const cx = this.width / 2;
      const cy = this.height / 2;
      // Retry / Next button bounds: cx - 140, cy + 40, w 130, h 45
      if (x >= cx - 140 && x <= cx - 10 && y >= cy + 40 && y <= cy + 85) {
        SoundManager.getInstance().playClick();
        if (this.gameState === 'victory') {
          const nextUnlockedCity = (this.realm === 'svartalfheim' && this.city)
            ? MapMenu.getNextUnlockedCity(this.city)
            : null;
          if (nextUnlockedCity) {
            const nextLevel = CITY_LEVELS[nextUnlockedCity] || (this.level + 1);
            if (this.onPrepareNextLevel) {
              this.onPrepareNextLevel(this.realm, nextUnlockedCity, nextLevel, [...this.selectedDefenders]);
              return;
            }
            this.startNextBattle(nextUnlockedCity, nextLevel, this.selectedDefenders);
            return;
          }
          this.restartBattle();
          return;
        }
        this.restartBattle();
        return;
      }
      // Return button bounds: cx + 10, cy + 40, w 130, h 45
      if (x >= cx + 10 && x <= cx + 140 && y >= cy + 40 && y <= cy + 85) {
        SoundManager.getInstance().playClick();
        const returnBtn = document.getElementById('return-menu-btn');
        if (returnBtn) returnBtn.click();
        return;
      }
    }

    const cell = this.grid.getCellFromCoordinates(x, y);
    if (cell && this.selectedUnit) {
      this.placeUnit(cell.row, cell.col, this.selectedUnit);
    }
  };

  handleInfiniteResourcesSettingChange = () => {
    this.updateUI();
  };

  handleLanguageChange = () => {
    this.renderSidebar();
    this.updateRealmHeader();
    this.updateUI();
    if (this.waveBannerTimer > 0 && this.activeBannerWaveSpec) {
      this.refreshWaveBannerStrings(this.activeBannerWaveSpec);
    }
  };

  updateRealmHeader() {
    const realmNames: Record<string, { name: string; icon: string }> = {
      asgard:       { name: 'Asgard',       icon: '⚡' },
      alfheim:      { name: 'Alfheim',      icon: '✨' },
      vanaheim:     { name: 'Vanaheim',     icon: '🌿' },
      svartalfheim: { name: 'Svartalfheim', icon: '⚒️' },
      midgard:      { name: 'Midgard',      icon: '🌱' },
      jotunheim:    { name: 'Jötunheim',    icon: '❄️' },
      niflheim:     { name: 'Niflheim',     icon: '🌫️' },
      muspelheim:   { name: 'Muspelheim',   icon: '🔥' },
      helheim:      { name: 'Helheim',      icon: '💀' }
    };
    const info = realmNames[this.realm] || realmNames.midgard;
    const realmNameEl = document.getElementById('realm-name');
    const realmIconEl = document.getElementById('realm-icon');
    let displayName = info.name;
    if (this.city) {
      const cityKey = `loc_${this.city.replace(/-/g, '_')}_name`;
      const transCity = t(cityKey);
      const cityFormatted = transCity !== cityKey ? transCity : this.city.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
      const worldKey = `world_${this.realm}`;
      const transWorld = t(worldKey);
      const worldName = transWorld !== worldKey ? transWorld : info.name;
      displayName = `${worldName} - ${cityFormatted}`;
    }
    if (realmNameEl) realmNameEl.textContent = displayName;
    if (realmIconEl) realmIconEl.textContent = info.icon;

    // Update Upper HUD resource counter for the active world's currency
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';
    const currency = getRealmCurrency(this.realm);
    const activeColor = isLight ? currency.lightColor : currency.color;
    const activeGlow = isLight ? currency.lightGlowColor : currency.glowColor;
    const currencyName = getRealmCurrencyName(this.realm);
    const resourceCounter = document.getElementById('resource-counter');
    if (resourceCounter) {
      const labelEl = resourceCounter.querySelector('.stat-label');
      if (labelEl) {
        labelEl.textContent = currencyName;
      }
      const iconEl = resourceCounter.querySelector('.sol-icon, .currency-icon');
      if (iconEl) {
        iconEl.textContent = currency.symbol;
      }
      const talismanEl = resourceCounter.querySelector('.sol-talisman') as HTMLElement;
      if (talismanEl) {
        talismanEl.style.setProperty('--talisman-color', activeColor);
        talismanEl.style.setProperty('--talisman-glow', activeGlow);
        talismanEl.style.borderColor = activeColor;
        talismanEl.style.boxShadow = isLight ? `0 2px 8px ${activeGlow}` : `0 0 14px ${activeGlow}`;
      }
      const valEl = document.getElementById('sun-count');
      if (valEl) {
        valEl.style.color = activeColor;
        valEl.style.textShadow = isLight ? `0 1px 4px ${activeGlow}` : `0 0 10px ${activeGlow}`;
      }
    }
  }

  private getInitialSpawnGraceMs(): number {
    return Math.max(25000, 32000 - (this.level - 1) * 750);
  }

  private buildWavePlan(): WaveSpec[] {
    const clampedLevel = Math.max(1, Math.min(10, this.level));
    const totalWaves = Math.min(10, 6 + Math.floor(clampedLevel / 2));
    const midMajorWave = totalWaves >= 8 ? Math.ceil(totalWaves / 2) : -1;
    const stepGrowth = 3 + Math.floor(clampedLevel / 4);
    const plan: WaveSpec[] = [];

    let baseline = 3 + Math.ceil(clampedLevel * 0.8);
    for (let w = 1; w <= totalWaves; w++) {
      if (w === 2) {
        baseline += Math.max(2, stepGrowth - 1);
      } else if (w > 2) {
        baseline += stepGrowth;
      }

      let kind: WaveKind = 'standard';
      let count = baseline;

      if (w === totalWaves) {
        kind = 'final';
        count = Math.round(baseline * 1.30) + 2;
      } else if (w === totalWaves - 1) {
        kind = 'major';
        count = Math.round(baseline * 1.15) + 2;
      } else if (w === midMajorWave) {
        kind = 'major';
        count = Math.round(baseline * 1.20) + 2;
      } else if (count === 1) {
        kind = 'scout';
      }

      plan.push({ waveNumber: w, count, kind });
    }

    return plan;
  }

  private initWaveDirector(): void {
    this.wavePlan = this.buildWavePlan();
    this.totalWaves = this.wavePlan.length;
    this.currentWave = 0;
    this.pendingWaveSpawns = [];
    this.nextSpawnTimer = 0;
    this.interWaveTimer = 0;
    this.interWaveDuration = 0;
    this.lastSpawnRow = -1;
    this.laneWarnings = [];
    this.waveBannerTimer = 0;
    this.activeBannerWaveSpec = null;
    this.waveAnnounced = false;
    this.zombiesSpawned = 0;
    this.zombiesTotal = this.wavePlan.reduce((sum, spec) => sum + spec.count, 0);
    this.spawnGraceTimer = this.getInitialSpawnGraceMs();
  }

  private computeSalvoSize(spec: WaveSpec): number {
    if (spec.kind === 'final') {
      return 3 + Math.floor(Math.random() * 3); // 3-5 enemies across lanes
    }
    if (spec.kind === 'major') {
      return 3 + Math.floor(Math.random() * 2); // 3-4 enemies across lanes
    }
    if (spec.waveNumber === 1) {
      return spec.count >= 8 && Math.random() > 0.5 ? 3 : 2;
    }
    return 2 + (spec.count >= 12 && Math.random() > 0.4 ? 1 : 0);
  }

  private computeIntraSalvoGapMs(spec: WaveSpec): number {
    if (spec.kind === 'final') {
      return 320 + Math.random() * 360;
    }
    if (spec.kind === 'major') {
      return 360 + Math.random() * 400;
    }
    return 440 + Math.random() * 460;
  }

  private computeInterSalvoGapMs(spec: WaveSpec): number {
    if (spec.kind === 'final') {
      return 2100 + Math.random() * 650;
    }
    if (spec.kind === 'major') {
      return 2500 + Math.random() * 750;
    }
    if (spec.waveNumber === 1) {
      return 4400 + Math.random() * 900;
    }
    if (spec.waveNumber === 2) {
      return 3900 + Math.random() * 850;
    }
    const progress = (spec.waveNumber - 1) / Math.max(1, this.totalWaves - 1);
    const base = Math.max(2800, 3600 - progress * 600);
    return base + Math.random() * 750;
  }

  private computeInterWaveDelayMs(completedWave: number): number {
    const nextSpec = this.wavePlan[completedWave];
    if (!nextSpec) return 0;
    if (nextSpec.kind === 'major' || nextSpec.kind === 'final') {
      return 48000;
    }
    if (completedWave === 1) return 42000;
    if (completedWave === 2) return 40000;
    return Math.max(35000, 39000 - (this.level - 1) * 400);
  }

  private computeStragglerDelayMs(completedWave: number): number {
    const nextSpec = this.wavePlan[completedWave];
    if (!nextSpec) return 0;
    if (nextSpec.kind === 'major' || nextSpec.kind === 'final') {
      return 26000;
    }
    return 22000;
  }

  private computePostClearDelayMs(completedWave: number): number {
    const nextSpec = this.wavePlan[completedWave];
    if (!nextSpec) return 0;
    if (nextSpec.kind === 'major' || nextSpec.kind === 'final') {
      return 16500;
    }
    if (completedWave <= 2) return 14500;
    return 12500;
  }

  private isHeavyEnemyKind(kind: EnemyUnitKind): boolean {
    return (
      kind === 'buckethead' ||
      kind === 'troll' ||
      kind === 'shieldbearer' ||
      kind === 'flame_drake'
    );
  }

  private pickSpawnRowsForWave(count: number): number[] {
    const numRows = Math.max(1, this.grid ? this.grid.rows : 5);
    const chosen: number[] = [];
    let prevRow = this.lastSpawnRow;

    while (chosen.length < count) {
      const bag: number[] = [];
      for (let r = 0; r < numRows; r++) {
        bag.push(r);
      }
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = bag[i];
        bag[i] = bag[j];
        bag[j] = tmp;
      }
      if (numRows > 1 && bag[0] === prevRow) {
        const swapIdx = 1 + Math.floor(Math.random() * (numRows - 1));
        const tmp = bag[0];
        bag[0] = bag[swapIdx];
        bag[swapIdx] = tmp;
      }
      for (let i = 0; i < bag.length && chosen.length < count; i++) {
        chosen.push(bag[i]);
        prevRow = bag[i];
      }
    }

    if (chosen.length > 0) {
      this.lastSpawnRow = chosen[chosen.length - 1];
    }
    return chosen;
  }

  private pickEnemyUnitForWave(spec: WaveSpec, spawnIndex: number): EnemyUnitKind {
    const { waveNumber, count, kind } = spec;
    const waveProgress = (waveNumber - 1) / Math.max(1, this.totalWaves - 1);
    const isLateClimax = kind === 'final' || (kind === 'major' && waveProgress >= 0.72);
    const spawnRatio = count > 1 ? spawnIndex / (count - 1) : 1;
    const rand = Math.random();

    // Thematic frost roster in Jotunheim & Niflheim, escalating gradually across waves
    if (this.realm === 'jotunheim' || this.realm === 'niflheim') {
      if (waveNumber <= 2) {
        return 'small_troll';
      }
      if (waveNumber === 3) {
        if (spawnRatio >= 0.70 && rand > 0.35) {
          return rand > 0.65 ? 'fenrir_wolf' : 'conehead';
        }
        return 'small_troll';
      }
      if (!isLateClimax) {
        if (kind === 'major' && spawnIndex === Math.floor(count / 2)) {
          return this.level >= 3 ? 'troll' : 'shieldbearer';
        }
        if (waveProgress >= 0.58 && spawnRatio >= 0.75 && rand > 0.55) {
          return 'troll';
        }
        if (waveProgress >= 0.42 || kind === 'major') {
          if (rand > 0.78) return 'shieldbearer';
          if (rand > 0.60) return 'berserker';
          if (rand > 0.40) return 'fenrir_wolf';
          if (rand > 0.22) return 'conehead';
          return 'small_troll';
        }
        if (rand > 0.66) return 'fenrir_wolf';
        if (rand > 0.36) return 'conehead';
        return 'small_troll';
      }
      if (spawnIndex === Math.floor(count / 2)) {
        return 'troll';
      }
      if (rand > 0.72) return 'troll';
      if (rand > 0.52) return 'shieldbearer';
      if (rand > 0.35) return 'berserker';
      if (rand > 0.18) return 'fenrir_wolf';
      return 'small_troll';
    }

    // Thematic fire roster in Muspelheim, introducing Flame Drakes & Berserkers after early setup
    if (this.realm === 'muspelheim') {
      if (waveNumber <= 2) {
        return 'basic';
      }
      if (waveNumber === 3) {
        return (spawnRatio >= 0.70 && rand > 0.40) ? 'fenrir_wolf' : 'basic';
      }
      if (waveNumber === 4 && kind !== 'major') {
        if (spawnRatio >= 0.75) return rand > 0.45 ? 'berserker' : 'conehead';
        return rand > 0.65 ? 'fenrir_wolf' : 'basic';
      }
      if (!isLateClimax) {
        if (kind === 'major' && spawnIndex === Math.floor(count / 2)) {
          return 'flame_drake';
        }
        if ((waveProgress >= 0.50 || kind === 'major') && spawnRatio >= 0.50 && rand > 0.60) {
          return 'flame_drake';
        }
        if (rand > 0.68) return 'berserker';
        if (rand > 0.50) return 'shieldbearer';
        if (rand > 0.30) return 'fenrir_wolf';
        return 'basic';
      }
      if (spawnIndex === Math.floor(count / 2)) {
        return 'flame_drake';
      }
      if (rand > 0.84) return 'troll';
      if (rand > 0.56) return 'flame_drake';
      if (rand > 0.36) return 'berserker';
      if (rand > 0.20) return 'shieldbearer';
      return 'fenrir_wolf';
    }

    // Waves 1-2: strictly basic raiders while the player establishes economy
    if (waveNumber <= 2) {
      return 'basic';
    }

    // Wave 3: basic raiders with agile small trolls or dire-wolves joining in the rear ranks
    if (waveNumber === 3) {
      if (spawnRatio >= 0.68) {
        if (this.level >= 2 && rand > 0.62) return 'fenrir_wolf';
        if (rand > 0.42) return 'small_troll';
      }
      return 'basic';
    }

    // Wave 4 (when not a mid-battle Major Wave): blend of scouts, dire-wolves, and light armor
    if (waveNumber === 4 && kind !== 'major') {
      if (spawnRatio >= 0.78) {
        if (this.level >= 3 && rand > 0.55) return 'shieldbearer';
        if (this.level >= 2 && rand > 0.35) return 'conehead';
        if (rand > 0.45) return 'fenrir_wolf';
      }
      if (spawnRatio >= 0.52 && rand > 0.55) {
        return rand > 0.5 ? 'fenrir_wolf' : 'small_troll';
      }
      return 'basic';
    }

    // Mid-game standard waves & Mid-Battle Major Waves (prior to Late Climax)
    if (!isLateClimax) {
      if (kind === 'major' && spawnIndex === Math.floor(count / 2)) {
        if (this.level >= 5) return 'buckethead';
        if (this.level >= 3) return 'shieldbearer';
        return 'conehead';
      }
      if (this.level >= 4 && waveProgress >= 0.65 && spawnRatio >= 0.82 && rand > 0.45) {
        return this.level >= 6 && rand > 0.45 ? 'flame_drake' : 'troll';
      }
      if (this.level >= 4 && waveProgress >= 0.56 && spawnRatio >= 0.50 && rand > 0.76) {
        return 'flame_drake';
      }
      if (this.level >= 3 && (waveProgress >= 0.50 || kind === 'major') && spawnRatio >= 0.50 && rand > 0.74) {
        return 'buckethead';
      }
      if (this.level >= 2 && (waveProgress >= 0.42 || kind === 'major') && rand > 0.78) {
        return 'shieldbearer';
      }
      if (this.level >= 2 && (waveProgress >= 0.38 || kind === 'major') && rand > 0.64) {
        return 'berserker';
      }
      if (this.level >= 2 && rand > 0.52) {
        return 'conehead';
      }
      if (rand > 0.36) {
        return 'fenrir_wolf';
      }
      if (rand > 0.20) {
        return 'small_troll';
      }
      return 'basic';
    }

    // Late-battle Major & Final waves
    if (this.level === 1) {
      if (
        spawnIndex === 2 ||
        spawnIndex === Math.floor(count / 2) ||
        (kind === 'final' && spawnIndex === count - 3)
      ) {
        return 'conehead';
      }
      if (rand > 0.82) return 'conehead';
      if (rand > 0.60) return 'fenrir_wolf';
      return rand > 0.35 ? 'small_troll' : 'basic';
    }

    if (this.level === 2) {
      if (spawnIndex === Math.floor(count / 2)) {
        return kind === 'final' ? 'troll' : 'shieldbearer';
      }
      if (kind === 'final' && rand > 0.86) return 'troll';
      if (rand > 0.72) return 'shieldbearer';
      if (rand > 0.54) return 'berserker';
      if (rand > 0.38) return 'conehead';
      if (rand > 0.22) return 'fenrir_wolf';
      return 'basic';
    }

    if (this.level === 3) {
      if (spawnIndex === Math.floor(count / 2)) {
        return kind === 'final' ? 'troll' : 'buckethead';
      }
      if (rand > 0.84) return 'troll';
      if (rand > 0.68) return 'buckethead';
      if (rand > 0.52) return 'shieldbearer';
      if (rand > 0.36) return 'berserker';
      if (rand > 0.20) return 'fenrir_wolf';
      return rand > 0.10 ? 'conehead' : 'small_troll';
    }

    // Levels 4+ (culminating in Sindri's Forge & Nidavellir with Elite Flame Drakes)
    if (spawnIndex === Math.floor(count / 2)) {
      if (this.level >= 6) {
        return kind === 'final' ? 'flame_drake' : 'shieldbearer';
      }
      return kind === 'final' ? 'troll' : 'flame_drake';
    }
    const trollCut = Math.max(0.80, 0.88 - (this.level - 4) * 0.02);
    const drakeCut = this.level >= 6 ? 0.58 : 0.66;
    const bucketCut = this.level >= 6 ? 0.44 : 0.50;
    if (rand > trollCut) return 'troll';
    if (rand > drakeCut) return 'flame_drake';
    if (rand > bucketCut) return 'buckethead';
    if (rand > 0.31) return 'shieldbearer';
    if (rand > 0.18) return 'berserker';
    if (rand > 0.08) return 'fenrir_wolf';
    return 'conehead';
  }

  private addIncomingLaneWarning(row: number, durationMs: number, isHeavy: boolean): void {
    const existing = this.laneWarnings.find(w => w.row === row);
    if (existing) {
      existing.timer = Math.max(existing.timer, durationMs);
      existing.maxTimer = Math.max(existing.maxTimer, durationMs);
      existing.isHeavy = existing.isHeavy || isHeavy;
      return;
    }
    this.laneWarnings.push({
      row,
      timer: durationMs,
      maxTimer: durationMs,
      isHeavy
    });
  }

  private startNextWave(): void {
    if (this.currentWave >= this.wavePlan.length) return;
    const spec = this.wavePlan[this.currentWave];
    this.currentWave = spec.waveNumber;
    this.announceWave(spec);

    const rows = this.pickSpawnRowsForWave(spec.count);
    const leadInMs = (spec.kind === 'major' || spec.kind === 'final') ? 3000 : 2400;
    this.pendingWaveSpawns = [];

    let remainingInSalvo = this.computeSalvoSize(spec);
    for (let i = 0; i < spec.count; i++) {
      const unitKind = this.pickEnemyUnitForWave(spec, i);
      let delayMs: number;
      if (i === 0) {
        delayMs = leadInMs;
        remainingInSalvo--;
      } else if (remainingInSalvo > 0) {
        delayMs = this.computeIntraSalvoGapMs(spec);
        remainingInSalvo--;
      } else {
        delayMs = this.computeInterSalvoGapMs(spec);
        remainingInSalvo = this.computeSalvoSize(spec) - 1;
      }

      this.pendingWaveSpawns.push({
        row: rows[i],
        unitKind,
        delayMs,
        warned: false
      });
    }

    if (this.pendingWaveSpawns.length > 0) {
      this.nextSpawnTimer = this.pendingWaveSpawns[0].delayMs;
    }
  }

  private spawnQueuedEnemy(spawn: QueuedWaveSpawn): void {
    this.zombiesSpawned++;
    const laneJitterY = (Math.random() - 0.5) * 8;
    const spawnY = (spawn.row + 0.5) * this.grid.cellHeight - 45 + laneJitterY;
    const spawnX = this.width + 10 + Math.random() * 18;

    switch (spawn.unitKind) {
      case 'troll':
        this.attackers.push(new Troll(spawnX, spawnY - 10, spawn.row));
        break;
      case 'flame_drake':
        this.attackers.push(new FlameDrake(spawnX, spawnY, spawn.row));
        break;
      case 'buckethead':
        this.attackers.push(new BucketheadZombie(spawnX, spawnY, spawn.row));
        break;
      case 'shieldbearer':
        this.attackers.push(new ShieldwallDraugr(spawnX, spawnY, spawn.row));
        break;
      case 'berserker':
        this.attackers.push(new BerserkerDraugr(spawnX, spawnY, spawn.row));
        break;
      case 'conehead':
        this.attackers.push(new ConeheadZombie(spawnX, spawnY, spawn.row));
        break;
      case 'fenrir_wolf':
        this.attackers.push(new FenrirRaider(spawnX, spawnY, spawn.row));
        break;
      case 'small_troll':
        this.attackers.push(new SmallTroll(spawnX, spawnY + 5, spawn.row));
        break;
      case 'basic':
      default:
        this.attackers.push(new BasicZombie(spawnX, spawnY, spawn.row));
        break;
    }
  }

  restartBattle() {
    this.gameState = 'playing';
    this.zombiesKilled = 0;
    this.ambientCurrencyTimer = 4500;
    this.defenders = [];
    this.attackers = [];
    this.dyingEnemies = [];
    this.battleDebris = [];
    this.projectiles = [];
    this.valkyries = [];
    this.particles.clear();
    for (let i = 0; i < this.floatingTexts.length; i++) {
      this.floatingTextPool.push(this.floatingTexts[i]);
    }
    this.floatingTexts.length = 0;
    if (typeof document !== 'undefined') {
      document.body.className = this.city ? `theme-${this.realm} location-${this.city}` : `theme-${this.realm}`;
    }
    this.grid = new Grid(this.width, this.height, this.realm, this.city);
    this.initWaveDirector();
    this.cachedBgGradient = null;
    this.cachedCastleCanvas = null;
    this.initWeather();
    this.sun = getStartingCurrencyForLevel(this.level);
    for (let r = 0; r < this.grid.rows; r++) {
      this.valkyrieAvailable[r] = true;
    }
    this.realmEntranceTimer = 2.8;
    this.updateRealmHeader();
    this.renderSidebar();
    this.updateUI();
  }

  placeUnit(row: number, col: number, unitType: string) {
    const occupantIndex = this.defenders.findIndex(d => d.row === row && d.col === col);
    const isOccupied = occupantIndex !== -1;

    if (unitType === 'shovel') {
      if (isOccupied) {
        const d = this.defenders[occupantIndex];
        this.particles.emit(d.x + d.width/2, d.y + d.height/2, '#795548', 20, 5, 4, 300);
        this.defenders.splice(occupantIndex, 1);
        SoundManager.getInstance().playExplosion();
        this.deselectUnit();
      }
      return;
    }

    if (isOccupied) return;

    let unit: Defender | null = null;
    const x = this.grid.startX + col * this.grid.cellWidth + (this.grid.cellWidth - 60) / 2;
    const y = row * this.grid.cellHeight + (this.grid.cellHeight - 80) / 2;
    const isInf = getInfiniteResourcesForLevel(this.level);

    if (unitType === 'peashooter' && (isInf || this.sun >= 100)) {
      unit = new PeaShooter(x, y, row, col);
    } else if ((unitType === 'sunflower' || unitType.startsWith('sunflower_')) && (isInf || this.sun >= 50)) {
      const flowerRealm = unitType.startsWith('sunflower_') ? unitType.replace('sunflower_', '') : this.realm;
      unit = new SunFlower(x, y, row, col, flowerRealm);
    } else if (unitType === 'wallnut' && (isInf || this.sun >= 50)) {
      unit = new WallNut(x, y, row, col);
    } else if (unitType === 'torchwood' && (isInf || this.sun >= 175)) {
      unit = new Torchwood(x, y, row, col);
    } else if (unitType === 'cherrybomb' && (isInf || this.sun >= 150)) {
      unit = new CherryBomb(x, y, row, col);
    } else if (unitType === 'chomper' && (isInf || this.sun >= 150)) {
      unit = new Chomper(x, y, row, col);
    } else if (unitType === 'potatomine' && (isInf || this.sun >= 25)) {
      unit = new PotatoMine(x, y, row, col);
    } else if (unitType === 'snowpea' && (isInf || this.sun >= 175)) {
      unit = new SnowPea(x, y, row, col);
    } else if (unitType === 'repeater' && (isInf || this.sun >= 200)) {
      unit = new Repeater(x, y, row, col);
    } else if (unitType === 'kernelpult' && (isInf || this.sun >= 100)) {
      unit = new KernelPult(x, y, row, col);
    } else if (unitType === 'einherjar' && (isInf || this.sun >= 225)) {
      unit = new Einherjar(x, y, row, col);
    } else if (unitType === 'jalapeno' && (isInf || this.sun >= 125)) {
      if (!isInf) {
        this.sun -= 125;
      }
      this.updateUI();
      this.triggerScreenShake(450, 12);
      SoundManager.getInstance().playExplosion();
      const rowAttackers = this.attackersByRow[row];
      if (rowAttackers) {
        for (let zi = 0; zi < rowAttackers.length; zi++) {
          const z = rowAttackers[zi];
          z.takeDamage(1000);
          this.addFloatingText(z.x + z.width/2, z.y, '-1000 🔥', '#ff5722', true);
        }
      }
      for (let i = 0; i < this.width; i += 40) {
        this.particles.emit(i, y + 20, '#ff5722', 15, 6, 5, 500);
        this.particles.emit(i, y + 20, '#ffeb3b', 10, 4, 3, 400);
      }
      this.deselectUnit();
      return; 
    }

    if (unit) {
      this.defenders.push(unit);
      if (!isInf) {
        this.sun -= unit.cost;
      }
      this.updateUI();
      SoundManager.getInstance().playPlant();
      this.particles.emit(x + 30, y + 40, '#ffd54f', 15, 4, 3, 400);

      this.deselectUnit();
    }
  }

  deselectUnit() {
    const unitCards = document.querySelectorAll('.unit-card');
    unitCards.forEach(c => c.classList.remove('selected'));
    this.selectedUnit = null;
  }

  updateRowBuckets() {
    const numRows = this.grid ? this.grid.rows : 5;
    while (this.attackersByRow.length < numRows) {
      this.attackersByRow.push([]);
    }
    while (this.defendersByRow.length < numRows) {
      this.defendersByRow.push([]);
    }
    for (let r = 0; r < numRows; r++) {
      this.attackersByRow[r].length = 0;
      this.defendersByRow[r].length = 0;
    }
    const aLen = this.attackers.length;
    for (let i = 0; i < aLen; i++) {
      const a = this.attackers[i];
      if (a.row >= 0 && a.row < numRows) {
        this.attackersByRow[a.row].push(a);
      }
    }
    const dLen = this.defenders.length;
    for (let i = 0; i < dLen; i++) {
      const d = this.defenders[i];
      if (!d.markedForDeletion && d.row >= 0 && d.row < numRows) {
        this.defendersByRow[d.row].push(d);
      }
    }
  }

  updateAttackerRowBuckets() {
    this.updateRowBuckets();
  }

  hasAttackerInRow(row: number, minX: number): boolean {
    const list = this.attackersByRow[row];
    if (!list || list.length === 0) return false;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].markedForDeletion && list[i].x > minX) return true;
    }
    return false;
  }

  private spawnBattleDebris(
    x: number,
    y: number,
    groundY: number,
    kind: BattleDebrisKind,
    vx?: number,
    vy?: number
  ) {
    if (this.battleDebris.length > 36) {
      this.battleDebris.shift();
    }
    this.battleDebris.push({
      x,
      y,
      vx: vx !== undefined ? vx : 1.8 + Math.random() * 2.6,
      vy: vy !== undefined ? vy : -(4.2 + Math.random() * 2.4),
      rot: (Math.random() - 0.5) * 0.4,
      vRot: (Math.random() > 0.3 ? 1 : -1) * (0.14 + Math.random() * 0.14),
      groundY,
      bounced: false,
      life: 0,
      maxLife: 1050 + Math.random() * 250,
      kind
    });
  }

  private handleEnemyArmorBreak(zombie: Attacker) {
    if (!zombie.justBrokeArmor) return;
    zombie.justBrokeArmor = false;
    const zcx = zombie.x + zombie.width * 0.5;
    const headY = zombie.y + 18;
    const groundY = zombie.y + zombie.height - 6;

    SoundManager.getInstance().playArmorBreak();
    if (zombie.armorStyle === 'iron_bucket') {
      this.spawnBattleDebris(zcx, headY, groundY, 'iron_bucket', 2.4 + Math.random() * 2.2, -5.2);
      this.particles.emit(zcx, headY, '#cbd5e1', 12, 5, 3, 380);
      this.particles.emit(zcx, headY, '#fbbf24', 6, 4, 2, 260);
    } else if (zombie.armorStyle === 'bronze_cone') {
      this.spawnBattleDebris(zcx, headY - 8, groundY, 'bronze_cone', 2.6 + Math.random() * 2.4, -5.6);
      this.particles.emit(zcx, headY - 6, '#f59e0b', 12, 5, 3, 380);
      this.particles.emit(zcx, headY - 6, '#fef08a', 6, 4, 2, 260);
    } else if (zombie.armorStyle === 'tower_shield') {
      zombie.mass = 1.1;
      this.spawnBattleDebris(zcx - 10, zombie.y + 42, groundY, 'tower_shield', 2.2 + Math.random() * 2.0, -4.8);
      this.particles.emit(zcx - 10, zombie.y + 42, '#0f766e', 12, 5, 3, 380);
      this.particles.emit(zcx - 10, zombie.y + 42, '#38bdf8', 8, 4.5, 2.5, 300);
    }
  }

  checkCollisions(deltaTime: number) {
    this.updateAttackerRowBuckets();

    for (let pi = 0; pi < this.projectiles.length; pi++) {
      const proj = this.projectiles[pi];
      if (proj.markedForDeletion) continue;
      const rowZombies = this.attackersByRow[proj.row];
      if (!rowZombies || rowZombies.length === 0) continue;

      for (let zi = 0; zi < rowZombies.length; zi++) {
        const zombie = rowZombies[zi];
        if (zombie.markedForDeletion) continue;

        if (proj.x < zombie.x + zombie.width &&
            proj.x + proj.width > zombie.x) {
          const hitArmored = zombie.hasArmor();
          const isFire = proj instanceof FirePea;
          const isButter = proj instanceof Butter;
          const finalDamage = zombie.modifyProjectileDamage(proj.damage, isFire, isButter);
          zombie.takeDamage(finalDamage);

          if (hitArmored) {
            const isHeavyMetal = zombie.armorStyle === 'iron_bucket' || zombie.armorStyle === 'tower_shield';
            SoundManager.getInstance().playArmorHit(isHeavyMetal);
            const sparkColor = zombie.armorStyle === 'tower_shield'
              ? (isFire ? '#fb923c' : '#38bdf8')
              : zombie.armorStyle === 'iron_bucket'
              ? '#e2e8f0'
              : '#fbbf24';
            this.particles.emit(proj.x + proj.width, proj.y + proj.height * 0.5, sparkColor, 5, 4, 2, 220);
          } else {
            SoundManager.getInstance().playHit();
          }

          this.handleEnemyArmorBreak(zombie);

          if (zombie.justEnraged) {
            zombie.justEnraged = false;
            SoundManager.getInstance().playBerserkRoar();
            this.particles.emit(zombie.x + zombie.width * 0.5, zombie.y + 34, '#ef4444', 14, 4.8, 3, 360, -0.02);
            this.particles.emit(zombie.x + zombie.width * 0.5, zombie.y + 34, '#fb923c', 8, 3.8, 2.4, 300, -0.03);
            this.addFloatingText(zombie.x + zombie.width / 2, zombie.y - 16, 'RAGE! 🔥', '#fb923c', true);
          }

          let damageColor = '#ffffff';
          if (proj instanceof SnowProjectile) {
            const chillMs = Math.round(5000 * (1 - zombie.frostResistance));
            if (chillMs > 0) {
              zombie.slowTimer = Math.max(zombie.slowTimer, chillMs);
            }
            damageColor = '#81d4fa';
            this.particles.emit(
              proj.x + proj.width,
              proj.y + proj.height / 2,
              zombie.frostResistance > 0 ? '#e2e8f0' : '#81d4fa',
              6,
              3,
              2,
              200
            );
          } else if (isFire) {
            zombie.slowTimer = 0;
            damageColor = '#ff9800';
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#ff9800', 8, 4, 3, 300);
          } else if (isButter) {
            zombie.stunTimer = 4000;
            damageColor = '#ffeb3b';
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#ffeb3b', 8, 4, 3, 300);
          } else if (zombie.enemyKind === 'troll' || zombie.enemyKind === 'small_troll') {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#94a3b8', 5, 3.2, 2.2, 220);
          } else if (zombie.enemyKind === 'flame_drake') {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#fb923c', 5, 3.2, 2.2, 220);
          } else {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#38bdf8', 5, 3, 2, 200);
          }
          
          this.addFloatingText(zombie.x + zombie.width / 2, zombie.y - 4, `-${finalDamage}`, damageColor);
          proj.markedForDeletion = true;
          break; 
        }
      }
    }

    for (const zombie of this.attackers) {
      let isEating = false;

      // Fortress breach defense check
      if (zombie.x < this.grid.startX) {
        if (this.valkyrieAvailable[zombie.row]) {
          this.valkyrieAvailable[zombie.row] = false;
          this.valkyries.push(new Valkyrie(this.grid.startX - 35, (zombie.row + 0.5) * this.grid.cellHeight - 37.5, zombie.row, this.realm, this.city));
          if (this.realm !== 'svartalfheim') {
            this.odinCommandTimer = 1000;
          }
          this.triggerScreenShake(300, 6);
          SoundManager.getInstance().playWave();
        } else if (zombie.x < this.grid.startX - 70 && this.gameState === 'playing') {
          // Fortress breached!
          this.gameState = 'defeat';
          this.triggerScreenShake(1000, 15);
          SoundManager.getInstance().playDefeat();
        }
      }

      for (const valk of this.valkyries) {
        if (zombie.row === valk.row && zombie.x < valk.x + valk.width && zombie.x + zombie.width > valk.x) {
          zombie.takeDamage(1000);
          if (this.isDwarvenWaterwayCity()) {
            this.addFloatingText(zombie.x + zombie.width/2, zombie.y - 10, '-1000 🌊', '#2dd4bf', true);
            this.particles.emit(zombie.x, zombie.y + zombie.height/2, '#2dd4bf', 12, 5, 4, 300);
            this.particles.emit(zombie.x, zombie.y + zombie.height/2, '#e0f2fe', 8, 3, 2, 200);
          } else if (this.isDwarvenForgeCity()) {
            this.addFloatingText(zombie.x + zombie.width/2, zombie.y - 10, '-1000 🔥', '#ff8c00', true);
            this.particles.emit(zombie.x, zombie.y + zombie.height/2, '#ff3d00', 10, 5, 4, 300);
          } else {
            this.addFloatingText(zombie.x + zombie.width/2, zombie.y - 10, '-1000 ⚡', '#ffd54f', true);
            this.particles.emit(zombie.x, zombie.y + zombie.height/2, '#ffb300', 10, 5, 4, 300);
          }
        }
      }

      const rowDefs = this.defendersByRow[zombie.row];
      if (rowDefs) {
        let targetDefender: Defender | null = null;

        for (let di = 0; di < rowDefs.length; di++) {
          const defender = rowDefs[di];
          if (defender.markedForDeletion) continue;

          // Winged Flame Drakes glide directly over buried Potato Mines
          if (zombie.isFlying && defender instanceof PotatoMine) continue;

          const directContact =
            zombie.x < defender.x + defender.width &&
            zombie.x + zombie.width > defender.x;
          const reachContact =
            zombie.attackReach > 0 &&
            zombie.x - zombie.attackReach < defender.x + defender.width &&
            zombie.x + zombie.width > defender.x;

          if (!directContact && !reachContact) continue;

          if (directContact && !zombie.isFlying && defender instanceof PotatoMine && defender.isArmed) {
            defender.markedForDeletion = true;
            this.particles.emitExplosion(defender.x + defender.width / 2, defender.y + defender.height / 2);
            this.triggerScreenShake(400, 10);
            SoundManager.getInstance().playExplosion();
            this.addFloatingText(defender.x + defender.width / 2, defender.y - 10, '-1800 💥', '#ff5722', true);
            const rowAttackers = this.attackersByRow[defender.row];
            if (rowAttackers) {
              for (let zi = 0; zi < rowAttackers.length; zi++) {
                const z = rowAttackers[zi];
                if (!z.isFlying && Math.abs(z.x - defender.x) < 80) {
                  z.overkilled = true;
                  z.markedForDeletion = true;
                }
              }
            }
            continue;
          }

          if (
            directContact &&
            !zombie.isFlying &&
            defender instanceof Chomper &&
            !defender.isDigesting &&
            zombie.x - defender.x < defender.range &&
            zombie.x - defender.x > -20
          ) {
            zombie.swallowed = true;
            zombie.markedForDeletion = true;
            defender.isDigesting = true;
            defender.digestTimer = 0;
            this.addFloatingText(defender.x + defender.width, defender.y - 10, 'Crunch! 🦷', '#ab47bc', true);
            this.particles.emit(defender.x + defender.width, defender.y + defender.height / 2, '#ab47bc', 20, 5, 4, 300);
            targetDefender = null;
            break;
          }

          if (!targetDefender || defender.x > targetDefender.x) {
            targetDefender = defender;
          }
        }

        if (!zombie.markedForDeletion && targetDefender) {
          isEating = true;
          const atkRate = zombie.getEffectiveAttackRate();
          if (!zombie.isStunned) {
            const effectiveDt = zombie.isSlowed ? deltaTime * 0.5 : deltaTime;
            zombie.attackTimer += effectiveDt;
            if (zombie.attackTimer >= atkRate) {
              zombie.attackTimer -= atkRate;
              zombie.onMeleeStrike();
              targetDefender.takeDamage(zombie.damage);
              SoundManager.getInstance().playEnemyAttack(zombie.attackStyle);

              const hitX = targetDefender.x + targetDefender.width * 0.65;
              const hitY = targetDefender.y + targetDefender.height * 0.48;
              if (zombie.attackStyle === 'heavy') {
                if (this.shakeTimer <= 0) {
                  this.triggerScreenShake(130, 3);
                }
                this.particles.emit(hitX, targetDefender.y + targetDefender.height - 6, '#94a3b8', 8, 4, 3, 320);
                this.particles.emit(hitX, hitY, '#fbbf24', 6, 3.5, 2.4, 240);
              } else if (zombie.attackStyle === 'fire_breath') {
                this.particles.emit(hitX, hitY, '#fb923c', 9, 4.2, 3, 280, -0.03);
                this.particles.emit(hitX, hitY, '#fef08a', 5, 3, 2, 210, -0.02);
              } else if (zombie.attackStyle === 'bite') {
                this.particles.emit(hitX, hitY, '#5eead4', 6, 3.6, 2.2, 200);
                this.particles.emit(hitX, hitY, '#ef4444', 4, 2.6, 2, 220);
              } else {
                const sparkCol = zombie.attackStyle === 'blade' ? '#e0f2fe' : '#fde047';
                this.particles.emit(hitX, hitY, sparkCol, 5, 3, 2, 200);
                this.particles.emit(hitX, hitY, '#ef4444', 3, 2.2, 2, 220);
              }
            }
          }
        }
      }
      if (!zombie.markedForDeletion) {
        zombie.isEating = isEating;
        if (!isEating) {
          zombie.attackTimer = Math.min(zombie.attackTimer, zombie.getEffectiveAttackRate() * 0.4);
        }
      }
    }
  }

  update(deltaTime: number) {
    if (this.realmEntranceTimer > 0) {
      this.realmEntranceTimer -= deltaTime / 1000;
      if (this.realmEntranceTimer < 0) this.realmEntranceTimer = 0;
    }

    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= deltaTime / 1000;
      if (this.waveBannerTimer < 0) this.waveBannerTimer = 0;
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
      if (this.shakeTimer < 0) this.shakeTimer = 0;
    }

    if (this.odinCommandTimer > 0) {
      this.odinCommandTimer -= deltaTime;
    }

    // Update floating texts (O(1) swap-and-pop with object pool)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += deltaTime;
      ft.y += ft.vy;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      if (ft.life >= ft.maxLife) {
        const last = this.floatingTexts.pop();
        if (i < this.floatingTexts.length && last) {
          this.floatingTexts[i] = last;
        }
        this.floatingTextPool.push(ft);
      }
    }

    // Update dynamic weather particles
    const w = this.width;
    const h = this.height;
    for (let i = 0; i < this.weatherParticles.length; i++) {
      const p = this.weatherParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.vAngle;

      if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        this.setWeatherParticleProps(p, false);
      }
    }

    // Update incoming lane call warnings
    for (let i = this.laneWarnings.length - 1; i >= 0; i--) {
      this.laneWarnings[i].timer -= deltaTime;
      if (this.laneWarnings[i].timer <= 0) {
        this.laneWarnings.splice(i, 1);
      }
    }

    if (this.gameState === 'playing') {
      if (this.realmEntranceTimer <= 0) {
        if (!getInfiniteResourcesForLevel(this.level)) {
          this.ambientCurrencyTimer += deltaTime;
          if (this.ambientCurrencyTimer >= this.ambientCurrencyInterval) {
            this.ambientCurrencyTimer -= this.ambientCurrencyInterval;
            this.sun += 25;
            this.updateUI();
            const currency = getRealmCurrency(this.realm);
            const dropX = this.grid.startX + (0.15 + Math.random() * 0.55) * Math.max(120, this.width - this.grid.startX);
            const dropY = Math.max(48, this.height * 0.16 + Math.random() * (this.height * 0.25));
            this.addFloatingText(dropX, dropY, `+25 ${currency.symbol}`, currency.color, true);
            this.particles.emit(dropX, dropY, currency.particleColor, 12, 3.5, 2.5, 380);
            SoundManager.getInstance().playSun();
          }
        }

        // Multi-wave progression director: grace period -> wave call -> salvo spawns -> breather
        if (this.spawnGraceTimer > 0) {
          this.spawnGraceTimer -= deltaTime;
          if (this.spawnGraceTimer <= 0) {
            this.spawnGraceTimer = 0;
            this.startNextWave();
          }
        } else if (this.pendingWaveSpawns.length > 0) {
          this.nextSpawnTimer -= deltaTime;

          let timeUntilSpawn = this.nextSpawnTimer;
          for (let i = 0; i < this.pendingWaveSpawns.length; i++) {
            if (i > 0) {
              timeUntilSpawn += this.pendingWaveSpawns[i].delayMs;
            }
            if (timeUntilSpawn > 1900) break;
            const upcoming = this.pendingWaveSpawns[i];
            if (!upcoming.warned) {
              upcoming.warned = true;
              this.addIncomingLaneWarning(
                upcoming.row,
                Math.max(950, timeUntilSpawn + 350),
                this.isHeavyEnemyKind(upcoming.unitKind)
              );
            }
          }

          while (this.pendingWaveSpawns.length > 0 && this.nextSpawnTimer <= 0) {
            const ready = this.pendingWaveSpawns.shift()!;
            this.spawnQueuedEnemy(ready);

            if (this.pendingWaveSpawns.length > 0) {
              this.nextSpawnTimer += this.pendingWaveSpawns[0].delayMs;
            } else if (this.currentWave < this.totalWaves) {
              this.interWaveDuration = this.computeInterWaveDelayMs(this.currentWave);
              this.interWaveTimer = this.interWaveDuration;
            }
          }
        } else if (this.currentWave < this.totalWaves) {
          if (this.attackers.length === 0) {
            this.interWaveTimer = Math.min(
              this.interWaveTimer,
              this.computePostClearDelayMs(this.currentWave)
            );
          } else {
            const completedSpec = this.wavePlan[this.currentWave - 1];
            const stragglerCap = completedSpec ? Math.max(1, Math.floor(completedSpec.count * 0.15)) : 1;
            const elapsedInterWave = this.interWaveDuration - this.interWaveTimer;
            if (elapsedInterWave >= 16000 && this.attackers.length <= stragglerCap) {
              this.interWaveTimer = Math.min(
                this.interWaveTimer,
                this.computeStragglerDelayMs(this.currentWave)
              );
            }
          }
          this.interWaveTimer -= deltaTime;
          if (this.interWaveTimer <= 0) {
            this.interWaveTimer = 0;
            this.startNextWave();
          }
        }
      }

      // Victory Condition check
      if (
        this.currentWave >= this.totalWaves &&
        this.pendingWaveSpawns.length === 0 &&
        this.zombiesSpawned >= this.zombiesTotal &&
        this.attackers.length === 0
      ) {
        this.gameState = 'victory';
        SoundManager.getInstance().playVictory();
      }
    }

    this.updateRowBuckets();
    const numDef = this.defenders.length;
    for (let i = 0; i < numDef; i++) this.defenders[i].update(deltaTime, this);
    const numAtt = this.attackers.length;
    for (let i = 0; i < numAtt; i++) this.attackers[i].update(deltaTime, this);
    const numProj = this.projectiles.length;
    for (let i = 0; i < numProj; i++) this.projectiles[i].update(deltaTime, this);
    const numValk = this.valkyries.length;
    for (let i = 0; i < numValk; i++) this.valkyries[i].update(deltaTime, this);
    this.particles.update(deltaTime);

    // Update tumbling helmets, weapons, & crag-stone battle debris
    const debrisTimeScale = deltaTime / 16;
    for (let i = this.battleDebris.length - 1; i >= 0; i--) {
      const db = this.battleDebris[i];
      db.life += deltaTime;
      db.x += db.vx * debrisTimeScale;
      db.vy += 0.28 * debrisTimeScale;
      db.y += db.vy * debrisTimeScale;
      db.rot += db.vRot * debrisTimeScale;
      if (db.y >= db.groundY) {
        db.y = db.groundY;
        if (!db.bounced) {
          db.bounced = true;
          db.vy = -Math.abs(db.vy) * 0.42;
          db.vx *= 0.62;
          db.vRot *= 0.55;
        } else {
          db.vy = 0;
          db.vx *= 0.85;
          db.vRot *= 0.8;
        }
      }
      if (db.life >= db.maxLife) {
        this.battleDebris.splice(i, 1);
      }
    }

    // Update non-blocking defeated enemy topple & soul-banishment sequences
    for (let i = this.dyingEnemies.length - 1; i >= 0; i--) {
      const de = this.dyingEnemies[i];
      de.timer += deltaTime;
      const p = Math.min(1, de.timer / de.duration);
      const ease = 1 - Math.pow(1 - p, 2.4);
      const att = de.attacker;
      if (att.overkilled) {
        att.scaleX = 1 + ease * 0.22;
        att.scaleY = 1 - ease * 0.28;
        att.offsetY = ease * 10;
      } else {
        att.rotation = ease * 1.38;
        att.offsetX = ease * 16;
        att.offsetY = ease * 22;
        att.recoilX = 0;
      }
      de.soulY -= (deltaTime / 16) * 0.95;
      if (de.timer >= de.duration) {
        this.dyingEnemies.splice(i, 1);
      }
    }
    
    this.checkCollisions(deltaTime);

    let anyDefDel = false;
    for (let i = 0; i < this.defenders.length; i++) {
      if (this.defenders[i].markedForDeletion) { anyDefDel = true; break; }
    }
    if (anyDefDel) {
      this.defenders = this.defenders.filter(d => {
        if (d.markedForDeletion) {
          this.particles.emit(d.x + d.width/2, d.y + d.height/2, '#4caf50', 20, 5, 4, 400); 
          return false;
        }
        return true;
      });
    }

    let anyAttDel = false;
    for (let i = 0; i < this.attackers.length; i++) {
      if (this.attackers[i].markedForDeletion) { anyAttDel = true; break; }
    }
    if (anyAttDel) {
      this.attackers = this.attackers.filter(a => {
        if (a.markedForDeletion) {
          this.zombiesKilled++;
          if (!a.swallowed) {
            const acx = a.x + a.width * 0.5;
            const acy = a.y + a.height * 0.5;
            const groundY = a.y + a.height - 5;
            const isHeavy =
              a.enemyKind === 'troll' ||
              a.enemyKind === 'buckethead' ||
              a.enemyKind === 'shieldbearer' ||
              a.enemyKind === 'flame_drake';
            SoundManager.getInstance().playEnemyDeath(isHeavy);

            if (a.enemyKind === 'troll') {
              if (this.shakeTimer <= 0) {
                this.triggerScreenShake(180, 4);
              }
              this.particles.emit(acx, acy, '#64748b', 18, 5.5, 4.5, 520);
              this.particles.emit(acx, acy, '#65a30d', 8, 4, 3, 420);
              this.particles.emit(acx, acy, '#fbbf24', 10, 4.5, 2.5, 460, -0.02);
              this.spawnBattleDebris(acx - 8, acy, groundY, 'crag_stone', -2.2, -4.5);
              this.spawnBattleDebris(acx + 10, acy - 6, groundY, 'crag_stone', 2.8, -5.0);
            } else if (a.enemyKind === 'flame_drake') {
              this.particles.emit(acx, acy, '#292524', 14, 5.2, 4.0, 460);
              this.particles.emit(acx, acy, '#fb923c', 12, 4.8, 3.2, 420, -0.03);
              this.particles.emit(acx, acy - 6, '#fef08a', 8, 3.5, 2.4, 380, -0.04);
              this.spawnBattleDebris(acx - 6, acy, groundY + 8, 'crag_stone', -1.8, -4.0);
            } else if (a.enemyKind === 'fenrir_wolf') {
              this.particles.emit(acx, acy, '#334155', 12, 4.8, 3.2, 380);
              this.particles.emit(acx, acy - 4, '#5eead4', 10, 3.8, 2.4, 440, -0.03);
            } else if (a.enemyKind === 'berserker') {
              this.particles.emit(acx, acy, '#78350f', 12, 4.8, 3.4, 420);
              this.particles.emit(acx, acy - 8, '#ef4444', 12, 3.8, 2.6, 480, -0.03);
              this.spawnBattleDebris(acx - 10, acy, groundY, 'axe', -2.4, -4.6);
              this.spawnBattleDebris(acx + 6, acy - 4, groundY, 'axe', 2.1, -4.8);
            } else if (a.enemyKind === 'small_troll') {
              this.particles.emit(acx, acy, '#475569', 12, 4.5, 3.5, 420);
              this.particles.emit(acx, acy, '#a3e635', 6, 3.5, 2.5, 360);
              this.spawnBattleDebris(acx - 6, acy, groundY, 'club', -1.8, -4.2);
            } else {
              const soulCol = a.enemyKind === 'buckethead'
                ? '#f87171'
                : a.enemyKind === 'conehead'
                ? '#fbbf24'
                : '#38bdf8';
              this.particles.emit(acx, acy, '#64748b', 12, 4.8, 3.2, 420);
              this.particles.emit(acx, acy - 8, soulCol, 10, 3.2, 2.5, 500, -0.03);
              const weaponKind: BattleDebrisKind = a.enemyKind === 'buckethead'
                ? 'axe'
                : a.enemyKind === 'conehead'
                ? 'mace'
                : a.enemyKind === 'shieldbearer'
                ? 'spear'
                : 'sword';
              this.spawnBattleDebris(acx - 8, acy, groundY, weaponKind, -1.6 + Math.random() * 1.4, -4.4);
            }

            if (a.overkilled) {
              this.particles.emit(acx, acy, '#1e293b', 14, 6, 4, 480);
            }

            // Prepare entity for visual death sequence (suppress health bar & hit flash)
            a.flashTimer = 0;
            a.lastDamageTimer = 0;
            a.isStunned = false;
            if (this.dyingEnemies.length >= 18) {
              this.dyingEnemies.shift();
            }
            const wispColor = a.enemyKind === 'buckethead' || a.enemyKind === 'berserker'
              ? '#f87171'
              : a.enemyKind === 'flame_drake'
              ? '#fb923c'
              : a.enemyKind === 'fenrir_wolf'
              ? '#5eead4'
              : a.enemyKind === 'conehead' || a.enemyKind === 'troll'
              ? '#fbbf24'
              : a.enemyKind === 'small_troll'
              ? '#bef264'
              : '#38bdf8';
            this.dyingEnemies.push({
              attacker: a,
              timer: 0,
              duration: a.overkilled ? 320 : 480,
              soulX: acx,
              soulY: a.y + 16,
              soulColor: wispColor
            });
          }
          return false;
        }
        return true;
      });
    }

    let anyProjDel = false;
    for (let i = 0; i < this.projectiles.length; i++) {
      if (this.projectiles[i].markedForDeletion) { anyProjDel = true; break; }
    }
    if (anyProjDel) {
      this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    }

    let anyValkDel = false;
    for (let i = 0; i < this.valkyries.length; i++) {
      if (this.valkyries[i].markedForDeletion) { anyValkDel = true; break; }
    }
    if (anyValkDel) {
      this.valkyries = this.valkyries.filter(v => !v.markedForDeletion);
    }
  }

  private buildCastleCache(dpr: number, wallW: number, height: number) {
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.ceil(wallW * dpr);
    offscreen.height = Math.ceil(height * dpr);
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.save();
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    // Procedural stone masonry fortification wall
    const wallGrad = ctx.createLinearGradient(0, 0, wallW, 0);
    if (isLight) {
      if (this.realm === 'jotunheim' || this.realm === 'niflheim' || this.realm === 'helheim') {
        wallGrad.addColorStop(0, '#e0f2fe');
        wallGrad.addColorStop(0.7, '#bae6fd');
        wallGrad.addColorStop(1, '#93c5fd');
      } else if (this.realm === 'asgard' || this.realm === 'alfheim') {
        wallGrad.addColorStop(0, '#fef9c3');
        wallGrad.addColorStop(0.7, '#fde68a');
        wallGrad.addColorStop(1, '#fcd34d');
      } else if (this.isDwarvenWaterwayCity()) {
        if (this.city === 'andvaris-falls') {
          wallGrad.addColorStop(0, '#e0f2fe');
          wallGrad.addColorStop(0.4, '#bae6fd');
          wallGrad.addColorStop(0.75, '#7dd3fc');
          wallGrad.addColorStop(1, '#38bdf8');
        } else {
          wallGrad.addColorStop(0, '#ccfbf1');
          wallGrad.addColorStop(0.4, '#99f6e4');
          wallGrad.addColorStop(0.75, '#5eead4');
          wallGrad.addColorStop(1, '#2dd4bf');
        }
      } else if (this.isDwarvenForgeCity()) {
        wallGrad.addColorStop(0, '#fef3c7');
        wallGrad.addColorStop(0.5, '#fde68a');
        wallGrad.addColorStop(0.85, '#fcd34d');
        wallGrad.addColorStop(1, '#fbbf24');
      } else if (this.realm === 'muspelheim') {
        wallGrad.addColorStop(0, '#ffedd5');
        wallGrad.addColorStop(0.7, '#fed7aa');
        wallGrad.addColorStop(1, '#fdba74');
      } else {
        wallGrad.addColorStop(0, '#f1f5f9');
        wallGrad.addColorStop(0.7, '#e2e8f0');
        wallGrad.addColorStop(1, '#cbd5e1');
      }
    } else {
      if (this.realm === 'jotunheim' || this.realm === 'niflheim' || this.realm === 'helheim') {
        wallGrad.addColorStop(0, '#102030');
        wallGrad.addColorStop(0.7, '#1b334a');
        wallGrad.addColorStop(1, '#2c4d68');
      } else if (this.realm === 'asgard' || this.realm === 'alfheim') {
        wallGrad.addColorStop(0, '#3a2d12');
        wallGrad.addColorStop(0.7, '#5c481e');
        wallGrad.addColorStop(1, '#8c6d2d');
      } else if (this.isDwarvenWaterwayCity()) {
        // Althjof's Wheel & Andvari's Falls: Damp subterranean dwarven river masonry
        wallGrad.addColorStop(0, '#0c151a');
        wallGrad.addColorStop(0.4, '#152229');
        wallGrad.addColorStop(0.75, '#1c2d36');
        wallGrad.addColorStop(1, '#243b47');
      } else if (this.isDwarvenForgeCity()) {
        // Dwarven Forge / Mine / Citadel Strongholds: charcoal with warm amber seams
        wallGrad.addColorStop(0, '#1a1510');
        wallGrad.addColorStop(0.5, '#2e2618');
        wallGrad.addColorStop(0.85, '#3a301e');
        wallGrad.addColorStop(1, '#4a3c24');
      } else if (this.realm === 'muspelheim') {
        wallGrad.addColorStop(0, '#21100c');
        wallGrad.addColorStop(0.7, '#381c15');
        wallGrad.addColorStop(1, '#542b20');
      } else {
        wallGrad.addColorStop(0, '#263238');
        wallGrad.addColorStop(0.7, '#37474f');
        wallGrad.addColorStop(1, '#455a64');
      }
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, wallW, height);

    // Stone brick patterns
    if (!this.isDwarvenWaterwayCity()) {
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      const brickH = 32;
      for (let y = 0; y < height; y += brickH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(wallW, y);
        ctx.stroke();
        const rowIdx = Math.floor(y / brickH);
        const shift = (rowIdx % 2) * 35;
        for (let x = shift; x < wallW; x += 70) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + brickH);
          ctx.stroke();
        }
      }
    }

    // Realm-specific wall overlay / frost / icicles / runes / static architecture
    if (this.isDwarvenWaterwayCity()) {
      const h = height;
      ctx.save();

      // ── 1. SUBTERRANEAN BASALT ASHLAR MASONRY & MINERAL SEEPAGE ──
      const courses = [42, 36, 46, 38, 44, 40, 48, 38, 44, 42, 46, 38, 44];
      let curY = 0;
      let cIdx = 0;
      while (curY < h) {
        const cH = courses[cIdx % courses.length];
        const nextY = Math.min(h, curY + cH);

        // Course bed joint (recessed mortar groove)
        ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(2, 6, 8, 0.75)';
        ctx.fillRect(0, nextY - 2, wallW, 3);

        // Top stone edge bevel highlight (mineral sheen)
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(45, 212, 191, 0.08)';
        ctx.fillRect(0, curY, wallW, 2);

        // Vertical head joints between individual blocks
        const blockW = 68 + ((cIdx * 31) % 24);
        const shift = ((cIdx % 2) * (blockW * 0.5)) % blockW;
        for (let bx = shift; bx < wallW; bx += blockW) {
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.10)' : 'rgba(2, 6, 8, 0.65)';
          ctx.fillRect(bx - 1, curY, 2, cH);
          ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(45, 212, 191, 0.05)';
          ctx.fillRect(bx + 1, curY, 1, cH);
        }

        curY = nextY;
        cIdx++;
      }

      // Water Seepage & Mineral Stain Gradient on stone
      const seepGrad = ctx.createLinearGradient(wallW, 0, 0, 0);
      seepGrad.addColorStop(0, isLight ? 'rgba(20, 184, 166, 0.14)' : 'rgba(20, 184, 166, 0.22)');
      seepGrad.addColorStop(0.5, isLight ? 'rgba(13, 148, 136, 0.06)' : 'rgba(13, 148, 136, 0.10)');
      seepGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = seepGrad;
      ctx.fillRect(0, 0, wallW, h);

      // Slender vertical water trickle streaks trickling down basalt
      const trickleX = [wallW * 0.32, wallW * 0.54, wallW * 0.74, wallW * 0.88];
      for (let ti = 0; ti < trickleX.length; ti++) {
        const tx = trickleX[ti];
        const tLen = h * (0.35 + 0.3 * Math.sin(ti * 1.9 + 1.2));
        const tGrad = ctx.createLinearGradient(tx, 0, tx, tLen);
        tGrad.addColorStop(0, 'rgba(45, 212, 191, 0.16)');
        tGrad.addColorStop(0.6, 'rgba(20, 184, 166, 0.08)');
        tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = tGrad;
        ctx.fillRect(tx - 1.5, 0, 3, tLen);
      }

      // ── 2. INNER BASTION SEAM & SUBTERRANEAN GLOW ──
      const quayWidth = 60;
      const quayLeft = wallW - quayWidth;
      const seamShadow = ctx.createLinearGradient(quayLeft - 10, 0, quayLeft + 4, 0);
      seamShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      seamShadow.addColorStop(0.7, isLight ? 'rgba(15, 23, 42, 0.18)' : 'rgba(2, 6, 8, 0.75)');
      seamShadow.addColorStop(1, 'rgba(20, 184, 166, 0.18)');
      ctx.fillStyle = seamShadow;
      ctx.fillRect(quayLeft - 10, 0, 14, h);

      // ── BASTION INTERIOR BOUNDS ──
      const bastionLeft = Math.max(76, Math.round(wallW * 0.28));
      const bastionRight = wallW - 58;
      const bastionW = Math.max(56, bastionRight - bastionLeft);
      const bastionCenterX = Math.round((bastionLeft + bastionRight) / 2);
      const wingW = bastionLeft - 8;
      const wingCenterX = Math.round(wingW / 2) + 2;
      const balconyFloorY = Math.round(h * 0.28);
      const embTopY = Math.max(38, balconyFloorY - 85);
      const gateTop = Math.round(balconyFloorY + 34);
      const gateH = Math.max(120, h - gateTop - 28);
      const gateW = Math.min(84, bastionW + 4);
      const gateX = bastionCenterX - gateW / 2;

      // ── 2b. UPPER CAVERN VAULT CORNICE & DWARVEN BRONZE FRIEZE (0 to quayLeft) ──
      const corniceGrad = ctx.createLinearGradient(0, 0, 0, 24);
      if (isLight) {
        corniceGrad.addColorStop(0, '#94a3b8');
        corniceGrad.addColorStop(0.6, '#cbd5e1');
        corniceGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');
      } else {
        corniceGrad.addColorStop(0, '#030709');
        corniceGrad.addColorStop(0.6, '#0a161c');
        corniceGrad.addColorStop(1, 'rgba(10, 22, 28, 0)');
      }
      ctx.fillStyle = corniceGrad;
      ctx.fillRect(0, 0, quayLeft, 24);

      // Overhanging stone corbel teeth & bronze frieze bar along top of wall
      ctx.fillStyle = isLight ? '#64748b' : '#081318';
      ctx.fillRect(0, 0, quayLeft, 12);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 12, quayLeft, 3.5);
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(0, 15.5, quayLeft, 1.5);
      for (let cx = 10; cx < quayLeft - 12; cx += 22) {
        ctx.fillStyle = isLight ? '#94a3b8' : '#0d1d24';
        ctx.fillRect(cx, 17, 12, 6);
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, 17, 12, 6);
      }

      // ── 2c. FAR-LEFT DWARVEN HYDRO-FORGE WING & SLUICE WINCH TOWER (0 to bastionLeft) ──
      // Structural Basalt & Bronze Dividing Pilaster between Left Wing and Central Bastion
      const pilasterX = bastionLeft - 8;
      const pilasterGrad = ctx.createLinearGradient(pilasterX, 0, pilasterX + 8, 0);
      if (isLight) {
        pilasterGrad.addColorStop(0, '#94a3b8');
        pilasterGrad.addColorStop(0.5, '#cbd5e1');
        pilasterGrad.addColorStop(1, '#64748b');
      } else {
        pilasterGrad.addColorStop(0, '#050c0f');
        pilasterGrad.addColorStop(0.5, '#12252e');
        pilasterGrad.addColorStop(1, '#04090c');
      }
      ctx.fillStyle = pilasterGrad;
      ctx.fillRect(pilasterX, 16, 7, h - 16);
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(pilasterX + 2.5, 16, 2, h - 16);

      // Bronze clamp rings along the dividing pilaster
      for (let py = 48; py < h - 30; py += 68) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pilasterX - 1, py, 9, 5);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 0.9;
        ctx.strokeRect(pilasterX - 1, py, 9, 5);
      }

      // (A) Upper Dwarven Guild Crest & Ancestral Medallion (Top of Left Wing)
      const crestY = Math.max(58, embTopY + 18);
      const crestR = Math.min(24, Math.floor(wingW * 0.36));
      ctx.save();
      ctx.translate(wingCenterX, crestY);
      // Octagonal basalt & bronze plaque
      ctx.fillStyle = isLight ? '#cbd5e1' : '#071217';
      ctx.beginPath();
      for (let oi = 0; oi < 8; oi++) {
        const ang = (oi * Math.PI) / 4 + Math.PI / 8;
        const ox = Math.cos(ang) * crestR;
        const oy = Math.sin(ang) * crestR;
        if (oi === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Inner teal runic ring
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, crestR - 5, 0, Math.PI * 2);
      ctx.stroke();

      // Embossed Dwarven Great-Hammer & Waterwheel Emblem
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -10, 4, 21); // Hammer shaft
      ctx.beginPath();
      ctx.moveTo(-11, -11);
      ctx.lineTo(11, -11);
      ctx.lineTo(9, -4);
      ctx.lineTo(-9, -4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing teal center rune gem
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(0, -7.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // (B) Mid-Wall Subterranean Hydro-Boiler Furnace Alcove (Left Wing)
      const boilerW = Math.min(48, wingW - 12);
      const boilerX = wingCenterX - boilerW / 2;
      const boilerBotY = balconyFloorY + 18;
      const boilerTopY = boilerBotY - 58;

      // Overhead copper steam-pressure pipe connecting Boiler to Central Bastion & Artillery Manifold
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wingCenterX - 3, boilerTopY - 22, 6, 24);
      ctx.fillRect(wingCenterX - 3, boilerTopY - 22, quayLeft - wingCenterX + 3, 5);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(wingCenterX - 1.5, boilerTopY - 21, 3, 22);
      ctx.fillRect(wingCenterX - 1.5, boilerTopY - 20.5, quayLeft - wingCenterX + 1.5, 2.5);

      // Boiler Furnace Arched Recess
      ctx.fillStyle = isLight ? '#475569' : '#04080b';
      ctx.beginPath();
      ctx.moveTo(boilerX, boilerTopY + boilerW / 2);
      ctx.arc(wingCenterX, boilerTopY + boilerW / 2, boilerW / 2, Math.PI, 0);
      ctx.lineTo(boilerX + boilerW, boilerBotY);
      ctx.lineTo(boilerX, boilerBotY);
      ctx.closePath();
      ctx.fill();

      // Molten amber forge-coal glow inside boiler
      const boilerGlow = ctx.createRadialGradient(wingCenterX, boilerBotY - 12, 2, wingCenterX, boilerBotY - 14, boilerW * 0.65);
      boilerGlow.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      boilerGlow.addColorStop(0.45, 'rgba(234, 88, 12, 0.55)');
      boilerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = boilerGlow;
      ctx.fill();

      // Copper Boiler Dome Hood & Riveted Arch Rim
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wingCenterX, boilerTopY + boilerW / 2, boilerW / 2, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Heavy Iron Furnace Grate Bars over glowing coals
      ctx.strokeStyle = isLight ? '#1e293b' : '#0f172a';
      ctx.lineWidth = 2.4;
      for (let gb = -2; gb <= 2; gb++) {
        const gbx = wingCenterX + gb * (boilerW * 0.17);
        ctx.beginPath();
        ctx.moveTo(gbx, boilerTopY + boilerW * 0.42);
        ctx.lineTo(gbx, boilerBotY - 2);
        ctx.stroke();
      }
      // Horizontal bronze crossbar & stone hearth sill
      ctx.fillStyle = '#92400e';
      ctx.fillRect(boilerX + 2, boilerBotY - 18, boilerW - 4, 4);
      ctx.fillStyle = isLight ? '#94a3b8' : '#0b181f';
      ctx.fillRect(boilerX - 3, boilerBotY - 3, boilerW + 6, 7);
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(boilerX - 3, boilerBotY - 3, boilerW + 6, 7);

      // (C) Lower Floodgate Counterweight Winch & Gear-Train Alcove (Left Wing)
      const winchW = Math.min(50, wingW - 10);
      const winchX = wingCenterX - winchW / 2;
      const winchTopY = gateTop + 8;
      const winchH = Math.max(105, gateH - 18);

      // Recessed Gear-Bay Chamber
      ctx.fillStyle = isLight ? '#64748b' : '#03070a';
      ctx.beginPath();
      ctx.roundRect(winchX, winchTopY, winchW, winchH, 6);
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Vertical Aquamarine Hydraulic Pressure Cylinder inside Winch Bay
      const cylX = winchX + 10;
      const cylGrad = ctx.createLinearGradient(cylX - 5, 0, cylX + 5, 0);
      cylGrad.addColorStop(0, '#0f766e');
      cylGrad.addColorStop(0.5, '#5eead4');
      cylGrad.addColorStop(1, '#115e59');
      ctx.fillStyle = cylGrad;
      ctx.fillRect(cylX - 4, winchTopY + 12, 8, winchH - 24);
      // Brass cylinder collars
      ctx.fillStyle = '#b45309';
      for (let cy = winchTopY + 12; cy <= winchTopY + winchH - 16; cy += 26) {
        ctx.fillRect(cylX - 6, cy, 12, 4);
      }

      // Taut Iron Hoist Chain connecting Winch Bay over Upper Pulley Sheaf to the Sluice Floodgate
      const pulleyY = gateTop + 14;
      ctx.strokeStyle = isLight ? '#334155' : '#64748b';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(wingCenterX + 8, winchTopY + winchH - 28);
      ctx.lineTo(wingCenterX + 8, pulleyY);
      ctx.lineTo(gateX + 12, pulleyY);
      ctx.lineTo(gateX + 12, gateTop + 42);
      ctx.stroke();
      ctx.setLineDash([]);

      // Upper Bronze Pulley Wheel
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(wingCenterX + 8, pulleyY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Suspended Heavy Basalt & Bronze Counterweight Block
      const cwX = wingCenterX + 1;
      const cwY = winchTopY + winchH - 36;
      ctx.fillStyle = isLight ? '#475569' : '#0f1f26';
      ctx.fillRect(cwX, cwY, 15, 22);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(cwX, cwY, 15, 22);
      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ᚢ', cwX + 7.5, cwY + 14);

      // ── 3. FORTIFIED STONE BALCONY & DWARVEN SENTRY EMBRASURE ──
      const embW = Math.min(76, bastionW);
      const embX = bastionCenterX - embW / 2;

      // Hanging Dwarven Clan Banners beneath the Balcony Corbels
      const bannerPositions = [embX + 10, embX + embW - 22];
      for (let bi = 0; bi < bannerPositions.length; bi++) {
        const bx = bannerPositions[bi];
        const byTop = balconyFloorY + 4;
        ctx.fillStyle = '#0f2930';
        ctx.beginPath();
        ctx.moveTo(bx, byTop);
        ctx.lineTo(bx + 12, byTop);
        ctx.lineTo(bx + 12, byTop + 22);
        ctx.lineTo(bx + 6, byTop + 28);
        ctx.lineTo(bx, byTop + 22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#2dd4bf';
        ctx.font = 'bold 8px serif';
        ctx.textAlign = 'center';
        ctx.fillText(bi === 0 ? 'ᛟ' : 'ᛏ', bx + 6, byTop + 16);
      }

      // Carved Stone Corbel Brackets
      ctx.fillStyle = isLight ? '#94a3b8' : '#060d10';
      const corbels = [embX + 8, bastionCenterX, embX + embW - 8];
      for (const cx of corbels) {
        ctx.beginPath();
        ctx.moveTo(cx - 7, balconyFloorY);
        ctx.lineTo(cx + 7, balconyFloorY);
        ctx.lineTo(cx + 4, balconyFloorY + 22);
        ctx.lineTo(cx - 4, balconyFloorY + 22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Outer Dressed Stone Arch Surround around Embrasure
      ctx.fillStyle = isLight ? '#cbd5e1' : '#0b181f';
      ctx.beginPath();
      ctx.moveTo(embX - 5, embTopY + embW / 2);
      ctx.arc(bastionCenterX, embTopY + embW / 2, embW / 2 + 5, Math.PI, 0);
      ctx.lineTo(embX + embW + 5, balconyFloorY);
      ctx.lineTo(embX - 5, balconyFloorY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Arched Embrasure Window into Mountain Foundries
      ctx.fillStyle = isLight ? '#64748b' : '#03070a';
      ctx.beginPath();
      ctx.moveTo(embX, embTopY + embW / 2);
      ctx.arc(bastionCenterX, embTopY + embW / 2, embW / 2, Math.PI, 0);
      ctx.lineTo(embX + embW, balconyFloorY);
      ctx.lineTo(embX, balconyFloorY);
      ctx.closePath();
      ctx.fill();

      // Soft interior forge warmth
      const innerForge = ctx.createRadialGradient(bastionCenterX, embTopY + 45, 4, bastionCenterX, embTopY + 45, embW * 0.65);
      innerForge.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
      innerForge.addColorStop(0.65, 'rgba(13, 148, 136, 0.16)');
      innerForge.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = innerForge;
      ctx.fill();

      // Heavy Bronze Arch Ring
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bastionCenterX, embTopY + embW / 2, embW / 2, Math.PI, 0);
      ctx.stroke();

      // Embrasure Arch Keystone with Rune ᛟ
      ctx.fillStyle = isLight ? '#cbd5e1' : '#14252e';
      ctx.beginPath();
      ctx.moveTo(bastionCenterX - 8, embTopY - 4);
      ctx.lineTo(bastionCenterX + 8, embTopY - 4);
      ctx.lineTo(bastionCenterX + 6, embTopY + 15);
      ctx.lineTo(bastionCenterX - 6, embTopY + 15);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 5;
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ᛟ', bastionCenterX, embTopY + 10);
      ctx.shadowBlur = 0;

      // Sentry / Master Canal Engineer in Embrasure
      ctx.save();
      ctx.translate(bastionCenterX, balconyFloorY - 14);

      // Dwarf shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dwarven Chainmail Hauberk & Bronze Shoulder Pauldrons
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-16, -16, 32, 26, 4);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(-13, -10, 5.5, 0, Math.PI * 2);
      ctx.arc(13, -10, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Polished Dwarven Bronze Breastplate
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.roundRect(-10, -14, 20, 22, 3);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Red-Golden Dwarf Beard
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(-11, -12);
      ctx.quadraticCurveTo(-13, 8, 0, 13);
      ctx.quadraticCurveTo(13, 8, 11, -12);
      ctx.closePath();
      ctx.fill();
      // Golden beard braid rings
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-4, 3, 8, 2.5);
      ctx.fillRect(-3, 8, 6, 2);

      // Face & Nose
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -15, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fdba74';
      ctx.beginPath();
      ctx.arc(0, -14, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Dwarven Master Artisan Helmet with Bronze Wings & Runic Brow
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, -18, 9.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-10, -19, 20, 3);
      ctx.fillRect(-1.5, -24, 3, 9);
      // Small bronze helm side-horns/wings
      ctx.beginPath();
      ctx.moveTo(-9, -18);
      ctx.lineTo(-14, -23);
      ctx.lineTo(-8, -21);
      ctx.moveTo(9, -18);
      ctx.lineTo(14, -23);
      ctx.lineTo(8, -21);
      ctx.fill();

      // Hydraulic Valve Control Wheel in Sentry Hands
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
      ctx.moveTo(0, -9); ctx.lineTo(0, 9);
      ctx.stroke();

      ctx.restore(); // Exit sentry

      // Front Stone & Bronze Parapet Wall
      const parapetTop = balconyFloorY - 14;
      const parapetGrad = ctx.createLinearGradient(embX - 2, parapetTop, embX + embW + 2, balconyFloorY);
      if (isLight) {
        parapetGrad.addColorStop(0, '#e2e8f0');
        parapetGrad.addColorStop(0.5, '#cbd5e1');
        parapetGrad.addColorStop(1, '#94a3b8');
      } else {
        parapetGrad.addColorStop(0, '#0c181e');
        parapetGrad.addColorStop(0.5, '#152a33');
        parapetGrad.addColorStop(1, '#081216');
      }
      ctx.fillStyle = parapetGrad;
      ctx.beginPath();
      ctx.roundRect(embX - 4, parapetTop, embW + 8, balconyFloorY - parapetTop + 4, 3);
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Decorative Bronze Parapet Shields along Balcony Front
      for (const sx of [embX + 14, bastionCenterX, embX + embW - 14]) {
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(sx, parapetTop + 8, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Bronze Coping Rail on parapet
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(embX - 6, parapetTop - 2, embW + 12, 4);

      // ── 4. ARCHITECTURAL CANAL SLUICE ARCH & HEAVY FLOODGATE ──
      // Heavy Dressed Arch Keystone & Voussoirs
      ctx.fillStyle = isLight ? '#cbd5e1' : '#0a161c';
      ctx.beginPath();
      ctx.moveTo(gateX - 6, gateTop + 24);
      ctx.arc(bastionCenterX, gateTop + 24, gateW / 2 + 6, Math.PI, 0);
      ctx.lineTo(gateX + gateW + 6, gateTop + gateH);
      ctx.lineTo(gateX - 6, gateTop + gateH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bronze clamp-irons along sluice jambs
      ctx.fillStyle = '#b45309';
      for (let jy = gateTop + 36; jy < gateTop + gateH - 16; jy += 32) {
        ctx.fillRect(gateX - 8, jy, 6, 4);
        ctx.fillRect(gateX + gateW + 2, jy, 6, 4);
      }

      // Deep Culvert Void
      ctx.fillStyle = isLight ? '#475569' : '#020507';
      ctx.beginPath();
      ctx.moveTo(gateX, gateTop + 24);
      ctx.arc(bastionCenterX, gateTop + 24, gateW / 2, Math.PI, 0);
      ctx.lineTo(gateX + gateW, gateTop + gateH);
      ctx.lineTo(gateX, gateTop + gateH);
      ctx.closePath();
      ctx.fill();

      // Sluice Arch Keystone with Rune ᚨ
      ctx.fillStyle = isLight ? '#cbd5e1' : '#162830';
      ctx.beginPath();
      ctx.moveTo(bastionCenterX - 10, gateTop - 4);
      ctx.lineTo(bastionCenterX + 10, gateTop - 4);
      ctx.lineTo(bastionCenterX + 7, gateTop + 20);
      ctx.lineTo(bastionCenterX - 7, gateTop + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ᚨ', bastionCenterX, gateTop + 14);
      ctx.shadowBlur = 0;

      // Heavy Iron Portcullis Bars
      ctx.strokeStyle = isLight ? '#334155' : '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'square';
      const numBars = Math.max(3, Math.floor(gateW / 18));
      for (let bar = 0; bar < numBars; bar++) {
        const bx = gateX + 8 + bar * ((gateW - 16) / Math.max(1, numBars - 1));
        ctx.beginPath();
        ctx.moveTo(bx, gateTop + 24);
        ctx.lineTo(bx, gateTop + gateH - 8);
        ctx.stroke();
      }

      // Horizontal Reinforced Bronze Girders with Rivets
      for (let rail = 0; rail < 3; rail++) {
        const ry = gateTop + 45 + rail * (gateH * 0.26);
        ctx.fillStyle = isLight ? '#0f766e' : '#0f272e';
        ctx.fillRect(gateX + 2, ry - 4, gateW - 4, 8);
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(gateX + 2, ry - 4, gateW - 4, 8);

        ctx.fillStyle = '#14b8a6';
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 3;
        for (let rv = 0; rv < numBars; rv++) {
          const rvx = gateX + 8 + rv * ((gateW - 16) / Math.max(1, numBars - 1));
          ctx.beginPath();
          ctx.arc(rvx, ry, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Churning Water Surging Through Sluice Spillway Base
      const spillTop = gateTop + gateH - 32;
      const spillGrad = ctx.createLinearGradient(bastionCenterX, spillTop, bastionCenterX, gateTop + gateH);
      spillGrad.addColorStop(0, 'rgba(13, 148, 136, 0.35)');
      spillGrad.addColorStop(0.5, 'rgba(20, 184, 166, 0.65)');
      spillGrad.addColorStop(1, 'rgba(153, 246, 228, 0.85)');
      ctx.fillStyle = spillGrad;
      ctx.fillRect(gateX + 2, spillTop, gateW - 4, 32);

      // Heavy Stone Culvert Base Threshold
      ctx.fillStyle = isLight ? '#94a3b8' : '#081216';
      ctx.fillRect(gateX - 4, gateTop + gateH - 6, gateW + 8, 10);
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(gateX - 4, gateTop + gateH - 6, gateW + 8, 2);

      // Lantern static metal brackets and cages
      const lanterns = [
        { x: bastionLeft - 4, y: Math.max(42, embTopY + 10) },
        { x: bastionLeft - 4, y: Math.min(h - 55, gateTop + 45) }
      ];
      for (let li = 0; li < lanterns.length; li++) {
        const lt = lanterns[li];
        ctx.fillStyle = isLight ? '#64748b' : '#1e293b';
        ctx.fillRect(lt.x - 14, lt.y - 3, 14, 6);
        ctx.fillRect(lt.x - 3, lt.y - 14, 4, 14);

        ctx.fillStyle = isLight ? '#cbd5e1' : '#081216';
        ctx.beginPath();
        ctx.roundRect(lt.x - 10, lt.y - 24, 18, 18, 3);
        ctx.fill();
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // ── 5. FORTIFIED DWARVEN ARTILLERY QUAY & CASEMATE BULWARK (Right Defensive Edge) ──
      const rows = this.grid.rows;
      const wallX = this.grid.startX;
      const qX = wallX - 60;

      // Semi-translucent basalt quay overlay so underlying ashlar masonry remains visible
      const quayGrad = ctx.createLinearGradient(qX, 0, wallX, 0);
      if (isLight) {
        quayGrad.addColorStop(0, 'rgba(226, 232, 240, 0.82)');
        quayGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.88)');
        quayGrad.addColorStop(1, 'rgba(148, 163, 184, 0.92)');
      } else {
        quayGrad.addColorStop(0, 'rgba(9, 21, 26, 0.78)');
        quayGrad.addColorStop(0.5, 'rgba(16, 34, 41, 0.85)');
        quayGrad.addColorStop(1, 'rgba(7, 16, 20, 0.92)');
      }
      ctx.fillStyle = quayGrad;
      ctx.fillRect(qX, 0, 60, h);

      // Stepped inner parapet molding & bronze trim along quay left edge (wallX - 60)
      ctx.fillStyle = isLight ? '#64748b' : '#050c0f';
      ctx.fillRect(qX - 2, 0, 4, h);
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(qX + 1, 0, 1.5, h);

      // Dressed stone block courses & vertical joints specifically across the 60px defensive quay
      const qCourseH = 28;
      for (let qy = 0, qi = 0; qy < h; qy += qCourseH, qi++) {
        ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(2, 6, 8, 0.72)';
        ctx.fillRect(qX + 2, qy, 46, 2);
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(45, 212, 191, 0.08)';
        ctx.fillRect(qX + 2, qy + 2, 46, 1);

        const vJointX = qX + 18 + ((qi % 2) * 16);
        ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(2, 6, 8, 0.65)';
        ctx.fillRect(vJointX, qy, 2, qCourseH);
      }

      // Recessed Octagonal Gun-Bay Casemate Alcoves for each lane's defender launcher
      const casemateRunes = ['ᚲ', 'ᚨ', 'ᚾ', 'ᚨ', 'ᛚ'];
      for (let r = 0; r < rows; r++) {
        const by = (r + 0.5) * this.grid.cellHeight;
        const bayH = Math.min(64, this.grid.cellHeight * 0.68);
        const bayTop = by - bayH / 2;
        const bayLeft = wallX - 48;
        const bayW = 36;

        // Deep recessed basalt casemate bay
        ctx.fillStyle = isLight ? '#cbd5e1' : '#040a0e';
        ctx.beginPath();
        ctx.moveTo(bayLeft + 6, bayTop);
        ctx.lineTo(bayLeft + bayW, bayTop);
        ctx.lineTo(bayLeft + bayW, bayTop + bayH);
        ctx.lineTo(bayLeft + 6, bayTop + bayH);
        ctx.lineTo(bayLeft, bayTop + bayH - 6);
        ctx.lineTo(bayLeft, bayTop + 6);
        ctx.closePath();
        ctx.fill();

        // Inner hydraulic reservoir glow inside casemate
        const bayGlow = ctx.createRadialGradient(wallX - 28, by, 3, wallX - 28, by, 26);
        bayGlow.addColorStop(0, 'rgba(20, 184, 166, 0.28)');
        bayGlow.addColorStop(0.6, 'rgba(13, 148, 136, 0.10)');
        bayGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bayGlow;
        ctx.fill();

        // Beveled bronze casemate frame & corner gussets
        ctx.strokeStyle = isLight ? '#0d9488' : '#0f766e';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Top & bottom bronze anchor plates with gold rivets
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bayLeft + 8, bayTop - 2, bayW - 10, 4);
        ctx.fillRect(bayLeft + 8, bayTop + bayH - 2, bayW - 10, 4);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bayLeft + 11, bayTop - 1, 3, 2);
        ctx.fillRect(bayLeft + bayW - 7, bayTop - 1, 3, 2);
        ctx.fillRect(bayLeft + 11, bayTop + bayH - 1, 3, 2);
        ctx.fillRect(bayLeft + bayW - 7, bayTop + bayH - 1, 3, 2);
      }

      // Fortified Stone Buttress Piers & Runic Partition Corbels between lanes
      for (let r = 0; r <= rows; r++) {
        const ly = r * this.grid.cellHeight;
        // Heavy stone divider pier
        const pierGrad = ctx.createLinearGradient(qX, ly - 8, wallX, ly + 8);
        if (isLight) {
          pierGrad.addColorStop(0, '#94a3b8');
          pierGrad.addColorStop(0.5, '#cbd5e1');
          pierGrad.addColorStop(1, '#64748b');
        } else {
          pierGrad.addColorStop(0, '#071116');
          pierGrad.addColorStop(0.5, '#132830');
          pierGrad.addColorStop(1, '#050c10');
        }
        ctx.fillStyle = pierGrad;
        ctx.beginPath();
        ctx.moveTo(qX - 3, ly - 7);
        ctx.lineTo(wallX, ly - 5);
        ctx.lineTo(wallX, ly + 5);
        ctx.lineTo(qX - 3, ly + 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Bronze-capped bastion buttress nose protruding into the canal edge
        ctx.fillStyle = '#b45309';
        ctx.fillRect(wallX - 16, ly - 4, 16, 8);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(wallX - 16, ly - 4, 16, 8);

        // Glowing teal ward-gem set into each lane divider pier
        ctx.fillStyle = '#2dd4bf';
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(wallX - 24, ly, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (r < rows) {
          // Carved dwarven ward rune on the upper casemate lintel
          ctx.fillStyle = 'rgba(45, 212, 191, 0.65)';
          ctx.font = 'bold 9px serif';
          ctx.textAlign = 'center';
          ctx.fillText(casemateRunes[r % casemateRunes.length], wallX - 38, ly + 13);
        }
      }

      // Twin Hydraulic Pressure Manifold & Runic Aquamarine Conduit behind stations
      const pipeX = wallX - 53;
      // Secondary runic water-pressure tube
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(pipeX - 6, 0, 3, h);
      ctx.fillStyle = 'rgba(45, 212, 191, 0.7)';
      ctx.fillRect(pipeX - 5.5, 0, 1.8, h);

      // Primary heavy copper/bronze hydraulic manifold
      ctx.fillStyle = '#451a03';
      ctx.fillRect(pipeX - 2, 0, 6, h);
      const pipeG = ctx.createLinearGradient(pipeX - 2, 0, pipeX + 4, 0);
      pipeG.addColorStop(0, '#92400e');
      pipeG.addColorStop(0.45, '#f59e0b');
      pipeG.addColorStop(0.8, '#b45309');
      pipeG.addColorStop(1, '#451a03');
      ctx.fillStyle = pipeG;
      ctx.fillRect(pipeX - 1.5, 0, 5, h);

      for (let r = 0; r < rows; r++) {
        const by = (r + 0.5) * this.grid.cellHeight;
        // Heavy iron pipe clamps
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(pipeX - 8, by - 26, 14, 4);
        ctx.fillRect(pipeX - 8, by + 22, 14, 4);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(pipeX - 8, by - 26, 14, 4);
        ctx.strokeRect(pipeX - 8, by + 22, 14, 4);

        // Twin branch feed pipes into the turret mount
        ctx.fillStyle = pipeG;
        ctx.fillRect(pipeX + 3, by - 8, 12, 4);
        ctx.fillRect(pipeX + 3, by + 4, 12, 4);
        // Brass junction valve box
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pipeX - 3, by - 10, 7, 20);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(pipeX - 3, by - 10, 7, 20);
      }

      // ── 6. HEAVY DWARVEN BRONZE BORDER BEAM & CRENELLATED CANAL COPING (wallX - 12 to wallX) ──
      ctx.fillStyle = isLight ? '#0d9488' : '#061014';
      ctx.fillRect(wallX - 12, 0, 12, h);
      const beamG = ctx.createLinearGradient(wallX - 12, 0, wallX, 0);
      if (isLight) {
        beamG.addColorStop(0, '#0f766e');
        beamG.addColorStop(0.35, '#2dd4bf');
        beamG.addColorStop(0.7, '#0d9488');
        beamG.addColorStop(1, '#115e59');
      } else {
        beamG.addColorStop(0, '#071318');
        beamG.addColorStop(0.35, '#14b8a6');
        beamG.addColorStop(0.7, '#0f766e');
        beamG.addColorStop(1, '#040b0e');
      }
      ctx.fillStyle = beamG;
      ctx.fillRect(wallX - 11, 0, 11, h);

      // Bronze battlement merlon plates flanking each launcher port along the border beam
      for (let r = 0; r < rows; r++) {
        const by = (r + 0.5) * this.grid.cellHeight;
        const merlonPositions = [by - 28, by + 16];
        for (const my of merlonPositions) {
          ctx.fillStyle = isLight ? '#cbd5e1' : '#0c1c24';
          ctx.fillRect(wallX - 13, my, 13, 12);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(wallX - 13, my, 13, 12);
        }
      }

      // Glowing water-ward teal rivets along the front defensive border beam
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 5;
      for (let ri = 0; ri < Math.floor(h / 24); ri++) {
        ctx.beginPath();
        ctx.arc(wallX - 5.5, 12 + ri * 24, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      ctx.restore();
    } else if (this.isDwarvenForgeCity()) {
      ctx.save();
      // Warm amber forge-glow seeping through the stone
      const forgeSeep = ctx.createLinearGradient(wallW - 10, 0, 0, 0);
      forgeSeep.addColorStop(0, 'rgba(200,120,20,0.22)');
      forgeSeep.addColorStop(0.4, 'rgba(160,90,10,0.10)');
      forgeSeep.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = forgeSeep;
      ctx.fillRect(0, 0, wallW, height);

      // Dwarven iron-riveted border beam
      ctx.fillStyle = isLight ? '#92400e' : '#2a2218';
      ctx.fillRect(wallW - 10, 0, 10, height);
      ctx.fillStyle = '#c8a050';
      ctx.shadowColor = '#ffa000';
      ctx.shadowBlur = 4;
      for (let ri = 0; ri < Math.floor(height / 28); ri++) {
        ctx.beginPath();
        ctx.arc(wallW - 5, 14 + ri * 28, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Torch brackets
      const torchX = wallW - 30;
      const torchPositions = [50, height * 0.28, height * 0.54, height * 0.80];
      for (let ti = 0; ti < torchPositions.length; ti++) {
        const ty = torchPositions[ti];
        ctx.fillStyle = isLight ? '#78350f' : '#3a3028';
        ctx.fillRect(torchX - 30, ty - 4, 30, 8);
        ctx.fillRect(torchX - 5, ty - 16, 6, 16);
      }

      // Portcullis gate surround
      const gateTop = height * 0.30;
      const gateH   = height * 0.40;
      const gateX   = 150;
      const gateW2  = 80;
      ctx.fillStyle = isLight ? '#cbd5e1' : '#1e1812';
      ctx.beginPath();
      ctx.moveTo(gateX, gateTop + 28);
      ctx.arc(gateX + gateW2 / 2, gateTop + 28, gateW2 / 2, Math.PI, 0);
      ctx.lineTo(gateX + gateW2, gateTop + gateH);
      ctx.lineTo(gateX, gateTop + gateH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = isLight ? '#d97706' : '#4a3c24';
      ctx.beginPath();
      ctx.moveTo(gateX + gateW2 / 2 - 10, gateTop);
      ctx.lineTo(gateX + gateW2 / 2 + 10, gateTop);
      ctx.lineTo(gateX + gateW2 / 2 + 6, gateTop + 22);
      ctx.lineTo(gateX + gateW2 / 2 - 6, gateTop + 22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isLight ? '#78350f' : '#2e2820';
      ctx.lineWidth = 5;
      ctx.lineCap = 'square';
      for (let bar = 0; bar < 4; bar++) {
        const bx = gateX + 10 + bar * 20;
        ctx.beginPath();
        ctx.moveTo(bx, gateTop + 28);
        ctx.lineTo(bx, gateTop + gateH);
        ctx.stroke();
      }
      ctx.lineWidth = 3;
      for (let rail = 0; rail < 3; rail++) {
        const ry2 = gateTop + 50 + rail * (gateH * 0.28);
        ctx.beginPath();
        ctx.moveTo(gateX + 4, ry2);
        ctx.lineTo(gateX + gateW2 - 4, ry2);
        ctx.stroke();
      }

      // Stone battlement wall & crenellations
      const wallX = this.grid.startX;
      ctx.fillStyle = isLight ? '#e2e8f0' : '#1e241c';
      ctx.beginPath();
      ctx.moveTo(wallX - 60, 0); ctx.lineTo(wallX, 0); 
      ctx.lineTo(wallX, height); ctx.lineTo(wallX - 60, height); 
      ctx.fill();
      const railGrad = ctx.createLinearGradient(wallX - 60, 0, wallX, 0);
      if (isLight) {
        railGrad.addColorStop(0, '#e2e8f0');
        railGrad.addColorStop(0.5, '#cbd5e1');
        railGrad.addColorStop(1, '#94a3b8');
      } else {
        railGrad.addColorStop(0, '#3a4a35');
        railGrad.addColorStop(0.5, '#6a7860');
        railGrad.addColorStop(1, '#2a3525');
      }
      ctx.fillStyle = railGrad;
      ctx.fillRect(wallX - 60, 0, 60, height);
      for (let y = 0; y < height; y += 45) {
        ctx.fillStyle = isLight ? '#94a3b8' : '#1e241c';
        ctx.fillRect(wallX - 40, y, 40, 20);
        ctx.fillStyle = isLight ? '#cbd5e1' : '#4a5545';
        ctx.fillRect(wallX - 43, y, 43, 6);
      }

      ctx.restore();
    } else if (this.realm === 'jotunheim') {
      ctx.save();
      const frostGrad = ctx.createLinearGradient(0, 0, wallW, 0);
      frostGrad.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
      frostGrad.addColorStop(1, 'rgba(129, 212, 250, 0.40)');
      ctx.fillStyle = frostGrad;
      ctx.fillRect(0, 0, wallW, height);

      ctx.fillStyle = isLight ? 'rgba(186, 230, 253, 0.85)' : 'rgba(224, 247, 250, 0.90)';
      ctx.shadowColor = isLight ? 'rgba(2, 132, 199, 0.4)' : '#00e5ff';
      ctx.shadowBlur = 10;
      const icicleCount = Math.max(3, Math.floor((wallW - 30) / 20));
      for (let i = 0; i < icicleCount; i++) {
        const ix = 15 + i * 20;
        const iLen = 22 + (i % 5) * 14;
        ctx.beginPath();
        ctx.moveTo(ix - 7, 0);
        ctx.lineTo(ix + 7, 0);
        ctx.lineTo(ix, iLen);
        ctx.closePath();
        ctx.fill();
        if (isLight) {
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const jRunes = ['ᛃ', 'ᛟ', 'ᛏ', 'ᚢ', 'ᚾ', 'ᚺ', 'ᛖ'];
      ctx.font = 'bold 20px serif';
      ctx.fillStyle = isLight ? '#0284c7' : '#e0f7fa';
      ctx.shadowColor = isLight ? 'rgba(2, 132, 199, 0.35)' : '#00e5ff';
      ctx.shadowBlur = 14;
      for (let i = 0; i < jRunes.length; i++) {
        ctx.fillText(jRunes[i], wallW - 28, 60 + i * 65);
      }
      ctx.restore();
    } else if (this.realm === 'asgard') {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
      ctx.fillRect(0, 0, wallW, height);
      const aRunes = ['ᚨ', 'ᛊ', 'ᚷ', 'ᚨ', 'ᚱ', 'ᛞ'];
      ctx.font = 'bold 20px serif';
      ctx.fillStyle = isLight ? '#b45309' : '#fff9c4';
      ctx.shadowColor = isLight ? 'rgba(217, 119, 6, 0.4)' : '#ffd54f';
      ctx.shadowBlur = 14;
      for (let i = 0; i < aRunes.length; i++) {
        ctx.fillText(aRunes[i], wallW - 28, 70 + i * 70);
      }
    }

    if (this.realm !== 'svartalfheim') {
      // Outer Fortress Border Beam - Realm-Adaptive with Frost / Element Accents
      const beamColor =
        this.realm === 'jotunheim' || this.realm === 'niflheim' ? '#38bdf8' :
        this.realm === 'helheim' || this.realm === 'muspelheim' ? '#ef4444' :
        this.realm === 'vanaheim' || this.realm === 'midgard' ? '#4ade80' :
        '#38bdf8'; // Asgard / Celestial Frost

      const beamHighlight =
        this.realm === 'jotunheim' || this.realm === 'niflheim' ? '#bae6fd' :
        this.realm === 'helheim' || this.realm === 'muspelheim' ? '#fecaca' :
        this.realm === 'vanaheim' || this.realm === 'midgard' ? '#bbf7d0' :
        '#bae6fd';

      ctx.fillStyle = beamColor; 
      ctx.fillRect(wallW - 8, 0, 8, height);
      ctx.fillStyle = beamHighlight;
      ctx.fillRect(wallW - 3, 0, 3, height);

      // Watchtower Window / Arched Stone Embrasure
      const winW = Math.min(130, Math.max(80, wallW - 40));
      const winX = (wallW - 8 - winW) / 2;
      const winArchR = winW / 2;

      // Outer stone arch framing
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(winX, 30 + winArchR);
      ctx.arc(winX + winArchR, 30 + winArchR, winArchR, Math.PI, 0);
      ctx.lineTo(winX + winW, 220);
      ctx.lineTo(winX, 220);
      ctx.closePath();

      const frameGrad = ctx.createLinearGradient(winX, 30, winX + winW, 220);
      if (isLight) {
        frameGrad.addColorStop(0, '#f8fafc');
        frameGrad.addColorStop(0.5, '#e2e8f0');
        frameGrad.addColorStop(1, '#cbd5e1');
      } else {
        frameGrad.addColorStop(0, '#1c2529');
        frameGrad.addColorStop(1, '#0e171b');
      }
      ctx.fillStyle = frameGrad;
      ctx.fill();
      ctx.strokeStyle = isLight ? '#94a3b8' : '#0a1014';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Window Sill
      ctx.fillStyle = isLight ? '#cbd5e1' : '#142026';
      ctx.fillRect(winX - 4, 218, winW + 8, 6);
      ctx.strokeStyle = isLight ? '#94a3b8' : '#0a1014';
      ctx.lineWidth = 1;
      ctx.strokeRect(winX - 4, 218, winW + 8, 6);

      // Inner illuminated warm chamber
      const innerW = winW - 24;
      const innerX = winX + 12;
      const innerArchR = innerW / 2;
      ctx.beginPath();
      ctx.moveTo(innerX, 45 + innerArchR);
      ctx.arc(innerX + innerArchR, 45 + innerArchR, innerArchR, Math.PI, 0);
      ctx.lineTo(innerX + innerW, 205);
      ctx.lineTo(innerX, 205);
      ctx.closePath();

      const innerGrad = ctx.createLinearGradient(innerX, 45, innerX, 205);
      if (isLight) {
        innerGrad.addColorStop(0, '#fffbeb');
        innerGrad.addColorStop(0.35, '#fef3c7');
        innerGrad.addColorStop(1, '#fde68a');
      } else {
        innerGrad.addColorStop(0, '#ffcc80');
        innerGrad.addColorStop(0.5, '#ffb74d');
        innerGrad.addColorStop(1, '#f57c00');
      }
      ctx.fillStyle = innerGrad;
      ctx.shadowBlur = isLight ? 12 : 24;
      ctx.shadowColor = isLight ? 'rgba(245, 158, 11, 0.45)' : '#ffb74d';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isLight ? '#f59e0b' : '#b45309';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Thor
      ctx.save();
      ctx.translate(winX - 15, 0); 
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.ellipse(70, 160, 25, 8, 0, 0, Math.PI*2); ctx.fill();

      const capeGrad = ctx.createLinearGradient(50, 110, 100, 170);
      capeGrad.addColorStop(0, '#b71c1c');
      capeGrad.addColorStop(1, '#7f0000');
      ctx.fillStyle = capeGrad;
      ctx.beginPath();
      ctx.moveTo(55, 110);
      ctx.quadraticCurveTo(40, 140, 45, 170);
      ctx.lineTo(105, 170);
      ctx.quadraticCurveTo(90, 140, 85, 110);
      ctx.fill();

      const armorGrad = ctx.createLinearGradient(60, 110, 90, 150);
      armorGrad.addColorStop(0, '#cfd8dc');
      armorGrad.addColorStop(1, '#78909c');
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      ctx.moveTo(60, 110);
      ctx.lineTo(90, 110);
      ctx.lineTo(85, 150);
      ctx.lineTo(65, 150);
      ctx.fill();
      
      ctx.fillStyle = '#81d4fa';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#81d4fa';
      ctx.beginPath(); ctx.arc(70, 120, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(80, 120, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(70, 135, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(80, 135, 4, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffccbc';
      ctx.beginPath(); ctx.arc(75, 95, 14, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#e0f7fa';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00bcd4';
      ctx.beginPath(); ctx.arc(82, 92, 3, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fbc02d';
      ctx.beginPath(); ctx.arc(75, 95, 15, Math.PI, -0.2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(60, 95); ctx.quadraticCurveTo(55, 110, 65, 120); ctx.quadraticCurveTo(70, 105, 75, 95); ctx.fill();

      ctx.strokeStyle = '#ffccbc';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(75, 115); ctx.lineTo(95, 120); ctx.lineTo(100, 130); ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#42a5f5'; 
      ctx.beginPath();
      ctx.moveTo(90, 125); ctx.lineTo(110, 120); ctx.lineTo(115, 140); ctx.lineTo(95, 145); ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(35, 125, 20, 14);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(42, 110, 6, 20);
      ctx.strokeStyle = '#81d4fa';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#81d4fa';
      ctx.strokeRect(35, 125, 20, 14);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Atreus
      ctx.save();
      ctx.translate(winX - 15, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(45, 160, 15, 5, 0, 0, Math.PI*2); ctx.fill();

      const tunicGrad = ctx.createLinearGradient(40, 120, 50, 150);
      tunicGrad.addColorStop(0, '#8d6e63');
      tunicGrad.addColorStop(1, '#5d4037');
      ctx.fillStyle = tunicGrad;
      ctx.beginPath();
      ctx.moveTo(35, 120); ctx.lineTo(55, 120); ctx.lineTo(50, 160); ctx.lineTo(40, 160); ctx.fill();

      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(35, 120); ctx.lineTo(50, 140); ctx.stroke();

      ctx.fillStyle = '#ffccbc';
      ctx.beginPath(); ctx.arc(45, 108, 10, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#4e342e';
      ctx.beginPath(); ctx.arc(45, 105, 10, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(35, 105); ctx.lineTo(40, 112); ctx.lineTo(45, 105); ctx.fill();

      ctx.strokeStyle = '#d32f2f';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(42, 105); ctx.lineTo(48, 115); ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(49, 108, 1.5, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = '#a1887f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(25, 110); ctx.quadraticCurveTo(15, 130, 25, 160); ctx.stroke();
      
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(25, 110); ctx.lineTo(25, 160); ctx.stroke();

      ctx.strokeStyle = '#ffccbc';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(45, 125); ctx.lineTo(30, 135); ctx.stroke();
      ctx.restore();

      // Odin's command balcony / Grand Battlements
      const balW = Math.min(145, Math.max(90, wallW - 24));
      const balX = (wallW - 8 - balW) / 2;

      ctx.save();
      // Stone Balcony Body
      const balGrad = ctx.createLinearGradient(balX, 250, balX + balW, 450);
      if (isLight) {
        balGrad.addColorStop(0, '#ffffff');
        balGrad.addColorStop(0.35, '#f1f5f9');
        balGrad.addColorStop(0.75, '#e2e8f0');
        balGrad.addColorStop(1, '#cbd5e1');
      } else {
        balGrad.addColorStop(0, '#263238');
        balGrad.addColorStop(0.5, '#1e293b');
        balGrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = balGrad;
      ctx.beginPath();
      ctx.moveTo(balX, 250); 
      ctx.lineTo(balX + balW, 250); 
      ctx.lineTo(balX + balW - 12, 450); 
      ctx.lineTo(balX + 12, 450); 
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isLight ? '#94a3b8' : '#0a1014';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stone corbels supporting balcony
      for (let ci = 0; ci < 4; ci++) {
        const cx = balX + 18 + ci * ((balW - 36) / 3);
        ctx.fillStyle = isLight ? '#cbd5e1' : '#142026';
        ctx.beginPath();
        ctx.moveTo(cx - 5, 450);
        ctx.lineTo(cx + 5, 450);
        ctx.lineTo(cx, 465);
        ctx.closePath();
        ctx.fill();
      }

      // Ornate Gold / Bronze Balustrade Railing
      const railGrad = ctx.createLinearGradient(balX, 245, balX + balW, 253);
      railGrad.addColorStop(0, '#d97706');
      railGrad.addColorStop(0.5, '#f59e0b');
      railGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = railGrad;
      ctx.beginPath();
      ctx.roundRect(balX - 3, 245, balW + 6, 8, 2);
      ctx.fill();
      ctx.strokeStyle = isLight ? '#92400e' : '#ffd54f';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Balustrade decorative slots
      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      for (let bi = 1; bi < 6; bi++) {
        const bx = balX + bi * (balW / 6);
        ctx.beginPath();
        ctx.moveTo(bx, 257);
        ctx.lineTo(bx, 280);
        ctx.stroke();
      }
      ctx.restore();

      // Odin body
      ctx.save();
      const odinShift = (balX + balW / 2) - 245;
      ctx.translate(odinShift, 0);

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.ellipse(245, 410, 30, 10, 0, 0, Math.PI*2); ctx.fill();
      
      const odinCape = ctx.createLinearGradient(200, 300, 250, 420);
      odinCape.addColorStop(0, '#b71c1c');
      odinCape.addColorStop(1, '#4a148c'); 
      ctx.fillStyle = odinCape;
      ctx.beginPath();
      ctx.moveTo(245, 290); ctx.quadraticCurveTo(195, 350, 205, 420); ctx.lineTo(270, 420); ctx.fill();

      const odinArmor = ctx.createLinearGradient(220, 300, 260, 380);
      odinArmor.addColorStop(0, '#ffe082');
      odinArmor.addColorStop(0.5, '#ffca28');
      odinArmor.addColorStop(1, '#ff8f00');
      ctx.fillStyle = odinArmor;
      ctx.beginPath();
      ctx.moveTo(225, 290); ctx.lineTo(265, 290); ctx.lineTo(270, 340); ctx.lineTo(245, 390); ctx.lineTo(220, 340); ctx.fill();
      
      ctx.fillStyle = '#fff9c4';
      ctx.font = '16px serif';
      ctx.fillText('ᛟ', 238, 330);

      ctx.fillStyle = '#ffccbc'; 
      ctx.beginPath(); ctx.arc(245, 275, 16, 0, Math.PI * 2); ctx.fill();
      
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.moveTo(230, 275); ctx.quadraticCurveTo(220, 320, 245, 340); ctx.quadraticCurveTo(270, 320, 260, 275); ctx.fill();
      
      ctx.strokeStyle = '#ffca28'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(230, 270); ctx.lineTo(260, 265); ctx.stroke();
      ctx.fillStyle = '#212121';
      ctx.beginPath(); ctx.arc(240, 268, 5, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = odinArmor;
      ctx.beginPath(); ctx.arc(245, 270, 17, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ffffff'; 
      ctx.shadowBlur = 5; ctx.shadowColor = '#fff';
      ctx.beginPath(); ctx.moveTo(228, 265); ctx.quadraticCurveTo(205, 240, 210, 210); ctx.quadraticCurveTo(224, 230, 235, 255); ctx.fill();
      ctx.beginPath(); ctx.moveTo(262, 265); ctx.quadraticCurveTo(285, 240, 280, 210); ctx.quadraticCurveTo(266, 230, 255, 255); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.restore();

    this.cachedCastleCanvas = offscreen;
    this.cachedCastleDpr = dpr;
    this.cachedCastleRealm = this.realm;
    this.cachedCastleCity = this.city;
    this.cachedCastleWidth = wallW;
    this.cachedCastleHeight = height;
    this.cachedCastleTheme = isLight ? 'light' : 'dark';
  }

  drawCastle() {
    const ctx = this.ctx;
    ctx.save();
    
    const wallW = this.grid.startX;
    const dpr = window.devicePixelRatio || 1;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';
    const currentTheme = isLight ? 'light' : 'dark';

    // Fast-path: draw cached static masonry and fortification architecture
    if (
      !this.cachedCastleCanvas ||
      this.cachedCastleTheme !== currentTheme ||
      this.cachedCastleDpr !== dpr ||
      this.cachedCastleRealm !== this.realm ||
      this.cachedCastleCity !== this.city ||
      this.cachedCastleWidth !== wallW ||
      this.cachedCastleHeight !== this.height
    ) {
      this.buildCastleCache(dpr, wallW, this.height);
    }

    if (this.cachedCastleCanvas) {
      ctx.drawImage(this.cachedCastleCanvas, 0, 0, wallW, this.height);
    }

    // ── DYNAMIC ANIMATED OVERLAYS & CONTROLS ──
    const time = Date.now() / 1000;
    const h = this.height;

    if (this.isDwarvenWaterwayCity()) {
      ctx.save();
      const bastionLeft = Math.max(76, Math.round(wallW * 0.28));
      const bastionRight = wallW - 58;
      const bastionW = Math.max(56, bastionRight - bastionLeft);
      const bastionCenterX = Math.round((bastionLeft + bastionRight) / 2);
      const wingW = bastionLeft - 8;
      const wingCenterX = Math.round(wingW / 2) + 2;
      const balconyFloorY = Math.round(h * 0.28);
      const embTopY = Math.max(38, balconyFloorY - 85);
      const gateTop = Math.round(balconyFloorY + 34);
      const gateH = Math.max(120, h - gateTop - 28);
      const gateW = Math.min(84, bastionW + 4);
      const gateX = bastionCenterX - gateW / 2;
      const spillTop = gateTop + gateH - 32;

      // 1. Dynamic Hydro-Boiler Furnace Ember Pulse & Sparks (Left Wing)
      const boilerBotY = balconyFloorY + 18;
      const boilerFlicker = 0.75 + Math.sin(time * 7.2) * 0.25;
      const emberHalo = ctx.createRadialGradient(wingCenterX, boilerBotY - 12, 2, wingCenterX, boilerBotY - 14, 24 * boilerFlicker);
      emberHalo.addColorStop(0, `rgba(254, 240, 138, ${0.55 * boilerFlicker})`);
      emberHalo.addColorStop(0.5, `rgba(249, 115, 22, ${0.28 * boilerFlicker})`);
      emberHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = emberHalo;
      ctx.beginPath();
      ctx.arc(wingCenterX, boilerBotY - 12, 24 * boilerFlicker, 0, Math.PI * 2);
      ctx.fill();

      // 2. Interlocking Rotating Bronze Cogwheels inside Floodgate Winch Bay (Left Wing)
      const winchTopY = gateTop + 8;
      const gears = [
        { x: wingCenterX + 4, y: winchTopY + 28, r: 11, teeth: 8, speed: 1.1, color: '#d97706' },
        { x: wingCenterX - 6, y: winchTopY + 46, r: 8.5, teeth: 6, speed: -1.45, color: '#b45309' }
      ];
      for (const g of gears) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(time * g.speed);
        ctx.fillStyle = g.color;
        for (let ti = 0; ti < g.teeth; ti++) {
          const ta = (ti * Math.PI * 2) / g.teeth;
          ctx.save();
          ctx.rotate(ta);
          ctx.fillRect(g.r - 1.5, -2, 3.5, 4);
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, g.r, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
        ctx.fillStyle = '#2dd4bf';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Churning water ripple lines & foam at Sluice Spillway
      ctx.strokeStyle = 'rgba(240, 253, 250, 0.85)';
      ctx.lineWidth = 1.4;
      for (let wLine = 0; wLine < 3; wLine++) {
        const wY = spillTop + 8 + wLine * 8;
        const wPhase = time * 4.5 + wLine * 1.8;
        ctx.beginPath();
        ctx.moveTo(gateX + 4, wY);
        for (let wx = gateX + 4; wx <= gateX + gateW - 4; wx += 6) {
          ctx.lineTo(wx, wY + Math.sin(wx * 0.2 + wPhase) * 2.2);
        }
        ctx.stroke();
      }

      // 4. Water-ward wall lanterns (dynamic flicker and light halo)
      const lanterns = [
        { x: bastionLeft - 4, y: Math.max(42, embTopY + 10) },
        { x: bastionLeft - 4, y: Math.min(h - 55, gateTop + 45) }
      ];
      for (let li = 0; li < lanterns.length; li++) {
        const lt = lanterns[li];
        const lFlicker = Math.sin(time * 6.8 + li * 2.5) * 0.2 + 0.8;

        const haloGrad = ctx.createRadialGradient(lt.x - 1, lt.y - 15, 1, lt.x - 1, lt.y - 15, 34 * lFlicker);
        haloGrad.addColorStop(0, `rgba(45, 212, 191, ${0.42 * lFlicker})`);
        haloGrad.addColorStop(0.5, `rgba(13, 148, 136, ${0.15 * lFlicker})`);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(lt.x - 1, lt.y - 15, 34 * lFlicker, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(204, 251, 241, ${0.9 * lFlicker})`;
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 10 * lFlicker;
        ctx.beginPath();
        ctx.arc(lt.x - 1, lt.y - 15, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Carved Canal Water Runes Glow
      const aRunes = ['ᚨ', 'ᛚ', 'ᛏ', '·', 'ᚲ', 'ᚨ', 'ᚾ', 'ᚨ', 'ᛚ'];
      ctx.font = 'bold 13px serif';
      ctx.textAlign = 'center';
      const runeGlow = 0.55 + Math.sin(time * 1.8) * 0.25;
      ctx.fillStyle = `rgba(45, 212, 191, ${runeGlow})`;
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 8;
      const runeYStart = gateTop + 30;
      const runeSpacing = Math.min(26, (gateH - 60) / aRunes.length);
      const runeX = bastionLeft + 10;
      for (let ri = 0; ri < aRunes.length; ri++) {
        ctx.fillText(aRunes[ri], runeX, runeYStart + ri * runeSpacing);
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // Hydraulic Defensive Canal Ram Launchers (Lane Defenses)
      const rows = this.grid.rows;
      const wallX = this.grid.startX;
      let hoveredLauncherRow: number | null = null;
      if (this.mouseX >= wallX - 65 && this.mouseX <= wallX + 35 && this.mouseY >= 0 && this.mouseY < h) {
        hoveredLauncherRow = Math.floor(this.mouseY / this.grid.cellHeight);
        if (hoveredLauncherRow < 0 || hoveredLauncherRow >= rows) hoveredLauncherRow = null;
      }

      for (let r = 0; r < rows; r++) {
        const by = (r + 0.5) * this.grid.cellHeight;
        const isReady = this.valkyrieAvailable[r];
        const isHovered = hoveredLauncherRow === r;

        // Base Turret Sponson Plate & Toothed Bronze Gear Ring
        ctx.fillStyle = isLight ? '#f1f5f9' : '#081319';
        ctx.beginPath();
        ctx.ellipse(wallX - 30, by, 23, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isReady ? '#0f766e' : (isLight ? '#94a3b8' : '#1e293b');
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Radial bronze gear teeth around turret ring
        ctx.save();
        ctx.translate(wallX - 30, by);
        ctx.fillStyle = isReady ? '#b45309' : (isLight ? '#94a3b8' : '#334155');
        for (let gt = 0; gt < 8; gt++) {
          const ga = (gt * Math.PI) / 4;
          const gx = Math.cos(ga) * 19;
          const gy = Math.sin(ga) * 13.5;
          ctx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
        }
        ctx.restore();

        ctx.strokeStyle = isReady ? '#d97706' : (isLight ? '#cbd5e1' : '#475569');
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(wallX - 30, by, 18, 12.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing runic embrasure chevron on the canal border beam
        ctx.save();
        ctx.translate(wallX - 15, by);
        ctx.fillStyle = isReady ? 'rgba(45, 212, 191, 0.85)' : (isLight ? 'rgba(148, 163, 184, 0.4)' : 'rgba(71, 85, 105, 0.3)');
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(9, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(3.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(wallX - 28, by);

        const trackAngle = isReady ? Math.sin(time * 0.9 + r * 1.4) * 0.06 : 0;
        ctx.rotate(trackAngle);

        if (isReady) {
          const beamGlow = 0.25 + Math.sin(time * 3.5 + r) * 0.12;
          const sightGrad = ctx.createLinearGradient(16, 0, 78, 0);
          sightGrad.addColorStop(0, `rgba(45, 212, 191, ${beamGlow * 1.5})`);
          sightGrad.addColorStop(0.5, `rgba(14, 165, 233, ${beamGlow})`);
          sightGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.strokeStyle = sightGrad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(16, 0);
          ctx.lineTo(78, 0);
          ctx.stroke();

          // Armored Dwarven Breech Housing
          ctx.fillStyle = isLight ? '#ffffff' : '#11222b';
          ctx.beginPath();
          ctx.roundRect(-17, -12, 23, 24, 4);
          ctx.fill();
          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Flanged Dwarven Gun-Shield Wing Plates
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.moveTo(2, -14);
          ctx.lineTo(10, -11);
          ctx.lineTo(10, 11);
          ctx.lineTo(2, 14);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Spinning Dwarven Pressure Turbine Wheel
          ctx.save();
          ctx.translate(-6, 0);
          ctx.rotate(time * 5.0 + r * 1.5);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
          ctx.stroke();
          for (let vi = 0; vi < 4; vi++) {
            const va = (vi * Math.PI) / 2;
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(Math.cos(va) * 2, Math.sin(va) * 2, 4.2, 1.8);
          }
          ctx.restore();

          // Twin Hydraulic Recoil Cylinders (top & bottom)
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-13, -16, 17, 4.5);
          ctx.fillRect(-13, 11.5, 17, 4.5);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-11, -15, 13, 2.8);
          ctx.fillRect(-11, 12.2, 13, 2.8);

          // Main Burnished Bronze Cannon Barrel
          const barrelGrad = ctx.createLinearGradient(0, -9, 0, 9);
          barrelGrad.addColorStop(0, '#d97706');
          barrelGrad.addColorStop(0.4, '#fbbf24');
          barrelGrad.addColorStop(1, '#78350f');
          ctx.fillStyle = barrelGrad;
          ctx.beginPath();
          ctx.roundRect(0, -8.5, 22, 17, 2);
          ctx.fill();

          // Glowing Runic Aquamarine Pressure Bands on Barrel
          ctx.fillStyle = '#0f766e';
          ctx.fillRect(6, -9.5, 3.5, 19);
          ctx.fillRect(14.5, -9.5, 3.5, 19);
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(7, -8.5, 1.5, 17);
          ctx.fillRect(15.5, -8.5, 1.5, 17);

          // Heavy Muzzle Collar
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.roundRect(20, -10.5, 6, 21, 2);
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Dwarven Runic Harpoon / Canal Ram Prow
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(18, -3, 20, 6);
          const spearHeadX = 38;
          ctx.fillStyle = '#2dd4bf';
          ctx.shadowColor = '#14b8a6';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(spearHeadX, -6.5);
          ctx.lineTo(spearHeadX + 11, 0);
          ctx.lineTo(spearHeadX, 6.5);
          ctx.lineTo(spearHeadX + 3, 0);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(spearHeadX - 4, -8.5);
          ctx.lineTo(spearHeadX + 4, -4);
          ctx.lineTo(spearHeadX - 2, -3);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(spearHeadX - 4, 8.5);
          ctx.lineTo(spearHeadX + 4, 4);
          ctx.lineTo(spearHeadX - 2, 3);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;

          const sFoam = ctx.createRadialGradient(26, 0, 1, 26, 0, 14);
          sFoam.addColorStop(0, 'rgba(240, 253, 250, 0.9)');
          sFoam.addColorStop(0.5, 'rgba(45, 212, 191, 0.6)');
          sFoam.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = sFoam;
          ctx.beginPath();
          ctx.ellipse(26, 0, 8, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          // Steam/Water Pressure Gauge Dial
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(-8, -18, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          const needleAng = Math.PI * 0.75 + Math.sin(time * 6.5 + r * 1.8) * 0.35;
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-8, -18);
          ctx.lineTo(-8 + Math.cos(needleAng) * 3.8, -18 + Math.sin(needleAng) * 3.8);
          ctx.stroke();

          ctx.fillStyle = '#2dd4bf';
          ctx.shadowColor = '#14b8a6';
          ctx.shadowBlur = 6;
          ctx.font = 'bold 9px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ᛏ', -6, 0);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = isLight ? '#f1f5f9' : '#0f172a';
          ctx.beginPath();
          ctx.roundRect(-22, -9, 28, 18, 3);
          ctx.fill();
          ctx.strokeStyle = isLight ? '#cbd5e1' : '#334155';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.fillStyle = isLight ? '#cbd5e1' : '#020608';
          ctx.beginPath();
          ctx.ellipse(6, 0, 4, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isLight ? '#94a3b8' : '#475569';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          for (let di = 0; di < 3; di++) {
            const dPhase = (time * 1.5 + di * 0.4 + r) % 1;
            ctx.fillStyle = `rgba(224, 242, 254, ${(1 - dPhase) * 0.45})`;
            ctx.beginPath();
            ctx.arc(8 + dPhase * 16, (di - 1) * 3 - dPhase * 4, 2 + dPhase * 3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = isLight ? '#f1f5f9' : '#0f172a';
          ctx.beginPath();
          ctx.arc(-14, -14, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isLight ? '#cbd5e1' : '#475569';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-14, -14);
          ctx.lineTo(-14 - 3, -14);
          ctx.stroke();

          ctx.fillStyle = isLight ? '#94a3b8' : '#64748b';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', -8, 0);
        }

        ctx.restore();

        if (isHovered) {
          ctx.strokeStyle = isReady ? '#2dd4bf' : (isLight ? '#64748b' : '#94a3b8');
          ctx.lineWidth = 2;
          ctx.shadowColor = isReady ? '#14b8a6' : (isLight ? 'rgba(0,0,0,0.1)' : '#64748b');
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.ellipse(wallX - 28, by, 26, 20, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      if (hoveredLauncherRow !== null) {
        const hR = hoveredLauncherRow;
        const by = (hR + 0.5) * this.grid.cellHeight;
        const isReady = this.valkyrieAvailable[hR];

        ctx.save();
        const tipX = wallX + 18;
        const tipY = Math.max(20, Math.min(h - 55, by - 22));
        const headerText = isReady ? t('emergency_defense_title_ready') : t('emergency_defense_title_discharged');
        const descText = isReady ? t('emergency_defense_status_armed') : t('emergency_defense_status_spent');

        ctx.font = 'bold 11px sans-serif';
        const headW = ctx.measureText(headerText).width;
        ctx.font = '10px sans-serif';
        const descW = ctx.measureText(descText).width;
        const tipW = Math.max(195, Math.ceil(Math.max(headW, descW) + 20));
        const tipH = 44;

        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(7, 18, 24, 0.95)';
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, tipW, tipH, 6);
        ctx.fill();
        ctx.strokeStyle = isReady ? '#14b8a6' : (isLight ? '#cbd5e1' : '#64748b');
        ctx.lineWidth = 1.5;
        ctx.shadowColor = isReady ? '#2dd4bf' : (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.5)');
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isReady ? (isLight ? '#0f766e' : '#2dd4bf') : (isLight ? '#475569' : '#94a3b8');
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(headerText, tipX + 8, tipY + 7);

        ctx.fillStyle = isReady ? (isLight ? '#134e4a' : '#ccfbf1') : (isLight ? '#334155' : '#cbd5e1');
        ctx.font = '10px sans-serif';
        ctx.fillText(descText, tipX + 8, tipY + 24);

        ctx.restore();
      }
    } else if (this.isDwarvenForgeCity()) {
      ctx.save();
      // Wall torches with animated flicker
      const torchX = wallW - 30;
      const torchPositions = [50, this.height * 0.28, this.height * 0.54, this.height * 0.80];
      for (let ti = 0; ti < torchPositions.length; ti++) {
        const ty = torchPositions[ti];
        const flicker = Math.sin(time * 7.0 + ti * 2.3) * 0.3 + 0.7;
        const flicker2 = Math.sin(time * 11.0 + ti * 1.7) * 0.15 + 0.85;

        const haloGrad = ctx.createRadialGradient(torchX, ty - 20, 0, torchX, ty - 20, 55 * flicker);
        haloGrad.addColorStop(0, `rgba(255,160,30,${0.45 * flicker * flicker2})`);
        haloGrad.addColorStop(0.5, `rgba(200,100,10,${0.18 * flicker})`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(torchX, ty - 20, 55 * flicker, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        ctx.save();
        ctx.translate(torchX, ty - 20);
        const flameGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * flicker);
        flameGrad.addColorStop(0, `rgba(255,240,160,${0.95 * flicker2})`);
        flameGrad.addColorStop(0.4, `rgba(255,140,20,${0.80 * flicker})`);
        flameGrad.addColorStop(1, 'rgba(180,40,0,0)');
        ctx.fillStyle = flameGrad;
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 12 * flicker;
        ctx.beginPath();
        ctx.moveTo(0, -10 * flicker);
        ctx.bezierCurveTo(5 * flicker2, -4, 6, 4, 0, 7);
        ctx.bezierCurveTo(-6, 4, -5 * flicker2, -4, 0, -10 * flicker);
        ctx.fill();
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      // Dwarven stronghold runes carved into the stone, glowing amber/bronze
      const nRunes = this.getDwarvenWallRunes();
      ctx.font = 'bold 18px serif';
      const runeGlow = 0.55 + Math.sin(time * 1.4) * 0.2;
      ctx.fillStyle = isLight ? `rgba(180, 83, 9, ${Math.min(0.95, runeGlow + 0.22)})` : `rgba(220,160,40,${runeGlow})`;
      ctx.shadowColor = isLight ? 'rgba(217, 119, 6, 0.45)' : '#ffaa00';
      ctx.shadowBlur = isLight ? 6 : 10;
      for (let ri = 0; ri < nRunes.length; ri++) {
        ctx.fillText(nRunes[ri], wallW - 85, 55 + ri * 58);
      }
      ctx.shadowBlur = 0;

      // Warm light pulsing from behind gate
      const gateTop = this.height * 0.30;
      const gateH   = this.height * 0.40;
      const gateX   = 150;
      const gateW2  = 80;
      const gateLightGrad = ctx.createRadialGradient(
        gateX + gateW2 / 2, gateTop + gateH * 0.6, 0,
        gateX + gateW2 / 2, gateTop + gateH * 0.6, gateW2 * 0.7
      );
      gateLightGrad.addColorStop(0, `rgba(255,180,40,${0.30 + Math.sin(time * 1.8) * 0.08})`);
      gateLightGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gateLightGrad;
      ctx.beginPath();
      ctx.arc(gateX + gateW2 / 2, gateTop + gateH * 0.6, gateW2 * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Forge smoke wisps rising along the wall top
      ctx.save();
      for (let sp = 0; sp < 5; sp++) {
        const st = ((time * 0.22 + sp * 0.24) % 1);
        const sx = 60 + sp * 58;
        const sy = -st * 50;
        const salpha = (1 - st) * 0.18;
        ctx.beginPath();
        ctx.arc(sx + Math.sin(st * 5 + sp) * 8, sy, 6 + st * 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80,65,45,${salpha})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw 5 ballistae, one for each row
      const wallX = this.grid.startX;
      for (let r = 0; r < 5; r++) {
        const by = (r + 0.5) * this.grid.cellHeight;
        const isReady = this.valkyrieAvailable[r];
        
        ctx.fillStyle = isLight ? (isReady ? '#78350f' : '#94a3b8') : (isReady ? '#2c3528' : '#1a1f18');
        ctx.beginPath(); ctx.ellipse(wallX - 25, by + 15, 20, 10, 0, 0, Math.PI*2); ctx.fill();
        
        ctx.save();
        ctx.translate(wallX - 25, by);
        ctx.rotate(isReady ? Math.sin(time * 0.8 + r) * 0.15 : 0);
        
        ctx.fillStyle = isLight ? '#451a03' : '#151a14';
        ctx.fillRect(-10, -35, 20, 60);
        
        ctx.fillStyle = isLight ? (isReady ? '#d97706' : '#64748b') : (isReady ? '#6a7860' : '#475569');
        ctx.fillRect(-12, -20, 24, 6);
        ctx.fillRect(-12, 5, 24, 6);
        
        ctx.strokeStyle = isLight ? (isReady ? '#92400e' : '#475569') : (isReady ? '#5a6850' : '#334155');
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (isReady) {
          ctx.moveTo(-35, -10);
          ctx.quadraticCurveTo(0, -25, 35, -10);
        } else {
          ctx.moveTo(-25, -25);
          ctx.quadraticCurveTo(0, -35, 25, -25);
        }
        ctx.stroke();
        
        if (isReady) {
          ctx.fillStyle = isLight
            ? `rgba(2, 132, 199, ${0.75 + Math.sin(time * 2 + r) * 0.25})`
            : `rgba(180,220,255,${0.6 + Math.sin(time * 2 + r) * 0.3})`;
          ctx.shadowColor = isLight ? '#38bdf8' : '#80bfff'; ctx.shadowBlur = 5;
          ctx.font = 'bold 12px serif'; ctx.textAlign = 'center';
          ctx.fillText('ᛏ', 0, -5);
          ctx.shadowBlur = 0;
          
          ctx.fillStyle = isLight ? '#0284c7' : '#a0d0ff';
          ctx.beginPath();
          ctx.moveTo(-2, -15); ctx.lineTo(2, -15); ctx.lineTo(0, -50); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.beginPath();
          ctx.arc(0, -30, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    } else if (this.realm !== 'svartalfheim') {
      // Dynamic Odin Spear Pose on Command
      const balW = Math.min(145, Math.max(90, wallW - 24));
      const balX = (wallW - 8 - balW) / 2;
      const odinShift = (balX + balW / 2) - 245;

      ctx.save();
      ctx.translate(odinShift, 0);
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (this.odinCommandTimer > 0) {
        ctx.moveTo(255, 330); ctx.lineTo(295, 190); ctx.stroke();
        ctx.fillStyle = isLight ? '#0284c7' : '#e0f7fa'; 
        ctx.shadowBlur = 25; ctx.shadowColor = isLight ? '#38bdf8' : '#00e5ff';
        ctx.beginPath(); ctx.moveTo(290, 200); ctx.lineTo(310, 150); ctx.lineTo(300, 210); ctx.fill();
        ctx.strokeStyle = '#ffca28'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(250, 290); ctx.lineTo(275, 260); ctx.stroke();
      } else {
        ctx.moveTo(262, 250); ctx.lineTo(262, 410); ctx.stroke();
        ctx.fillStyle = isLight ? '#0284c7' : '#e0f7fa'; 
        ctx.shadowBlur = 15; ctx.shadowColor = isLight ? '#38bdf8' : '#00e5ff';
        ctx.beginPath(); ctx.moveTo(256, 250); ctx.lineTo(262, 200); ctx.lineTo(268, 250); ctx.fill();
        ctx.strokeStyle = '#ffca28'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(250, 290); ctx.lineTo(262, 320); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw 100% Procedural Animated Living Realm Environments
  drawAtmosphere() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const time = Date.now() / 1000;
    const gridX = this.grid.startX;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    // === ALTHJOF'S WHEEL & ANDVARI'S FALLS: SUBTERRANEAN DWARVEN WATERWAYS & CANAL RAPIDS ===
    if (this.isDwarvenWaterwayCity()) {
      ctx.save();

      // ── 1. SKY / CAVERN GORGE AMBIENCE ──
      const skyGrad = ctx.createLinearGradient(gridX, 0, w, h * 0.7);
      if (isLight) {
        if (this.city === 'andvaris-falls') {
          skyGrad.addColorStop(0, '#f0f9ff');
          skyGrad.addColorStop(0.35, '#e0f2fe');
          skyGrad.addColorStop(0.75, '#bae6fd');
          skyGrad.addColorStop(1, '#7dd3fc');
        } else {
          skyGrad.addColorStop(0, '#f0fdfa');
          skyGrad.addColorStop(0.35, '#e6fffa');
          skyGrad.addColorStop(0.75, '#ccfbf1');
          skyGrad.addColorStop(1, '#99f6e4');
        }
      } else {
        skyGrad.addColorStop(0, '#0a161b');
        skyGrad.addColorStop(0.35, '#071015');
        skyGrad.addColorStop(0.75, '#04090c');
        skyGrad.addColorStop(1, '#020507');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(gridX, 0, w - gridX, h);

      // ── 2. SUBTERRANEAN WATERWAY CANAL (Cascading rapids flowing behind grid) ──
      const riverTopY = h * 0.28;
      const riverBotY = h * 0.78;
      const riverGrad = ctx.createLinearGradient(gridX, riverTopY, gridX, riverBotY);
      if (isLight) {
        riverGrad.addColorStop(0, '#e0f2fe');
        riverGrad.addColorStop(0.3, '#bae6fd');
        riverGrad.addColorStop(0.65, '#7dd3fc');
        riverGrad.addColorStop(1, '#38bdf8');
      } else {
        riverGrad.addColorStop(0, '#04171d');
        riverGrad.addColorStop(0.3, '#0b323c');
        riverGrad.addColorStop(0.65, '#07242c');
        riverGrad.addColorStop(1, '#031116');
      }
      ctx.fillStyle = riverGrad;
      ctx.fillRect(gridX, riverTopY, w - gridX, riverBotY - riverTopY);

      // Animated Water Torrents & Current Flow Lines
      ctx.save();
      for (let wi = 0; wi < 14; wi++) {
        const streamT = ((time * 0.8 + wi * 0.23) % 1);
        const wy = riverTopY + 16 + (wi * 22) % (riverBotY - riverTopY - 32);
        const wxStart = gridX + streamT * (w - gridX);
        const wLen = 70 + (wi % 5) * 35;
        const wGrad = ctx.createLinearGradient(wxStart, wy, wxStart + wLen, wy);
        wGrad.addColorStop(0, 'rgba(20, 184, 166, 0)');
        wGrad.addColorStop(0.4, `rgba(45, 212, 191, ${0.35 + (wi % 3) * 0.12})`);
        wGrad.addColorStop(0.8, `rgba(56, 189, 248, ${0.45 + (wi % 3) * 0.15})`);
        wGrad.addColorStop(1, 'rgba(20, 184, 166, 0)');
        ctx.strokeStyle = wGrad;
        ctx.lineWidth = 1.8 + (wi % 3) * 0.8;
        ctx.beginPath();
        ctx.moveTo(wxStart, wy);
        ctx.quadraticCurveTo(wxStart + wLen * 0.5, wy + Math.sin(time * 3 + wi) * 5, wxStart + wLen, wy);
        ctx.stroke();
      }
      ctx.restore();

      // ── 3. CAVERN VAULT ROCK CEILING & STALACTITES ──
      ctx.fillStyle = isLight ? '#cbd5e1' : '#060d10';
      ctx.beginPath();
      ctx.moveTo(gridX, 0);
      ctx.lineTo(gridX, h * 0.16);
      ctx.quadraticCurveTo(w * 0.45, h * 0.22, w * 0.55, h * 0.14);
      ctx.quadraticCurveTo(w * 0.68, h * 0.25, w * 0.82, h * 0.16);
      ctx.quadraticCurveTo(w * 0.92, h * 0.20, w, h * 0.12);
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fill();

      // Stalactites hanging from cavern ceiling with bioluminescent crystal tips
      const stalactites = [
        { x: w * 0.38, len: 45, w: 14, crystal: true },
        { x: w * 0.44, len: 65, w: 18, crystal: true },
        { x: w * 0.52, len: 38, w: 12, crystal: false },
        { x: w * 0.61, len: 75, w: 20, crystal: true },
        { x: w * 0.69, len: 50, w: 15, crystal: false },
        { x: w * 0.80, len: 80, w: 22, crystal: true },
        { x: w * 0.89, len: 42, w: 14, crystal: true },
        { x: w * 0.96, len: 60, w: 16, crystal: true },
      ];
      for (let si = 0; si < stalactites.length; si++) {
        const st = stalactites[si];
        ctx.fillStyle = isLight ? '#94a3b8' : '#0a1317';
        ctx.beginPath();
        ctx.moveTo(st.x - st.w * 0.5, 0);
        ctx.lineTo(st.x + st.w * 0.5, 0);
        ctx.lineTo(st.x, st.len);
        ctx.closePath();
        ctx.fill();

        if (st.crystal) {
          const cPulse = Math.sin(time * 2.2 + si * 1.5) * 0.25 + 0.75;
          // Crystal cluster
          ctx.fillStyle = `rgba(45, 212, 191, ${0.75 * cPulse})`;
          ctx.shadowColor = '#14b8a6';
          ctx.shadowBlur = 10 * cPulse;
          ctx.beginPath();
          ctx.moveTo(st.x, st.len - 3);
          ctx.lineTo(st.x + 4, st.len + 10);
          ctx.lineTo(st.x, st.len + 16);
          ctx.lineTo(st.x - 4, st.len + 10);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ── 4. DWARVEN AQUEDUCT BRIDGE & CATWALK (Midground) ──
      const bY = riverTopY - 14;
      // Stone bridge beam in subterranean basalt
      ctx.fillStyle = isLight ? '#94a3b8' : '#0a151b';
      ctx.fillRect(this.grid.startX, bY, w - this.grid.startX, 14);
      // Aged bronze railing trim
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(this.grid.startX, bY - 2, w - this.grid.startX, 2.5);

      // Bridge support arch piers
      for (let pi = 0; pi < 3; pi++) {
        const px = w * (0.46 + pi * 0.20);
        ctx.fillStyle = isLight ? '#cbd5e1' : '#071216';
        ctx.fillRect(px - 14, bY + 14, 28, riverBotY - bY - 14);
        ctx.strokeStyle = isLight ? '#0d9488' : '#115e59';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 14, bY + 14, 28, riverBotY - bY - 14);

        // Bronze pier collar bracket
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(px - 16, bY + 12, 32, 5);

        // Water culvert arch on pier
        ctx.fillStyle = isLight ? '#64748b' : '#03080a';
        ctx.beginPath();
        ctx.arc(px, riverBotY - 30, 10, Math.PI, 0);
        ctx.rect(px - 10, riverBotY - 30, 20, 30);
        ctx.fill();

        // Water foaming at pier base
        const pFoamGrad = ctx.createRadialGradient(px, riverBotY - 2, 2, px, riverBotY - 2, 22);
        pFoamGrad.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
        pFoamGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.4)');
        pFoamGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = pFoamGrad;
        ctx.beginPath();
        ctx.ellipse(px, riverBotY - 2, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 5. THE ROTATING GREAT WATERWHEEL OF ALTHJOF (Right Midground) ──
      const wheelX = w * 0.90;
      const wheelY = riverTopY + (riverBotY - riverTopY) * 0.42;
      const wheelR = Math.min(85, (riverBotY - riverTopY) * 0.50);
      const wheelRot = time * 0.48; // Smooth continuous rotation
      ctx.save();
      ctx.globalAlpha = 0.42; // Atmospheric depth while keeping runes & mechanics crisp

      // ── 4b. AQUEDUCT WATER CHUTE FEEDING THE GREAT WHEEL ──
      const chuteX = wheelX - wheelR * 0.42;
      const chuteY = bY + 12;
      // Basalt stone & canal bronze water chute
      ctx.fillStyle = isLight ? '#94a3b8' : '#081419';
      ctx.fillRect(chuteX - 30, chuteY, 50, 16);
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.strokeRect(chuteX - 30, chuteY, 50, 16);

      // Churning water torrent pouring from chute onto the top buckets
      const pourGrad = ctx.createLinearGradient(chuteX + 15, chuteY, chuteX + 26, wheelY - wheelR * 0.72);
      pourGrad.addColorStop(0, 'rgba(240, 253, 250, 0.95)');
      pourGrad.addColorStop(0.4, 'rgba(45, 212, 191, 0.85)');
      pourGrad.addColorStop(1, 'rgba(14, 165, 233, 0.75)');
      ctx.fillStyle = pourGrad;
      ctx.beginPath();
      ctx.moveTo(chuteX + 18, chuteY + 12);
      ctx.quadraticCurveTo(chuteX + 28, chuteY + 28, chuteX + 32, wheelY - wheelR * 0.70);
      ctx.lineTo(chuteX + 18, wheelY - wheelR * 0.70);
      ctx.quadraticCurveTo(chuteX + 16, chuteY + 28, chuteX + 8, chuteY + 12);
      ctx.closePath();
      ctx.fill();

      // Spray droplets at chute pour impact
      for (let si = 0; si < 5; si++) {
        const sPhase = ((time * 3.8 + si * 0.25) % 1);
        const spX = chuteX + 25 + Math.sin(si * 2.3) * 18 * sPhase;
        const spY = wheelY - wheelR * 0.70 - sPhase * 16 + (sPhase * sPhase) * 20;
        ctx.fillStyle = `rgba(240, 253, 250, ${(1 - sPhase) * 0.9})`;
        ctx.beginPath();
        ctx.arc(spX, spY, 2 + (1 - sPhase) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(wheelX, wheelY);

      // Wheel shadow on rear stone wall
      ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.arc(6, 6, wheelR + 8, 0, Math.PI * 2);
      ctx.fill();

      // Outer Aged Canal Bronze Rim
      ctx.rotate(wheelRot);
      ctx.strokeStyle = isLight ? '#475569' : '#0a1a20';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
      ctx.stroke();

      // Polished Bronze & Teal Tread band with runes
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner basalt timber rim
      ctx.strokeStyle = isLight ? '#0f766e' : '#042f2e';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, wheelR - 12, 0, Math.PI * 2);
      ctx.stroke();

      // Runic inscriptions along the bronze rim
      const rimRunes = ['ᚨ', 'ᛚ', 'ᛏ', 'ᛗ', 'ᚲ', 'ᚱ', 'ᚦ', 'ᛟ'];
      ctx.font = 'bold 9.5px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let ri = 0; ri < 8; ri++) {
        const rAng = (ri * Math.PI * 2) / 8;
        const rx = Math.cos(rAng) * (wheelR - 6);
        const ry = Math.sin(rAng) * (wheelR - 6);
        ctx.fillStyle = '#5eead4';
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 6;
        ctx.fillText(rimRunes[ri], rx, ry);
      }
      ctx.shadowBlur = 0;

      // 16 Bucket Paddles & Radial Spoke Beams
      const numPaddles = 16;
      for (let pIdx = 0; pIdx < numPaddles; pIdx++) {
        const pAng = (pIdx * Math.PI * 2) / numPaddles;
        ctx.save();
        ctx.rotate(pAng);

        // Heavy Bog-Oak Spoke
        ctx.fillStyle = isLight
          ? (pIdx % 2 === 0 ? '#64748b' : '#475569')
          : (pIdx % 2 === 0 ? '#111c22' : '#0b1317');
        ctx.fillRect(-4, 0, 8, wheelR - 10);

        // Aged Bronze Spoke Reinforcement Ring
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(-6, wheelR * 0.55 - 3, 12, 6);

        // Water Bucket Blade on the rim
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.roundRect(wheelR - 14, -6, 26, 12, 3);
        ctx.fill();
        ctx.strokeStyle = '#5eead4';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.restore();
      }

      // Central Bronze Axle Hub
      ctx.fillStyle = isLight ? '#475569' : '#081014';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Center Gear Teeth (rotates with wheel)
      for (let g = 0; g < 10; g++) {
        const ga = (g * Math.PI * 2) / 10;
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(Math.cos(ga) * 28 - 4, Math.sin(ga) * 28 - 4, 8, 8);
      }

      // Center Core Cap
      ctx.fillStyle = isLight ? '#0f766e' : '#042f2e';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5eead4';
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 12px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ᛱ', 0, 1);
      ctx.shadowBlur = 0;

      ctx.restore(); // Exit wheel rotation

      // ── 6. WATER CASCADES & SPLASHING FOAM FROM THE GREAT WHEEL ──
      const foamBaseY = wheelY + wheelR - 4;
      const foamGrad = ctx.createRadialGradient(wheelX, foamBaseY, 12, wheelX, foamBaseY, wheelR * 0.92);
      foamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      foamGrad.addColorStop(0.3, 'rgba(153, 246, 228, 0.8)');
      foamGrad.addColorStop(0.65, 'rgba(45, 212, 191, 0.4)');
      foamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = foamGrad;
      ctx.beginPath();
      ctx.ellipse(wheelX, foamBaseY, wheelR * 0.92, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cascading water sheets falling off rising buckets
      for (let wDrop = 0; wDrop < 9; wDrop++) {
        const dropPhase = ((time * 2.2 + wDrop * 0.35) % 1);
        const dropX = wheelX - wheelR * 0.55 + Math.sin(wDrop * 2) * 28;
        const dropY = wheelY - wheelR * 0.2 + dropPhase * (wheelR * 0.98);
        ctx.fillStyle = `rgba(224, 242, 254, ${(1 - dropPhase) * 0.85})`;
        ctx.beginPath();
        ctx.arc(dropX, dropY, 2.5 + dropPhase * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore(); // Exit distant waterwheel alpha

      // ── 6b. DWARVEN CANAL OUTER EMBANKMENT & RIVER GATE (Right Bulwark) ──
      const rWallW = 56;
      const rWallX = w - rWallW;

      // Cast shadow from right embankment onto the canal waters
      const rCastShadow = ctx.createLinearGradient(rWallX - 24, 0, rWallX, 0);
      rCastShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rCastShadow.addColorStop(1, isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(2, 6, 8, 0.72)');
      ctx.fillStyle = rCastShadow;
      ctx.fillRect(rWallX - 24, 0, 24, h);

      // Subterranean Dwarven Basalt Embankment Wall
      const rWallGrad = ctx.createLinearGradient(rWallX, 0, w, 0);
      if (isLight) {
        rWallGrad.addColorStop(0, '#e2e8f0');
        rWallGrad.addColorStop(0.45, '#cbd5e1');
        rWallGrad.addColorStop(1, '#94a3b8');
      } else {
        rWallGrad.addColorStop(0, '#0b161b');
        rWallGrad.addColorStop(0.45, '#122229');
        rWallGrad.addColorStop(1, '#070f13');
      }
      ctx.fillStyle = rWallGrad;
      ctx.fillRect(rWallX, 0, rWallW, h);

      // Staggered Basalt Ashlar Masonry Courses & Vertical Head Joints
      const rCourses = [34, 30, 36, 32, 34, 28, 36];
      let rCurY = 0;
      let rCIdx = 0;
      while (rCurY < h) {
        const cH = rCourses[rCIdx % rCourses.length];
        const nextY = Math.min(h, rCurY + cH);

        // Recessed mortar bed joint
        ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(2, 6, 8, 0.75)';
        ctx.fillRect(rWallX, nextY - 2, rWallW, 2.5);

        // Top stone edge bevel highlight (mineral sheen)
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(45, 212, 191, 0.09)';
        ctx.fillRect(rWallX, rCurY, rWallW, 1.5);

        // Staggered vertical stone joints
        const vJointX = rWallX + 18 + ((rCIdx % 2) * 18);
        ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(2, 6, 8, 0.65)';
        ctx.fillRect(vJointX, rCurY, 2, cH);
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(45, 212, 191, 0.06)';
        ctx.fillRect(vJointX + 2, rCurY, 1, cH);

        rCurY = nextY;
        rCIdx++;
      }

      // Aquamarine Mineral Seepage along right embankment
      const rSeepGrad = ctx.createLinearGradient(rWallX, 0, w, 0);
      rSeepGrad.addColorStop(0, isLight ? 'rgba(20, 184, 166, 0.18)' : 'rgba(20, 184, 166, 0.24)');
      rSeepGrad.addColorStop(0.6, isLight ? 'rgba(13, 148, 136, 0.06)' : 'rgba(13, 148, 136, 0.09)');
      rSeepGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rSeepGrad;
      ctx.fillRect(rWallX, 0, rWallW, h);

      // Heavy Dwarven Bronze Canal Rim Border Beam facing the battlefield
      ctx.fillStyle = isLight ? '#0d9488' : '#061014';
      ctx.fillRect(rWallX, 0, 11, h);
      const rBeamG = ctx.createLinearGradient(rWallX, 0, rWallX + 10, 0);
      if (isLight) {
        rBeamG.addColorStop(0, '#115e59');
        rBeamG.addColorStop(0.35, '#2dd4bf');
        rBeamG.addColorStop(0.75, '#0d9488');
        rBeamG.addColorStop(1, '#0f766e');
      } else {
        rBeamG.addColorStop(0, '#040b0e');
        rBeamG.addColorStop(0.35, '#14b8a6');
        rBeamG.addColorStop(0.75, '#0f766e');
        rBeamG.addColorStop(1, '#081419');
      }
      ctx.fillStyle = rBeamG;
      ctx.fillRect(rWallX, 0, 10, h);

      // Fortified Stone Buttress Corbels & Bronze Pier Caps aligned with grid lanes
      for (let r = 0; r <= this.grid.rows; r++) {
        const ly = r * this.grid.cellHeight;
        ctx.fillStyle = isLight ? '#94a3b8' : '#0a181f';
        ctx.beginPath();
        ctx.moveTo(rWallX - 4, ly - 5);
        ctx.lineTo(w, ly - 6);
        ctx.lineTo(w, ly + 6);
        ctx.lineTo(rWallX - 4, ly + 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Burnished bronze nose cap on each right-side lane pier
        ctx.fillStyle = '#b45309';
        ctx.fillRect(rWallX - 4, ly - 3.5, 14, 7);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(rWallX - 4, ly - 3.5, 14, 7);
      }

      // Water-ward glowing teal rivets along the right border beam
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 4;
      for (let ri = 0; ri < Math.floor(h / 26); ri++) {
        ctx.beginPath();
        ctx.arc(rWallX + 5, 13 + ri * 26, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Upper Dwarven Watch-Embrasure Slit & Warm Forge Lookout (above the River Gate)
      const rEmbW = 28;
      const rEmbX = rWallX + 18;
      const rEmbTop = Math.max(24, h * 0.05);
      const rEmbFloor = Math.max(72, h * 0.16);
      ctx.fillStyle = isLight ? '#475569' : '#03070a';
      ctx.beginPath();
      ctx.moveTo(rEmbX, rEmbTop + rEmbW / 2);
      ctx.arc(rEmbX + rEmbW / 2, rEmbTop + rEmbW / 2, rEmbW / 2, Math.PI, 0);
      ctx.lineTo(rEmbX + rEmbW, rEmbFloor);
      ctx.lineTo(rEmbX, rEmbFloor);
      ctx.closePath();
      ctx.fill();
      const rForgeGlow = ctx.createRadialGradient(rEmbX + rEmbW / 2, rEmbTop + 24, 2, rEmbX + rEmbW / 2, rEmbTop + 24, rEmbW * 0.75);
      rForgeGlow.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
      rForgeGlow.addColorStop(0.6, 'rgba(20, 184, 166, 0.15)');
      rForgeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rForgeGlow;
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Bronze parapet rail on upper watch slit
      ctx.fillStyle = '#b45309';
      ctx.fillRect(rEmbX - 3, rEmbFloor - 4, rEmbW + 6, 5);
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(rEmbX - 4, rEmbFloor - 5, rEmbW + 8, 2);

      // Breached Outer River Gate Arch (From where attackers advance)
      const rGateTop = h * 0.23;
      const rGateH = h * 0.56;
      const rGateW = 40;
      const rGateX = rWallX + 12;
      const rGateCenterX = rGateX + rGateW / 2;

      // Heavy Dressed Stone Arch Surround & Bronze Voussoir Ring
      ctx.fillStyle = isLight ? '#cbd5e1' : '#0a161c';
      ctx.beginPath();
      ctx.moveTo(rGateX - 4, rGateTop + 22);
      ctx.arc(rGateCenterX, rGateTop + 22, rGateW / 2 + 4, Math.PI, 0);
      ctx.lineTo(rGateX + rGateW + 4, rGateTop + rGateH);
      ctx.lineTo(rGateX - 4, rGateTop + rGateH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Canal Culvert Portal Void
      ctx.fillStyle = isLight ? '#334155' : '#020507';
      ctx.beginPath();
      ctx.moveTo(rGateX, rGateTop + 22);
      ctx.arc(rGateCenterX, rGateTop + 22, rGateW / 2, Math.PI, 0);
      ctx.lineTo(rGateX + rGateW, rGateTop + rGateH);
      ctx.lineTo(rGateX, rGateTop + rGateH);
      ctx.closePath();
      ctx.fill();

      // Arch Stone Keystone with Glowing Rune ᚦ (Gateway / Threshold)
      ctx.fillStyle = isLight ? '#e2e8f0' : '#162830';
      ctx.beginPath();
      ctx.moveTo(rGateCenterX - 8, rGateTop - 3);
      ctx.lineTo(rGateCenterX + 8, rGateTop - 3);
      ctx.lineTo(rGateCenterX + 6, rGateTop + 17);
      ctx.lineTo(rGateCenterX - 6, rGateTop + 17);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = '#2dd4bf';
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 7;
      ctx.font = 'bold 11px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ᚦ', rGateCenterX, rGateTop + 12);
      ctx.shadowBlur = 0;

      // Heavy Iron Portcullis Bars & Riveted Bronze Cross-Girders
      ctx.strokeStyle = isLight ? '#475569' : '#1e293b';
      ctx.lineWidth = 3.2;
      const rNumBars = 3;
      for (let bar = 0; bar < rNumBars; bar++) {
        const bx = rGateX + 8 + bar * 12;
        ctx.beginPath();
        ctx.moveTo(bx, rGateTop + 20);
        ctx.lineTo(bx, rGateTop + rGateH - 6);
        ctx.stroke();
      }
      for (let rail = 0; rail < 3; rail++) {
        const ry = rGateTop + 42 + rail * (rGateH * 0.25);
        ctx.fillStyle = isLight ? '#0f766e' : '#0f272e';
        ctx.fillRect(rGateX + 2, ry - 3.5, rGateW - 4, 7);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1;
        ctx.strokeRect(rGateX + 2, ry - 3.5, rGateW - 4, 7);

        // Glowing bronze-teal rivets at bar intersections
        ctx.fillStyle = '#2dd4bf';
        for (let rv = 0; rv < rNumBars; rv++) {
          const rvx = rGateX + 8 + rv * 12;
          ctx.beginPath();
          ctx.arc(rvx, ry, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pulsing Carved Dwarven Ward Runes along the right gate jamb
      const rGateRunes = ['ᚦ', 'ᚢ', 'ᚱ', 'ᛋ'];
      const rRuneGlow = 0.5 + Math.sin(time * 2.0 + 1.1) * 0.25;
      ctx.fillStyle = `rgba(45, 212, 191, ${rRuneGlow})`;
      ctx.shadowColor = '#14b8a6';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 10px serif';
      ctx.textAlign = 'center';
      for (let ri = 0; ri < rGateRunes.length; ri++) {
        ctx.fillText(rGateRunes[ri], rWallX + 5.5, rGateTop + 48 + ri * 38);
      }
      ctx.shadowBlur = 0;

      // Torrents pouring into the battlefield from the breached gate spillway
      const rSpillTop = rGateTop + rGateH - 30;
      const rGateWater = ctx.createLinearGradient(rGateX, rSpillTop, rGateX, rGateTop + rGateH);
      rGateWater.addColorStop(0, 'rgba(13, 148, 136, 0.35)');
      rGateWater.addColorStop(0.5, 'rgba(45, 212, 191, 0.65)');
      rGateWater.addColorStop(1, 'rgba(204, 251, 241, 0.88)');
      ctx.fillStyle = rGateWater;
      ctx.fillRect(rGateX + 2, rSpillTop, rGateW - 4, 30);

      // Animated churning water ripple lines & foam at the right gate spillway
      ctx.strokeStyle = 'rgba(240, 253, 250, 0.85)';
      ctx.lineWidth = 1.3;
      for (let wLine = 0; wLine < 3; wLine++) {
        const wY = rSpillTop + 7 + wLine * 8;
        const wPhase = -time * 4.5 + wLine * 1.6;
        ctx.beginPath();
        ctx.moveTo(rGateX + 3, wY);
        for (let wx = rGateX + 3; wx <= rGateX + rGateW - 3; wx += 5) {
          ctx.lineTo(wx, wY + Math.sin(wx * 0.22 + wPhase) * 2.0);
        }
        ctx.stroke();
      }

      // Heavy Stone Culvert Base Threshold & Bronze Sill
      ctx.fillStyle = isLight ? '#94a3b8' : '#081216';
      ctx.fillRect(rGateX - 4, rGateTop + rGateH - 5, rGateW + 8, 9);
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(rGateX - 4, rGateTop + rGateH - 5, rGateW + 8, 2);

      // Twin Animated Water-Ward Wall Lanterns on the Right Embankment (Upper & Lower)
      const rLanternPositions = [
        { x: rWallX + 18, y: Math.max(44, h * 0.19) },
        { x: rWallX + 18, y: Math.min(h - 36, rGateTop + rGateH + 34) }
      ];
      for (let li = 0; li < rLanternPositions.length; li++) {
        const rLt = rLanternPositions[li];
        const rFlicker = Math.sin(time * 6.4 + li * 2.3 + 1.0) * 0.18 + 0.82;

        // Iron mounting bracket
        ctx.fillStyle = isLight ? '#475569' : '#1e293b';
        ctx.fillRect(rLt.x - 4, rLt.y - 3, 14, 5);
        ctx.fillRect(rLt.x - 1, rLt.y - 12, 4, 12);

        // Lantern housing cage
        ctx.fillStyle = isLight ? '#cbd5e1' : '#081216';
        ctx.beginPath();
        ctx.roundRect(rLt.x - 7, rLt.y - 22, 16, 17, 3);
        ctx.fill();
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Dynamic radial light halo
        const rHalo = ctx.createRadialGradient(rLt.x + 1, rLt.y - 13, 1, rLt.x + 1, rLt.y - 13, 30 * rFlicker);
        rHalo.addColorStop(0, `rgba(45, 212, 191, ${0.42 * rFlicker})`);
        rHalo.addColorStop(0.5, `rgba(13, 148, 136, ${0.15 * rFlicker})`);
        rHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rHalo;
        ctx.beginPath();
        ctx.arc(rLt.x + 1, rLt.y - 13, 30 * rFlicker, 0, Math.PI * 2);
        ctx.fill();

        // Glowing lantern core
        ctx.fillStyle = `rgba(204, 251, 241, ${0.92 * rFlicker})`;
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 9 * rFlicker;
        ctx.beginPath();
        ctx.arc(rLt.x + 1, rLt.y - 13, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 7. COOL SUBTERRANEAN RIVER MIST & FOG BANKS ──
      for (let f = 0; f < 3; f++) {
        const fX = gridX + ((time * 22 + f * 260) % (w - gridX));
        const fY = riverBotY - 18 + f * 10;
        const fogG = ctx.createRadialGradient(fX, fY, 0, fX, fY, 180);
        fogG.addColorStop(0, 'rgba(45, 212, 191, 0.12)');
        fogG.addColorStop(0.5, 'rgba(20, 184, 166, 0.05)');
        fogG.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fogG;
        ctx.fillRect(fX - 180, fY - 60, 360, 120);
      }

      // ── 8. DRIFTING WATER SPRAY PARTICLES & GLOWING CAVE MOTES ──
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        const pColor = (p.size > 2.6)
          ? `rgba(165, 243, 252, ${p.alpha * 0.65})`
          : `rgba(45, 212, 191, ${p.alpha * 0.85})`;
        ctx.fillStyle = pColor;
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';

      ctx.restore();

    // === SVARTALFHEIM FORGE / MINE / CITADEL STRONGHOLDS: UNDERGROUND CAVERN, FORGE GLOW, CLIFFS, EMBERS ===
    } else if (this.isDwarvenForgeCity()) {
      ctx.save();

      // ── 1. SKY: gorge atmosphere ──
      const skyGrad = ctx.createLinearGradient(gridX, 0, w, h * 0.55);
      if (isLight) {
        skyGrad.addColorStop(0,   '#fef9c3');
        skyGrad.addColorStop(0.4, '#fef3c7');
        skyGrad.addColorStop(1,   '#fde68a');
      } else {
        skyGrad.addColorStop(0,   '#202e20');
        skyGrad.addColorStop(0.4, '#131c13');
        skyGrad.addColorStop(1,   '#080c08');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(gridX, 0, w - gridX, h);

      // ── 2. SUBTLE GOD RAYS — 2 soft golden shafts only ──
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let ri = 0; ri < 2; ri++) {
        const rayPulse = 0.018 + Math.sin(time * 0.35 + ri * 2.0) * 0.008;
        const rayGrad = ctx.createLinearGradient(gridX, 0, w, h);
        rayGrad.addColorStop(0,   `rgba(230,210,150,${rayPulse})`);
        rayGrad.addColorStop(0.6, `rgba(180,160,100,${rayPulse * 0.3})`);
        rayGrad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = rayGrad;
        const rx0 = gridX + 30 + ri * 220;
        const rw2 = 55 + ri * 30;
        ctx.beginPath();
        ctx.moveTo(rx0 - rw2, 0);
        ctx.lineTo(rx0 + rw2, 0);
        ctx.lineTo(rx0 + rw2 * 1.8 + w * 0.3, h);
        ctx.lineTo(rx0 - rw2 * 0.5 + w * 0.3, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      // ── 3. WATERFALLS drawn first so they show behind cliffs ──
      const falls = [
        {x: w * 0.415, topY: 0,         botY: h * 0.96, width: 22},
        {x: w * 0.635, topY: 0,         botY: h * 0.96, width: 18},
        {x: w * 0.855, topY: 0,         botY: h * 0.96, width: 14},
      ];
      for (let fi = 0; fi < falls.length; fi++) {
        const fl = falls[fi];
        const fallH = fl.botY - fl.topY;
        const wobble = Math.sin(time * 1.2 + fi) * 4;
        // Main ribbon — bright and opaque
        const wfGrad = ctx.createLinearGradient(fl.x, fl.topY, fl.x, fl.botY);
        wfGrad.addColorStop(0,   'rgba(220,240,255,0.90)');
        wfGrad.addColorStop(0.3, 'rgba(190,220,248,0.80)');
        wfGrad.addColorStop(0.7, 'rgba(160,200,235,0.65)');
        wfGrad.addColorStop(1,   'rgba(140,185,220,0.30)');
        ctx.fillStyle = wfGrad;
        ctx.beginPath();
        ctx.moveTo(fl.x - fl.width * 0.5 + wobble, fl.topY);
        ctx.quadraticCurveTo(fl.x - fl.width * 0.3, fl.topY + fallH * 0.5, fl.x - fl.width * 0.5 - wobble, fl.botY);
        ctx.lineTo(fl.x + fl.width * 0.5 - wobble, fl.botY);
        ctx.quadraticCurveTo(fl.x + fl.width * 0.3, fl.topY + fallH * 0.5, fl.x + fl.width * 0.5 + wobble, fl.topY);
        ctx.closePath();
        ctx.fill();
        // Bright white core streak
        const streakAlpha = 0.70 + Math.sin(time * 2.2 + fi) * 0.15;
        const streakGrad = ctx.createLinearGradient(fl.x, fl.topY, fl.x, fl.botY * 0.85);
        streakGrad.addColorStop(0,   `rgba(255,255,255,${streakAlpha})`);
        streakGrad.addColorStop(0.5, `rgba(230,245,255,${streakAlpha * 0.6})`);
        streakGrad.addColorStop(1,   'rgba(210,235,255,0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(fl.x - 3, fl.topY, 6, fallH * 0.85);
        // Large mist pool at base
        const mistPulse = 0.35 + Math.sin(time * 0.9 + fi * 1.5) * 0.08;
        const mistGrad = ctx.createRadialGradient(fl.x, fl.botY, 0, fl.x, fl.botY, fl.width * 5.5);
        mistGrad.addColorStop(0,   `rgba(210,228,245,${mistPulse})`);
        mistGrad.addColorStop(0.5, `rgba(180,205,230,${mistPulse * 0.5})`);
        mistGrad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath(); ctx.ellipse(fl.x, fl.botY, fl.width * 5.5, fl.width * 2.2, 0, 0, Math.PI * 2); ctx.fill();
        // Rising mist wisps
        for (let mv = 0; mv < 5; mv++) {
          const mt = ((time * 0.25 + fi * 0.3 + mv * 0.22) % 1);
          const mx2 = fl.x + Math.sin(mt * 4 + mv) * fl.width * 2;
          const my2 = fl.botY - mt * 75;
          ctx.beginPath(); ctx.arc(mx2, my2, 8 + mt * 22, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190,215,235,${(1 - mt) * 0.28})`; ctx.fill();
        }
      }

      // ── 4. BACKGROUND CLIFF SILHOUETTES (3 depth layers, mossy grey-green) ──
      // Layer 3 — most distant
      ctx.fillStyle = isLight ? '#cbd5e1' : '#1a2218';
      ctx.beginPath();
      ctx.moveTo(gridX, h);
      ctx.lineTo(gridX, h * 0.55);
      ctx.quadraticCurveTo(w * 0.42, h * 0.38, w * 0.55, h * 0.48);
      ctx.quadraticCurveTo(w * 0.65, h * 0.34, w * 0.75, h * 0.42);
      ctx.quadraticCurveTo(w * 0.85, h * 0.28, w, h * 0.36);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      // Layer 2 — mid-distance
      ctx.fillStyle = isLight ? '#94a3b8' : '#121810';
      ctx.beginPath();
      ctx.moveTo(gridX, h);
      ctx.lineTo(gridX, h * 0.62);
      ctx.quadraticCurveTo(w * 0.38, h * 0.44, w * 0.48, h * 0.54);
      ctx.quadraticCurveTo(w * 0.58, h * 0.38, w * 0.68, h * 0.50);
      ctx.quadraticCurveTo(w * 0.80, h * 0.30, w * 0.90, h * 0.44);
      ctx.lineTo(w, h * 0.42);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      // Layer 1 — closest
      ctx.fillStyle = isLight ? '#64748b' : '#0b100a';
      ctx.beginPath();
      ctx.moveTo(gridX, h);
      ctx.lineTo(gridX, h * 0.72);
      ctx.quadraticCurveTo(w * 0.36, h * 0.58, w * 0.44, h * 0.66);
      ctx.quadraticCurveTo(w * 0.53, h * 0.50, w * 0.62, h * 0.62);
      ctx.quadraticCurveTo(w * 0.74, h * 0.44, w * 0.84, h * 0.58);
      ctx.quadraticCurveTo(w * 0.93, h * 0.38, w, h * 0.52);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // ── 5. CLIFF FACE MOSS STREAKS ──
      const mossPositions = [w*0.39, w*0.51, w*0.63, w*0.76, w*0.88];
      for (let mi = 0; mi < mossPositions.length; mi++) {
        const mx = mossPositions[mi];
        const mossGrad = ctx.createLinearGradient(mx, h * 0.4, mx, h * 0.82);
        mossGrad.addColorStop(0,   'rgba(28,45,12,0)');
        mossGrad.addColorStop(0.3, `rgba(22,38,8,${0.45 + (mi % 3) * 0.10})`);
        mossGrad.addColorStop(1,   'rgba(12,20,4,0)');
        ctx.fillStyle = mossGrad;
        ctx.beginPath();
        ctx.ellipse(mx, h * 0.62, 8 + (mi % 3) * 4, h * 0.20, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 5. FOREST SILHOUETTE — fir trees on clifftops ──
      ctx.fillStyle = isLight ? '#14532d' : '#0c0e06';
      const treeBases: {x: number, y: number, s: number}[] = [
        {x: w*0.38, y: h*0.44, s: 1.0}, {x: w*0.41, y: h*0.42, s: 1.3},
        {x: w*0.44, y: h*0.40, s: 0.9}, {x: w*0.56, y: h*0.30, s: 1.1},
        {x: w*0.60, y: h*0.28, s: 1.4}, {x: w*0.64, y: h*0.31, s: 0.8},
        {x: w*0.75, y: h*0.25, s: 1.2}, {x: w*0.79, y: h*0.23, s: 1.0},
        {x: w*0.83, y: h*0.25, s: 0.9}, {x: w*0.90, y: h*0.32, s: 1.1},
        {x: w*0.94, y: h*0.30, s: 0.8},
      ];
      for (const tr of treeBases) {
        const th2 = 26 * tr.s, tw2 = 9 * tr.s;
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y - th2);
        ctx.lineTo(tr.x - tw2, tr.y);
        ctx.lineTo(tr.x + tw2, tr.y);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y - th2 * 0.6);
        ctx.lineTo(tr.x - tw2 * 1.3, tr.y + th2 * 0.15);
        ctx.lineTo(tr.x + tw2 * 1.3, tr.y + th2 * 0.15);
        ctx.closePath(); ctx.fill();
      }

      // ── 6. DWARVEN STONE AQUEDUCT BRIDGE ──
      // Bridge deck
      ctx.fillStyle = isLight ? '#92400e' : '#2a1e0c';
      ctx.beginPath();
      ctx.moveTo(w * 0.48, h * 0.50);
      ctx.lineTo(w * 0.48, h * 0.52);
      ctx.lineTo(w * 0.74, h * 0.47);
      ctx.lineTo(w * 0.74, h * 0.45);
      ctx.closePath();
      ctx.fill();
      // Arch spans beneath bridge
      for (let ai = 0; ai < 3; ai++) {
        const ax = w * (0.51 + ai * 0.075);
        const ay = h * (0.500 - ai * 0.005);
        ctx.fillStyle = isLight ? '#b45309' : '#1c1408';
        ctx.beginPath();
        ctx.arc(ax, ay, 12, Math.PI, 0);
        ctx.rect(ax - 12, ay, 24, 18);
        ctx.fill();
      }
      // Bronze railing accents
      ctx.strokeStyle = `rgba(160,100,20,${0.60 + Math.sin(time * 0.5) * 0.10})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.48, h * 0.50);
      ctx.lineTo(w * 0.74, h * 0.45);
      ctx.stroke();
      // Stone pillars holding bridge
      ctx.fillStyle = isLight ? '#92400e' : '#1a1208';
      ctx.fillRect(w * 0.548 - 5, h * 0.50, 10, h * 0.18);
      ctx.fillRect(w * 0.623 - 5, h * 0.47, 10, h * 0.20);

      // ── 7. FORGE-CAVE GLOW OPENINGS in the cliff face ──
      const caves = [
        {x: w * 0.46, y: h * 0.58, r: 22},
        {x: w * 0.70, y: h * 0.50, r: 18},
        {x: w * 0.88, y: h * 0.45, r: 14},
      ];
      for (let ci = 0; ci < caves.length; ci++) {
        const cv = caves[ci];
        const cavePulse = Math.sin(time * 1.8 + ci * 1.4) * 0.12 + 0.88;
        // Amber glow halo
        const caveGlow = ctx.createRadialGradient(cv.x, cv.y, 0, cv.x, cv.y, cv.r * 2.8 * cavePulse);
        caveGlow.addColorStop(0,   `rgba(255,200,60,${0.50 * cavePulse})`);
        caveGlow.addColorStop(0.4, `rgba(220,110,10,${0.22 * cavePulse})`);
        caveGlow.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = caveGlow;
        ctx.beginPath(); ctx.arc(cv.x, cv.y, cv.r * 2.8, 0, Math.PI * 2); ctx.fill();
        // Cave mouth (dark arch)
        ctx.fillStyle = isLight ? '#451a03' : '#060402';
        ctx.beginPath();
        ctx.arc(cv.x, cv.y, cv.r * cavePulse, Math.PI, 0);
        ctx.rect(cv.x - cv.r, cv.y, cv.r * 2, cv.r * 0.8);
        ctx.fill();
        // Bright inner forge core
        ctx.fillStyle = `rgba(255,240,120,${0.75 * cavePulse})`;
        ctx.beginPath(); ctx.ellipse(cv.x, cv.y, cv.r * 0.45, cv.r * 0.30, 0, 0, Math.PI * 2); ctx.fill();
        // Smoke drifting up
        for (let ss = 0; ss < 3; ss++) {
          const st = ((time * 0.18 + ci * 0.35 + ss * 0.28) % 1);
          const salpha = (1 - st) * 0.18;
          ctx.beginPath();
          ctx.arc(cv.x + Math.sin(st * 3.5 + ss) * 7, cv.y - st * 60 - 10, 5 + st * 14, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(50,38,18,${salpha})`;
          ctx.fill();
        }
      }

      // ── 8. GROUND FOG at the base of the gorge — cool blue-grey ──
      const fogGrad = ctx.createLinearGradient(gridX, h * 0.80, gridX, h);
      fogGrad.addColorStop(0,   'rgba(0,0,0,0)');
      fogGrad.addColorStop(0.4, 'rgba(100,130,120,0.10)');
      fogGrad.addColorStop(1,   'rgba(80,115,110,0.28)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(gridX, h * 0.80, w - gridX, h * 0.20);

      // ── 9. FORGE CAVE EMBER SPARKS — subtle, high-contrast in both Light & Dark ──
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      for (const p of this.weatherParticles) {
        const sparkAlpha = p.alpha * (0.35 + Math.sin(time * 2.5 + p.x * 0.01) * 0.20);
        ctx.fillStyle = isLight ? `rgba(217, 119, 6, ${Math.min(0.9, sparkAlpha * 0.9)})` : `rgba(255,200,80,${sparkAlpha * 0.5})`;
        ctx.shadowColor = isLight ? '#d97706' : '#ffaa00';
        ctx.shadowBlur = isLight ? 4 : 5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';

      ctx.restore();


    // === JÖTUNHEIM: AURORA BOREALIS, 3-TIER FROST MOUNTAINS, BLIZZARD ===

    } else if (this.realm === 'jotunheim') {
      ctx.save();

      // 1. Dynamic Aurora Borealis (Waving polar lights)
      ctx.globalCompositeOperation = 'lighter';
      for (let a = 0; a < 3; a++) {
        const aGrad = ctx.createLinearGradient(gridX, 0, w, h * 0.5);
        const aAlpha = 0.18 + Math.sin(time * 0.6 + a * 1.8) * 0.08;
        aGrad.addColorStop(0, `rgba(0, 229, 255, ${aAlpha})`);
        aGrad.addColorStop(0.5, `rgba(105, 240, 174, ${aAlpha * 0.8})`);
        aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(gridX, 0);
        for (let x = gridX; x <= w; x += 30) {
          const waveY = h * 0.15 + Math.sin(time * 1.2 + x * 0.008 + a) * 45 + Math.cos(time * 0.8 + x * 0.015) * 20;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // 2. Far Mountain Range (Icy peaks)
      ctx.fillStyle = isLight ? '#bfdbfe' : '#081829';
      ctx.beginPath();
      ctx.moveTo(gridX, h);
      ctx.lineTo(gridX + 50, h * 0.40);
      ctx.lineTo(gridX + 170, h * 0.65);
      ctx.lineTo(gridX + 310, h * 0.28);
      ctx.lineTo(gridX + 470, h * 0.55);
      ctx.lineTo(gridX + 600, h * 0.20);
      ctx.lineTo(w, h * 0.45);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 3. Mid Mountain Range (Snow-capped glaciers)
      ctx.fillStyle = isLight ? '#93c5fd' : '#10273f';
      ctx.beginPath();
      ctx.moveTo(gridX, h);
      ctx.lineTo(gridX + 110, h * 0.48);
      ctx.lineTo(gridX + 230, h * 0.72);
      ctx.lineTo(gridX + 390, h * 0.38);
      ctx.lineTo(gridX + 540, h * 0.65);
      ctx.lineTo(w, h * 0.42);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Snow Glaciers on Peaks
      ctx.fillStyle = 'rgba(224, 247, 250, 0.75)';
      ctx.beginPath();
      ctx.moveTo(gridX + 390, h * 0.38);
      ctx.lineTo(gridX + 360, h * 0.50);
      ctx.lineTo(gridX + 420, h * 0.50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(gridX + 110, h * 0.48);
      ctx.lineTo(gridX + 90, h * 0.56);
      ctx.lineTo(gridX + 130, h * 0.56);
      ctx.closePath();
      ctx.fill();

      // 4. Rolling Frost Mist Banks across the battlefield
      for (let i = 0; i < 3; i++) {
        const fogX = gridX + ((time * 35 + i * 260) % (w - gridX));
        const fogY = h * (0.35 + i * 0.22);
        const fGrad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, 200);
        fGrad.addColorStop(0, 'rgba(178, 235, 242, 0.16)');
        fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fGrad;
        ctx.fillRect(fogX - 200, fogY - 100, 400, 200);
      }

      // 5. Blizzard Snow Particles (Swirling white & cyan snowflakes)
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      for (const p of this.weatherParticles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = isLight ? `rgba(2, 132, 199, ${p.alpha * 0.7})` : `rgba(225, 245, 254, ${p.alpha})`;
        ctx.shadowColor = isLight ? '#38bdf8' : '#00e5ff';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    } else if (this.realm === 'asgard') {
      // Golden divine light beams & celestial feathers
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      for (let i = 0; i < 5; i++) {
        const shaftX = 380 + i * 130 + Math.sin(time * 0.4 + i) * 25;
        const sg = ctx.createLinearGradient(shaftX, 0, shaftX, h);
        sg.addColorStop(0, isLight ? 'rgba(245, 158, 11, 0.14)' : 'rgba(255, 235, 180, 0.18)');
        sg.addColorStop(0.6, isLight ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255, 213, 79, 0.06)');
        sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sg;
        ctx.fillRect(shaftX - 40, 0, 80, h);
      }
      for (const p of this.weatherParticles) {
        ctx.fillStyle = isLight ? `rgba(217, 119, 6, ${p.alpha * 0.8})` : `rgba(255, 224, 130, ${p.alpha})`;
        ctx.shadowColor = isLight ? '#f59e0b' : '#ffd54f';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (this.realm === 'helheim') {
      // Ghostly pale blue-grey souls
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      for (const p of this.weatherParticles) {
        ctx.fillStyle = isLight ? `rgba(100, 116, 139, ${p.alpha * 0.75})` : `rgba(144, 164, 174, ${p.alpha})`;
        ctx.shadowColor = isLight ? '#475569' : '#607d8b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      // Burning underworld embers / forge sparks
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      for (const p of this.weatherParticles) {
        const color = this.realm === 'svartalfheim'
          ? (isLight ? `rgba(217, 119, 6, ${p.alpha * 0.85})` : `rgba(255, 179, 0, ${p.alpha})`)
          : (isLight ? `rgba(220, 38, 38, ${p.alpha * 0.85})` : `rgba(255, 112, 67, ${p.alpha})`);
        const shadow = this.realm === 'svartalfheim' ? (isLight ? '#d97706' : '#ff8f00') : (isLight ? '#dc2626' : '#ff5722');
        ctx.fillStyle = color;
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (this.realm === 'vanaheim' || this.realm === 'alfheim') {
      // Bioluminescent floating spores or magical light motes
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      for (const p of this.weatherParticles) {
        const color = this.realm === 'alfheim'
          ? (isLight ? `rgba(219, 39, 119, ${p.alpha * 0.8})` : `rgba(255, 128, 171, ${p.alpha})`)
          : (isLight ? `rgba(22, 163, 74, ${p.alpha * 0.8})` : `rgba(129, 199, 132, ${p.alpha})`);
        const shadow = this.realm === 'alfheim' ? (isLight ? '#ec4899' : '#ff4081') : (isLight ? '#22c55e' : '#66bb6a');
        ctx.fillStyle = color;
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Cinematic God of War Bifrost Realm Travel Entrance Sequence
  drawRealmEntranceIntro() {
    if (this.realmEntranceTimer <= 0) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const entranceTimer = this.realmEntranceTimer;
    const progress = (2.8 - entranceTimer) / 2.8;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    let alpha = 1.0;
    if (progress < 0.2) alpha = progress / 0.2;
    else if (progress > 0.7) alpha = (1 - progress) / 0.3;

    ctx.save();
    // 1. Radiant Bifrost Flash
    if (progress < 0.35) {
      const flashAlpha = (1 - progress / 0.35) * 0.75;
      const fGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.85);
      fGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      fGrad.addColorStop(0.4, isLight ? `rgba(56, 189, 248, ${flashAlpha * 0.45})` : `rgba(0, 229, 255, ${flashAlpha * 0.65})`);
      fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. God of War Realm Crest Announcement
    const realmInfo: Record<string, { title: string; subtitle: string; runes: string; color: string; lightColor: string }> = {
      jotunheim:    { title: 'Jötunheim',    subtitle: 'Realm of the Frost Giants', runes: 'ᚦ ᛟ ᛏ ᚢ ᚾ ᚺ ᛖ ᛁ ᛗ', color: '#00e5ff', lightColor: '#0284c7' },
      asgard:       { title: 'Asgard',       subtitle: 'Realm of the Aesir Gods',   runes: 'ᚨ ᛊ ᚷ ᚨ ᚱ ᛞ',       color: '#ffd54f', lightColor: '#b45309' },
      helheim:      { title: 'Helheim',      subtitle: 'Realm of the Dead',         runes: 'ᚺ ᛖ ᛚ ᚺ ᛖ ᛁ ᛗ',       color: '#607d8b', lightColor: '#475569' },
      vanaheim:     { title: 'Vanaheim',     subtitle: 'Realm of the Vanir Gods',   runes: 'ᚹ ᚨ ᚾ ᚨ ᚺ ᛖ ᛁ ᛗ', color: '#66bb6a', lightColor: '#15803d' },
      midgard:      { title: 'Midgard',      subtitle: 'Realm of Mortals',          runes: 'ᛗ ᛁ ᛞ ᚷ ᚨ ᚱ ᛞ',       color: '#81c784', lightColor: '#0369a1' },
      alfheim:      { title: 'Alfheim',      subtitle: 'Realm of Light Elves',      runes: 'ᛉ ᛚ ᚠ ᚺ ᛖ ᛁ ᛗ',       color: '#ff80ab', lightColor: '#be185d' },
      svartalfheim: { title: 'Svartalfheim', subtitle: 'Realm of Dwarves',          runes: 'ᚲ ᚹ ᚨ ᚱ ᛏ ᚨ ᛚ ᚠ', color: '#ffb300', lightColor: '#c2410c' },
      niflheim:     { title: 'Niflheim',     subtitle: 'Realm of Ice and Mist',     runes: 'ᛁ ᚠ ᛚ ᚺ ᛖ ᛁ ᛗ',       color: '#b2ebf2', lightColor: '#0e7490' },
      muspelheim:   { title: 'Muspelheim',   subtitle: 'Realm of Fire',             runes: 'ᛊ ᚢ ᛊ ᛈ ᛖ ᛚ ᚺ',       color: '#ff3d00', lightColor: '#b91c1c' }
    };

    let info = realmInfo[this.realm] || realmInfo.midgard;
    
    // Copy info to avoid mutating the shared object
    info = { ...info };
    if (this.city) {
      const locKey = `loc_${this.city.replace(/-/g, '_')}_name`;
      const subKey = `loc_${this.city.replace(/-/g, '_')}_sub`;
      const transName = t(locKey);
      const transSub = t(subKey);
      const resolvedName = transName !== locKey ? transName : this.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const resolvedSub = transSub !== subKey ? transSub : info.subtitle;

      const dwarvenCityMeta: Record<string, { chapterKey: string; runes: string; color: string; lightColor: string }> = {
        'althjofs-wheel':   { chapterKey: 'prologue',    runes: 'ᚨ ᛚ ᛏ   ·   ᚲ ᚨ ᚾ ᚨ ᛚ',   color: '#14b8a6', lightColor: '#0f766e' },
        'andvaris-falls':   { chapterKey: 'chapter_ii',  runes: 'ᚨ ᚾ ᛞ ᚹ ᚨ ᚱ ᛁ ᛊ   ·   ᚠ ᚨ ᛚ ᛚ', color: '#38bdf8', lightColor: '#0284c7' },
        'ivaldis-workshop': { chapterKey: 'chapter_iii', runes: 'ᛁ ᚹ ᚨ ᛚ ᛞ ᛁ   ·   ᛊ ᛗ ᛁ ᛞ',     color: '#f59e0b', lightColor: '#b45309' },
        'jarnsmida-quarry': { chapterKey: 'chapter_iv',  runes: 'ᛃ ᚨ ᚱ ᚾ ᛊ ᛗ ᛁ ᛞ ᚨ',             color: '#fb923c', lightColor: '#c2410c' },
        'dvalins-depths':   { chapterKey: 'chapter_v',   runes: 'ᛞ ᚹ ᚨ ᛚ ᛁ ᚾ ᛊ   ·   ᛞ ᛖ ᛈ',     color: '#c084fc', lightColor: '#7e22ce' },
        'sindris-forge':    { chapterKey: 'chapter_vi',  runes: 'ᛊ ᛁ ᚾ ᛞ ᚱ ᛁ ᛊ   ·   ᚠ ᛟ ᚱ ᚷ ᛖ', color: '#f97316', lightColor: '#c2410c' },
        'nidavellir':       { chapterKey: 'chapter_vii', runes: 'ᚾ ᛁ ᛞ ᚨ ᚹ ᛖ ᛚ ᛚ ᛁ ᚱ',           color: '#ffaa00', lightColor: '#b45309' },
      };

      const dMeta = dwarvenCityMeta[this.city];
      if (dMeta) {
        const chapLabel = t(dMeta.chapterKey);
        info.title      = resolvedName;
        info.subtitle   = `${chapLabel} · ${resolvedSub}`;
        info.runes      = dMeta.runes;
        info.color      = dMeta.color;
        info.lightColor = dMeta.lightColor;
      } else {
        info.title = `${info.title} · ${resolvedName}`;
      }
    }

    const accentColor = isLight ? info.lightColor : info.color;

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    const cx = w / 2 + 100;
    const cy = h / 2 - 30;

    // Glowing ornamental banner box
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(10, 14, 20, 0.90)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = isLight ? 'rgba(15, 23, 42, 0.22)' : accentColor;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.roundRect(cx - 240, cy - 65, 480, 130, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Elder Futhark Runes
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.runes, cx, cy - 35);

    // Realm Title
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 30px "Outfit", "Inter", sans-serif';
    if (!isLight) {
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 18;
    }
    ctx.fillText(`✦ ${info.title} ✦`, cx, cy + 2);

    // Subtitle
    ctx.fillStyle = isLight ? '#475569' : 'rgba(220, 235, 250, 0.9)';
    ctx.font = '700 12px "Outfit", "Inter", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.shadowBlur = 0;
    ctx.fillText(info.subtitle, cx, cy + 36);

    ctx.restore();
  }

  drawSummoningPreview() {
    if (!this.selectedUnit || !this.hoverCell) return;
    const ctx = this.ctx;
    const { row, col } = this.hoverCell;
    const cellW = this.grid.cellWidth;
    const cellH = this.grid.cellHeight;
    const cx = this.grid.startX + col * cellW;
    const cy = row * cellH;

    const occupant = this.defenders.find(d => d.row === row && d.col === col);
    const isOccupied = !!occupant;
    const now = Date.now() / 1000;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    ctx.save();

    if (this.selectedUnit === 'shovel') {
      if (isOccupied) {
        // Demolition reticle around defender
        ctx.strokeStyle = isLight ? '#dc2626' : '#ff3d00';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = isLight ? 'rgba(220, 38, 38, 0.5)' : '#ff1744';
        ctx.shadowBlur = 15;
        
        ctx.strokeRect(cx + 8, cy + 8, cellW - 16, cellH - 16);
        
        // Corner demolition notches
        const cornerSize = 14;
        ctx.fillStyle = isLight ? '#dc2626' : '#ff3d00';
        // Top-left
        ctx.fillRect(cx + 4, cy + 4, cornerSize, 3);
        ctx.fillRect(cx + 4, cy + 4, 3, cornerSize);
        // Top-right
        ctx.fillRect(cx + cellW - 4 - cornerSize, cy + 4, cornerSize, 3);
        ctx.fillRect(cx + cellW - 7, cy + 4, 3, cornerSize);
        // Bottom-left
        ctx.fillRect(cx + 4, cy + cellH - 7, cornerSize, 3);
        ctx.fillRect(cx + 4, cy + cellH - 4 - cornerSize, 3, cornerSize);
        // Bottom-right
        ctx.fillRect(cx + cellW - 4 - cornerSize, cy + cellH - 7, cornerSize, 3);
        ctx.fillRect(cx + cellW - 7, cy + cellH - 4 - cornerSize, 3, cornerSize);

        // DEMOLISH text badge
        ctx.shadowBlur = 0;
        ctx.fillStyle = isLight ? 'rgba(254, 242, 242, 0.96)' : 'rgba(20, 10, 10, 0.9)';
        ctx.strokeStyle = isLight ? '#dc2626' : '#ff3d00';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx + cellW / 2 - 45, cy - 14, 90, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isLight ? '#b91c1c' : '#ff5252';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⛏️ ${t('remove') || 'Demolish'}`, cx + cellW / 2, cy - 3);
      }
    } else if (isOccupied) {
      // Red Ward Barrier - Placement Blocked
      ctx.fillStyle = isLight ? 'rgba(254, 226, 226, 0.45)' : 'rgba(211, 47, 47, 0.2)';
      ctx.strokeStyle = isLight ? 'rgba(220, 38, 38, 0.85)' : 'rgba(255, 82, 82, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#d32f2f';
      ctx.shadowBlur = isLight ? 8 : 12;
      ctx.beginPath();
      ctx.roundRect(cx + 6, cy + 6, cellW - 12, cellH - 12, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isLight ? '#b91c1c' : '#ff5252';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⛔ ${t('occupied')}`, cx + cellW / 2, cy + cellH / 2);
    } else {
      // Valid Placement: Glowing Norse Rune Circle (Cyan for Towers/Siege/Ordnance, Green for Plants)
      const defenderInfo = getDefenderInfo(this.selectedUnit, this.realm);
      const isTower = defenderInfo?.category !== 'plants';
      const pulse = (Math.sin(now * 4) + 1) / 2;

      const ringColor = isTower
        ? (isLight ? `rgba(2, 132, 199, ${0.7 + pulse * 0.3})` : `rgba(56, 189, 248, ${0.6 + pulse * 0.4})`)
        : (isLight ? `rgba(22, 163, 74, ${0.7 + pulse * 0.3})` : `rgba(129, 199, 132, ${0.6 + pulse * 0.4})`);
      const glowColor = isTower ? (isLight ? '#0284c7' : '#38bdf8') : (isLight ? '#16a34a' : '#81c784');

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14 + pulse * 10;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2;

      // Outer tile highlight
      ctx.fillStyle = isTower
        ? (isLight ? `rgba(2, 132, 199, ${0.08 + pulse * 0.06})` : `rgba(56, 189, 248, ${0.12 + pulse * 0.08})`)
        : (isLight ? `rgba(22, 163, 74, ${0.08 + pulse * 0.06})` : `rgba(76, 175, 80, ${0.12 + pulse * 0.08})`);
      ctx.beginPath();
      ctx.roundRect(cx + 6, cy + 6, cellW - 12, cellH - 12, 10);
      ctx.fill();
      ctx.stroke();

      // Rotating Runic Circle on Tile Floor
      const centerX = cx + cellW / 2;
      const centerY = cy + cellH / 2;
      const radius = 32;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(now * 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isTower
        ? (isLight ? 'rgba(2, 132, 199, 0.75)' : 'rgba(56, 189, 248, 0.75)')
        : (isLight ? 'rgba(180, 83, 9, 0.75)' : 'rgba(212, 175, 55, 0.7)');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Elder Futhark compass runes
      ctx.fillStyle = isLight
        ? (isTower ? '#0369a1' : '#854d0e')
        : (isTower ? 'rgba(224, 242, 254, 0.9)' : 'rgba(255, 215, 0, 0.85)');
      ctx.font = 'bold 11px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ['ᚱ', 'ᚨ', 'ᚷ', 'ᚾ', 'ᚨ', 'ᚱ'].forEach((rune, idx) => {
        const angle = (idx * Math.PI) / 3;
        const rx = Math.cos(angle) * (radius - 8);
        const ry = Math.sin(angle) * (radius - 8);
        ctx.fillText(rune, rx, ry);
      });
      ctx.restore();

      // Attack Trajectory Guide Arrow down the row
      if (!this.selectedUnit.startsWith('sunflower') && this.selectedUnit !== 'wallnut' && this.selectedUnit !== 'potatomine') {
        ctx.save();
        ctx.strokeStyle = isTower
          ? (isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(56, 189, 248, 0.4)')
          : (isLight ? 'rgba(22, 163, 74, 0.4)' : 'rgba(129, 199, 132, 0.35)');
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(centerX + 30, centerY);
        ctx.lineTo(this.width - 20, centerY);
        ctx.stroke();
        ctx.restore();
      }

      // Ethereal Ghost Silhouette of Defender / Tower Name
      ctx.globalAlpha = 0.85 + pulse * 0.15;
      ctx.fillStyle = isLight
        ? (isTower ? '#0369a1' : '#15803d')
        : (isTower ? '#38bdf8' : '#81c784');
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const unitName = defenderInfo ? defenderInfo.name : (this.selectedUnit.charAt(0).toUpperCase() + this.selectedUnit.slice(1));
      const actionTemplate = isTower ? (t('action_build') || '✦ Build {name} ✦') : (t('action_plant') || '✦ Plant {name} ✦');
      const actionLabel = actionTemplate.replace('{name}', unitName);
      ctx.fillText(actionLabel, centerX, cy + cellH - 12);
    }

    ctx.restore();
  }

  drawStatusAilments() {
    const ctx = this.ctx;
    const now = Date.now() / 1000;

    for (const zombie of this.attackers) {
      const zcx = zombie.x + zombie.width / 2;
      const zcy = zombie.y + zombie.height / 2;

      // 1. Slowed / Frozen Effect: Frost spikes and cyan chill aura
      if (zombie.isSlowed) {
        ctx.save();
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.85)';
        
        // Ice crystal spikes around base and head
        [-15, 0, 15].forEach((offset, idx) => {
          const spikeH = 8 + (idx % 2) * 5;
          ctx.beginPath();
          ctx.moveTo(zcx + offset - 4, zombie.y + zombie.height);
          ctx.lineTo(zcx + offset, zombie.y + zombie.height - spikeH);
          ctx.lineTo(zcx + offset + 4, zombie.y + zombie.height);
          ctx.closePath();
          ctx.fill();
        });

        // Frost particle motes
        ctx.fillStyle = '#84ffff';
        for (let i = 0; i < 3; i++) {
          const fx = zcx + Math.sin(now * 3 + i * 2) * 20;
          const fy = zcy + Math.cos(now * 3 + i * 2) * 25;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Stunned / Buttered: Spinning stars above head
      if (zombie.isStunned) {
        ctx.save();
        ctx.shadowColor = '#ffd54f';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fff59d';

        // Butter slab on head
        ctx.fillRect(zcx - 10, zombie.y - 12, 20, 10);
        ctx.strokeStyle = '#fbc02d';
        ctx.lineWidth = 1;
        ctx.strokeRect(zcx - 10, zombie.y - 12, 20, 10);

        // 3 Spinning golden stars
        for (let i = 0; i < 3; i++) {
          const angle = now * 4 + (i * Math.PI * 2) / 3;
          const sx = zcx + Math.cos(angle) * 16;
          const sy = zombie.y - 18 + Math.sin(angle) * 6;
          
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 12px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', sx, sy);
        }
        ctx.restore();
      }
    }
  }

  drawDyingEnemies() {
    if (this.dyingEnemies.length === 0) return;
    const ctx = this.ctx;
    for (let i = 0; i < this.dyingEnemies.length; i++) {
      const de = this.dyingEnemies[i];
      const p = Math.min(1, de.timer / de.duration);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p * 0.94);
      de.attacker.draw(ctx);
      ctx.restore();

      // Rising Norse soul-wisp banishment mote
      const wispAlpha = Math.max(0, (1 - p) * 0.85);
      if (wispAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = wispAlpha;
        ctx.fillStyle = de.soulColor;
        ctx.shadowColor = de.soulColor;
        ctx.shadowBlur = 10;
        const driftX = de.soulX + Math.sin(de.timer * 0.018) * 5;
        ctx.beginPath();
        ctx.arc(driftX, de.soulY, 3.6 * (1 - p * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  drawBattleDebris() {
    if (this.battleDebris.length === 0) return;
    const ctx = this.ctx;
    for (let i = 0; i < this.battleDebris.length; i++) {
      const db = this.battleDebris[i];
      const alpha = Math.max(0, 1 - Math.max(0, (db.life - db.maxLife * 0.65) / (db.maxLife * 0.35)));
      if (alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(db.x, db.y);
      ctx.rotate(db.rot);
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.2;

      switch (db.kind) {
        case 'tower_shield': {
          ctx.fillStyle = '#0f766e';
          ctx.beginPath();
          ctx.roundRect(-7, -14, 14, 28, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'iron_bucket': {
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.roundRect(-8, -7, 16, 14, 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'bronze_cone': {
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 7);
          ctx.lineTo(-8, 7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'spear': {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(-14, 0);
          ctx.lineTo(10, 0);
          ctx.stroke();
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(-14, -3);
          ctx.lineTo(-22, 0);
          ctx.lineTo(-14, 3);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'axe': {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(-8, 6);
          ctx.lineTo(6, -6);
          ctx.stroke();
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(5, -5, 5.5, 0.3, 2.5);
          ctx.lineTo(4, -5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'mace': {
          ctx.strokeStyle = '#57534e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-8, 5);
          ctx.lineTo(5, -5);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(6, -6, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'club': {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(-10, -3.5, 20, 7, 3);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'crag_stone': {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(-6, -4);
          ctx.lineTo(2, -6);
          ctx.lineTo(7, 1);
          ctx.lineTo(1, 6);
          ctx.lineTo(-6, 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'sword':
        default: {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-11, -1.8, 16, 3.6);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(4, -4.5, 2.5, 9);
          break;
        }
      }
      ctx.restore();
    }
  }

  drawFloatingTexts() {
    if (this.floatingTexts.length === 0) return;
    const ctx = this.ctx;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ctx.globalAlpha = ft.alpha;
      const isWhiteText = ft.color.toLowerCase() === '#ffffff' || ft.color.toLowerCase() === '#fff';
      const fillColor = (isLight && isWhiteText) ? '#0f172a' : ft.color;
      ctx.strokeStyle = (isLight && isWhiteText) ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.85)';
      ctx.shadowColor = (isLight && isWhiteText) ? 'rgba(255, 255, 255, 0.8)' : ft.color;
      ctx.shadowBlur = ft.isCritical ? 16 : 8;
      ctx.fillStyle = fillColor;
      ctx.font = ft.isCritical
        ? 'bold 20px "Outfit", "Inter", sans-serif'
        : 'bold 15px "Outfit", "Inter", sans-serif';
      ctx.lineWidth = ft.isCritical ? 4 : 2.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  drawIncomingLaneWarnings() {
    if (this.gameState !== 'playing' || this.laneWarnings.length === 0 || !this.grid) return;
    const ctx = this.ctx;
    const w = this.width;
    const now = performance.now();
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    ctx.save();
    for (let i = 0; i < this.laneWarnings.length; i++) {
      const warning = this.laneWarnings[i];
      if (warning.row < 0 || warning.row >= this.grid.rows) continue;

      const rowTop = warning.row * this.grid.cellHeight;
      const rowH = this.grid.cellHeight;
      const cy = rowTop + rowH * 0.5;
      const elapsed = Math.max(0, warning.maxTimer - warning.timer);
      const fadeIn = Math.min(1, elapsed / 220);
      const fadeOut = Math.min(1, warning.timer / 320);
      const alpha = Math.max(0, Math.min(1, fadeIn * fadeOut));
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.011 + warning.row);

      ctx.save();
      ctx.globalAlpha = alpha;

      // Subtle incoming lane edge wash
      const bandW = 78;
      const bandGrad = ctx.createLinearGradient(w - bandW, cy, w, cy);
      bandGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      if (warning.isHeavy) {
        bandGrad.addColorStop(1, isLight ? `rgba(220, 38, 38, ${0.22 * pulse})` : `rgba(239, 68, 68, ${0.3 * pulse})`);
      } else {
        bandGrad.addColorStop(1, isLight ? `rgba(217, 119, 6, ${0.2 * pulse})` : `rgba(245, 158, 11, ${0.26 * pulse})`);
      }
      ctx.fillStyle = bandGrad;
      ctx.fillRect(w - bandW, rowTop + 4, bandW, Math.max(12, rowH - 8));

      // Norse watchman lane-call badge
      const bx = w - 26 + Math.sin(now * 0.012) * 2.5;
      const borderColor = warning.isHeavy
        ? (isLight ? '#dc2626' : '#ff5252')
        : (isLight ? '#d97706' : '#fbbf24');

      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 36, 0.92)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = 12 * pulse;

      ctx.beginPath();
      ctx.roundRect(bx - 20, cy - 14, 40, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(warning.isHeavy ? '« ⚠' : '« ⚔', bx, cy + 0.5);

      ctx.restore();
    }
    ctx.restore();
  }

  drawWaveBanner() {
    if (this.waveBannerTimer <= 0) return;
    const ctx = this.ctx;
    const w = this.width;
    const cx = this.grid ? (this.grid.startX + (this.width - this.grid.startX) / 2) : (w / 2);
    const isMajorOrFinal = this.waveBannerKind === 'major' || this.waveBannerKind === 'final';
    const maxTimer = Math.max(0.6, this.waveBannerMaxTimer);
    const elapsed = Math.max(0, maxTimer - this.waveBannerTimer);
    const fadeIn = Math.min(1, elapsed / 0.25);
    const fadeOut = Math.min(1, this.waveBannerTimer / 0.55);
    const alpha = Math.max(0, Math.min(1, fadeIn * fadeOut));
    const cy = 56 - (1 - fadeIn) * 10;
    const availableW = this.grid ? Math.max(300, w - this.grid.startX - 36) : Math.max(300, w - 36);
    const boxW = Math.min(540, availableW);
    const boxH = 64;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    ctx.save();
    ctx.globalAlpha = alpha;

    // Alert / Wave Call Tablet
    if (isMajorOrFinal) {
      ctx.fillStyle = isLight ? 'rgba(255, 241, 242, 0.96)' : 'rgba(25, 10, 10, 0.92)';
      ctx.strokeStyle = isLight ? '#dc2626' : '#ff3d00';
      ctx.shadowColor = isLight ? 'rgba(220, 38, 38, 0.35)' : '#ff1744';
      ctx.shadowBlur = 28;
    } else {
      ctx.fillStyle = isLight ? 'rgba(255, 251, 235, 0.96)' : 'rgba(14, 22, 34, 0.92)';
      ctx.strokeStyle = isLight ? '#d97706' : '#f59e0b';
      ctx.shadowColor = isLight ? 'rgba(217, 119, 6, 0.28)' : 'rgba(245, 158, 11, 0.45)';
      ctx.shadowBlur = 20;
    }
    ctx.lineWidth = isMajorOrFinal ? 3 : 2.2;

    ctx.beginPath();
    ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Runic wave counter header
    const headerText = this.waveBannerHeader || 'ᚱ ᚨ ᚷ ᚾ ᚨ ᚱ ᛟ ᚲ   ·   ᚹ ᚨ ᚱ ᚾ ᛁ ᚾ ᚷ';
    ctx.shadowBlur = 0;
    ctx.fillStyle = isMajorOrFinal
      ? (isLight ? '#b91c1c' : '#ff6b6b')
      : (isLight ? '#b45309' : '#fbbf24');
    ctx.font = 'bold 11.5px "Outfit", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(headerText, cx, cy - 14);

    // Main Wave Callout Text (auto-fitted to tablet width)
    ctx.fillStyle = isMajorOrFinal
      ? (isLight ? '#7f1d1d' : '#ffffff')
      : (isLight ? '#0f172a' : '#f8fafc');
    let fontSize = isMajorOrFinal ? 17.5 : 16.5;
    ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;
    while (fontSize > 11.5 && ctx.measureText(this.waveBannerText).width > boxW - 36) {
      fontSize -= 0.5;
      ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;
    }
    if (!isLight) {
      ctx.shadowColor = isMajorOrFinal ? '#ff5722' : 'rgba(245, 158, 11, 0.55)';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fillText(this.waveBannerText, cx, cy + 11);

    ctx.restore();
  }

  drawVictoryDefeatOverlays() {
    if (this.gameState === 'playing') return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    ctx.save();

    if (this.gameState === 'defeat') {
      // Defeat backdrop
      const defGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.7);
      if (isLight) {
        defGrad.addColorStop(0, 'rgba(254, 226, 226, 0.75)');
        defGrad.addColorStop(1, 'rgba(127, 29, 29, 0.65)');
      } else {
        defGrad.addColorStop(0, 'rgba(40, 10, 10, 0.85)');
        defGrad.addColorStop(1, 'rgba(10, 2, 2, 0.95)');
      }
      ctx.fillStyle = defGrad;
      ctx.fillRect(0, 0, w, h);

      // Carved Norse Stone Tablet
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(15, 20, 28, 0.96)';
      ctx.strokeStyle = isLight ? '#dc2626' : '#d32f2f';
      ctx.lineWidth = 3;
      ctx.shadowColor = isLight ? 'rgba(185, 28, 28, 0.35)' : '#ff1744';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.roundRect(cx - 220, cy - 140, 440, 260, 16);
      ctx.fill();
      ctx.stroke();

      // Skull Runes
      ctx.fillStyle = isLight ? '#b91c1c' : '#ff5252';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ᛞ ᛖ ᚨ ᚦ   ·   ᚱ ᚨ ᚷ ᚾ ᚨ ᚱ ᛟ ᚲ', cx, cy - 105);

      // Main Title
      ctx.fillStyle = isLight ? '#7f1d1d' : '#ffffff';
      ctx.font = 'bold 26px "Outfit", "Inter", sans-serif';
      if (!isLight) {
        ctx.shadowColor = '#d32f2f';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillText('Realm has fallen', cx, cy - 65);

      // Description
      ctx.fillStyle = isLight ? '#334155' : 'rgba(220, 200, 200, 0.85)';
      ctx.font = '500 13px "Outfit", sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText('The fortress defenses were breached by the invaders.', cx, cy - 25);
      ctx.fillText(`Monsters Cleared: ${this.zombiesKilled} / ${this.zombiesTotal}`, cx, cy - 5);

      // Buttons
      // 1. Retry Button (Left)
      ctx.fillStyle = isLight ? '#dc2626' : 'rgba(183, 28, 28, 0.85)';
      ctx.strokeStyle = isLight ? '#b91c1c' : '#ff5252';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 140, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillText('↺ Retry', cx - 75, cy + 62);

      // 2. Realms / Realm Map Button (Right)
      const defeatReturnLabel = (this.realm === 'svartalfheim' && this.city) ? t('return_to_map') : '« Realms';
      ctx.fillStyle = isLight ? '#f1f5f9' : 'rgba(38, 50, 56, 0.85)';
      ctx.strokeStyle = isLight ? '#0284c7' : 'rgba(212, 175, 55, 0.6)';
      ctx.beginPath();
      ctx.roundRect(cx + 10, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isLight ? '#0f172a' : '#e0e0e0';
      ctx.fillText(defeatReturnLabel, cx + 75, cy + 62);

    } else if (this.gameState === 'victory') {
      // Victory: Golden Celestial Bifrost Backdrop
      const vicGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.7);
      if (isLight) {
        vicGrad.addColorStop(0, 'rgba(254, 243, 199, 0.75)');
        vicGrad.addColorStop(1, 'rgba(6, 78, 59, 0.6)');
      } else {
        vicGrad.addColorStop(0, 'rgba(20, 35, 20, 0.85)');
        vicGrad.addColorStop(1, 'rgba(4, 12, 6, 0.95)');
      }
      ctx.fillStyle = vicGrad;
      ctx.fillRect(0, 0, w, h);

      // Carved Norse Stone Tablet
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(15, 24, 20, 0.96)';
      ctx.strokeStyle = isLight ? '#d97706' : '#ffd54f';
      ctx.lineWidth = 3;
      ctx.shadowColor = isLight ? 'rgba(217, 119, 6, 0.35)' : '#ffb300';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.roundRect(cx - 220, cy - 140, 440, 260, 16);
      ctx.fill();
      ctx.stroke();

      // Golden Runes
      ctx.fillStyle = isLight ? '#b45309' : '#ffd54f';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ᚹ ᛁ ᚲ ᛏ ᛟ ᚱ ᛁ   ·   ᛊ ᛖ ᚲ ᚢ ᚱ ᛖ', cx, cy - 105);

      // Main Title
      ctx.fillStyle = isLight ? '#065f46' : '#ffffff';
      ctx.font = 'bold 26px "Outfit", "Inter", sans-serif';
      if (!isLight) {
        ctx.shadowColor = '#ffd54f';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillText('✦ Realm Secured ✦', cx, cy - 65);

      // Description
      const currencyLabel = getRealmCurrencyName(this.realm);
      ctx.fillStyle = isLight ? '#334155' : 'rgba(200, 240, 210, 0.85)';
      ctx.font = '500 13px "Outfit", sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText('All invading waves have been repelled by Odin\'s defense!', cx, cy - 25);
      ctx.fillText(`Victory Bonus: +500 ${currencyLabel} · Total Defeated: ${this.zombiesKilled}`, cx, cy - 5);

      // Buttons
      // 1. Next Level (if unlocked) or Play Again Button (Left)
      const nextUnlockedCity = (this.realm === 'svartalfheim' && this.city)
        ? MapMenu.getNextUnlockedCity(this.city)
        : null;
      const victoryLeftLabel = nextUnlockedCity ? '✦ Next Level' : `↺ ${t('play_again')}`;
      ctx.fillStyle = isLight ? '#15803d' : 'rgba(46, 125, 50, 0.85)';
      ctx.strokeStyle = isLight ? '#166534' : '#81c784';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 140, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      let leftBtnFontSize = 13;
      ctx.font = `bold ${leftBtnFontSize}px "Outfit", sans-serif`;
      while (leftBtnFontSize > 10.5 && ctx.measureText(victoryLeftLabel).width > 116) {
        leftBtnFontSize -= 0.5;
        ctx.font = `bold ${leftBtnFontSize}px "Outfit", sans-serif`;
      }
      ctx.fillText(victoryLeftLabel, cx - 75, cy + 62);

      // 2. Realms / Realm Map Button (Right)
      const victoryReturnLabel = (this.realm === 'svartalfheim' && this.city) ? t('return_to_map') : '« Realms';
      ctx.fillStyle = isLight ? '#f1f5f9' : 'rgba(38, 50, 56, 0.85)';
      ctx.strokeStyle = isLight ? '#0284c7' : 'rgba(212, 175, 55, 0.6)';
      ctx.beginPath();
      ctx.roundRect(cx + 10, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isLight ? '#0f172a' : '#e0e0e0';
      ctx.fillText(victoryReturnLabel, cx + 75, cy + 62);
    }

    ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    
    // Apply Screen Shake if active
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeMagnitude;
      shakeY = (Math.random() - 0.5) * this.shakeMagnitude;
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }

    // Dynamic realm base backdrop (cached)
    ctx.fillStyle = this.getBgGradient(ctx);
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw living realm weather, mountains, and atmospheric lighting
    this.drawAtmosphere();

    this.drawCastle();
    this.grid.draw(ctx);
    
    for (let i = 0; i < this.valkyries.length; i++) this.valkyries[i].draw(ctx);
    for (let i = 0; i < this.defenders.length; i++) this.defenders[i].draw(ctx);
    this.drawDyingEnemies();
    for (let i = 0; i < this.attackers.length; i++) this.attackers[i].draw(ctx);
    this.drawBattleDebris();
    this.drawStatusAilments();
    for (let i = 0; i < this.projectiles.length; i++) this.projectiles[i].draw(ctx);
    this.particles.draw(ctx);

    // Draw summoning hologram and grid hover previews
    this.drawSummoningPreview();

    // Draw floating combat numbers & Sol floaters
    this.drawFloatingTexts();

    // Draw cinematic Bifrost entrance sequence
    this.drawRealmEntranceIntro();

    // Draw incoming enemy lane call markers & wave alert banner
    this.drawIncomingLaneWarnings();
    this.drawWaveBanner();

    // Draw victory / defeat overlays
    this.drawVictoryDefeatOverlays();

    if (this.shakeTimer > 0) {
      ctx.restore();
    }
  }

  getBgGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';
    const currentTheme = isLight ? 'light' : 'dark';
    if (
      this.cachedBgGradient &&
      this.cachedBgTheme === currentTheme &&
      this.cachedBgWidth === this.width &&
      this.cachedBgHeight === this.height &&
      this.cachedBgRealm === this.realm &&
      this.cachedBgCity === this.city
    ) {
      return this.cachedBgGradient;
    }

    const bgGradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.width
    );
    if (isLight) {
      if (this.realm === 'asgard') {
        bgGradient.addColorStop(0, '#fef9c3');
        bgGradient.addColorStop(1, '#fde68a');
      } else if (this.realm === 'helheim') {
        bgGradient.addColorStop(0, '#f1f5f9');
        bgGradient.addColorStop(1, '#cbd5e1');
      } else if (this.realm === 'vanaheim') {
        bgGradient.addColorStop(0, '#ecfdf5');
        bgGradient.addColorStop(1, '#a7f3d0');
      } else if (this.realm === 'jotunheim') {
        bgGradient.addColorStop(0, '#f0f9ff');
        bgGradient.addColorStop(1, '#bae6fd');
      } else if (this.isDwarvenWaterwayCity()) {
        if (this.city === 'andvaris-falls') {
          bgGradient.addColorStop(0, '#f0f9ff');
          bgGradient.addColorStop(0.5, '#e0f2fe');
          bgGradient.addColorStop(1, '#bae6fd');
        } else {
          bgGradient.addColorStop(0, '#f0fdfa');
          bgGradient.addColorStop(0.5, '#ccfbf1');
          bgGradient.addColorStop(1, '#99f6e4');
        }
      } else if (this.isDwarvenForgeCity()) {
        bgGradient.addColorStop(0, '#fffbeb');
        bgGradient.addColorStop(0.6, '#fef3c7');
        bgGradient.addColorStop(1, '#fde68a');
      } else if (this.realm === 'muspelheim') {
        bgGradient.addColorStop(0, '#fff7ed');
        bgGradient.addColorStop(1, '#fed7aa');
      } else {
        bgGradient.addColorStop(0, '#f8fafc');
        bgGradient.addColorStop(1, '#e2e8f0');
      }
    } else {
      if (this.realm === 'asgard') {
        bgGradient.addColorStop(0, '#2e2410');
        bgGradient.addColorStop(1, '#0e0b04');
      } else if (this.realm === 'helheim') {
        bgGradient.addColorStop(0, '#192730');
        bgGradient.addColorStop(1, '#05080a');
      } else if (this.realm === 'vanaheim') {
        bgGradient.addColorStop(0, '#152d1d');
        bgGradient.addColorStop(1, '#051108');
      } else if (this.realm === 'jotunheim') {
        bgGradient.addColorStop(0, '#0c2338');
        bgGradient.addColorStop(1, '#030b13');
      } else if (this.isDwarvenWaterwayCity()) {
        bgGradient.addColorStop(0, '#0d191d');
        bgGradient.addColorStop(0.5, '#081013');
        bgGradient.addColorStop(1, '#030608');
      } else if (this.isDwarvenForgeCity()) {
        bgGradient.addColorStop(0, '#1a2218');
        bgGradient.addColorStop(0.6, '#101610');
        bgGradient.addColorStop(1, '#070c07');
      } else {
        bgGradient.addColorStop(0, '#1b2838');
        bgGradient.addColorStop(1, '#0b131c');
      }
    }

    this.cachedBgGradient = bgGradient;
    this.cachedBgWidth = this.width;
    this.cachedBgHeight = this.height;
    this.cachedBgRealm = this.realm;
    this.cachedBgCity = this.city;
    this.cachedBgTheme = currentTheme;
    return bgGradient;
  }

  loop = (timestamp: number) => {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.isPaused) {
      this.update(Math.min(deltaTime, 100));
      this.draw();
    }

    this.animationId = requestAnimationFrame(this.loop);
  }

  start() {
    this.lastTime = performance.now();
    cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(this.loop);
  }
  
  resize(width: number, height: number) {
    this.grid = new Grid(width, height, this.realm, this.city);
    this.cachedBgGradient = null;
    this.cachedCastleCanvas = null;
  }
  
  stop() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('languagechange', this.handleLanguageChange);
    window.removeEventListener('infiniteresourcessettingchanged', this.handleInfiniteResourcesSettingChange);
    window.removeEventListener('levelconfigchanged', this.handleInfiniteResourcesSettingChange);
    window.removeEventListener('ragnarok-theme-changed', this.handleThemeChange);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('click', this.handleCanvasClick);
    this.particles.clear();
    cancelAnimationFrame(this.animationId);
  }
}
