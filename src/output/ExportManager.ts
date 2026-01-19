export class ExportManager {
  copyToClipboard(asciiGrid: string[][]): Promise<void> {
    const text = asciiGrid.map(row => row.join('')).join('\n');
    return navigator.clipboard.writeText(text);
  }

  downloadTXT(asciiGrid: string[][]): void {
    const text = asciiGrid.map(row => row.join('')).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadPNG(asciiGrid: string[][]): void {
    if (asciiGrid.length === 0 || asciiGrid[0].length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Character dimensions for rendering
    const charWidth = 8;
    const charHeight = 14;
    const padding = 20;

    canvas.width = asciiGrid[0].length * charWidth + padding * 2;
    canvas.height = asciiGrid.length * charHeight + padding * 2;

    // Set background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font
    ctx.fillStyle = '#ffffff';
    ctx.font = `${charHeight}px "Courier New", Courier, monospace`;
    ctx.textBaseline = 'top';

    // Draw each character
    for (let y = 0; y < asciiGrid.length; y++) {
      for (let x = 0; x < asciiGrid[y].length; x++) {
        ctx.fillText(
          asciiGrid[y][x],
          padding + x * charWidth,
          padding + y * charHeight
        );
      }
    }

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
}
