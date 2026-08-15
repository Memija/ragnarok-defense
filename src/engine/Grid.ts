export class Grid {
  rows: number = 5;
  cols: number = 9;
  cellSize: number;
  width: number;
  height: number;
  realm: string = 'midgard';

  constructor(canvasWidth: number, canvasHeight: number, realm: string = 'midgard') {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.realm = realm;
    this.cellSize = (this.width - 350) / this.cols; 
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Realm-specific grid aesthetic
    if (this.realm === 'jotunheim') {
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
