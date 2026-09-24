import { Entity } from '../entities/Entity';
import { Game } from '../engine/Game';

export class Valkyrie extends Entity {
  speed: number = 850;
  row: number;
  realm: string;
  city?: string;

  constructor(x: number, y: number, row: number, realm: string = 'midgard', city?: string) {
    super(x, y, 75, 75, 1000000); 
    this.row = row;
    this.realm = realm;
    this.city = city;
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    this.x += this.speed * (deltaTime / 1000);
    
    if (this.realm === 'svartalfheim' && this.city === 'althjofs-wheel') {
      // Hydrodynamic canal wave bobbing & churning splash particles
      this.y += Math.sin(this.animTimer / 50) * 1.5;
      if (Math.random() < 0.6) {
        game.particles.emit(this.x - 20, this.y + this.height / 2, '#2dd4bf', 4, 3, 2, 200);
        game.particles.emit(this.x - 35, this.y + this.height / 2 + (Math.random() - 0.5) * 16, '#e0f2fe', 3, 2, 2, 180);
      }
    } else if (this.realm === 'svartalfheim' && this.city === 'nidavellir') {
      // Fiery forge rocket smoke & sparks
      this.y += Math.sin(this.animTimer / 70) * 1.0;
      if (Math.random() < 0.5) {
        game.particles.emit(this.x - 15, this.y + this.height / 2, '#ff8c00', 4, 3, 2, 220);
      }
    } else {
      // Celestial Valkyrie divine flight
      this.y += Math.sin(this.animTimer / 100) * 2;
      if (Math.random() < 0.4) {
        game.particles.emit(this.x, this.y + this.height / 2, '#fff59d', 5, 3, 2, 300);
      }
    }
    
    if (this.x > game.width + 60) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const t = this.animTimer / 60;

      // ══════════════════════════════════════════════
      // 1. SVARTALFHEIM (ALTHJOF'S WHEEL): DWARVEN HYDRAULIC TORRENT RAM
      // ══════════════════════════════════════════════
      if (this.realm === 'svartalfheim' && this.city === 'althjofs-wheel') {
        // High-velocity churning tidal wave plume trailing behind
        const plumeGrad = ctx.createLinearGradient(cx - 70, cy, cx - 10, cy);
        plumeGrad.addColorStop(0, 'rgba(14, 165, 233, 0)');
        plumeGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.45)');
        plumeGrad.addColorStop(0.7, 'rgba(45, 212, 191, 0.75)');
        plumeGrad.addColorStop(1, 'rgba(224, 242, 254, 0.95)');
        ctx.fillStyle = plumeGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 15, cy - 14);
        ctx.quadraticCurveTo(cx - 45, cy - 28 + Math.sin(t * 3) * 6, cx - 75, cy - 8);
        ctx.lineTo(cx - 65, cy + 12);
        ctx.quadraticCurveTo(cx - 40, cy + 26 + Math.cos(t * 3) * 6, cx - 15, cy + 14);
        ctx.closePath();
        ctx.fill();

        // Frothing whitewater wave crests
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 10);
        ctx.quadraticCurveTo(cx - 45, cy - 20, cx - 70, cy - 4);
        ctx.moveTo(cx - 20, cy + 10);
        ctx.quadraticCurveTo(cx - 45, cy + 20, cx - 70, cy + 6);
        ctx.stroke();

        // Rotating Hydrodynamic Turbine Vanes inside rear chamber
        ctx.save();
        ctx.translate(cx - 18, cy);
        ctx.rotate(t * 9);
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 2;
        for (let fi = 0; fi < 4; fi++) {
          const fa = (fi * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(fa) * 14, Math.sin(fa) * 14);
          ctx.stroke();
        }
        ctx.restore();

        // Heavy Forged Bronze & Basalt Torpedo Chassis
        const hullGrad = ctx.createLinearGradient(cx - 28, cy - 12, cx - 28, cy + 12);
        hullGrad.addColorStop(0, '#d97706');
        hullGrad.addColorStop(0.4, '#f59e0b');
        hullGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = hullGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 28, cy - 11, 40, 22, 5);
        ctx.fill();
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Bronze Reinforcing Ribs & Rivets
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(cx - 16, cy - 12, 4, 24);
        ctx.fillRect(cx - 2, cy - 12, 4, 24);
        ctx.fillStyle = '#14b8a6';
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 4;
        ctx.fillRect(cx - 15, cy - 9, 2, 2.5);
        ctx.fillRect(cx - 15, cy + 6.5, 2, 2.5);
        ctx.fillRect(cx - 1, cy - 9, 2, 2.5);
        ctx.fillRect(cx - 1, cy + 6.5, 2, 2.5);
        ctx.shadowBlur = 0;

        // Inscribed Glowing Canal Rune ᛏ (Tyr / Force)
        ctx.fillStyle = '#ccfbf1';
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 8;
        ctx.font = 'bold 11px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ᛏ', cx - 9, cy);
        ctx.shadowBlur = 0;

        // Heavy Iron Harpoon Base Collar
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 12);
        ctx.lineTo(cx + 30, cy);
        ctx.lineTo(cx + 12, cy + 12);
        ctx.closePath();
        ctx.fill();

        // Massive Triple-Barbed Runic Trident Spearhead (Glowing Cyan)
        ctx.fillStyle = '#2dd4bf';
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 18;
        // Central piercing spear
        ctx.beginPath();
        ctx.moveTo(cx + 24, cy - 7);
        ctx.lineTo(cx + 52, cy);
        ctx.lineTo(cx + 24, cy + 7);
        ctx.lineTo(cx + 30, cy);
        ctx.closePath();
        ctx.fill();
        // Top barb
        ctx.beginPath();
        ctx.moveTo(cx + 16, cy - 16);
        ctx.lineTo(cx + 38, cy - 10);
        ctx.lineTo(cx + 28, cy - 6);
        ctx.closePath();
        ctx.fill();
        // Bottom barb
        ctx.beginPath();
        ctx.moveTo(cx + 16, cy + 16);
        ctx.lineTo(cx + 38, cy + 10);
        ctx.lineTo(cx + 28, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pressurized Cavitation Shockwave Cone
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + 52, cy, 9, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.stroke();
        return;
      }

      // ══════════════════════════════════════════════
      // 2. SVARTALFHEIM (NIDAVELLIR): DWARVEN MOLTEN SIEGE BOLT
      // ══════════════════════════════════════════════
      if (this.realm === 'svartalfheim' && this.city === 'nidavellir') {
        // Trailing molten fire plume
        const flameGrad = ctx.createLinearGradient(cx - 60, cy, cx - 10, cy);
        flameGrad.addColorStop(0, 'rgba(255, 61, 0, 0)');
        flameGrad.addColorStop(0.4, 'rgba(255, 140, 0, 0.6)');
        flameGrad.addColorStop(0.8, 'rgba(255, 215, 0, 0.9)');
        flameGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 15, cy - 10);
        ctx.quadraticCurveTo(cx - 40, cy - 18, cx - 65, cy);
        ctx.quadraticCurveTo(cx - 40, cy + 18, cx - 15, cy + 10);
        ctx.closePath();
        ctx.fill();

        // Heavy Iron Siege Shaft
        ctx.fillStyle = '#1e1812';
        ctx.fillRect(cx - 25, cy - 4, 45, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx - 20, cy - 6, 8, 12);
        ctx.fillRect(cx + 5, cy - 6, 8, 12);

        // Blazing Molten Arrowhead
        ctx.fillStyle = '#ff3d00';
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(cx + 18, cy - 14);
        ctx.lineTo(cx + 50, cy);
        ctx.lineTo(cx + 18, cy + 14);
        ctx.lineTo(cx + 26, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        return;
      }

      // ══════════════════════════════════════════════
      // 3. ASGARDIAN REALMS: CELESTIAL WINGED VALKYRIE
      // ══════════════════════════════════════════════
      const wingBeat = Math.sin(t * 1.3) * 0.35;
      const capeWave = Math.sin(t * 2.0) * 6;

      // Divine Celestial Aura
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#38bdf8';

      // Auroral Flowing Cloak (trailing behind to the left)
      const cloakGrad = ctx.createLinearGradient(cx - 50, cy, cx - 10, cy);
      cloakGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      cloakGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.7)');
      cloakGrad.addColorStop(1, 'rgba(45, 212, 191, 0.9)');
      ctx.fillStyle = cloakGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 12);
      ctx.quadraticCurveTo(cx - 35, cy - 6 + capeWave, cx - 55, cy + 8 + capeWave);
      ctx.lineTo(cx - 48, cy + 24 + capeWave);
      ctx.quadraticCurveTo(cx - 28, cy + 16, cx - 6, cy + 18);
      ctx.closePath();
      ctx.fill();

      // Back Wing (flapping)
      ctx.save();
      ctx.translate(cx - 8, cy - 8);
      ctx.rotate(-0.4 + wingBeat);
      ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(-16, -18, 28, 12, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      // Back Wing feather tip highlight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-32, -28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Silver Plated Greaves & Boots
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy + 18, 8, 16, 2);
      ctx.roundRect(cx + 2, cy + 18, 8, 16, 2);
      ctx.fill();

      // Armored Body (Silver Cuirass with Gold Trim)
      const armorGrad = ctx.createLinearGradient(cx - 12, cy - 14, cx + 12, cy + 16);
      armorGrad.addColorStop(0, '#f8fafc');
      armorGrad.addColorStop(0.5, '#cbd5e1');
      armorGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 12, cy - 12, 24, 30, 4);
      ctx.fill();

      // Gold Valknut / Asgardian Chest Inscription
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx - 6, cy);
      ctx.lineTo(cx + 6, cy);
      ctx.closePath();
      ctx.fill();

      // Platinum / Golden Hair flowing backwards
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 24);
      ctx.quadraticCurveTo(cx - 24, cy - 20 + capeWave * 0.5, cx - 36, cy - 12 + capeWave);
      ctx.lineTo(cx - 26, cy - 8);
      ctx.quadraticCurveTo(cx - 14, cy - 14, cx - 2, cy - 16);
      ctx.fill();

      // Face & Neck
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(cx + 2, cy - 20, 11, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Celestial Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 21, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Winged Silver Helmet
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(cx + 2, cy - 23, 11.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      // Gold Brow Band
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 7, cy - 25, 18, 3.5);

      // Helm Feather Wings
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 25);
      ctx.lineTo(cx - 14, cy - 42);
      ctx.lineTo(cx - 8, cy - 22);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 25);
      ctx.lineTo(cx - 16, cy - 38);
      ctx.lineTo(cx - 12, cy - 24);
      ctx.fill();

      // Fore Wing (flapping dynamically)
      ctx.save();
      ctx.translate(cx - 4, cy - 4);
      ctx.rotate(-0.2 - wingBeat);
      const wingGrad = ctx.createLinearGradient(-30, -25, 10, 10);
      wingGrad.addColorStop(0, '#ffffff');
      wingGrad.addColorStop(0.7, '#e0f2fe');
      wingGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.ellipse(-14, -14, 32, 14, -Math.PI / 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Feathered tips
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-26, -26, 6, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      // Gungnir Spear (Divine spear pointing forward to right)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fef08a';
      // Polished Shaft
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 22);
      ctx.lineTo(cx + 50, cy - 14);
      ctx.stroke();

      // Radiant Gold & Silver Spearhead
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(cx + 42, cy - 11);
      ctx.lineTo(cx + 62, cy - 19);
      ctx.lineTo(cx + 49, cy - 21);
      ctx.closePath();
      ctx.fill();

      // Spear Energy Flare Tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 62, cy - 19, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    });
  }
}
