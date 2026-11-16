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
  | 'flame_drake'
  | 'frost_giant'
  | 'draugr_jarl'
  | 'magma_juggernaut';
export type EnemyAttackStyle = 'blade' | 'blunt' | 'heavy' | 'bite' | 'fire_breath';
export type EnemyArmorStyle =
  | 'none'
  | 'bronze_cone'
  | 'iron_bucket'
  | 'tower_shield'
  | 'frost_helm'
  | 'runic_plate';

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
  private static readonly LEFT_CORNERS: [number, number, number, number] = [2, 0, 0, 2];
  private static readonly RIGHT_CORNERS: [number, number, number, number] = [0, 2, 2, 0];
  private static attackerHpGradHigh: CanvasGradient | null = null;
  private static attackerHpGradLow: CanvasGradient | null = null;
  private static baseArmorHpGrad: CanvasGradient | null = null;
  private static armorGrads: Partial<Record<EnemyArmorStyle, CanvasGradient>> = {};

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
  stunResistance: number = 0;
  stunImmunityTimer: number = 0;
  winterTier: number = 0;

  mass: number = 1.0;
  animOffset: number;
  hitTilt: number = 0;
  strikeFlashTimer: number = 0;
  swallowed: boolean = false;
  overkilled: boolean = false;
  private lastStepSign: number = 0;
  private readonly cachedPose: MeleePose = { armSwing: 0, bodyLean: 0, jawOpen: 0, slashAlpha: 0 };

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

  modifyProjectileDamage(amount: number, _isFire: boolean, _isStunning: boolean, _isIce?: boolean): number {
    return amount;
  }

  applyStun(baseDurationMs: number): boolean {
    if (this.isStunned || this.stunImmunityTimer > 0 || this.stunResistance >= 0.96) {
      return false;
    }
    const dur = Math.round(baseDurationMs * (1 - this.stunResistance));
    if (dur <= 140) return false;
    this.stunTimer = dur;
    this.isStunned = true;
    return true;
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
    const out = this.cachedPose;
    if (!this.isEating) {
      if (this.strikeFlashTimer > 0) {
        const s = this.strikeFlashTimer / 220;
        out.armSwing = -0.75 * s;
        out.bodyLean = -0.08 * s;
        out.jawOpen = 0.3 * s;
        out.slashAlpha = s;
        return out;
      }
      out.armSwing = 0;
      out.bodyLean = 0;
      out.jawOpen = 0;
      out.slashAlpha = 0;
      return out;
    }

    const slashAlpha = this.strikeFlashTimer > 0 ? this.strikeFlashTimer / 220 : 0;
    const p = Math.max(0, Math.min(1, this.attackTimer / Math.max(1, this.getEffectiveAttackRate())));

    // 0.00 -> 0.22: Recovering from previous downward smash
    if (p < 0.22 && this.strikeFlashTimer > 0) {
      const t = p / 0.22;
      const ease = t * t * (3 - 2 * t);
      out.armSwing = -0.82 * (1 - ease) + 0.05 * ease;
      out.bodyLean = -0.12 * (1 - ease);
      out.jawOpen = 0.4 * (1 - ease);
      out.slashAlpha = slashAlpha;
      return out;
    }

    // 0.00 -> 0.80: Coiling back & raising weapon menacingly overhead
    if (p < 0.80) {
      const t = Math.max(0, (p - 0.1) / 0.7);
      const windup = Math.sin(t * Math.PI * 0.5);
      out.armSwing = windup * 0.98;
      out.bodyLean = windup * 0.09;
      out.jawOpen = Math.max(0, (t - 0.25) / 0.75);
      out.slashAlpha = slashAlpha;
      return out;
    }

    // 0.80 -> 1.00: Violent downward cleave into the defender
    const strikeT = (p - 0.80) / 0.20;
    const fast = strikeT * strikeT;
    out.armSwing = 0.98 * (1 - fast) - 0.88 * fast;
    out.bodyLean = 0.09 * (1 - fast) - 0.14 * fast;
    out.jawOpen = 1 - strikeT * 0.25;
    out.slashAlpha = Math.max(slashAlpha, strikeT * 0.65);
    return out;
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
    if (
      this.enemyKind === 'troll' ||
      this.enemyKind === 'frost_giant' ||
      this.enemyKind === 'magma_juggernaut'
    ) {
      // Heavy ponderous giant / siege-juggernaut stomp (mean = 1.0)
      return 1 + 0.30 * Math.sin(stridePhase * 2);
    }
    if (this.enemyKind === 'draugr_jarl') {
      // Measured warlord march surging into furious cleave strides when enraged (mean = 1.0)
      return 1 + (this.enraged ? 0.24 : 0.20) * Math.sin(stridePhase * 2);
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

    if (this.stunImmunityTimer > 0) {
      this.stunImmunityTimer = Math.max(0, this.stunImmunityTimer - deltaTime);
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.isStunned = false;
        this.stunImmunityTimer = 2200 + this.winterTier * 450;
      } else {
        this.isStunned = true;
        effectiveDeltaTime = 0;
      }
    }

    super.update(effectiveDeltaTime, game);

    const animT = this.getAnimTime();
    const stridePeriod =
      this.enemyKind === 'magma_juggernaut'
        ? 235
        : this.enemyKind === 'frost_giant'
        ? 220
        : this.enemyKind === 'troll'
        ? 210
        : this.enemyKind === 'draugr_jarl'
        ? (this.enraged ? 120 : 172)
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
          if (this.enemyKind === 'magma_juggernaut') {
            game.particles.emit(footX, footY, '#f97316', 4, 2.5, 2.8, 340, -0.02);
            game.particles.emit(footX, footY, '#44403c', 4, 2.2, 2.8, 300, 0.04);
          } else if (this.enemyKind === 'frost_giant') {
            game.particles.emit(footX, footY, '#bae6fd', 4, 2.4, 2.6, 320, 0.02);
            game.particles.emit(footX, footY, '#38bdf8', 3, 1.8, 2.2, 260, 0.01);
          } else if (this.enemyKind === 'troll') {
            game.particles.emit(footX, footY, '#64748b', 5, 2.4, 2.8, 320, 0.04);
            game.particles.emit(footX, footY, '#78716c', 3, 1.8, 2.2, 260, 0.02);
          } else if (this.enemyKind === 'draugr_jarl') {
            const jarlStepColor = this.enraged ? '#ef4444' : '#eab308';
            game.particles.emit(footX, footY, jarlStepColor, 3, 2.0, 2.2, 260, 0.01);
            game.particles.emit(footX, footY, '#475569', 2, 1.6, 2.0, 240, 0.03);
          } else if (this.enemyKind === 'fenrir_wolf') {
            game.particles.emit(footX, footY, '#7dd3fc', 3, 1.8, 2.0, 220, 0.01);
          } else if (this.enemyKind === 'berserker' && this.enraged) {
            game.particles.emit(footX, footY, '#f97316', 3, 2.0, 2.2, 250, -0.01);
          } else if (Math.random() < 0.55) {
            const dustColor = this.winterTier >= 2 || this.isSlowed ? '#bae6fd' : '#57534e';
            game.particles.emit(footX, footY, dustColor, 2, 1.5, 2, 240, 0.02);
          }
          if (this.winterTier >= 2 && Math.random() < 0.5) {
            game.particles.emit(footX, footY - 4, '#e0f2fe', 2, 1.6, 2.0, 260, -0.01);
          }
        }
      }
      this.lastStepSign = stepSign;
    }
  }

  override drawHealthBar(ctx: CanvasRenderingContext2D) {
    if (this.health >= this.maxHealth || this.lastDamageTimer <= 0 || this.markedForDeletion) return;

    ctx.save();
    const isColossal =
      this.enemyKind === 'troll' ||
      this.enemyKind === 'frost_giant' ||
      this.enemyKind === 'magma_juggernaut' ||
      this.enemyKind === 'draugr_jarl';
    const barW = Math.min(58, Math.max(36, this.width * 0.84));
    const barH = isColossal ? 6.5 : 5;
    const bx = this.x + (this.width - barW) / 2;
    const by = this.y - this.getHeadClearance();
    const pct = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const trailPct = Math.max(pct, Math.min(1, this.trailHealth / this.maxHealth));
    const alpha = Math.min(1, this.lastDamageTimer / 500);
    const armored = this.hasArmor();

    ctx.translate(bx, by);
    ctx.globalAlpha = alpha;

    // Dark Forged Iron Frame
    ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
    ctx.strokeStyle = armored
      ? (this.armorStyle === 'iron_bucket'
        ? 'rgba(203, 213, 225, 0.8)'
        : this.armorStyle === 'tower_shield'
        ? 'rgba(56, 189, 248, 0.85)'
        : this.armorStyle === 'frost_helm'
        ? 'rgba(186, 230, 253, 0.9)'
        : this.armorStyle === 'runic_plate'
        ? 'rgba(250, 204, 21, 0.9)'
        : 'rgba(245, 158, 11, 0.8)')
      : 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(-1.5, -1.5, barW + 3, barH + 3, 3);
    ctx.fill();
    ctx.stroke();

    // Recent Hit Damage-Lag Ghost Bar
    if (trailPct > pct + 0.005) {
      ctx.fillStyle = 'rgba(255, 241, 242, 0.78)';
      ctx.beginPath();
      ctx.roundRect(0, 0, barW * trailPct, barH, 2);
      ctx.fill();
    }

    if (armored) {
      const baseRatio = this.armorThreshold / this.maxHealth;
      const baseW = barW * baseRatio;
      const armorW = Math.max(0, barW * pct - baseW);

      // Underlying Flesh/Bone HP segment (cached gradient)
      if (!Attacker.baseArmorHpGrad) {
        const g = ctx.createLinearGradient(0, 0, 28, 0);
        g.addColorStop(0, '#991b1b');
        g.addColorStop(1, '#ef4444');
        Attacker.baseArmorHpGrad = g;
      }
      ctx.fillStyle = Attacker.baseArmorHpGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, baseW, barH, Attacker.LEFT_CORNERS);
      ctx.fill();

      // Helmet / Plate Armor HP segment
      if (armorW > 0.5) {
        let armGrad = Attacker.armorGrads[this.armorStyle];
        if (!armGrad) {
          armGrad = ctx.createLinearGradient(14, 0, 58, 0);
          if (this.armorStyle === 'iron_bucket') {
            armGrad.addColorStop(0, '#64748b');
            armGrad.addColorStop(0.5, '#cbd5e1');
            armGrad.addColorStop(1, '#f8fafc');
          } else if (this.armorStyle === 'tower_shield') {
            armGrad.addColorStop(0, '#0284c7');
            armGrad.addColorStop(0.5, '#38bdf8');
            armGrad.addColorStop(1, '#bae6fd');
          } else if (this.armorStyle === 'frost_helm') {
            armGrad.addColorStop(0, '#0369a1');
            armGrad.addColorStop(0.5, '#7dd3fc');
            armGrad.addColorStop(1, '#f0f9ff');
          } else if (this.armorStyle === 'runic_plate') {
            armGrad.addColorStop(0, '#991b1b');
            armGrad.addColorStop(0.45, '#d97706');
            armGrad.addColorStop(1, '#fef08a');
          } else {
            armGrad.addColorStop(0, '#b45309');
            armGrad.addColorStop(0.5, '#f59e0b');
            armGrad.addColorStop(1, '#fef08a');
          }
          Attacker.armorGrads[this.armorStyle] = armGrad;
        }
        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.roundRect(baseW, 0, armorW, barH, Attacker.RIGHT_CORNERS);
        ctx.fill();
      }

      // Crisp Armor Notch Divider
      ctx.fillStyle = '#020617';
      ctx.fillRect(baseW - 0.6, -0.5, 1.2, barH + 1);
    } else {
      if (pct > 0.35) {
        if (!Attacker.attackerHpGradHigh) {
          const g = ctx.createLinearGradient(0, 0, 58, 0);
          g.addColorStop(0, '#b91c1c');
          g.addColorStop(0.6, '#ef4444');
          g.addColorStop(1, '#fb7185');
          Attacker.attackerHpGradHigh = g;
        }
        ctx.fillStyle = Attacker.attackerHpGradHigh;
      } else {
        if (!Attacker.attackerHpGradLow) {
          const g = ctx.createLinearGradient(0, 0, 58, 0);
          g.addColorStop(0, '#7f1d1d');
          g.addColorStop(1, '#dc2626');
          Attacker.attackerHpGradLow = g;
        }
        ctx.fillStyle = Attacker.attackerHpGradLow;
      }
      ctx.beginPath();
      ctx.roundRect(0, 0, barW * pct, barH, 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
