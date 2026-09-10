export class Grid {
  rows: number = 5;
  cols: number = 9;
  cellSize: number;
  width: number;
  height: number;
  realm: string = 'midgard';
  city?: string;

  constructor(canvasWidth: number, canvasHeight: number, realm: string = 'midgard', city?: string) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.realm = realm;
    this.city = city;
    this.cellSize = (this.width - 350) / this.cols; 
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Realm-specific grid aesthetic
    if (this.realm === 'svartalfheim' && this.city === 'althjofs-wheel') {
      // Subterranean Dwarven Canal Embankment: Wet carved basalt flagstones with glowing cyan drainage runoff
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.38)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#14b8a6';

      const canalRunes = ['ᚨ', 'ᛚ', 'ᛏ', 'ᛗ', 'ᚲ', 'ᚱ', 'ᚦ', 'ᛟ', 'ᚹ'];

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = 350 + c * this.cellSize;
          const y = r * this.cellSize;

          // Wet basalt stone flagstone base (translucent so canal rapids and waterwheel show clearly)
          const isAlt = (r + c) % 2 === 0;
          ctx.fillStyle = isAlt ? 'rgba(15, 23, 30, 0.28)' : 'rgba(21, 32, 43, 0.16)';
          ctx.fillRect(x + 1.5, y + 1.5, this.cellSize - 3, this.cellSize - 3);

          // Subtle cyan water reflection pool on damp stone
          if (isAlt) {
            const poolGrad = ctx.createRadialGradient(
              x + this.cellSize * 0.5, y + this.cellSize * 0.5, 2,
              x + this.cellSize * 0.5, y + this.cellSize * 0.5, this.cellSize * 0.45
            );
            poolGrad.addColorStop(0, 'rgba(45, 212, 191, 0.10)');
            poolGrad.addColorStop(0.7, 'rgba(20, 184, 166, 0.03)');
            poolGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = poolGrad;
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          }

          // Carved stone bevel highlights
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.14)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6);

          // Dwarven canal drainage glyph at center
          const runeChar = canalRunes[(r * this.cols + c) % canalRunes.length];
          ctx.fillStyle = isAlt ? 'rgba(45, 212, 191, 0.22)' : 'rgba(20, 184, 166, 0.14)';
          ctx.font = 'bold 11px serif';
          ctx.fillText(runeChar, x + this.cellSize * 0.5 - 3.5, y + this.cellSize * 0.5 + 4);
        }
      }
    } else if (this.realm === 'svartalfheim') {
      // General Svartalfheim Dwarven Stone & Amber Forge Inlay
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.32)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#d97706';

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = 350 + c * this.cellSize;
          const y = r * this.cellSize;
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = 'rgba(30, 20, 14, 0.65)';
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          }
        }
      }
    } else if (this.realm === 'jotunheim') {
      // Icy permafrost grid with glowing frost fissures
      ctx.strokeStyle = 'rgba(129, 212, 250, 0.28)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00e5ff';
      
      // Ice tile floor pattern
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = 350 + c * this.cellSize;
          const y = r * this.cellSize;
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = 'rgba(2, 119, 189, 0.08)';
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          }
          // Tiny frost crystal rune at center of tile
          ctx.fillStyle = 'rgba(178, 235, 242, 0.12)';
          ctx.font = '10px serif';
          ctx.fillText('ᚱ', x + this.cellSize / 2 - 3, y + this.cellSize / 2 + 4);
        }
      }
    } else if (this.realm === 'asgard') {
      // Golden marble & celestial runes
      ctx.strokeStyle = 'rgba(255, 213, 79, 0.32)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffd54f';
      
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = 350 + c * this.cellSize;
          const y = r * this.cellSize;
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 193, 7, 0.07)';
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          }
        }
      }
    } else if (this.realm === 'helheim') {
      // Scorched earth & lava fissures
      ctx.strokeStyle = 'rgba(255, 87, 34, 0.28)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff5722';
      
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = 350 + c * this.cellSize;
          const y = r * this.cellSize;
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = 'rgba(216, 67, 21, 0.08)';
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          }
        }
      }
    } else if (this.realm === 'vanaheim') {
      // Enchanted bioluminescent moss & roots
      ctx.strokeStyle = 'rgba(102, 187, 106, 0.28)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#66bb6a';
      
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = 350 + c * this.cellSize;
          const y = r * this.cellSize;
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = 'rgba(46, 125, 50, 0.08)';
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
          }
        }
      }
    } else {
      // Midgard: Classic green Nordic lawn
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.22)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#4caf50';
    }
    
    // Draw outer grid lines
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(350, r * this.cellSize);
      ctx.lineTo(this.width, r * this.cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(350 + c * this.cellSize, 0);
      ctx.lineTo(350 + c * this.cellSize, this.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  getCellFromCoordinates(x: number, y: number): { row: number, col: number } | null {
    if (x < 350 || x >= this.width || y < 0 || y >= this.height) return null;
    const col = Math.floor((x - 350) / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return { row, col };
  }
}
