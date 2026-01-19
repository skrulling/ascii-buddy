import './styles/main.css';
import { ASCIIEngine } from './engine/ASCIIEngine';
import { InputHandler } from './input/InputHandler';
import { ExportManager } from './output/ExportManager';
import { Renderer } from './output/Renderer';
class App {
    constructor() {
        this.inputHandler = null;
        this.renderer = null;
        this.currentResult = null;
        this.currentImage = null;
        this.colorMode = false;
        this.resolution = 150;
        this.contrastExponent = 2.0;
        this.engine = new ASCIIEngine();
        this.exportManager = new ExportManager();
    }
    async init() {
        this.showLoading('Initializing...');
        try {
            // Initialize ASCII engine (precompute character vectors)
            await this.engine.initialize();
            // Setup renderer
            this.renderer = new Renderer();
            // Setup input handler
            this.inputHandler = new InputHandler((img) => this.processImage(img), (msg) => this.showToast(msg, 'error'));
            // Setup export buttons and controls
            this.setupControls();
            this.hideLoading();
        }
        catch (error) {
            this.hideLoading();
            this.showToast('Failed to initialize: ' + error, 'error');
        }
    }
    async processImage(image) {
        this.currentImage = image;
        await this.reprocessImage();
        this.showOutput();
    }
    async reprocessImage() {
        if (!this.currentImage)
            return;
        this.showLoading('Processing image...');
        try {
            // Use setTimeout to allow UI to update before heavy processing
            await new Promise(resolve => setTimeout(resolve, 50));
            const options = {
                resolution: this.resolution,
                contrastExponent: this.contrastExponent
            };
            this.currentResult = await this.engine.processImage(this.currentImage, options);
            this.renderer?.display(this.currentResult, this.colorMode);
        }
        catch (error) {
            this.showToast('Error processing image: ' + error, 'error');
        }
        finally {
            this.hideLoading();
        }
    }
    showOutput() {
        const inputSection = document.getElementById('input-section');
        const outputSection = document.getElementById('output-section');
        if (inputSection)
            inputSection.style.display = 'none';
        if (outputSection)
            outputSection.style.display = 'block';
    }
    showInput() {
        const inputSection = document.getElementById('input-section');
        const outputSection = document.getElementById('output-section');
        if (inputSection)
            inputSection.style.display = 'block';
        if (outputSection)
            outputSection.style.display = 'none';
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput)
            fileInput.value = '';
        // Reset URL input
        const urlInput = document.getElementById('url-input');
        if (urlInput)
            urlInput.value = '';
        // Reset controls to defaults
        const colorToggle = document.getElementById('color-toggle');
        if (colorToggle)
            colorToggle.checked = false;
        this.colorMode = false;
        const resolutionSlider = document.getElementById('resolution-slider');
        if (resolutionSlider)
            resolutionSlider.value = '150';
        const resolutionValue = document.getElementById('resolution-value');
        if (resolutionValue)
            resolutionValue.textContent = '150';
        this.resolution = 150;
        const contrastSlider = document.getElementById('contrast-slider');
        if (contrastSlider)
            contrastSlider.value = '20';
        const contrastValue = document.getElementById('contrast-value');
        if (contrastValue)
            contrastValue.textContent = '2.0';
        this.contrastExponent = 2.0;
        this.currentImage = null;
    }
    showLoading(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            const p = loading.querySelector('p');
            if (p)
                p.textContent = message;
            loading.style.display = 'flex';
        }
    }
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading)
            loading.style.display = 'none';
    }
    showToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    setupControls() {
        // Color toggle
        const colorToggle = document.getElementById('color-toggle');
        colorToggle?.addEventListener('change', () => {
            this.colorMode = colorToggle.checked;
            if (this.currentResult) {
                this.renderer?.display(this.currentResult, this.colorMode);
            }
        });
        // Resolution slider
        const resolutionSlider = document.getElementById('resolution-slider');
        const resolutionValue = document.getElementById('resolution-value');
        resolutionSlider?.addEventListener('input', () => {
            this.resolution = parseInt(resolutionSlider.value, 10);
            if (resolutionValue)
                resolutionValue.textContent = resolutionSlider.value;
        });
        resolutionSlider?.addEventListener('change', () => {
            this.reprocessImage();
        });
        // Contrast/edge detail slider
        const contrastSlider = document.getElementById('contrast-slider');
        const contrastValue = document.getElementById('contrast-value');
        contrastSlider?.addEventListener('input', () => {
            this.contrastExponent = parseInt(contrastSlider.value, 10) / 10;
            if (contrastValue)
                contrastValue.textContent = this.contrastExponent.toFixed(1);
        });
        contrastSlider?.addEventListener('change', () => {
            this.reprocessImage();
        });
        // Export buttons
        document.getElementById('copy-btn')?.addEventListener('click', async () => {
            if (!this.currentResult)
                return;
            try {
                await this.exportManager.copyToClipboard(this.currentResult);
                this.showToast('Copied to clipboard!', 'success');
            }
            catch {
                this.showToast('Failed to copy to clipboard', 'error');
            }
        });
        document.getElementById('download-txt-btn')?.addEventListener('click', () => {
            if (!this.currentResult)
                return;
            this.exportManager.downloadTXT(this.currentResult);
            this.showToast('Downloading TXT...', 'success');
        });
        document.getElementById('download-png-btn')?.addEventListener('click', () => {
            if (!this.currentResult)
                return;
            this.exportManager.downloadPNG(this.currentResult, this.colorMode);
            this.showToast('Downloading PNG...', 'success');
        });
        document.getElementById('new-image-btn')?.addEventListener('click', () => {
            this.showInput();
        });
    }
}
// Bootstrap application
const app = new App();
app.init();
