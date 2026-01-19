export class Renderer {
    constructor() {
        this.outputElement = document.getElementById('ascii-output');
    }
    display(asciiGrid) {
        this.outputElement.textContent = asciiGrid.map(row => row.join('')).join('\n');
    }
    clear() {
        this.outputElement.textContent = '';
    }
}
