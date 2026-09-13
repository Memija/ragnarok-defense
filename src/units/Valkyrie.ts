import { Entity } from '../entities/Entity';
import { Game } from '../engine/Game';

export class Valkyrie extends Entity {
  speed: number = 800;
  row: number;

  constructor(x: number, y: number, row: number) {
    super(x, y, 60, 80, 1000000); 
    this.row = row;
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    this.x += this.speed * (deltaTime / 1000);
    
    this.y += Math.sin(this.animTimer / 100) * 2;
    
    if (Math.random() < 0.4) {
      game.particles.emit(this.x, this.y + this.height / 2, '#fff59d', 5, 3, 2, 300);
    }
    
    if (this.x > game.canvas.width) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const t = this.animTimer / 80;
      const wingBeat = Math.sin(t) * 0.35;
      const capeWave = Math.sin(t * 1.5) * 6;

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
