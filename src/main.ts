import './styles/main.css';
import { ASCIIEngine } from './engine/ASCIIEngine';
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
  private colorMode: boolean = false;

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

      // Setup export buttons and color toggle
      this.setupControls();

      this.hideLoading();
    } catch (error) {
      this.hideLoading();
      this.showToast('Failed to initialize: ' + error, 'error');
    }
  }

  private async processImage(image: HTMLImageElement): Promise<void> {
    this.showLoading('Processing image...');

    try {
      // Use setTimeout to allow UI to update before heavy processing
      await new Promise(resolve => setTimeout(resolve, 50));

      this.currentResult = await this.engine.processImage(image);
      this.renderer?.display(this.currentResult, this.colorMode);
      this.showOutput();
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

    // Reset color toggle
    const colorToggle = document.getElementById('color-toggle') as HTMLInputElement;
    if (colorToggle) colorToggle.checked = false;
    this.colorMode = false;
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
    // Color toggle
    const colorToggle = document.getElementById('color-toggle') as HTMLInputElement;
    colorToggle?.addEventListener('change', () => {
      this.colorMode = colorToggle.checked;
      if (this.currentResult) {
        this.renderer?.display(this.currentResult, this.colorMode);
      }
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
