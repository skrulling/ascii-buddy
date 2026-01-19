import { KDTree } from './KDTree';
import { CharacterData, KDPoint, ASCIICell, ASCIIResult } from './types';

export class ASCIIEngine {
  private characters: CharacterData[] = [];
  private kdTree: KDTree | null = null;
  private charCanvas: HTMLCanvasElement;
  private charCtx: CanvasRenderingContext2D;

  constructor() {
    this.charCanvas = document.createElement('canvas');
    this.charCanvas.width = 20;
    this.charCanvas.height = 30;
    this.charCtx = this.charCanvas.getContext('2d')!;
  }

  async initialize(): Promise<void> {
    // Generate all 95 printable ASCII characters (space through ~)
    const chars = Array.from({ length: 95 }, (_, i) =>
      String.fromCharCode(32 + i)
    );

    // Compute shape vectors for each character
    for (const char of chars) {
      const shapeVector = this.computeCharacterVector(char);
      const brightness = this.computeBrightness(shapeVector);
      this.characters.push({ char, shapeVector, brightness });
    }

    // Build k-d tree from character vectors
    const points: KDPoint[] = this.characters.map(c => ({
      point: c.shapeVector,
      char: c.char
    }));
    this.kdTree = new KDTree(points, 6);
  }

  private computeCharacterVector(char: string): number[] {
    const ctx = this.charCtx;
    const canvas = this.charCanvas;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render character
    ctx.fillStyle = 'white';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 10, 15);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Sample 6 circular regions
    return [
      this.sampleCircle(imageData, 10, 7, 5),   // top
      this.sampleCircle(imageData, 10, 23, 5),  // bottom
      this.sampleCircle(imageData, 5, 15, 5),   // left
      this.sampleCircle(imageData, 15, 15, 5),  // right
      this.sampleCircle(imageData, 10, 15, 3),  // center-inner
      this.sampleCircle(imageData, 10, 15, 7),  // center-outer
    ];
  }

  private computeBrightness(vector: number[]): number {
    return vector.reduce((a, b) => a + b, 0) / vector.length;
  }

  private sampleCircle(
    imageData: ImageData,
    cx: number,
    cy: number,
    radius: number
  ): number {
    let sum = 0;
    let count = 0;

    // Sample points around circle (16 points)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(angle) * radius);
      const y = Math.round(cy + Math.sin(angle) * radius);

      if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
        const idx = (y * imageData.width + x) * 4;
        // Convert to grayscale using relative luminance
        const brightness =
          0.2126 * imageData.data[idx] +
          0.7152 * imageData.data[idx + 1] +
          0.0722 * imageData.data[idx + 2];
        sum += brightness / 255;
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  private sampleImageCircle(
    imageData: ImageData,
    cx: number,
    cy: number,
    radius: number
  ): number {
    let sum = 0;
    let count = 0;

    // Sample more points for image cells for better accuracy
    const numSamples = 24;
    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(angle) * radius);
      const y = Math.round(cy + Math.sin(angle) * radius);

      if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
        const idx = (y * imageData.width + x) * 4;
        const brightness =
          0.2126 * imageData.data[idx] +
          0.7152 * imageData.data[idx + 1] +
          0.0722 * imageData.data[idx + 2];
        sum += brightness / 255;
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  private sampleCellColor(
    imageData: ImageData,
    cx: number,
    cy: number,
    cellWidth: number,
    cellHeight: number
  ): string {
    let r = 0, g = 0, b = 0;
    let count = 0;

    // Sample a grid of points within the cell
    const startX = Math.floor(cx - cellWidth / 2);
    const startY = Math.floor(cy - cellHeight / 2);
    const endX = Math.floor(cx + cellWidth / 2);
    const endY = Math.floor(cy + cellHeight / 2);

    // Sample every few pixels for performance
    const step = Math.max(1, Math.floor(Math.min(cellWidth, cellHeight) / 4));

    for (let y = startY; y < endY; y += step) {
      for (let x = startX; x < endX; x += step) {
        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
          const idx = (y * imageData.width + x) * 4;
          r += imageData.data[idx];
          g += imageData.data[idx + 1];
          b += imageData.data[idx + 2];
          count++;
        }
      }
    }

    if (count === 0) return '#ffffff';

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  async processImage(image: HTMLImageElement): Promise<ASCIIResult> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Default grid: ~120 chars wide
    const targetWidth = 120;
    const aspectRatio = image.height / image.width;
    // 0.5 factor accounts for character aspect ratio (chars are ~2x taller than wide)
    const targetHeight = Math.round(targetWidth * aspectRatio * 0.5);

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return this.imageToASCII(imageData, targetWidth, targetHeight);
  }

  private imageToASCII(
    imageData: ImageData,
    gridWidth: number,
    gridHeight: number
  ): ASCIIResult {
    const cellWidth = imageData.width / gridWidth;
    const cellHeight = imageData.height / gridHeight;

    const grid: ASCIICell[][] = [];

    for (let gy = 0; gy < gridHeight; gy++) {
      const row: ASCIICell[] = [];
      for (let gx = 0; gx < gridWidth; gx++) {
        // Sample 6 regions for this cell
        const cx = (gx + 0.5) * cellWidth;
        const cy = (gy + 0.5) * cellHeight;
        const radius = Math.min(cellWidth, cellHeight) * 0.4;

        let vector = [
          this.sampleImageCircle(imageData, cx, cy - radius, radius * 0.6),  // top
          this.sampleImageCircle(imageData, cx, cy + radius, radius * 0.6),  // bottom
          this.sampleImageCircle(imageData, cx - radius, cy, radius * 0.6),  // left
          this.sampleImageCircle(imageData, cx + radius, cy, radius * 0.6),  // right
          this.sampleImageCircle(imageData, cx, cy, radius * 0.4),           // center-inner
          this.sampleImageCircle(imageData, cx, cy, radius * 0.8),           // center-outer
        ];

        // Apply contrast enhancement
        vector = this.enhanceContrast(vector);

        // Find best matching character
        const char = this.kdTree!.nearest(vector);
        
        // Sample average color for this cell
        const color = this.sampleCellColor(imageData, cx, cy, cellWidth, cellHeight);

        row.push({ char, color });
      }
      grid.push(row);
    }

    return { grid, width: gridWidth, height: gridHeight };
  }

  private enhanceContrast(vector: number[]): number[] {
    // Global contrast enhancement
    const mean = vector.reduce((a, b) => a + b, 0) / vector.length;
    const normalized = vector.map(v => v - mean);

    // Apply power function to enhance differences
    const enhanced = normalized.map(v => {
      const sign = v >= 0 ? 1 : -1;
      return sign * Math.pow(Math.abs(v), 1.5);
    });

    // Denormalize back
    const enhancedMean = enhanced.reduce((a, b) => a + b, 0) / enhanced.length;
    return enhanced.map(v => v - enhancedMean + mean);
  }
}
