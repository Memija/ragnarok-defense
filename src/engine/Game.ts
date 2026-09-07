import { Grid } from './Grid';
import { Defender } from '../entities/Defender';
import { Attacker } from '../entities/Attacker';
import { Projectile } from '../entities/Projectile';
import { Resource } from '../entities/Resource';
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
import { Butter } from '../units/Butter';
import { Troll } from '../units/Troll';
import { SmallTroll } from '../units/SmallTroll';
import { SoundManager } from './SoundManager';

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

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid: Grid;
  lastTime: number = 0;
  animationId: number = 0;
  realm: string = 'midgard';
  city?: string;
  
  sun: number = 1000;
  level: number = 1;
  selectedUnit: string | null = null;
  
  defenders: Defender[] = [];
  attackers: Attacker[] = [];
  projectiles: Projectile[] = [];
  resources: Resource[] = [];
  valkyries: Valkyrie[] = [];
  valkyrieAvailable: boolean[] = [];
  odinCommandTimer: number = 0;
  fortressImg: HTMLImageElement;
  
  particles: ParticleSystem = new ParticleSystem();
  weatherParticles: WeatherParticle[] = [];
  floatingTexts: FloatingText[] = [];

  // Screen shake FX
  shakeTimer: number = 0;
  shakeMagnitude: number = 0;

  // Grid hover & summoning preview
  hoverCell: { row: number; col: number } | null = null;
  mouseX: number = -1000;
  mouseY: number = -1000;

  // Wave warning alert
  waveBannerTimer: number = 0;
  waveBannerText: string = '';
  waveAnnounced: boolean = false;

  // Game state & statistics
  gameState: 'playing' | 'victory' | 'defeat' = 'playing';
  zombiesSpawned: number = 0;
  zombiesTotal: number = 12;
  zombiesKilled: number = 0;
  victoryTimer: number = 0;
  defeatTimer: number = 0;
  
  // Cinematic Bifrost entrance transition
  realmEntranceTimer: number = 2.8;

  zombieSpawnTimer: number = 0;
  zombieSpawnInterval: number = 5000;
  
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, realm: string = 'midgard', city?: string) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.realm = realm;
    this.city = city;
    this.grid = new Grid(canvas.width, canvas.height, realm);

    this.fortressImg = new Image();
    this.fortressImg.src = '/asgard_fortress.png';

    this.zombiesTotal = 10 + this.level * 5;

    for (let r = 0; r < this.grid.rows; r++) {
      this.valkyrieAvailable.push(true);
    }

    this.initWeather();
    this.bindEvents();
    this.updateUI();
  }

  initWeather() {
    this.weatherParticles = [];
    const count = this.realm === 'jotunheim' ? 160 : 80;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push(this.createWeatherParticle(true));
    }
  }

  createWeatherParticle(randomY = false): WeatherParticle {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    if (this.realm === 'jotunheim' || this.realm === 'niflheim') {
      // Blizzard/Ice mist: Snowflakes & ice crystals drifting rapidly
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10,
        vx: -3.0 - Math.random() * 5.0,
        vy: 1.5 + Math.random() * 3.5,
        size: 1.5 + Math.random() * 3.8,
        alpha: 0.4 + Math.random() * 0.55,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.09
      };
    } else if (this.realm === 'asgard') {
      // Golden divine light motes & feathers floating gently
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.6 - Math.random() * 1.2,
        size: 2.0 + Math.random() * 3.0,
        alpha: 0.3 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.03
      };
    } else if (this.realm === 'helheim') {
      // Ghostly wisps
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 1.5,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.02
      };
    } else if (this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      // Burning embers or forge sparks
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.2 - Math.random() * 3.5,
        size: 1.8 + Math.random() * 3.2,
        alpha: 0.4 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.05
      };
    } else if (this.realm === 'vanaheim' || this.realm === 'alfheim') {
      // Glowing spores, drifting autumn leaves, or light magic motes
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10,
        vx: 0.8 + Math.random() * 1.5,
        vy: 0.8 + Math.random() * 1.5,
        size: 2.5 + Math.random() * 4.0,
        alpha: 0.4 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.06
      };
    } else {
      // Midgard: Dandelion seeds & pollen drifting in wind
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10,
        vx: 0.5 + Math.random() * 1.0,
        vy: 0.6 + Math.random() * 1.0,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.04
      };
    }
  }

  updateUI() {
    const sunCountEl = document.getElementById('sun-count');
    if (sunCountEl) {
      sunCountEl.textContent = this.sun.toString();
    }
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
      levelDisplay.textContent = this.level.toString();
    }
    
    const unitCards = document.querySelectorAll('.unit-card');
    unitCards.forEach(card => {
      const el = card as HTMLElement;
      const cost = parseInt(el.dataset.cost || '0', 10);
      if (this.sun < cost) {
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
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      scale: isCritical ? 1.4 : 1.0,
      life: 0,
      maxLife: isCritical ? 1200 : 900,
      vy: isCritical ? -1.8 : -1.2,
      isCritical
    });
  }

  triggerScreenShake(duration: number, magnitude: number) {
    this.shakeTimer = duration;
    this.shakeMagnitude = magnitude;
  }

  triggerWaveBanner(text: string = '⚔️ Incoming Horde of Invaders ⚔️') {
    this.waveBannerText = text;
    this.waveBannerTimer = 3.5;
    this.triggerScreenShake(800, 8);
    SoundManager.getInstance().playWave();
  }

  handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    const unitCards = Array.from(document.querySelectorAll('.unit-card')) as HTMLElement[];
    
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
      const shovelCard = unitCards.find(c => c.dataset.unit === 'shovel');
      if (shovelCard) shovelCard.click();
    } else if (key === 'ESCAPE') {
      // Deselect unit
      unitCards.forEach(c => c.classList.remove('selected'));
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

  bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);

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

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;

      const cell = this.grid.getCellFromCoordinates(this.mouseX, this.mouseY);
      this.hoverCell = cell ? { row: cell.row, col: cell.col } : null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverCell = null;
      this.mouseX = -1000;
      this.mouseY = -1000;
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Handle Victory / Defeat Button Clicks
      if (this.gameState === 'defeat' || this.gameState === 'victory') {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        // Retry / Next button bounds: cx - 140, cy + 40, w 130, h 45
        if (x >= cx - 140 && x <= cx - 10 && y >= cy + 40 && y <= cy + 85) {
          SoundManager.getInstance().playClick();
          if (this.gameState === 'victory') {
            this.level++;
          }
          this.restartBattle();
          return;
        }
        // Return button bounds: cx + 10, cy + 40, w 130, h 45
        if (x >= cx + 10 && x <= cx + 140 && y >= cy + 40 && y <= cy + 85) {
          SoundManager.getInstance().playClick();
          const returnBtn = document.getElementById('return-btn');
          if (returnBtn) returnBtn.click();
          return;
        }
      }

      const cell = this.grid.getCellFromCoordinates(x, y);
      if (cell && this.selectedUnit) {
        this.placeUnit(cell.row, cell.col, this.selectedUnit);
      }
    });

    const levelUpBtn = document.getElementById('level-up');
    const levelDownBtn = document.getElementById('level-down');
    
    if (levelUpBtn) {
      levelUpBtn.addEventListener('click', () => {
        SoundManager.getInstance().playClick();
        this.level++;
        this.zombiesTotal = 10 + this.level * 5;
        this.updateUI();
      });
    }
    
    if (levelDownBtn) {
      levelDownBtn.addEventListener('click', () => {
        if (this.level > 1) {
          SoundManager.getInstance().playClick();
          this.level--;
          this.zombiesTotal = 10 + this.level * 5;
          this.updateUI();
        }
      });
    }
  }

  restartBattle() {
    this.gameState = 'playing';
    this.zombiesSpawned = 0;
    this.zombiesKilled = 0;
    this.waveAnnounced = false;
    this.defenders = [];
    this.attackers = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.sun = 1000;
    for (let r = 0; r < this.grid.rows; r++) {
      this.valkyrieAvailable[r] = true;
    }
    this.realmEntranceTimer = 2.5;
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
        
        const unitCards = document.querySelectorAll('.unit-card');
        unitCards.forEach(c => c.classList.remove('selected'));
        this.selectedUnit = null;
      }
      return;
    }

    if (isOccupied) return;

    let unit: Defender | null = null;
    const x = 350 + col * this.grid.cellSize + 20; 
    const y = row * this.grid.cellSize + 10;

    if (unitType === 'peashooter' && this.sun >= 100) {
      unit = new PeaShooter(x, y, row, col);
    } else if (unitType === 'sunflower' && this.sun >= 50) {
      unit = new SunFlower(x, y, row, col);
    } else if (unitType === 'wallnut' && this.sun >= 50) {
      unit = new WallNut(x, y, row, col);
    } else if (unitType === 'torchwood' && this.sun >= 175) {
      unit = new Torchwood(x, y, row, col);
    } else if (unitType === 'cherrybomb' && this.sun >= 150) {
      unit = new CherryBomb(x, y, row, col);
    } else if (unitType === 'chomper' && this.sun >= 150) {
      unit = new Chomper(x, y, row, col);
    } else if (unitType === 'potatomine' && this.sun >= 25) {
      unit = new PotatoMine(x, y, row, col);
    } else if (unitType === 'snowpea' && this.sun >= 175) {
      unit = new SnowPea(x, y, row, col);
    } else if (unitType === 'repeater' && this.sun >= 200) {
      unit = new Repeater(x, y, row, col);
    } else if (unitType === 'kernelpult' && this.sun >= 100) {
      unit = new KernelPult(x, y, row, col);
    } else if (unitType === 'jalapeno' && this.sun >= 125) {
      this.sun -= 125;
      this.updateUI();
      this.triggerScreenShake(450, 12);
      SoundManager.getInstance().playExplosion();
      for (const z of this.attackers) {
        if (z.row === row) {
          z.takeDamage(1000);
          this.addFloatingText(z.x + z.width/2, z.y, '-1000 🔥', '#ff5722', true);
        }
      }
      for (let i = 0; i < this.canvas.width; i += 40) {
        this.particles.emit(i, y + 20, '#ff5722', 15, 6, 5, 500);
        this.particles.emit(i, y + 20, '#ffeb3b', 10, 4, 3, 400);
      }
      const unitCards = document.querySelectorAll('.unit-card');
      unitCards.forEach(c => c.classList.remove('selected'));
      this.selectedUnit = null;
      return; 
    }

    if (unit) {
      this.defenders.push(unit);
      this.sun -= unit.cost;
      this.updateUI();
      SoundManager.getInstance().playPlant();
      this.particles.emit(x + 30, y + 40, '#ffd54f', 15, 4, 3, 400);

      const unitCards = document.querySelectorAll('.unit-card');
      unitCards.forEach(c => c.classList.remove('selected'));
      this.selectedUnit = null;
    }
  }

  checkCollisions() {
    for (const proj of this.projectiles) {
      for (const zombie of this.attackers) {
        if (proj.row === zombie.row &&
            proj.x < zombie.x + zombie.width &&
            proj.x + proj.width > zombie.x) {
          zombie.takeDamage(proj.damage);
          SoundManager.getInstance().playHit();
          
          let damageColor = '#ffffff';
          if (proj instanceof SnowProjectile) {
            zombie.slowTimer = 5000;
            damageColor = '#81d4fa';
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#81d4fa', 6, 3, 2, 200);
          } else if (proj instanceof FirePea) {
            zombie.slowTimer = 0;
            damageColor = '#ff9800';
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#ff9800', 8, 4, 3, 300);
          } else if (proj instanceof Butter) {
            zombie.stunTimer = 4000;
            damageColor = '#ffeb3b';
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#ffeb3b', 8, 4, 3, 300);
          } else {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#4caf50', 5, 3, 2, 200);
          }
          
          this.addFloatingText(zombie.x + zombie.width / 2, zombie.y, `-${proj.damage}`, damageColor);
          proj.markedForDeletion = true;
          break; 
        }
      }
    }

    for (const zombie of this.attackers) {
      let isEating = false;

      // Fortress breach defense check
      if (zombie.x < 350) {
        if (this.valkyrieAvailable[zombie.row]) {
          this.valkyrieAvailable[zombie.row] = false;
          this.valkyries.push(new Valkyrie(300, zombie.row * this.grid.cellSize + 10, zombie.row));
          this.odinCommandTimer = 1000;
          this.triggerScreenShake(300, 6);
          SoundManager.getInstance().playWave();
        } else if (zombie.x < 260 && this.gameState === 'playing') {
          // Fortress breached!
          this.gameState = 'defeat';
          this.triggerScreenShake(1000, 15);
          SoundManager.getInstance().playDefeat();
        }
      }

      for (const valk of this.valkyries) {
        if (zombie.row === valk.row && zombie.x < valk.x + valk.width && zombie.x + zombie.width > valk.x) {
          zombie.takeDamage(1000);
          this.addFloatingText(zombie.x + zombie.width/2, zombie.y - 10, '-1000 ⚡', '#ffd54f', true);
          this.particles.emit(zombie.x, zombie.y + zombie.height/2, '#ffb300', 10, 5, 4, 300);
        }
      }

      for (const defender of this.defenders) {
        if (zombie.row === defender.row &&
            zombie.x < defender.x + defender.width &&
            zombie.x + zombie.width > defender.x) {
          
          if (defender instanceof PotatoMine) {
            if (defender.isArmed) {
              defender.markedForDeletion = true;
              this.particles.emitExplosion(defender.x + defender.width / 2, defender.y + defender.height / 2);
              this.triggerScreenShake(400, 10);
              SoundManager.getInstance().playExplosion();
              this.addFloatingText(defender.x + defender.width / 2, defender.y - 10, '-1800 💥', '#ff5722', true);
              for (const z of this.attackers) {
                if (z.row === defender.row && Math.abs(z.x - defender.x) < 80) {
                  z.markedForDeletion = true;
                }
              }
              continue;
            }
          }

          if (defender instanceof Chomper) {
            if (!defender.isDigesting && zombie.x - defender.x < defender.range && zombie.x - defender.x > -20) {
              zombie.markedForDeletion = true;
              defender.isDigesting = true;
              defender.digestTimer = 0;
              this.addFloatingText(defender.x + defender.width, defender.y - 10, 'Crunch! 🦷', '#ab47bc', true);
              this.particles.emit(defender.x + defender.width, defender.y + defender.height / 2, '#ab47bc', 20, 5, 4, 300);
              continue;
            }
          }

          isEating = true;
          defender.takeDamage(0.1); 
          break; 
        }
      }
      if (!zombie.markedForDeletion) {
        zombie.isEating = isEating;
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

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += deltaTime;
      ft.y += ft.vy;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update dynamic weather particles
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (let i = 0; i < this.weatherParticles.length; i++) {
      const p = this.weatherParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.vAngle;

      if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        this.weatherParticles[i] = this.createWeatherParticle(false);
      }
    }

    if (this.gameState === 'playing') {
      this.zombieSpawnTimer += deltaTime;
      this.zombieSpawnInterval = Math.max(1200, 5000 - (this.level * 350));

      // Wave announcement trigger
      if (!this.waveAnnounced && this.zombiesSpawned >= Math.floor(this.zombiesTotal / 2)) {
        this.waveAnnounced = true;
        this.triggerWaveBanner('⚔️ A huge wave of monsters is approaching! ⚔️');
      }

      // Spawning attackers
      if (this.zombieSpawnTimer > this.zombieSpawnInterval && this.zombiesSpawned < this.zombiesTotal) {
        this.zombieSpawnTimer = 0;
        this.zombiesSpawned++;
        const randomRow = Math.floor(Math.random() * this.grid.rows);
        const rand = Math.random();
        
        // Thematic enemy spawns in Jotunheim (more frost trolls & giants)
        if (this.realm === 'jotunheim') {
          if (rand > 0.55) {
            this.attackers.push(new Troll(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          } else if (rand > 0.25) {
            this.attackers.push(new SmallTroll(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          } else {
            this.attackers.push(new ConeheadZombie(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          }
        } else {
          if (this.level >= 2 && rand > 0.75) {
            this.attackers.push(new Troll(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          } else if (this.level >= 3 && rand > 0.6) {
            this.attackers.push(new BucketheadZombie(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          } else if (this.level >= 2 && rand > 0.45) {
            this.attackers.push(new ConeheadZombie(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          } else if (this.level >= 1 && rand > 0.3) {
            this.attackers.push(new SmallTroll(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          } else {
            this.attackers.push(new BasicZombie(this.canvas.width, randomRow * this.grid.cellSize, randomRow));
          }
        }
      }

      // Victory Condition check
      if (this.zombiesSpawned >= this.zombiesTotal && this.attackers.length === 0) {
        this.gameState = 'victory';
        SoundManager.getInstance().playVictory();
      }
    }

    this.defenders.forEach(d => d.update(deltaTime, this));
    this.attackers.forEach(a => a.update(deltaTime, this));
    this.projectiles.forEach(p => p.update(deltaTime, this));
    this.particles.update(deltaTime);
    
    this.checkCollisions();

    this.defenders = this.defenders.filter(d => {
      if (d.markedForDeletion) {
         this.particles.emit(d.x + d.width/2, d.y + d.height/2, '#4caf50', 20, 5, 4, 400); 
         return false;
      }
      return true;
    });
    
    this.attackers = this.attackers.filter(a => {
      if (a.markedForDeletion) {
         this.zombiesKilled++;
         this.particles.emit(a.x + a.width/2, a.y + a.height/2, '#9e9e9e', 20, 6, 5, 500); 
         return false;
      }
      return true;
    });
    
    this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    this.valkyries.forEach(v => v.update(deltaTime, this));
    this.valkyries = this.valkyries.filter(v => !v.markedForDeletion);
  }

  drawCastle() {
    const ctx = this.ctx;
    ctx.save();
    
    // Procedural stone masonry fortification wall
    const wallGrad = ctx.createLinearGradient(0, 0, 350, 0);
    if (this.realm === 'jotunheim' || this.realm === 'niflheim' || this.realm === 'helheim') {
      wallGrad.addColorStop(0, '#102030');
      wallGrad.addColorStop(0.7, '#1b334a');
      wallGrad.addColorStop(1, '#2c4d68');
    } else if (this.realm === 'asgard' || this.realm === 'alfheim') {
      wallGrad.addColorStop(0, '#3a2d12');
      wallGrad.addColorStop(0.7, '#5c481e');
      wallGrad.addColorStop(1, '#8c6d2d');
    } else if (this.realm === 'svartalfheim' && this.city === 'nidavellir') {
      // Nidavellir: rich dark stone — charcoal with warm amber seams
      wallGrad.addColorStop(0, '#1a1510');
      wallGrad.addColorStop(0.5, '#2e2618');
      wallGrad.addColorStop(0.85, '#3a301e');
      wallGrad.addColorStop(1, '#4a3c24');
    } else if (this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      wallGrad.addColorStop(0, '#21100c');
      wallGrad.addColorStop(0.7, '#381c15');
      wallGrad.addColorStop(1, '#542b20');
    } else {
      wallGrad.addColorStop(0, '#263238');
      wallGrad.addColorStop(0.7, '#37474f');
      wallGrad.addColorStop(1, '#455a64');
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, 350, this.canvas.height);

    // Stone brick patterns
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1.5;
    const brickH = 32;
    for (let y = 0; y < this.canvas.height; y += brickH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(350, y);
      ctx.stroke();
      const rowIdx = Math.floor(y / brickH);
      const shift = (rowIdx % 2) * 35;
      for (let x = shift; x < 350; x += 70) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + brickH);
        ctx.stroke();
      }
    }

    // Realm-specific wall overlay / frost / icicles / runes
    if (this.realm === 'svartalfheim' && this.city === 'nidavellir') {
      const time = Date.now() / 1000;
      ctx.save();

      // ── Warm amber forge-glow seeping through the stone ──
      const forgeSeep = ctx.createLinearGradient(340, 0, 0, 0);
      forgeSeep.addColorStop(0, 'rgba(200,120,20,0.22)');
      forgeSeep.addColorStop(0.4, 'rgba(160,90,10,0.10)');
      forgeSeep.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = forgeSeep;
      ctx.fillRect(0, 0, 350, this.canvas.height);

      // ── Dwarven iron-riveted border beam ──
      ctx.fillStyle = '#2a2218';
      ctx.fillRect(340, 0, 10, this.canvas.height);
      // Rivet dots
      ctx.fillStyle = '#c8a050';
      ctx.shadowColor = '#ffa000';
      ctx.shadowBlur = 4;
      for (let ri = 0; ri < Math.floor(this.canvas.height / 28); ri++) {
        ctx.beginPath();
        ctx.arc(345, 14 + ri * 28, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ── Wall torches with animated flicker ──
      const torchPositions = [50, this.canvas.height * 0.28, this.canvas.height * 0.54, this.canvas.height * 0.80];
      for (let ti = 0; ti < torchPositions.length; ti++) {
        const ty = torchPositions[ti];
        const flicker = Math.sin(time * 7.0 + ti * 2.3) * 0.3 + 0.7;
        const flicker2 = Math.sin(time * 11.0 + ti * 1.7) * 0.15 + 0.85;

        // Torch bracket
        ctx.fillStyle = '#3a3028';
        ctx.fillRect(290, ty - 4, 30, 8);
        ctx.fillRect(315, ty - 16, 6, 16);

        // Torch glow halo (large, bleeds onto battlefield)
        const haloGrad = ctx.createRadialGradient(320, ty - 20, 0, 320, ty - 20, 55 * flicker);
        haloGrad.addColorStop(0, `rgba(255,160,30,${0.45 * flicker * flicker2})`);
        haloGrad.addColorStop(0.5, `rgba(200,100,10,${0.18 * flicker})`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(320, ty - 20, 55 * flicker, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Flame body
        ctx.save();
        ctx.translate(320, ty - 20);
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

      // ── Dwarven runes carved into the stone, glowing amber ──
      const nRunes = ['ᚾ', 'ᛁ', 'ᛞ', 'ᚨ', 'ᚹ', 'ᛖ', 'ᛚ', 'ᛚ', 'ᛁ', 'ᚱ'];
      ctx.font = 'bold 18px serif';
      const runeGlow = 0.55 + Math.sin(time * 1.4) * 0.2;
      ctx.fillStyle = `rgba(220,160,40,${runeGlow})`;
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;
      for (let ri = 0; ri < nRunes.length; ri++) {
        ctx.fillText(nRunes[ri], 258, 55 + ri * 58);
      }
      ctx.shadowBlur = 0;

      // ── Portcullis gate (heavy iron bars) ──
      const gateTop = this.canvas.height * 0.30;
      const gateH   = this.canvas.height * 0.40;
      const gateX   = 150;
      const gateW2  = 80;
      // Gate arch surround
      ctx.fillStyle = '#1e1812';
      ctx.beginPath();
      ctx.moveTo(gateX, gateTop + 28);
      ctx.arc(gateX + gateW2 / 2, gateTop + 28, gateW2 / 2, Math.PI, 0);
      ctx.lineTo(gateX + gateW2, gateTop + gateH);
      ctx.lineTo(gateX, gateTop + gateH);
      ctx.closePath();
      ctx.fill();
      // Arch keystone highlight
      ctx.fillStyle = '#4a3c24';
      ctx.beginPath();
      ctx.moveTo(gateX + gateW2 / 2 - 10, gateTop);
      ctx.lineTo(gateX + gateW2 / 2 + 10, gateTop);
      ctx.lineTo(gateX + gateW2 / 2 + 6, gateTop + 22);
      ctx.lineTo(gateX + gateW2 / 2 - 6, gateTop + 22);
      ctx.closePath();
      ctx.fill();
      // Iron portcullis bars
      ctx.strokeStyle = '#2e2820';
      ctx.lineWidth = 5;
      ctx.lineCap = 'square';
      for (let bar = 0; bar < 4; bar++) {
        const bx = gateX + 10 + bar * 20;
        ctx.beginPath();
        ctx.moveTo(bx, gateTop + 28);
        ctx.lineTo(bx, gateTop + gateH);
        ctx.stroke();
      }
      // Horizontal rails
      ctx.lineWidth = 3;
      for (let rail = 0; rail < 3; rail++) {
        const ry2 = gateTop + 50 + rail * (gateH * 0.28);
        ctx.beginPath();
        ctx.moveTo(gateX + 4, ry2);
        ctx.lineTo(gateX + gateW2 - 4, ry2);
        ctx.stroke();
      }
      // Warm light from behind gate
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

      // ── Forge smoke wisps rising along the wall top ──
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

      ctx.restore();
    } else if (this.realm === 'jotunheim') {
      ctx.save();
      // Frost glaze on wall
      const frostGrad = ctx.createLinearGradient(0, 0, 350, 0);
      frostGrad.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
      frostGrad.addColorStop(1, 'rgba(129, 212, 250, 0.40)');
      ctx.fillStyle = frostGrad;
      ctx.fillRect(0, 0, 350, this.canvas.height);

      // Large hanging icicles along the battlement
      ctx.fillStyle = 'rgba(224, 247, 250, 0.90)';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 10;
      for (let i = 0; i < 14; i++) {
        const ix = 25 + i * 24;
        const iLen = 25 + (i % 5) * 16;
        ctx.beginPath();
        ctx.moveTo(ix - 8, 0);
        ctx.lineTo(ix + 8, 0);
        ctx.lineTo(ix, iLen);
        ctx.closePath();
        ctx.fill();
      }

      // Glowing Frost Runes carved into the stone
      const jRunes = ['ᛃ', 'ᛟ', 'ᛏ', 'ᚢ', 'ᚾ', 'ᚺ', 'ᛖ'];
      ctx.font = 'bold 22px serif';
      ctx.fillStyle = '#e0f7fa';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 14;
      for (let i = 0; i < jRunes.length; i++) {
        ctx.fillText(jRunes[i], 310, 60 + i * 65);
      }
      ctx.restore();
    } else if (this.realm === 'asgard') {
      // Golden Valhalla trim & Aesir runes
      ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
      ctx.fillRect(0, 0, 350, this.canvas.height);
      const aRunes = ['ᚨ', 'ᛊ', 'ᚷ', 'ᚨ', 'ᚱ', 'ᛞ'];
      ctx.font = 'bold 22px serif';
      ctx.fillStyle = '#fff9c4';
      ctx.shadowColor = '#ffd54f';
      ctx.shadowBlur = 14;
      for (let i = 0; i < aRunes.length; i++) {
        ctx.fillText(aRunes[i], 310, 70 + i * 70);
      }
    }

    if (!(this.realm === 'svartalfheim' && this.city === 'nidavellir')) {
      // Outer Fortress Border Beam (non-Nidavellir)
      ctx.fillStyle = this.realm === 'jotunheim' ? '#00e5ff' : '#ffc107'; 
      ctx.fillRect(340, 0, 10, this.canvas.height);

      // Watchtower Window
      ctx.fillStyle = '#1c2529'; 
      ctx.fillRect(20, 30, 140, 200);
      ctx.fillStyle = '#ffb74d'; 
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ffb74d';
      ctx.fillRect(40, 50, 100, 150);
      ctx.shadowBlur = 0;

      // --- DRAW THOR ---
      ctx.save();
      ctx.translate(20, 0); 
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

      // --- DRAW ATREUS ---
      ctx.save();
      ctx.translate(20, 0);
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

      // --- ODIN'S BALCONY ---
      ctx.fillStyle = '#37474f';
      ctx.beginPath();
      ctx.moveTo(180, 250); ctx.lineTo(360, 250); ctx.lineTo(320, 450); ctx.lineTo(180, 450); ctx.fill();
      ctx.fillStyle = '#ffc107'; 
      ctx.fillRect(180, 230, 180, 20);

      // --- DRAW ODIN ---
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.ellipse(250, 410, 35, 12, 0, 0, Math.PI*2); ctx.fill();
      
      const odinCape = ctx.createLinearGradient(200, 300, 250, 420);
      odinCape.addColorStop(0, '#b71c1c');
      odinCape.addColorStop(1, '#4a148c'); 
      ctx.fillStyle = odinCape;
      ctx.beginPath();
      ctx.moveTo(250, 290); ctx.quadraticCurveTo(180, 350, 190, 420); ctx.lineTo(270, 420); ctx.fill();

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
      ctx.beginPath(); ctx.moveTo(228, 265); ctx.quadraticCurveTo(190, 240, 195, 210); ctx.quadraticCurveTo(220, 230, 235, 255); ctx.fill();
      ctx.beginPath(); ctx.moveTo(262, 265); ctx.quadraticCurveTo(300, 240, 295, 210); ctx.quadraticCurveTo(270, 230, 255, 255); ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      if (this.odinCommandTimer > 0) {
        ctx.moveTo(260, 340); ctx.lineTo(340, 200); ctx.stroke();
        ctx.fillStyle = '#e0f7fa'; 
        ctx.shadowBlur = 30; ctx.shadowColor = '#00e5ff';
        ctx.beginPath(); ctx.moveTo(330, 210); ctx.lineTo(360, 160); ctx.lineTo(350, 220); ctx.fill();
        ctx.strokeStyle = '#ffca28'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(255,300); ctx.lineTo(290, 270); ctx.stroke();
      } else {
        ctx.moveTo(270, 250); ctx.lineTo(270, 420); ctx.stroke();
        ctx.fillStyle = '#e0f7fa'; 
        ctx.shadowBlur = 15; ctx.shadowColor = '#00e5ff';
        ctx.beginPath(); ctx.moveTo(262, 250); ctx.lineTo(270, 200); ctx.lineTo(278, 250); ctx.fill();
        ctx.strokeStyle = '#ffca28'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(255,300); ctx.lineTo(270, 330); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

    } else {
      // ══════════════════════════════════════════════
      // NIDAVELLIR: DWARVEN DEFENSIVE BATTLEMENTS
      // ══════════════════════════════════════════════
      const time = Date.now() / 1000;
      const h = this.canvas.height;
      
      // Stone battlement wall (narrower, covering the left edge up to x=330)
      ctx.fillStyle = '#1e241c'; // Cool dark stone to match new palette
      ctx.beginPath();
      ctx.moveTo(270, 0); ctx.lineTo(330, 0); 
      ctx.lineTo(330, h); ctx.lineTo(270, h); 
      ctx.fill();
      
      // Bronze trim along battlement edge
      const railGrad = ctx.createLinearGradient(270, 0, 330, 0);
      railGrad.addColorStop(0, '#3a4a35');
      railGrad.addColorStop(0.5, '#6a7860');
      railGrad.addColorStop(1, '#2a3525');
      ctx.fillStyle = railGrad;
      ctx.fillRect(270, 0, 60, h);
      
      // Crenellations (teeth on the wall) vertically distributed
      ctx.fillStyle = '#1e241c';
      for (let y = 0; y < h; y += 45) {
        ctx.fillRect(290, y, 40, 20);
        // Bronze cap on each crenellation
        ctx.fillStyle = '#4a5545';
        ctx.fillRect(287, y, 43, 6);
        ctx.fillStyle = '#1e241c';
      }

      // Draw 5 ballistae, one for each row
      for (let r = 0; r < 5; r++) {
        // Assume grid has 5 rows, center of each row:
        const by = (h / 5) * (r + 0.5);
        
        // Base swivel
        ctx.fillStyle = '#2c3528';
        ctx.beginPath(); ctx.ellipse(305, by + 15, 20, 10, 0, 0, Math.PI*2); ctx.fill();
        
        ctx.save();
        ctx.translate(305, by);
        // Idle tracking rotation varying per row
        ctx.rotate(Math.sin(time * 0.8 + r) * 0.15);
        
        // Main barrel/shaft
        ctx.fillStyle = '#151a14';
        ctx.fillRect(-10, -35, 20, 60);
        
        // Bronze banding
        ctx.fillStyle = '#6a7860';
        ctx.fillRect(-12, -20, 24, 6);
        ctx.fillRect(-12, 5, 24, 6);
        
        // Crossbow arms (bronze)
        ctx.strokeStyle = '#5a6850';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-35, -10);
        ctx.quadraticCurveTo(0, -25, 35, -10);
        ctx.stroke();
        
        // Glowing rune on barrel
        ctx.fillStyle = `rgba(180,220,255,${0.6 + Math.sin(time * 2 + r) * 0.3})`;
        ctx.shadowColor = '#80bfff'; ctx.shadowBlur = 5;
        ctx.font = 'bold 12px serif'; ctx.textAlign = 'center';
        ctx.fillText('ᛏ', 0, -5);
        ctx.shadowBlur = 0;
        
        // Loaded glowing bolt
        ctx.fillStyle = '#a0d0ff';
        ctx.beginPath();
        ctx.moveTo(-2, -15); ctx.lineTo(2, -15); ctx.lineTo(0, -50); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // Draw 100% Procedural Animated Living Realm Environments
  drawAtmosphere() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = Date.now() / 1000;

    // === NIDAVELLIR: UNDERGROUND CAVERN, FORGE GLOW, STALACTITES, EMBERS ===
    if (this.realm === 'svartalfheim' && this.city === 'nidavellir') {
      ctx.save();

      // ── 1. SKY: cool dark gorge atmosphere ──
      const skyGrad = ctx.createLinearGradient(350, 0, w, h * 0.55);
      skyGrad.addColorStop(0,   '#202e20');
      skyGrad.addColorStop(0.4, '#131c13');
      skyGrad.addColorStop(1,   '#080c08');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(350, 0, w - 350, h);

      // ── 2. SUBTLE GOD RAYS — 2 soft golden shafts only ──
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let ri = 0; ri < 2; ri++) {
        const rayPulse = 0.018 + Math.sin(time * 0.35 + ri * 2.0) * 0.008;
        const rayGrad = ctx.createLinearGradient(350, 0, w, h);
        rayGrad.addColorStop(0,   `rgba(230,210,150,${rayPulse})`);
        rayGrad.addColorStop(0.6, `rgba(180,160,100,${rayPulse * 0.3})`);
        rayGrad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = rayGrad;
        const rx0 = 380 + ri * 220;
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
      ctx.fillStyle = '#1a2218';
      ctx.beginPath();
      ctx.moveTo(350, h);
      ctx.lineTo(350, h * 0.55);
      ctx.quadraticCurveTo(w * 0.42, h * 0.38, w * 0.55, h * 0.48);
      ctx.quadraticCurveTo(w * 0.65, h * 0.34, w * 0.75, h * 0.42);
      ctx.quadraticCurveTo(w * 0.85, h * 0.28, w, h * 0.36);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      // Layer 2 — mid-distance
      ctx.fillStyle = '#121810';
      ctx.beginPath();
      ctx.moveTo(350, h);
      ctx.lineTo(350, h * 0.62);
      ctx.quadraticCurveTo(w * 0.38, h * 0.44, w * 0.48, h * 0.54);
      ctx.quadraticCurveTo(w * 0.58, h * 0.38, w * 0.68, h * 0.50);
      ctx.quadraticCurveTo(w * 0.80, h * 0.30, w * 0.90, h * 0.44);
      ctx.lineTo(w, h * 0.42);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      // Layer 1 — closest
      ctx.fillStyle = '#0b100a';
      ctx.beginPath();
      ctx.moveTo(350, h);
      ctx.lineTo(350, h * 0.72);
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

      // ── 5. FOREST SILHOUETTE — dark fir trees on clifftops ──
      ctx.fillStyle = '#0c0e06';
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
      ctx.fillStyle = '#2a1e0c';
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
        ctx.fillStyle = '#1c1408';
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
      ctx.fillStyle = '#1a1208';
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
        ctx.fillStyle = '#060402';
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
      const fogGrad = ctx.createLinearGradient(350, h * 0.80, 350, h);
      fogGrad.addColorStop(0,   'rgba(0,0,0,0)');
      fogGrad.addColorStop(0.4, 'rgba(100,130,120,0.10)');
      fogGrad.addColorStop(1,   'rgba(80,115,110,0.28)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(350, h * 0.80, w - 350, h * 0.20);

      // ── 9. FORGE CAVE EMBER SPARKS — subtle, not dominant ──
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        const sparkAlpha = p.alpha * (0.35 + Math.sin(time * 2.5 + p.x * 0.01) * 0.20);
        ctx.fillStyle = `rgba(255,200,80,${sparkAlpha * 0.5})`;
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 5;
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
        const aGrad = ctx.createLinearGradient(350, 0, w, h * 0.5);
        const aAlpha = 0.18 + Math.sin(time * 0.6 + a * 1.8) * 0.08;
        aGrad.addColorStop(0, `rgba(0, 229, 255, ${aAlpha})`);
        aGrad.addColorStop(0.5, `rgba(105, 240, 174, ${aAlpha * 0.8})`);
        aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(350, 0);
        for (let x = 350; x <= w; x += 30) {
          const waveY = h * 0.15 + Math.sin(time * 1.2 + x * 0.008 + a) * 45 + Math.cos(time * 0.8 + x * 0.015) * 20;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // 2. Far Mountain Range (Deep dark icy peaks)
      ctx.fillStyle = '#081829';
      ctx.beginPath();
      ctx.moveTo(350, h);
      ctx.lineTo(400, h * 0.40);
      ctx.lineTo(520, h * 0.65);
      ctx.lineTo(660, h * 0.28);
      ctx.lineTo(820, h * 0.55);
      ctx.lineTo(950, h * 0.20);
      ctx.lineTo(w, h * 0.45);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 3. Mid Mountain Range (Snow-capped glaciers)
      ctx.fillStyle = '#10273f';
      ctx.beginPath();
      ctx.moveTo(350, h);
      ctx.lineTo(460, h * 0.48);
      ctx.lineTo(580, h * 0.72);
      ctx.lineTo(740, h * 0.38);
      ctx.lineTo(890, h * 0.65);
      ctx.lineTo(w, h * 0.42);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Snow Glaciers on Peaks
      ctx.fillStyle = 'rgba(224, 247, 250, 0.75)';
      ctx.beginPath();
      ctx.moveTo(740, h * 0.38);
      ctx.lineTo(710, h * 0.50);
      ctx.lineTo(770, h * 0.50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(460, h * 0.48);
      ctx.lineTo(440, h * 0.56);
      ctx.lineTo(480, h * 0.56);
      ctx.closePath();
      ctx.fill();

      // 4. Rolling Frost Mist Banks across the battlefield
      for (let i = 0; i < 3; i++) {
        const fogX = 350 + ((time * 35 + i * 260) % (w - 300));
        const fogY = h * (0.35 + i * 0.22);
        const fGrad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, 200);
        fGrad.addColorStop(0, 'rgba(178, 235, 242, 0.16)');
        fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fGrad;
        ctx.fillRect(fogX - 200, fogY - 100, 400, 200);
      }

      // 5. Blizzard Snow Particles (Swirling white & cyan snowflakes)
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = `rgba(225, 245, 254, ${p.alpha})`;
        ctx.shadowColor = '#00e5ff';
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
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const shaftX = 380 + i * 130 + Math.sin(time * 0.4 + i) * 25;
        const sg = ctx.createLinearGradient(shaftX, 0, shaftX, h);
        sg.addColorStop(0, 'rgba(255, 235, 180, 0.18)');
        sg.addColorStop(0.6, 'rgba(255, 213, 79, 0.06)');
        sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sg;
        ctx.fillRect(shaftX - 40, 0, 80, h);
      }
      for (const p of this.weatherParticles) {
        ctx.fillStyle = `rgba(255, 224, 130, ${p.alpha})`;
        ctx.shadowColor = '#ffd54f';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (this.realm === 'helheim') {
      // Ghostly pale blue-grey souls
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        ctx.fillStyle = `rgba(144, 164, 174, ${p.alpha})`;
        ctx.shadowColor = '#607d8b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      // Burning underworld embers / forge sparks
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        const color = this.realm === 'svartalfheim' ? `rgba(255, 179, 0, ${p.alpha})` : `rgba(255, 112, 67, ${p.alpha})`;
        const shadow = this.realm === 'svartalfheim' ? '#ff8f00' : '#ff5722';
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
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        const color = this.realm === 'alfheim' ? `rgba(255, 128, 171, ${p.alpha})` : `rgba(129, 199, 132, ${p.alpha})`;
        const shadow = this.realm === 'alfheim' ? '#ff4081' : '#66bb6a';
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
    const w = this.canvas.width;
    const h = this.canvas.height;
    const t = this.realmEntranceTimer;
    const progress = (2.8 - t) / 2.8;

    let alpha = 1.0;
    if (progress < 0.2) alpha = progress / 0.2;
    else if (progress > 0.7) alpha = (1 - progress) / 0.3;

    ctx.save();
    // 1. Radiant Bifrost Flash
    if (progress < 0.35) {
      const flashAlpha = (1 - progress / 0.35) * 0.75;
      const fGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.85);
      fGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      fGrad.addColorStop(0.4, `rgba(0, 229, 255, ${flashAlpha * 0.65})`);
      fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. God of War Realm Crest Announcement
    const realmInfo: Record<string, { title: string; subtitle: string; runes: string; color: string }> = {
      jotunheim:    { title: 'Jötunheim',    subtitle: 'Realm of the Frost Giants', runes: 'ᚦ ᛟ ᛏ ᚢ ᚾ ᚺ ᛖ ᛁ ᛗ', color: '#00e5ff' },
      asgard:       { title: 'Asgard',       subtitle: 'Realm of the Aesir Gods',   runes: 'ᚨ ᛊ ᚷ ᚨ ᚱ ᛞ',       color: '#ffd54f' },
      helheim:      { title: 'Helheim',      subtitle: 'Realm of the Dead',         runes: 'ᚺ ᛖ ᛚ ᚺ ᛖ ᛁ ᛗ',       color: '#607d8b' },
      vanaheim:     { title: 'Vanaheim',     subtitle: 'Realm of the Vanir Gods',   runes: 'ᚹ ᚨ ᚾ ᚨ ᚺ ᛖ ᛁ ᛗ', color: '#66bb6a' },
      midgard:      { title: 'Midgard',      subtitle: 'Realm of Mortals',          runes: 'ᛗ ᛁ ᛞ ᚷ ᚨ ᚱ ᛞ',       color: '#81c784' },
      alfheim:      { title: 'Alfheim',      subtitle: 'Realm of Light Elves',      runes: 'ᛉ ᛚ ᚠ ᚺ ᛖ ᛁ ᛗ',       color: '#ff80ab' },
      svartalfheim: { title: 'Svartalfheim', subtitle: 'Realm of Dwarves',          runes: 'ᚲ ᚹ ᚨ ᚱ ᛏ ᚨ ᛚ ᚠ', color: '#ffb300' },
      niflheim:     { title: 'Niflheim',     subtitle: 'Realm of Ice and Mist',     runes: 'ᛁ ᚠ ᛚ ᚺ ᛖ ᛁ ᛗ',       color: '#b2ebf2' },
      muspelheim:   { title: 'Muspelheim',   subtitle: 'Realm of Fire',             runes: 'ᛊ ᚢ ᛊ ᛈ ᛖ ᛚ ᚺ',       color: '#ff3d00' }
    };

    let info = realmInfo[this.realm] || realmInfo.midgard;
    
    // Copy info to avoid mutating the shared object
    info = { ...info };
    if (this.city === 'nidavellir') {
      info.title    = 'Niðavellir';
      info.subtitle = 'The Dwarven Capital · Svartalfheim';
      info.runes    = 'ᚾ ᛁ ᛞ ᚨ ᚹ ᛖ ᛚ ᛚ ᛁ ᚱ';
      info.color    = '#ffaa00';
    } else if (this.city) {
      const cityFormatted = this.city.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
      info.title = `${info.title} · ${cityFormatted}`;
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    const cx = w / 2 + 100;
    const cy = h / 2 - 30;

    // Glowing ornamental banner box
    ctx.fillStyle = 'rgba(10, 14, 20, 0.90)';
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = info.color;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.roundRect(cx - 240, cy - 65, 480, 130, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Elder Futhark Runes
    ctx.fillStyle = info.color;
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.runes, cx, cy - 35);

    // Realm Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Outfit", "Inter", sans-serif';
    ctx.shadowColor = info.color;
    ctx.shadowBlur = 18;
    ctx.fillText(`✦ ${info.title} ✦`, cx, cy + 2);

    // Subtitle
    ctx.fillStyle = 'rgba(220, 235, 250, 0.9)';
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
    const cellW = this.grid.cellSize;
    const cellH = this.grid.cellSize;
    const cx = 350 + col * cellW;
    const cy = row * cellH;

    const occupant = this.defenders.find(d => d.row === row && d.col === col);
    const isOccupied = !!occupant;
    const now = Date.now() / 1000;

    ctx.save();

    if (this.selectedUnit === 'shovel') {
      if (isOccupied) {
        // Demolition reticle around defender
        ctx.strokeStyle = '#ff3d00';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 15;
        
        ctx.strokeRect(cx + 8, cy + 8, cellW - 16, cellH - 16);
        
        // Corner demolition notches
        const cornerSize = 14;
        ctx.fillStyle = '#ff3d00';
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
        ctx.fillStyle = 'rgba(20, 10, 10, 0.9)';
        ctx.strokeStyle = '#ff3d00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx + cellW / 2 - 45, cy - 14, 90, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff5252';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⛏️ Demolish', cx + cellW / 2, cy - 3);
      }
    } else if (isOccupied) {
      // Red Ward Barrier - Placement Blocked
      ctx.fillStyle = 'rgba(211, 47, 47, 0.2)';
      ctx.strokeStyle = 'rgba(255, 82, 82, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#d32f2f';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(cx + 6, cy + 6, cellW - 12, cellH - 12, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛔ Occupied', cx + cellW / 2, cy + cellH / 2);
    } else {
      // Valid Placement: Glowing Norse Summoning Rune Circle
      const pulse = (Math.sin(now * 4) + 1) / 2;
      const ringColor = `rgba(129, 199, 132, ${0.6 + pulse * 0.4})`;
      const glowColor = '#81c784';

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14 + pulse * 10;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2;

      // Outer tile highlight
      ctx.fillStyle = `rgba(76, 175, 80, ${0.12 + pulse * 0.08})`;
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
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Elder Futhark compass runes
      ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
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
      if (this.selectedUnit !== 'sunflower' && this.selectedUnit !== 'wallnut' && this.selectedUnit !== 'potatomine') {
        ctx.save();
        ctx.strokeStyle = 'rgba(129, 199, 132, 0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(centerX + 30, centerY);
        ctx.lineTo(this.canvas.width - 20, centerY);
        ctx.stroke();
        ctx.restore();
      }

      // Ethereal Ghost Silhouette of Defender
      ctx.globalAlpha = 0.55 + pulse * 0.2;
      ctx.fillStyle = '#81c784';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const unitDisplay = this.selectedUnit.charAt(0).toUpperCase() + this.selectedUnit.slice(1);
      ctx.fillText(`✦ Summon ${unitDisplay} ✦`, centerX, cy + cellH - 12);
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

  drawFloatingTexts() {
    const ctx = this.ctx;
    ctx.save();
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = ft.isCritical ? 16 : 8;
      ctx.fillStyle = ft.color;
      ctx.font = ft.isCritical
        ? 'bold 20px "Outfit", "Inter", sans-serif'
        : 'bold 15px "Outfit", "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline for maximum legibility
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = ft.isCritical ? 4 : 2.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  drawWaveBanner() {
    if (this.waveBannerTimer <= 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const cx = w / 2 + 100;
    const cy = 120;
    const alpha = Math.min(1, this.waveBannerTimer * 1.5);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glowing alert tablet
    ctx.fillStyle = 'rgba(25, 10, 10, 0.92)';
    ctx.strokeStyle = '#ff3d00';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff1744';
    ctx.shadowBlur = 30;

    ctx.beginPath();
    ctx.roundRect(cx - 280, cy - 35, 560, 70, 12);
    ctx.fill();
    ctx.stroke();

    // Runic warning header
    ctx.fillStyle = '#ff5252';
    ctx.font = 'bold 11px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ᚱ ᚨ ᚷ ᚾ ᚨ ᚱ ᛟ ᚲ   ·   ᚹ ᚨ ᚱ ᚾ ᛁ ᚾ ᚷ', cx, cy - 16);

    // Main Alert Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.shadowColor = '#ff5722';
    ctx.shadowBlur = 12;
    ctx.fillText(this.waveBannerText, cx, cy + 12);

    ctx.restore();
  }

  drawVictoryDefeatOverlays() {
    if (this.gameState === 'playing') return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.save();

    if (this.gameState === 'defeat') {
      // Defeat: Blood-red cosmic vignette backdrop
      const defGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.7);
      defGrad.addColorStop(0, 'rgba(40, 10, 10, 0.85)');
      defGrad.addColorStop(1, 'rgba(10, 2, 2, 0.95)');
      ctx.fillStyle = defGrad;
      ctx.fillRect(0, 0, w, h);

      // Carved Norse Stone Tablet
      ctx.fillStyle = 'rgba(15, 20, 28, 0.96)';
      ctx.strokeStyle = '#d32f2f';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.roundRect(cx - 220, cy - 140, 440, 260, 16);
      ctx.fill();
      ctx.stroke();

      // Skull Runes
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ᛞ ᛖ ᚨ ᚦ   ·   ᚱ ᚨ ᚷ ᚾ ᚨ ᚱ ᛟ ᚲ', cx, cy - 105);

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Outfit", "Inter", sans-serif';
      ctx.shadowColor = '#d32f2f';
      ctx.shadowBlur = 20;
      ctx.fillText('Realm has fallen', cx, cy - 65);

      // Description
      ctx.fillStyle = 'rgba(220, 200, 200, 0.85)';
      ctx.font = '500 13px "Outfit", sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText('The fortress defenses were breached by the invaders.', cx, cy - 25);
      ctx.fillText(`Monsters Cleared: ${this.zombiesKilled} / ${this.zombiesTotal}`, cx, cy - 5);

      // Buttons
      // 1. Retry Button (Left)
      ctx.fillStyle = 'rgba(183, 28, 28, 0.85)';
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 140, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillText('↺ Retry', cx - 75, cy + 62);

      // 2. Realms Button (Right)
      ctx.fillStyle = 'rgba(38, 50, 56, 0.85)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.beginPath();
      ctx.roundRect(cx + 10, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText('« Realms', cx + 75, cy + 62);

    } else if (this.gameState === 'victory') {
      // Victory: Golden Celestial Bifrost Backdrop
      const vicGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.7);
      vicGrad.addColorStop(0, 'rgba(20, 35, 20, 0.85)');
      vicGrad.addColorStop(1, 'rgba(4, 12, 6, 0.95)');
      ctx.fillStyle = vicGrad;
      ctx.fillRect(0, 0, w, h);

      // Carved Norse Stone Tablet
      ctx.fillStyle = 'rgba(15, 24, 20, 0.96)';
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffb300';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.roundRect(cx - 220, cy - 140, 440, 260, 16);
      ctx.fill();
      ctx.stroke();

      // Golden Runes
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ᚹ ᛁ ᚲ ᛏ ᛟ ᚱ ᛁ   ·   ᛊ ᛖ ᚲ ᚢ ᚱ ᛖ', cx, cy - 105);

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Outfit", "Inter", sans-serif';
      ctx.shadowColor = '#ffd54f';
      ctx.shadowBlur = 20;
      ctx.fillText('✦ Realm Secured ✦', cx, cy - 65);

      // Description
      ctx.fillStyle = 'rgba(200, 240, 210, 0.85)';
      ctx.font = '500 13px "Outfit", sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText('All invading waves have been repelled by Odin\'s defense!', cx, cy - 25);
      ctx.fillText(`Victory Bonus: +500 Sol Energy · Total Defeated: ${this.zombiesKilled}`, cx, cy - 5);

      // Buttons
      // 1. Next Level Button (Left)
      ctx.fillStyle = 'rgba(46, 125, 50, 0.85)';
      ctx.strokeStyle = '#81c784';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 140, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillText('✦ Next Level', cx - 75, cy + 62);

      // 2. Realms Button (Right)
      ctx.fillStyle = 'rgba(38, 50, 56, 0.85)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.beginPath();
      ctx.roundRect(cx + 10, cy + 40, 130, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText('« Realms', cx + 75, cy + 62);
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

    // Dynamic realm base backdrop
    const bgGradient = ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    );
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
    } else if (this.realm === 'svartalfheim' && this.city === 'nidavellir') {
      bgGradient.addColorStop(0, '#1a2218');
      bgGradient.addColorStop(0.6, '#101610');
      bgGradient.addColorStop(1, '#070c07');
    } else {
      bgGradient.addColorStop(0, '#1b2838');
      bgGradient.addColorStop(1, '#0b131c');
    }
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw living realm weather, mountains, and atmospheric lighting
    this.drawAtmosphere();

    this.drawCastle();
    this.grid.draw(ctx);
    
    this.valkyries.forEach(v => v.draw(ctx));
    this.defenders.forEach(d => d.draw(ctx));
    this.attackers.forEach(a => a.draw(ctx));
    this.drawStatusAilments();
    this.projectiles.forEach(p => p.draw(ctx));
    this.particles.draw(ctx);

    // Draw summoning hologram and grid hover previews
    this.drawSummoningPreview();

    // Draw floating combat numbers & Sol floaters
    this.drawFloatingTexts();

    // Draw cinematic Bifrost entrance sequence
    this.drawRealmEntranceIntro();

    // Draw wave alert banner if active
    this.drawWaveBanner();

    // Draw victory / defeat overlays
    this.drawVictoryDefeatOverlays();

    if (this.shakeTimer > 0) {
      ctx.restore();
    }
  }

  loop = (timestamp: number) => {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(Math.min(deltaTime, 100));
    this.draw();

    this.animationId = requestAnimationFrame(this.loop);
  }

  start() {
    this.animationId = requestAnimationFrame(this.loop);
  }
  
  stop() {
    window.removeEventListener('keydown', this.handleKeyDown);
    cancelAnimationFrame(this.animationId);
  }
}
