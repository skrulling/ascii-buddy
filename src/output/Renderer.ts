export class Renderer {
  private outputElement: HTMLPreElement;

  constructor() {
    this.outputElement = document.getElementById('ascii-output') as HTMLPreElement;
  }

  display(asciiGrid: string[][]): void {
    this.outputElement.textContent = asciiGrid.map(row => row.join('')).join('\n');
  }

  clear(): void {
    this.outputElement.textContent = '';
  }
}
