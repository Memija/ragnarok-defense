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

interface WeatherParticle {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; angle: number; vAngle: number;
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid: Grid;
  lastTime: number = 0;
  animationId: number = 0;
  realm: string = 'midgard';
  
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
  
  // Cinematic Bifrost entrance transition
  realmEntranceTimer: number = 2.8;

  zombieSpawnTimer: number = 0;
  zombieSpawnInterval: number = 5000;
  
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, realm: string = 'midgard') {
    this.canvas = canvas;
    this.ctx = ctx;
    this.realm = realm;
    this.grid = new Grid(canvas.width, canvas.height, realm);

    this.fortressImg = new Image();
    this.fortressImg.src = '/asgard_fortress.png';

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
    } else if (this.realm === 'helheim' || this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      // Burning embers, green soul wisps, or forge sparks
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

  bindEvents() {
    const unitCards = document.querySelectorAll('.unit-card');
    unitCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        if (target.classList.contains('unavailable')) return;
        
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

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cell = this.grid.getCellFromCoordinates(x, y);
      if (cell && this.selectedUnit) {
        this.placeUnit(cell.row, cell.col, this.selectedUnit);
      }
    });

    const levelUpBtn = document.getElementById('level-up');
    const levelDownBtn = document.getElementById('level-down');
    
    if (levelUpBtn) {
      levelUpBtn.addEventListener('click', () => {
        this.level++;
        this.updateUI();
      });
    }
    
    if (levelDownBtn) {
      levelDownBtn.addEventListener('click', () => {
        if (this.level > 1) {
          this.level--;
          this.updateUI();
        }
      });
    }
  }

  placeUnit(row: number, col: number, unitType: string) {
    const occupantIndex = this.defenders.findIndex(d => d.row === row && d.col === col);
    const isOccupied = occupantIndex !== -1;

    if (unitType === 'shovel') {
      if (isOccupied) {
        const d = this.defenders[occupantIndex];
        this.particles.emit(d.x + d.width/2, d.y + d.height/2, '#795548', 20, 5, 4, 300);
        this.defenders.splice(occupantIndex, 1);
        
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
      for (const z of this.attackers) {
        if (z.row === row) {
          z.takeDamage(1000);
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
          if (proj instanceof SnowProjectile) {
            zombie.slowTimer = 5000;
          } else if (proj instanceof FirePea) {
            zombie.slowTimer = 0;
          } else if (proj instanceof Butter) {
            zombie.stunTimer = 4000;
          }
          
          if (proj instanceof SnowProjectile) {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#81d4fa', 5, 3, 2, 200);
          } else if (proj instanceof FirePea) {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#ff9800', 8, 4, 3, 300);
          } else if (proj instanceof Butter) {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#ffeb3b', 8, 4, 3, 300);
          } else {
            this.particles.emit(proj.x + proj.width, proj.y + proj.height/2, '#4caf50', 5, 3, 2, 200);
          }
          proj.markedForDeletion = true;
          break; 
        }
      }
    }

    for (const zombie of this.attackers) {
      let isEating = false;

      if (zombie.x < 350) {
        if (this.valkyrieAvailable[zombie.row]) {
          this.valkyrieAvailable[zombie.row] = false;
          this.valkyries.push(new Valkyrie(300, zombie.row * this.grid.cellSize + 10, zombie.row));
          this.odinCommandTimer = 1000;
        }
      }

      for (const valk of this.valkyries) {
        if (zombie.row === valk.row && zombie.x < valk.x + valk.width && zombie.x + zombie.width > valk.x) {
          zombie.takeDamage(1000);
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

    if (this.odinCommandTimer > 0) {
      this.odinCommandTimer -= deltaTime;
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

    this.zombieSpawnTimer += deltaTime;
    this.zombieSpawnInterval = Math.max(1000, 5000 - (this.level * 400));

    if (this.zombieSpawnTimer > this.zombieSpawnInterval) {
      this.zombieSpawnTimer = 0;
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
    if (this.realm === 'jotunheim' || this.realm === 'niflheim') {
      wallGrad.addColorStop(0, '#102030');
      wallGrad.addColorStop(0.7, '#1b334a');
      wallGrad.addColorStop(1, '#2c4d68');
    } else if (this.realm === 'asgard' || this.realm === 'alfheim') {
      wallGrad.addColorStop(0, '#3a2d12');
      wallGrad.addColorStop(0.7, '#5c481e');
      wallGrad.addColorStop(1, '#8c6d2d');
    } else if (this.realm === 'helheim' || this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
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
    if (this.realm === 'jotunheim') {
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

    // Outer Fortress Border Beam
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
    ctx.restore();
  }

  // Draw 100% Procedural Animated Living Realm Environments
  drawAtmosphere() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = Date.now() / 1000;

    // === JÖTUNHEIM: AURORA BOREALIS, 3-TIER FROST MOUNTAINS, BLIZZARD ===
    if (this.realm === 'jotunheim') {
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
    } else if (this.realm === 'helheim' || this.realm === 'muspelheim' || this.realm === 'svartalfheim') {
      // Burning underworld embers & soul flames / forge sparks
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.weatherParticles) {
        const isSoul = p.size > 2.5 && this.realm === 'helheim';
        const color = isSoul ? `rgba(105, 240, 174, ${p.alpha})` : 
                      this.realm === 'svartalfheim' ? `rgba(255, 179, 0, ${p.alpha})` : 
                      `rgba(255, 112, 67, ${p.alpha})`;
        const shadow = isSoul ? '#00e676' : 
                       this.realm === 'svartalfheim' ? '#ff8f00' : 
                       '#ff5722';
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
      jotunheim:    { title: 'JÖTUNHEIM',    subtitle: 'REALM OF THE FROST GIANTS', runes: 'ᛃ ᛟ ᛏ ᚢ ᚾ ᚺ ᛖ ᛁ ᛗ', color: '#00e5ff' },
      asgard:       { title: 'ASGARD',       subtitle: 'REALM OF THE AESIR GODS',   runes: 'ᚨ ᛊ ᚷ ᚨ ᚱ ᛞ',       color: '#ffd54f' },
      helheim:      { title: 'HELHEIM',      subtitle: 'REALM OF THE DEAD',         runes: 'ᚺ ᛖ ᛚ ᚺ ᛖ ᛁ ᛗ',       color: '#ff5722' },
      vanaheim:     { title: 'VANAHEIM',     subtitle: 'REALM OF THE VANIR GODS',   runes: 'ᚹ ᚨ ᚾ ᚨ ᚺ ᛖ ᛁ ᛗ', color: '#66bb6a' },
      midgard:      { title: 'MIDGARD',      subtitle: 'REALM OF MORTALS',          runes: 'ᛗ ᛁ ᛞ ᚷ ᚨ ᚱ ᛞ',       color: '#81c784' },
      alfheim:      { title: 'ALFHEIM',      subtitle: 'REALM OF LIGHT ELVES',      runes: 'ᛉ ᛚ ᚠ ᚺ ᛖ ᛁ ᛗ',       color: '#ff80ab' },
      svartalfheim: { title: 'SVARTALFHEIM', subtitle: 'REALM OF DWARVES',          runes: 'ᚲ ᚹ ᚨ ᚱ ᛏ ᚨ ᛚ ᚠ', color: '#ffb300' },
      niflheim:     { title: 'NIFLHEIM',     subtitle: 'REALM OF ICE AND MIST',     runes: 'ᛁ ᚠ ᛚ ᚺ ᛖ ᛁ ᛗ',       color: '#b2ebf2' },
      muspelheim:   { title: 'MUSPELHEIM',   subtitle: 'REALM OF FIRE',             runes: 'ᛊ ᚢ ᛊ ᛈ ᛖ ᛚ ᚺ',       color: '#ff3d00' }
    };

    const info = realmInfo[this.realm] || realmInfo.midgard;

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
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.shadowColor = info.color;
    ctx.shadowBlur = 18;
    ctx.fillText(`✦ ${info.title} ✦`, cx, cy + 2);

    // Subtitle
    ctx.fillStyle = 'rgba(220, 235, 250, 0.85)';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillText(info.subtitle, cx, cy + 36);

    ctx.restore();
  }

  draw() {
    // Dynamic realm base backdrop
    const bgGradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    );
    if (this.realm === 'asgard') {
      bgGradient.addColorStop(0, '#2e2410');
      bgGradient.addColorStop(1, '#0e0b04');
    } else if (this.realm === 'helheim') {
      bgGradient.addColorStop(0, '#2b120c');
      bgGradient.addColorStop(1, '#0e0402');
    } else if (this.realm === 'vanaheim') {
      bgGradient.addColorStop(0, '#152d1d');
      bgGradient.addColorStop(1, '#051108');
    } else if (this.realm === 'jotunheim') {
      bgGradient.addColorStop(0, '#0c2338');
      bgGradient.addColorStop(1, '#030b13');
    } else {
      bgGradient.addColorStop(0, '#1b2838');
      bgGradient.addColorStop(1, '#0b131c');
    }
    
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw living realm weather, mountains, and atmospheric lighting
    this.drawAtmosphere();

    this.drawCastle();
    this.grid.draw(this.ctx);
    
    this.valkyries.forEach(v => v.draw(this.ctx));
    this.defenders.forEach(d => d.draw(this.ctx));
    this.attackers.forEach(a => a.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.particles.draw(this.ctx);

    // Draw cinematic Bifrost entrance sequence
    this.drawRealmEntranceIntro();
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
    cancelAnimationFrame(this.animationId);
  }
}
