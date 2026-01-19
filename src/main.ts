import './styles/main.css';
import { ASCIIEngine, ProcessOptions } from './engine/ASCIIEngine';
import { InputHandler } from './input/InputHandler';
import { ExportManager } from './output/ExportManager';
import { Renderer } from './output/Renderer';
import { ASCIIResult } from './engine/types';

class App {
  private engine: ASCIIEngine;
  private inputHandler: InputHandler | null = null;
  private exportManager: ExportManager;
  private renderer: Renderer | null = null;
  private currentResult: ASCIIResult | null = null;
  private currentImage: HTMLImageElement | null = null;
  private colorMode: boolean = false;
  private darkMode: boolean = true;
  private resolution: number = 150;
  private contrastExponent: number = 2.0;

  constructor() {
    this.engine = new ASCIIEngine();
    this.exportManager = new ExportManager();
  }

  async init(): Promise<void> {
    this.showLoading('Initializing...');

    try {
      // Initialize ASCII engine (precompute character vectors)
      await this.engine.initialize();

      // Setup renderer
      this.renderer = new Renderer();

      // Setup input handler
      this.inputHandler = new InputHandler(
        (img) => this.processImage(img),
        (msg) => this.showToast(msg, 'error')
      );

      // Setup export buttons and controls
      this.setupControls();

      this.hideLoading();
    } catch (error) {
      this.hideLoading();
      this.showToast('Failed to initialize: ' + error, 'error');
    }
  }

  private async processImage(image: HTMLImageElement): Promise<void> {
    this.currentImage = image;
    await this.reprocessImage();
    this.showOutput();
  }

  private async reprocessImage(): Promise<void> {
    if (!this.currentImage) return;
    
    this.showLoading('Processing image...');

    try {
      // Use setTimeout to allow UI to update before heavy processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const options: ProcessOptions = {
        resolution: this.resolution,
        contrastExponent: this.contrastExponent,
        invertBrightness: this.darkMode
      };

      this.currentResult = await this.engine.processImage(this.currentImage, options);
      this.renderer?.display(this.currentResult, this.colorMode);
    } catch (error) {
      this.showToast('Error processing image: ' + error, 'error');
    } finally {
      this.hideLoading();
    }
  }

  private showOutput(): void {
    const inputSection = document.getElementById('input-section');
    const outputSection = document.getElementById('output-section');
    if (inputSection) inputSection.style.display = 'none';
    if (outputSection) outputSection.style.display = 'block';
  }

  private showInput(): void {
    const inputSection = document.getElementById('input-section');
    const outputSection = document.getElementById('output-section');
    if (inputSection) inputSection.style.display = 'block';
    if (outputSection) outputSection.style.display = 'none';
    
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    // Reset URL input
    const urlInput = document.getElementById('url-input') as HTMLInputElement;
    if (urlInput) urlInput.value = '';

    // Reset controls to defaults
    const colorToggle = document.getElementById('color-toggle') as HTMLInputElement;
    if (colorToggle) colorToggle.checked = false;
    this.colorMode = false;

    const darkModeToggle = document.getElementById('dark-mode-toggle') as HTMLInputElement;
    if (darkModeToggle) darkModeToggle.checked = true;
    this.darkMode = true;
    
    // Reset display styling
    const asciiDisplay = document.getElementById('ascii-display');
    if (asciiDisplay) asciiDisplay.classList.remove('light-mode');

    const resolutionSlider = document.getElementById('resolution-slider') as HTMLInputElement;
    if (resolutionSlider) resolutionSlider.value = '150';
    const resolutionValue = document.getElementById('resolution-value');
    if (resolutionValue) resolutionValue.textContent = '150';
    this.resolution = 150;

    const contrastSlider = document.getElementById('contrast-slider') as HTMLInputElement;
    if (contrastSlider) contrastSlider.value = '20';
    const contrastValue = document.getElementById('contrast-value');
    if (contrastValue) contrastValue.textContent = '2.0';
    this.contrastExponent = 2.0;

    this.currentImage = null;
  }

  private showLoading(message: string): void {
    const loading = document.getElementById('loading');
    if (loading) {
      const p = loading.querySelector('p');
      if (p) p.textContent = message;
      loading.style.display = 'flex';
    }
  }

  private hideLoading(): void {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  private setupControls(): void {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle') as HTMLInputElement;
    const asciiDisplay = document.getElementById('ascii-display');
    darkModeToggle?.addEventListener('change', () => {
      this.darkMode = darkModeToggle.checked;
      if (asciiDisplay) {
        asciiDisplay.classList.toggle('light-mode', !this.darkMode);
      }
      // Re-process image with new brightness mode
      if (this.currentImage) {
        this.reprocessImage();
      }
    });

    // Color toggle
    const colorToggle = document.getElementById('color-toggle') as HTMLInputElement;
    colorToggle?.addEventListener('change', () => {
      this.colorMode = colorToggle.checked;
      if (this.currentResult) {
        this.renderer?.display(this.currentResult, this.colorMode);
      }
    });

    // Resolution slider
    const resolutionSlider = document.getElementById('resolution-slider') as HTMLInputElement;
    const resolutionValue = document.getElementById('resolution-value');
    resolutionSlider?.addEventListener('input', () => {
      this.resolution = parseInt(resolutionSlider.value, 10);
      if (resolutionValue) resolutionValue.textContent = resolutionSlider.value;
    });
    resolutionSlider?.addEventListener('change', () => {
      this.reprocessImage();
    });

    // Contrast/edge detail slider
    const contrastSlider = document.getElementById('contrast-slider') as HTMLInputElement;
    const contrastValue = document.getElementById('contrast-value');
    contrastSlider?.addEventListener('input', () => {
      this.contrastExponent = parseInt(contrastSlider.value, 10) / 10;
      if (contrastValue) contrastValue.textContent = this.contrastExponent.toFixed(1);
    });
    contrastSlider?.addEventListener('change', () => {
      this.reprocessImage();
    });

    // Export buttons
    document.getElementById('copy-btn')?.addEventListener('click', async () => {
      if (!this.currentResult) return;
      try {
        await this.exportManager.copyToClipboard(this.currentResult);
        this.showToast('Copied to clipboard!', 'success');
      } catch {
        this.showToast('Failed to copy to clipboard', 'error');
      }
    });

    document.getElementById('download-txt-btn')?.addEventListener('click', () => {
      if (!this.currentResult) return;
      this.exportManager.downloadTXT(this.currentResult);
      this.showToast('Downloading TXT...', 'success');
    });

    document.getElementById('download-png-btn')?.addEventListener('click', () => {
      if (!this.currentResult) return;
      this.exportManager.downloadPNG(this.currentResult, this.colorMode, this.darkMode);
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
