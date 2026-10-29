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

  private cachedCanvas: HTMLCanvasElement | null = null;
  private cachedDpr: number = 0;
  private cachedTheme: string = '';

  invalidateCache() {
    this.cachedCanvas = null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const dpr = window.devicePixelRatio || 1;
    const currentTheme = (typeof document !== 'undefined' && document.body?.dataset.activeTheme) || 'dark';
    if (!this.cachedCanvas || this.cachedDpr !== dpr || this.cachedTheme !== currentTheme) {
      this.cachedTheme = currentTheme;
      this.buildCache(dpr);
    }
    if (this.cachedCanvas) {
      ctx.drawImage(this.cachedCanvas, 0, 0, this.width, this.height);
    }
  }

  private buildCache(dpr: number) {
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.ceil(this.width * dpr);
    offscreen.height = Math.ceil(this.height * dpr);
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.scale(dpr, dpr);
    this.renderGrid(offCtx);

    this.cachedCanvas = offscreen;
    this.cachedDpr = dpr;
  }

  private renderGrid(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const isLight = typeof document !== 'undefined' && document.body?.dataset.activeTheme === 'light';

    const isDwarvenWaterway = this.realm === 'svartalfheim' && (this.city === 'althjofs-wheel' || this.city === 'andvaris-falls');
    const isAndvariFalls = this.city === 'andvaris-falls';

    // ── Draw Each Grid Cell with Realm-Specific Luxury Flagstone Style ──
    for (let r = 0; r < this.rows; r++) {
      const y = r * this.cellHeight;
      
      for (let c = 0; c < this.cols; c++) {
        const x = this.startX + c * this.cellWidth;
        const isAlt = (r + c) % 2 === 0;

        ctx.save();

        if (isDwarvenWaterway) {
          // ── Althjof's Wheel & Andvari's Falls: Subterranean Dwarven Basalt/Aqua Canal Paving ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          if (isLight) {
            if (isAndvariFalls) {
              tileGrad.addColorStop(0, isAlt ? 'rgba(224, 242, 254, 0.78)' : 'rgba(240, 249, 255, 0.90)');
              tileGrad.addColorStop(1, isAlt ? 'rgba(186, 230, 253, 0.58)' : 'rgba(224, 242, 254, 0.68)');
            } else {
              tileGrad.addColorStop(0, isAlt ? 'rgba(204, 251, 241, 0.75)' : 'rgba(240, 253, 250, 0.88)');
              tileGrad.addColorStop(1, isAlt ? 'rgba(153, 246, 228, 0.55)' : 'rgba(204, 251, 241, 0.65)');
            }
          } else {
            if (isAndvariFalls) {
              tileGrad.addColorStop(0, isAlt ? 'rgba(14, 30, 44, 0.48)' : 'rgba(10, 22, 34, 0.38)');
              tileGrad.addColorStop(1, isAlt ? 'rgba(8, 18, 28, 0.58)' : 'rgba(6, 14, 22, 0.48)');
            } else {
              tileGrad.addColorStop(0, isAlt ? 'rgba(18, 28, 35, 0.45)' : 'rgba(14, 22, 29, 0.35)');
              tileGrad.addColorStop(1, isAlt ? 'rgba(10, 18, 24, 0.55)' : 'rgba(8, 14, 20, 0.45)');
            }
          }
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          // Subtle cyan-teal / cerulean beveled stone trim
          ctx.strokeStyle = isLight
            ? (isAndvariFalls
                ? (isAlt ? 'rgba(2, 132, 199, 0.36)' : 'rgba(14, 165, 233, 0.22)')
                : (isAlt ? 'rgba(13, 148, 136, 0.35)' : 'rgba(20, 184, 166, 0.22)'))
            : (isAndvariFalls
                ? (isAlt ? 'rgba(56, 189, 248, 0.24)' : 'rgba(14, 165, 233, 0.13)')
                : (isAlt ? 'rgba(45, 212, 191, 0.22)' : 'rgba(20, 184, 166, 0.12)'));
          ctx.lineWidth = 1;
          ctx.stroke();

          // Tiny corner runes
          const canalRunes = isAndvariFalls
            ? ['ᚨ', 'ᚾ', 'ᛞ', 'ᚹ', 'ᚨ', 'ᚱ', 'ᛁ', 'ᛚ', 'ᛟ']
            : ['ᚨ', 'ᛚ', 'ᛏ', 'ᛗ', 'ᚲ', 'ᚱ', 'ᚦ', 'ᛟ', 'ᚹ'];
          const runeChar = canalRunes[(r * this.cols + c) % canalRunes.length];
          ctx.fillStyle = isLight
            ? (isAndvariFalls
                ? (isAlt ? 'rgba(2, 132, 199, 0.45)' : 'rgba(14, 165, 233, 0.30)')
                : (isAlt ? 'rgba(13, 148, 136, 0.45)' : 'rgba(20, 184, 166, 0.30)'))
            : (isAndvariFalls
                ? (isAlt ? 'rgba(56, 189, 248, 0.20)' : 'rgba(14, 165, 233, 0.11)')
                : (isAlt ? 'rgba(45, 212, 191, 0.18)' : 'rgba(20, 184, 166, 0.10)'));
          ctx.font = '9px serif';
          ctx.fillText(runeChar, x + 8, y + 14);

        } else if (this.realm === 'svartalfheim') {
          // ── Svartalfheim Forge/Mine/Citadel Strongholds: Warm Amber Forge Obsidian / Sandstone Tiles ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          if (isLight) {
            tileGrad.addColorStop(0, isAlt ? 'rgba(254, 243, 199, 0.80)' : 'rgba(255, 251, 235, 0.90)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(253, 230, 138, 0.58)' : 'rgba(254, 243, 199, 0.68)');
          } else {
            tileGrad.addColorStop(0, isAlt ? 'rgba(32, 22, 16, 0.50)' : 'rgba(22, 14, 10, 0.40)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(18, 12, 8, 0.60)' : 'rgba(14, 8, 6, 0.50)');
          }
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isLight
            ? (isAlt ? 'rgba(217, 119, 6, 0.35)' : 'rgba(245, 158, 11, 0.22)')
            : (isAlt ? 'rgba(245, 158, 11, 0.22)' : 'rgba(217, 119, 6, 0.12)');
          ctx.lineWidth = 1;
          ctx.stroke();

          // Carved Dwarven forge corner runes
          const forgeRunes = ['ᚲ', 'ᛞ', 'ᛊ', 'ᚾ', 'ᛁ', 'ᛟ', 'ᛏ', 'ᛗ', 'ᚱ'];
          const forgeRune = forgeRunes[(r * this.cols + c) % forgeRunes.length];
          ctx.fillStyle = isLight
            ? (isAlt ? 'rgba(180, 83, 9, 0.40)' : 'rgba(217, 119, 6, 0.26)')
            : (isAlt ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.10)');
          ctx.font = '9px serif';
          ctx.fillText(forgeRune, x + 8, y + 14);

        } else if (this.realm === 'jotunheim' || this.realm === 'niflheim') {
          // ── Jötunheim / Niflheim: Glacial Permafrost & Crystalline Fissures ──
          const tileGrad = ctx.createLinearGradient(x, y, x, y + this.cellHeight);
          if (isLight) {
            tileGrad.addColorStop(0, isAlt ? 'rgba(224, 242, 254, 0.82)' : 'rgba(240, 249, 255, 0.92)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(186, 230, 253, 0.62)' : 'rgba(224, 242, 254, 0.72)');
          } else {
            tileGrad.addColorStop(0, isAlt ? 'rgba(12, 34, 52, 0.40)' : 'rgba(8, 24, 38, 0.30)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(6, 20, 32, 0.55)' : 'rgba(4, 14, 22, 0.45)');
          }
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isLight
            ? (isAlt ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.22)')
            : (isAlt ? 'rgba(56, 189, 248, 0.22)' : 'rgba(14, 165, 233, 0.12)');
          ctx.lineWidth = 1;
          ctx.stroke();

          // Frost crystal accent
          ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(186, 230, 253, 0.16)';
          ctx.font = '8px serif';
          ctx.fillText('❄', x + this.cellWidth - 14, y + 14);

        } else if (this.realm === 'asgard' || this.realm === 'alfheim') {
          // ── Asgard: Celestial Sunken Marble & Golden Bifrost Dust ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          if (isLight) {
            tileGrad.addColorStop(0, isAlt ? 'rgba(254, 249, 195, 0.85)' : 'rgba(255, 253, 235, 0.94)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(254, 240, 138, 0.65)' : 'rgba(254, 249, 195, 0.75)');
          } else {
            tileGrad.addColorStop(0, isAlt ? 'rgba(45, 36, 18, 0.42)' : 'rgba(32, 24, 12, 0.32)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(28, 20, 10, 0.55)' : 'rgba(20, 14, 8, 0.45)');
          }
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isLight
            ? (isAlt ? 'rgba(202, 138, 4, 0.38)' : 'rgba(234, 179, 8, 0.22)')
            : (isAlt ? 'rgba(251, 191, 36, 0.25)' : 'rgba(245, 158, 11, 0.12)');
          ctx.lineWidth = 1;
          ctx.stroke();

        } else if (this.realm === 'helheim' || this.realm === 'muspelheim') {
          // ── Helheim / Muspelheim: Scorched Volcanic Basalt ──
          if (isLight) {
            const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
            tileGrad.addColorStop(0, isAlt ? 'rgba(254, 226, 226, 0.78)' : 'rgba(255, 241, 242, 0.90)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(254, 202, 202, 0.58)' : 'rgba(254, 226, 226, 0.68)');
            ctx.fillStyle = tileGrad;
          } else {
            ctx.fillStyle = isAlt ? 'rgba(38, 16, 12, 0.48)' : 'rgba(24, 10, 8, 0.38)';
          }
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isLight
            ? (isAlt ? 'rgba(220, 38, 38, 0.35)' : 'rgba(239, 68, 68, 0.20)')
            : (isAlt ? 'rgba(239, 68, 68, 0.25)' : 'rgba(185, 28, 28, 0.14)');
          ctx.lineWidth = 1;
          ctx.stroke();

        } else {
          // ── Midgard / Vanaheim: Ancient Nordic Mossy Flagstones ──
          const tileGrad = ctx.createLinearGradient(x, y, x + this.cellWidth, y + this.cellHeight);
          if (isLight) {
            tileGrad.addColorStop(0, isAlt ? 'rgba(236, 253, 245, 0.82)' : 'rgba(240, 253, 244, 0.92)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(209, 250, 229, 0.62)' : 'rgba(236, 253, 245, 0.72)');
          } else {
            tileGrad.addColorStop(0, isAlt ? 'rgba(20, 36, 24, 0.42)' : 'rgba(14, 26, 18, 0.32)');
            tileGrad.addColorStop(1, isAlt ? 'rgba(12, 22, 14, 0.55)' : 'rgba(8, 16, 10, 0.45)');
          }
          ctx.fillStyle = tileGrad;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.cellWidth - 4, this.cellHeight - 4, 6);
          ctx.fill();

          ctx.strokeStyle = isLight
            ? (isAlt ? 'rgba(5, 150, 105, 0.35)' : 'rgba(16, 185, 129, 0.20)')
            : (isAlt ? 'rgba(74, 222, 128, 0.22)' : 'rgba(34, 197, 94, 0.12)');
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // ── Crisp Outer Lane Borders with Subtle Glow ──
    const laneGlowColor = isLight ? (
      isAndvariFalls ? 'rgba(2, 132, 199, 0.45)' :
      isDwarvenWaterway ? 'rgba(13, 148, 136, 0.45)' :
      this.realm === 'svartalfheim' ? 'rgba(217, 119, 6, 0.42)' :
      this.realm === 'jotunheim' || this.realm === 'niflheim' ? 'rgba(2, 132, 199, 0.45)' :
      this.realm === 'asgard' ? 'rgba(202, 138, 4, 0.45)' :
      this.realm === 'helheim' || this.realm === 'muspelheim' ? 'rgba(220, 38, 38, 0.42)' :
      'rgba(5, 150, 105, 0.42)'
    ) : (
      isAndvariFalls ? 'rgba(56, 189, 248, 0.28)' :
      isDwarvenWaterway ? 'rgba(45, 212, 191, 0.28)' :
      this.realm === 'svartalfheim' ? 'rgba(245, 158, 11, 0.25)' :
      this.realm === 'jotunheim' || this.realm === 'niflheim' ? 'rgba(56, 189, 248, 0.28)' :
      this.realm === 'asgard' ? 'rgba(251, 191, 36, 0.30)' :
      this.realm === 'helheim' || this.realm === 'muspelheim' ? 'rgba(239, 68, 68, 0.25)' :
      'rgba(74, 222, 128, 0.24)'
    );

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
