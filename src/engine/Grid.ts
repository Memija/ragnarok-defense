export class Grid {
  rows: number = 5;
  cols: number = 9;
  startX: number = 220;
  cellWidth: number;
  cellHeight: number;
  cellSize: number; // for backwards compatibility
  width: number;
  height: number;
  realm: string = 'midgard';
  city?: string;

  constructor(canvasWidth: number, canvasHeight: number, realm: string = 'midgard', city?: string) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.realm = realm;
    this.city = city;

    // Fortress wall takes ~20% of width (clamped between 180 and 240)
    this.startX = Math.max(180, Math.min(240, Math.round(this.width * 0.20)));
    this.cellWidth = (this.width - this.startX) / this.cols;
    this.cellHeight = this.height / this.rows;
    this.cellSize = this.cellHeight; // compatibility fallback
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // ── Draw Each Grid Cell with Realm-Specific Luxury Flagstone Style ──
    for (let r = 0; r < this.rows; r++) {
      const y = r * this.cellHeight;
      
      for (let c = 0; c < this.cols; c++) {
        const x = this.startX + c * this.cellWidth;
        const isAlt = (r + c) % 2 === 0;

        ctx.save();

        if (this.realm === 'svartalfheim' && this.city === 'althjofs-wheel') {
          // ── Althjof's Wheel: Subterranean Dwarven Basalt Canal Paving ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          if (isAlt) {
            tileGrad.addColorStop(0, 'rgba(18, 28, 35, 0.45)');
            tileGrad.addColorStop(1, 'rgba(10, 18, 24, 0.55)');
          } else {
            tileGrad.addColorStop(0, 'rgba(14, 22, 29, 0.35)');
            tileGrad.addColorStop(1, 'rgba(8, 14, 20, 0.45)');
          }
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          // Subtle cyan-teal beveled stone trim
          ctx.strokeStyle = isAlt ? 'rgba(45, 212, 191, 0.22)' : 'rgba(20, 184, 166, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Tiny corner runes
          const canalRunes = ['ᚨ', 'ᛚ', 'ᛏ', 'ᛗ', 'ᚲ', 'ᚱ', 'ᚦ', 'ᛟ', 'ᚹ'];
          const runeChar = canalRunes[(r * this.cols + c) % canalRunes.length];
          ctx.fillStyle = isAlt ? 'rgba(45, 212, 191, 0.18)' : 'rgba(20, 184, 166, 0.10)';
          ctx.font = '9px serif';
          ctx.fillText(runeChar, x + 8, y + 14);

        } else if (this.realm === 'svartalfheim') {
          // ── Svartalfheim General: Warm Amber Forge Obsidian Tiles ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          tileGrad.addColorStop(0, isAlt ? 'rgba(32, 22, 16, 0.50)' : 'rgba(22, 14, 10, 0.40)');
          tileGrad.addColorStop(1, isAlt ? 'rgba(18, 12, 8, 0.60)' : 'rgba(14, 8, 6, 0.50)');
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isAlt ? 'rgba(245, 158, 11, 0.22)' : 'rgba(217, 119, 6, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

        } else if (this.realm === 'jotunheim' || this.realm === 'niflheim') {
          // ── Jötunheim / Niflheim: Glacial Permafrost & Crystalline Fissures ──
          const tileGrad = ctx.createLinearGradient(x, y, x, y + this.cellHeight);
          tileGrad.addColorStop(0, isAlt ? 'rgba(12, 34, 52, 0.40)' : 'rgba(8, 24, 38, 0.30)');
          tileGrad.addColorStop(1, isAlt ? 'rgba(6, 20, 32, 0.55)' : 'rgba(4, 14, 22, 0.45)');
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isAlt ? 'rgba(56, 189, 248, 0.22)' : 'rgba(14, 165, 233, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Frost crystal accent
          ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
          ctx.font = '8px serif';
          ctx.fillText('❄', x + this.cellWidth - 14, y + 14);

        } else if (this.realm === 'asgard' || this.realm === 'alfheim') {
          // ── Asgard: Celestial Sunken Marble & Golden Bifrost Dust ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          tileGrad.addColorStop(0, isAlt ? 'rgba(45, 36, 18, 0.42)' : 'rgba(32, 24, 12, 0.32)');
          tileGrad.addColorStop(1, isAlt ? 'rgba(28, 20, 10, 0.55)' : 'rgba(20, 14, 8, 0.45)');
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isAlt ? 'rgba(251, 191, 36, 0.25)' : 'rgba(245, 158, 11, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

        } else if (this.realm === 'helheim' || this.realm === 'muspelheim') {
          // ── Helheim / Muspelheim: Scorched Volcanic Basalt ──
          ctx.fillStyle = isAlt ? 'rgba(38, 16, 12, 0.48)' : 'rgba(24, 10, 8, 0.38)';
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isAlt ? 'rgba(239, 68, 68, 0.25)' : 'rgba(185, 28, 28, 0.14)';
          ctx.lineWidth = 1;
          ctx.stroke();

        } else {
          // ── Midgard / Vanaheim: Ancient Nordic Mossy Flagstones ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          tileGrad.addColorStop(0, isAlt ? 'rgba(20, 36, 24, 0.42)' : 'rgba(14, 26, 18, 0.32)');
          tileGrad.addColorStop(1, isAlt ? 'rgba(12, 22, 14, 0.55)' : 'rgba(8, 16, 10, 0.45)');
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isAlt ? 'rgba(74, 222, 128, 0.22)' : 'rgba(34, 197, 94, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // ── Crisp Outer Lane Borders with Subtle Glow ──
    const laneGlowColor =
      this.realm === 'svartalfheim' && this.city === 'althjofs-wheel' ? 'rgba(45, 212, 191, 0.28)' :
      this.realm === 'svartalfheim' ? 'rgba(245, 158, 11, 0.25)' :
      this.realm === 'jotunheim' || this.realm === 'niflheim' ? 'rgba(56, 189, 248, 0.28)' :
      this.realm === 'asgard' ? 'rgba(251, 191, 36, 0.30)' :
      this.realm === 'helheim' || this.realm === 'muspelheim' ? 'rgba(239, 68, 68, 0.25)' :
      'rgba(74, 222, 128, 0.24)';

    ctx.strokeStyle = laneGlowColor;
    ctx.lineWidth = 1.2;

    // Horizontal lane dividers
    for (let r = 0; r <= this.rows; r++) {
      const ly = r * this.cellHeight;
      ctx.beginPath();
      ctx.moveTo(this.startX, ly);
      ctx.lineTo(this.width, ly);
      ctx.stroke();
    }

    // Vertical column dividers
    for (let c = 0; c <= this.cols; c++) {
      const lx = this.startX + c * this.cellWidth;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, this.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  getCellFromCoordinates(x: number, y: number): { row: number, col: number } | null {
    if (x < this.startX || x >= this.width || y < 0 || y >= this.height) return null;
    const col = Math.floor((x - this.startX) / this.cellWidth);
    const row = Math.floor(y / this.cellHeight);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return { row, col };
  }

  getCellCenter(row: number, col: number): { x: number, y: number } {
    return {
      x: this.startX + (col + 0.5) * this.cellWidth,
      y: (row + 0.5) * this.cellHeight
    };
  }
}
