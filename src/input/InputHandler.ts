export class InputHandler {
  private onImageLoad: (image: HTMLImageElement) => void;
  private onError: (message: string) => void;

  constructor(
    onImageLoad: (image: HTMLImageElement) => void,
    onError: (message: string) => void
  ) {
    this.onImageLoad = onImageLoad;
    this.onError = onError;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // File input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

    // URL input
    const urlBtn = document.getElementById('url-load-btn');
    const urlInput = document.getElementById('url-input') as HTMLInputElement;
    urlBtn?.addEventListener('click', () => this.handleURLLoad());
    urlInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleURLLoad();
    });

    // Drag and drop
    const dropZone = document.getElementById('drop-zone');
    dropZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
    dropZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    dropZone?.addEventListener('drop', (e) => this.handleDrop(e));

    // Paste
    document.addEventListener('paste', (e) => this.handlePaste(e));
  }

  private handleFileSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files[0]) {
      this.loadImageFromFile(files[0]);
    }
  }

  private handleURLLoad(): void {
    const urlInput = document.getElementById('url-input') as HTMLInputElement;
    const url = urlInput.value.trim();
    if (url) {
      this.loadImageFromURL(url);
    }
  }

  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('drag-over');
  }

  private handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('drag-over');
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      if (files[0].type.startsWith('image/')) {
        this.loadImageFromFile(files[0]);
      } else {
        this.onError('Please drop an image file');
      }
    }
  }

  private handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.loadImageFromFile(file);
          return;
        }
      }
    }
  }

  private loadImageFromFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.onError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => this.onImageLoad(img);
      img.onerror = () => this.onError('Failed to load image');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => this.onError('Failed to read file');
    reader.readAsDataURL(file);
  }

  private loadImageFromURL(url: string): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => this.onImageLoad(img);
    img.onerror = () => this.onError('Failed to load image from URL. Make sure the URL is valid and supports CORS.');
    img.src = url;
  }
}
