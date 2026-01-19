export class Renderer {
    constructor() {
        this.outputElement = document.getElementById('ascii-output');
    }
    display(result, colorMode) {
        if (colorMode) {
            this.displayColored(result);
        }
        else {
            this.displayMonochrome(result);
        }
    }
    displayMonochrome(result) {
        this.outputElement.textContent = result.grid
            .map(row => row.map(cell => cell.char).join(''))
            .join('\n');
    }
    displayColored(result) {
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
    clear() {
        this.outputElement.textContent = '';
    }
}
