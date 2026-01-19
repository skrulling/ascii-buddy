import { ASCIIResult } from '../engine/types';

export class Renderer {
  private outputElement: HTMLPreElement;

  constructor() {
    this.outputElement = document.getElementById('ascii-output') as HTMLPreElement;
  }

  display(result: ASCIIResult, colorMode: boolean): void {
    if (colorMode) {
      this.displayColored(result);
    } else {
      this.displayMonochrome(result);
    }
  }

  private displayMonochrome(result: ASCIIResult): void {
    this.outputElement.textContent = result.grid
      .map(row => row.map(cell => cell.char).join(''))
      .join('\n');
  }

  private displayColored(result: ASCIIResult): void {
    // Clear existing content
    this.outputElement.innerHTML = '';

    for (let y = 0; y < result.grid.length; y++) {
      const row = result.grid[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        const span = document.createElement('span');
        span.textContent = cell.char;
        span.style.color = cell.color;
        this.outputElement.appendChild(span);
      }
      if (y < result.grid.length - 1) {
        this.outputElement.appendChild(document.createTextNode('\n'));
      }
    }
  }

  clear(): void {
    this.outputElement.textContent = '';
  }
}
