import { Entity } from './Entity';

export type EnemyVisualKind =
  | 'basic'
  | 'conehead'
  | 'buckethead'
  | 'small_troll'
  | 'troll'
  | 'fenrir_wolf'
  | 'berserker'
  | 'shieldbearer'
  | 'flame_drake';
export type EnemyAttackStyle = 'blade' | 'blunt' | 'heavy' | 'bite' | 'fire_breath';
export type EnemyArmorStyle = 'none' | 'bronze_cone' | 'iron_bucket' | 'tower_shield';

export interface MeleePose {
  /** Positive = raised overhead/back (clockwise), Negative = cleaved forward-downward (counter-clockwise) */
  armSwing: number;
  /** Positive = coiled/reeled back, Negative = lunging forward-left */
  bodyLean: number;
  /** 0..1 jaw roar opening */
  jawOpen: number;
  /** 0..1 weapon slash arc opacity right on strike */
  slashAlpha: number;
}

export abstract class Attacker extends Entity {
  speed: number;
  damage: number;
  row: number;
  isEating: boolean = false;
  isSlowed: boolean = false;
  slowTimer: number = 0;
  isStunned: boolean = false;
  stunTimer: number = 0;
  attackTimer: number = 0;
  attackRate: number = 1250;

  enemyKind: EnemyVisualKind = 'basic';
  attackStyle: EnemyAttackStyle = 'blade';
  armorStyle: EnemyArmorStyle = 'none';
  armorThreshold: number = 0;
  armorBroken: boolean = false;
  justBrokeArmor: boolean = false;

  attackReach: number = 0;
  isFlying: boolean = false;
  enraged: boolean = false;
  justEnraged: boolean = false;
  frostResistance: number = 0;

  mass: number = 1.0;
  animOffset: number;
  hitTilt: number = 0;
  strikeFlashTimer: number = 0;
  swallowed: boolean = false;
  overkilled: boolean = false;
  private lastStepSign: number = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    health: number,
    speed: number,
    damage: number,
    row: number
  ) {
    super(x, y, width, height, health);
    this.speed = speed;
    this.damage = damage;
    this.row = row;
    this.animOffset = Math.random() * 1000;
  }

  getAnimTime(): number {
    return this.animTimer + this.animOffset;
  }

  hasArmor(): boolean {
    return this.armorThreshold > 0 && this.health > this.armorThreshold;
  }

  getArmorIntegrity(): number {
    if (!this.hasArmor() || this.maxHealth <= this.armorThreshold) return 0;
    return Math.max(0, Math.min(1, (this.health - this.armorThreshold) / (this.maxHealth - this.armorThreshold)));
  }

  override getHeadClearance(): number {
    return 14;
  }

  getEffectiveSpeed(): number {
    return this.speed;
  }

  getEffectiveAttackRate(): number {
    return this.attackRate;
  }

  modifyProjectileDamage(amount: number, _isFire: boolean, _isStunning: boolean): number {
    return amount;
  }

  override takeDamage(amount: number) {
    const hadArmor = this.hasArmor();
    super.takeDamage(amount);

    if (amount >= 180) {
      this.overkilled = true;
    }

    // Tactile mass-based knockback, squash/stretch, and upper-body flinch
    const clampedAmt = Math.min(amount, 80);
    this.recoilX = Math.min(12, this.recoilX + (3.8 + clampedAmt * 0.065) / this.mass);
    const jolt = Math.min(0.14, (0.065 + clampedAmt * 0.001) / Math.sqrt(this.mass));
    this.scaleX = 1 - jolt * 0.85;
    this.scaleY = 1 + jolt;
    this.hitTilt = Math.min(0.24, this.hitTilt + 0.11 / this.mass);

    if (hadArmor && !this.hasArmor() && !this.armorBroken) {
      this.armorBroken = true;
      this.justBrokeArmor = true;
      this.recoilX = Math.min(15, this.recoilX + 5.5);
      this.hitTilt = 0.26;
      this.scaleX = 0.86;
      this.scaleY = 1.14;
    }
  }

  onMeleeStrike() {
    this.strikeFlashTimer = 220;
    this.recoilX = -5.5 / Math.sqrt(this.mass);
    this.scaleX = 1.09;
    this.scaleY = 0.93;
  }

  getMeleePose(): MeleePose {
    if (!this.isEating) {
      if (this.strikeFlashTimer > 0) {
        const s = this.strikeFlashTimer / 220;
        return {
          armSwing: -0.75 * s,
          bodyLean: -0.08 * s,
          jawOpen: 0.3 * s,
          slashAlpha: s
        };
      }
      return { armSwing: 0, bodyLean: 0, jawOpen: 0, slashAlpha: 0 };
    }

    const slashAlpha = this.strikeFlashTimer > 0 ? this.strikeFlashTimer / 220 : 0;
    const p = Math.max(0, Math.min(1, this.attackTimer / Math.max(1, this.getEffectiveAttackRate())));

    // 0.00 -> 0.22: Recovering from previous downward smash
    if (p < 0.22 && this.strikeFlashTimer > 0) {
      const t = p / 0.22;
      const ease = t * t * (3 - 2 * t);
      return {
        armSwing: -0.82 * (1 - ease) + 0.05 * ease,
        bodyLean: -0.12 * (1 - ease),
        jawOpen: 0.4 * (1 - ease),
        slashAlpha
      };
    }

    // 0.00 -> 0.80: Coiling back & raising weapon menacingly overhead
    if (p < 0.80) {
      const t = Math.max(0, (p - 0.1) / 0.7);
      const windup = Math.sin(t * Math.PI * 0.5);
      return {
        armSwing: windup * 0.98,
        bodyLean: windup * 0.09,
        jawOpen: Math.max(0, (t - 0.25) / 0.75),
        slashAlpha
      };
    }

    // 0.80 -> 1.00: Violent downward cleave into the defender
    const strikeT = (p - 0.80) / 0.20;
    const fast = strikeT * strikeT;
    return {
      armSwing: 0.98 * (1 - fast) - 0.88 * fast,
      bodyLean: 0.09 * (1 - fast) - 0.14 * fast,
      jawOpen: 1 - strikeT * 0.25,
      slashAlpha: Math.max(slashAlpha, strikeT * 0.65)
    };
  }

  protected getStrideCadenceMultiplier(stridePhase: number): number {
    if (this.enemyKind === 'fenrir_wolf') {
      // Bounding quadruped dire-wolf lope (mean = 1.0)
      return 1 + 0.26 * Math.cos(stridePhase * 2);
    }
    if (this.enemyKind === 'small_troll') {
      // Agile bounding scuttle (mean = 1.0)
      return 1 + 0.22 * Math.cos(stridePhase * 2);
    }
    if (this.enemyKind === 'troll') {
      // Heavy ponderous giant stomp (mean = 1.0)
      return 1 + 0.28 * Math.sin(stridePhase * 2);
    }
    if (this.enemyKind === 'flame_drake') {
      // Aerial wingbeat glide surge (mean = 1.0)
      return 1 + 0.14 * Math.sin(stridePhase);
    }
    // Undead Draugr / Berserker / Shieldbearer stride (mean = 1.0)
    return 1 + 0.18 * Math.sin(stridePhase * 2);
  }

  override update(deltaTime: number, game?: any) {
    let effectiveDeltaTime = deltaTime;

    if (this.strikeFlashTimer > 0) {
      this.strikeFlashTimer = Math.max(0, this.strikeFlashTimer - deltaTime);
    }
    if (this.hitTilt > 0.002) {
      this.hitTilt -= this.hitTilt * Math.min(1, deltaTime / 90);
    } else {
      this.hitTilt = 0;
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.isSlowed = false;
      } else {
        this.isSlowed = true;
        effectiveDeltaTime = deltaTime * 0.5;
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.isStunned = false;
      } else {
        this.isStunned = true;
        effectiveDeltaTime = 0;
      }
    }

    super.update(effectiveDeltaTime, game);

    const animT = this.getAnimTime();
    const stridePeriod =
      this.enemyKind === 'troll'
        ? 210
        : this.enemyKind === 'fenrir_wolf'
        ? 92
        : this.enemyKind === 'berserker'
        ? (this.enraged ? 96 : 128)
        : this.enemyKind === 'small_troll'
        ? 115
        : this.enemyKind === 'flame_drake'
        ? 140
        : 150;
    const stridePhase = animT / stridePeriod;
    const pose = this.getMeleePose();
    this.rotation = this.hitTilt + pose.bodyLean;

    if (!this.isEating && !this.isStunned) {
      const cadence = this.getStrideCadenceMultiplier(stridePhase);
      this.x -= this.getEffectiveSpeed() * cadence * (effectiveDeltaTime / 1000);

      // Rhythmic footfall dust / frost puffs (or aerial drake embers)
      const stepSin = Math.sin(stridePhase);
      const stepSign = stepSin >= 0 ? 1 : -1;
      if (this.lastStepSign !== 0 && stepSign !== this.lastStepSign && game) {
        if (this.isFlying) {
          if (Math.random() < 0.65) {
            const emberX = this.x + this.width * 0.55;
            const emberY = this.y + this.height * 0.55;
            game.particles.emit(emberX, emberY, '#fb923c', 2, 1.4, 2.0, 260, -0.02);
          }
        } else {
          const footX = this.x + this.width * 0.5 + (stepSign > 0 ? -6 : 6);
          const footY = this.y + this.height - 3;
          if (this.enemyKind === 'troll') {
            game.particles.emit(footX, footY, '#64748b', 5, 2.4, 2.8, 320, 0.04);
            game.particles.emit(footX, footY, '#78716c', 3, 1.8, 2.2, 260, 0.02);
          } else if (this.enemyKind === 'fenrir_wolf') {
            game.particles.emit(footX, footY, '#7dd3fc', 3, 1.8, 2.0, 220, 0.01);
          } else if (this.enemyKind === 'berserker' && this.enraged) {
            game.particles.emit(footX, footY, '#f97316', 3, 2.0, 2.2, 250, -0.01);
          } else if (Math.random() < 0.55) {
            const dustColor = this.isSlowed ? '#7dd3fc' : '#57534e';
            game.particles.emit(footX, footY, dustColor, 2, 1.5, 2, 240, 0.02);
          }
        }
      }
      this.lastStepSign = stepSign;
    }
  }

  override drawHealthBar(ctx: CanvasRenderingContext2D) {
    if (this.health >= this.maxHealth || this.lastDamageTimer <= 0 || this.markedForDeletion) return;

    ctx.save();
    const barW = Math.min(54, Math.max(36, this.width * 0.84));
    const barH = this.enemyKind === 'troll' ? 6.5 : 5;
    const bx = this.x + (this.width - barW) / 2;
    const by = this.y - this.getHeadClearance();
    const pct = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const trailPct = Math.max(pct, Math.min(1, this.trailHealth / this.maxHealth));
    const alpha = Math.min(1, this.lastDamageTimer / 500);
    const armored = this.hasArmor();

    ctx.globalAlpha = alpha;

    // Dark Forged Iron Frame
    ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
    ctx.strokeStyle = armored
      ? (this.armorStyle === 'iron_bucket'
        ? 'rgba(203, 213, 225, 0.8)'
        : this.armorStyle === 'tower_shield'
        ? 'rgba(56, 189, 248, 0.85)'
        : 'rgba(245, 158, 11, 0.8)')
      : 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(bx - 1.5, by - 1.5, barW + 3, barH + 3, 3);
    ctx.fill();
    ctx.stroke();

    // Recent Hit Damage-Lag Ghost Bar
    if (trailPct > pct + 0.005) {
      ctx.fillStyle = 'rgba(255, 241, 242, 0.78)';
      ctx.beginPath();
      ctx.roundRect(bx, by, barW * trailPct, barH, 2);
      ctx.fill();
    }

    if (armored) {
      const baseRatio = this.armorThreshold / this.maxHealth;
      const baseW = barW * baseRatio;
      const armorW = Math.max(0, barW * pct - baseW);

      // Underlying Flesh/Bone HP segment
      const baseGrad = ctx.createLinearGradient(bx, by, bx + baseW, by);
      baseGrad.addColorStop(0, '#991b1b');
      baseGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, baseW, barH, [2, 0, 0, 2]);
      ctx.fill();

      // Helmet Armor HP segment
      if (armorW > 0.5) {
        const armGrad = ctx.createLinearGradient(bx + baseW, by, bx + baseW + armorW, by);
        if (this.armorStyle === 'iron_bucket') {
          armGrad.addColorStop(0, '#64748b');
          armGrad.addColorStop(0.5, '#cbd5e1');
          armGrad.addColorStop(1, '#f8fafc');
        } else if (this.armorStyle === 'tower_shield') {
          armGrad.addColorStop(0, '#0284c7');
          armGrad.addColorStop(0.5, '#38bdf8');
          armGrad.addColorStop(1, '#bae6fd');
        } else {
          armGrad.addColorStop(0, '#b45309');
          armGrad.addColorStop(0.5, '#f59e0b');
          armGrad.addColorStop(1, '#fef08a');
        }
        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.roundRect(bx + baseW, by, armorW, barH, [0, 2, 2, 0]);
        ctx.fill();
      }

      // Crisp Armor Notch Divider
      ctx.fillStyle = '#020617';
      ctx.fillRect(bx + baseW - 0.6, by - 0.5, 1.2, barH + 1);
    } else {
      const hpGrad = ctx.createLinearGradient(bx, by, bx + barW, by);
      if (pct > 0.35) {
        hpGrad.addColorStop(0, '#b91c1c');
        hpGrad.addColorStop(0.6, '#ef4444');
        hpGrad.addColorStop(1, '#fb7185');
      } else {
        hpGrad.addColorStop(0, '#7f1d1d');
        hpGrad.addColorStop(1, '#dc2626');
      }
      ctx.fillStyle = hpGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW * pct, barH, 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
