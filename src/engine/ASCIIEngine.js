import { KDTree } from './KDTree';
export class ASCIIEngine {
    constructor() {
        this.characters = [];
        this.kdTree = null;
        this.charCanvas = document.createElement('canvas');
        this.charCanvas.width = 20;
        this.charCanvas.height = 30;
        this.charCtx = this.charCanvas.getContext('2d');
    }
    async initialize() {
        // Generate all 95 printable ASCII characters (space through ~)
        const chars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));
        // Compute shape vectors for each character
        for (const char of chars) {
            const shapeVector = this.computeCharacterVector(char);
            const brightness = this.computeBrightness(shapeVector);
            this.characters.push({ char, shapeVector, brightness });
        }
        // Build k-d tree from character vectors
        const points = this.characters.map(c => ({
            point: c.shapeVector,
            char: c.char
        }));
        this.kdTree = new KDTree(points, 6);
    }
    computeCharacterVector(char) {
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
            this.sampleCircle(imageData, 10, 7, 5), // top
            this.sampleCircle(imageData, 10, 23, 5), // bottom
            this.sampleCircle(imageData, 5, 15, 5), // left
            this.sampleCircle(imageData, 15, 15, 5), // right
            this.sampleCircle(imageData, 10, 15, 3), // center-inner
            this.sampleCircle(imageData, 10, 15, 7), // center-outer
        ];
    }
    computeBrightness(vector) {
        return vector.reduce((a, b) => a + b, 0) / vector.length;
    }
    sampleCircle(imageData, cx, cy, radius) {
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
                const brightness = 0.2126 * imageData.data[idx] +
                    0.7152 * imageData.data[idx + 1] +
                    0.0722 * imageData.data[idx + 2];
                sum += brightness / 255;
                count++;
            }
        }
        return count > 0 ? sum / count : 0;
    }
    sampleImageCircle(imageData, cx, cy, radius) {
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
                const brightness = 0.2126 * imageData.data[idx] +
                    0.7152 * imageData.data[idx + 1] +
                    0.0722 * imageData.data[idx + 2];
                sum += brightness / 255;
                count++;
            }
        }
        return count > 0 ? sum / count : 0;
    }
    async processImage(image) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
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
    imageToASCII(imageData, gridWidth, gridHeight) {
        const cellWidth = imageData.width / gridWidth;
        const cellHeight = imageData.height / gridHeight;
        const result = [];
        for (let gy = 0; gy < gridHeight; gy++) {
            const row = [];
            for (let gx = 0; gx < gridWidth; gx++) {
                // Sample 6 regions for this cell
                const cx = (gx + 0.5) * cellWidth;
                const cy = (gy + 0.5) * cellHeight;
                const radius = Math.min(cellWidth, cellHeight) * 0.4;
                let vector = [
                    this.sampleImageCircle(imageData, cx, cy - radius, radius * 0.6), // top
                    this.sampleImageCircle(imageData, cx, cy + radius, radius * 0.6), // bottom
                    this.sampleImageCircle(imageData, cx - radius, cy, radius * 0.6), // left
                    this.sampleImageCircle(imageData, cx + radius, cy, radius * 0.6), // right
                    this.sampleImageCircle(imageData, cx, cy, radius * 0.4), // center-inner
                    this.sampleImageCircle(imageData, cx, cy, radius * 0.8), // center-outer
                ];
                // Apply contrast enhancement
                vector = this.enhanceContrast(vector);
                // Find best matching character
                const char = this.kdTree.nearest(vector);
                row.push(char);
            }
            result.push(row);
        }
        return result;
    }
    enhanceContrast(vector) {
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
