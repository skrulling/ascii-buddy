export class ExportManager {
    copyToClipboard(result) {
        const text = result.grid
            .map(row => row.map(cell => cell.char).join(''))
            .join('\n');
        return navigator.clipboard.writeText(text);
    }
    downloadTXT(result) {
        const text = result.grid
            .map(row => row.map(cell => cell.char).join(''))
            .join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
    downloadPNG(result, colorMode) {
        if (result.grid.length === 0 || result.grid[0].length === 0)
            return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Character dimensions for rendering
        const charWidth = 8;
        const charHeight = 14;
        const padding = 20;
        canvas.width = result.grid[0].length * charWidth + padding * 2;
        canvas.height = result.grid.length * charHeight + padding * 2;
        // Set background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Set font
        ctx.font = `${charHeight}px "Courier New", Courier, monospace`;
        ctx.textBaseline = 'top';
        // Draw each character
        for (let y = 0; y < result.grid.length; y++) {
            for (let x = 0; x < result.grid[y].length; x++) {
                const cell = result.grid[y][x];
                ctx.fillStyle = colorMode ? cell.color : '#ffffff';
                ctx.fillText(cell.char, padding + x * charWidth, padding + y * charHeight);
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
