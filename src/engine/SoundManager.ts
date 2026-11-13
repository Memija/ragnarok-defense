// Procedural Web Audio API Sound Synthesizer for Ragnarok Defense
// Generates authentic dynamic sound effects without external audio files

export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private lastHitSoundTime: number = 0;
  private lastMeleeSoundTime: number = 0;
  private lastDeathSoundTime: number = 0;
  public isMuted: boolean = false;
  public volume: number = 0.8;

  private constructor() {
    const saved = localStorage.getItem('ragnarok_muted');
    this.isMuted = saved === 'true';
    const savedVol = localStorage.getItem('ragnarok_volume');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        this.volume = parsed;
      }
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
      const bufferSize = Math.floor(ctx.sampleRate * 0.4);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  private initCtx(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public getDestination(ctx: AudioContext): AudioNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('ragnarok_volume', this.volume.toString());
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('ragnarok_muted', this.isMuted.toString());
    if (this.isMuted && this.ctx) {
      this.ctx.suspend();
    } else if (!this.isMuted) {
      this.initCtx();
    }
    return this.isMuted;
  }

  public resumeContext(): void {
    if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
  }

  private autoCleanup(source: OscillatorNode | AudioBufferSourceNode, nodes: AudioNode[] = []) {
    source.onended = () => {
      try {
        source.disconnect();
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].disconnect();
        }
      } catch (_) {}
    };
  }

  // Crisp Norse UI Medallion Click
  public playClick() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Heavy Iron Dwarven Lock Rattle (Locked Sector Feedback)
  public playLocked() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Playful Celestial Squirrel Chime / Chirp (Ratatoskr)
  public playSquirrelChirp() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.16);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Mystical Earth / Rune Plant Chime
  public playPlant() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [330, 440, 554.37, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      gain.gain.setValueAtTime(0.15, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.18);
      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      this.autoCleanup(osc, [gain]);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.18);
    });
  }

  // Kinetic Shoot Sound (Pea / Ice / Fire / Butter)
  public playShoot(type: 'pea' | 'ice' | 'fire' | 'butter' = 'pea') {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'ice') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else if (type === 'fire') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (type === 'butter') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Projectile Impact / Enemy Hit Thud
  public playHit() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastHitSoundTime < 0.035) return;
    this.lastHitSoundTime = now;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Metallic Plate / Helm Clang (Armored Conehead & Buckethead Hit)
  public playArmorHit(isHeavyIron: boolean = false) {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastHitSoundTime < 0.035) return;
    this.lastHitSoundTime = now;

    const baseFreq = isHeavyIron ? 760 : 980;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.42, now + 0.09);
    osc2.frequency.setValueAtTime(baseFreq * 1.47, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.07);

    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    this.autoCleanup(osc2);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.09);
    osc2.stop(now + 0.075);
  }

  // Shattering Forged Helm Break (Armor Broken Milestone)
  public playArmorBreak() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    [920, 610, 380].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.35, now + idx * 0.02 + 0.16);
      gain.gain.setValueAtTime(0.15, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.16);
      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      this.autoCleanup(osc, [gain]);
      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.16);
    });
  }

  // Enemy Melee / Breath Strike (Blade Slash / Cudgel Crunch / Jötunn Slam / Wolf Bite / Dragonfire)
  public playEnemyAttack(style: 'blade' | 'blunt' | 'heavy' | 'bite' | 'fire_breath' = 'blade') {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (style !== 'heavy' && style !== 'fire_breath' && now - this.lastMeleeSoundTime < 0.08) return;
    this.lastMeleeSoundTime = now;

    if (style === 'heavy') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.24);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination(ctx));
      this.autoCleanup(osc, [filter, gain]);
      osc.start(now);
      osc.stop(now + 0.24);
      return;
    }

    if (style === 'fire_breath') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.22);
      filter.Q.value = 1.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination(ctx));
      this.autoCleanup(noise, [filter, gain]);
      noise.start(now);
      noise.stop(now + 0.22);
      return;
    }

    if (style === 'bite') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.06);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination(ctx));
      this.autoCleanup(osc, [filter, gain]);
      osc.start(now);
      osc.stop(now + 0.065);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = style === 'blade' ? 'sawtooth' : 'triangle';
    const startF = style === 'blade' ? 310 : 190;
    const endF = style === 'blade' ? 95 : 65;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + 0.075);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(style === 'blade' ? 900 : 480, now);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [filter, gain]);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Ulfhednar Berserker Blood-Rage Roar
  public playBerserkRoar() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.linearRampToValueAtTime(215, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(92, now + 0.34);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [filter, gain]);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Enemy Collapse / Banishment Sound
  public playEnemyDeath(isHeavy: boolean = false) {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (!isHeavy && now - this.lastDeathSoundTime < 0.06) return;
    this.lastDeathSoundTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isHeavy ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isHeavy ? 125 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(isHeavy ? 36 : 68, now + (isHeavy ? 0.28 : 0.15));
    gain.gain.setValueAtTime(isHeavy ? 0.2 : 0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.28 : 0.15));
    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start(now);
    osc.stop(now + (isHeavy ? 0.28 : 0.15));
  }

  // Deep Explosive Blast (Cherry Bomb, Potato Mine, Jalapeño)
  public playExplosion() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub-bass rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [gain]);
    osc.start(now);
    osc.stop(now + 0.6);

    // Noise burst simulation (cached buffer reuse to eliminate GC pauses)
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.4);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.getDestination(ctx));
    this.autoCleanup(noise, [noiseFilter, noiseGain]);
    noise.start(now);
    noise.stop(now + 0.4);
  }

  // Radiant Sol Energy Sparkle Arpeggio
  public playSun() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.12, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.22);
      osc.connect(gain);
      gain.connect(this.getDestination(ctx));
      this.autoCleanup(osc, [gain]);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.22);
    });
  }

  // Norse Watchman Horn Call (Scout & Standard Wave Arrival)
  public playScoutHorn() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.16);
    osc.frequency.setValueAtTime(293.66, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(246.94, now + 0.58);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 780;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [filter, gain]);
    osc.start(now);
    osc.stop(now + 0.58);
  }

  // Ancient Gjallarhorn / Horde Wave Warning
  public playWave() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.5);
    osc.frequency.linearRampToValueAtTime(130, now + 1.2);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [filter, gain]);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Celestial Victory Fanfare
  public playVictory() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chords = [
      { t: 0.0, f: [440, 554.37, 659.25] },
      { t: 0.25, f: [493.88, 622.25, 739.99] },
      { t: 0.55, f: [554.37, 659.25, 880] }
    ];

    chords.forEach(({ t, f }) => {
      f.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.12, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.7);
        osc.connect(gain);
        gain.connect(this.getDestination(ctx));
        this.autoCleanup(osc, [gain]);
        osc.start(now + t);
        osc.stop(now + t + 0.7);
      });
    });
  }

  // Ominous Defeat Gong
  public playDefeat() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.5);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination(ctx));
    this.autoCleanup(osc, [filter, gain]);
    osc.start(now);
    osc.stop(now + 1.5);
  }
}
