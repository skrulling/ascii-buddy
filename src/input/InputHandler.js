export class InputHandler {
    constructor(onImageLoad, onError) {
        this.onImageLoad = onImageLoad;
        this.onError = onError;
        this.setupEventListeners();
    }
    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('file-input');
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        // URL input
        const urlBtn = document.getElementById('url-load-btn');
        const urlInput = document.getElementById('url-input');
        urlBtn?.addEventListener('click', () => this.handleURLLoad());
        urlInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                this.handleURLLoad();
        });
        // Drag and drop
        const dropZone = document.getElementById('drop-zone');
        dropZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        dropZone?.addEventListener('drop', (e) => this.handleDrop(e));
        // Paste
        document.addEventListener('paste', (e) => this.handlePaste(e));
    }
    handleFileSelect(event) {
        const files = event.target.files;
        if (files && files[0]) {
            this.loadImageFromFile(files[0]);
        }
    }
    handleURLLoad() {
        const urlInput = document.getElementById('url-input');
        const url = urlInput.value.trim();
        if (url) {
            this.loadImageFromURL(url);
        }
    }
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = event.currentTarget;
        dropZone.classList.add('drag-over');
    }
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = event.currentTarget;
        dropZone.classList.remove('drag-over');
    }
    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = event.currentTarget;
        dropZone.classList.remove('drag-over');
        const files = event.dataTransfer?.files;
        if (files && files[0]) {
            if (files[0].type.startsWith('image/')) {
                this.loadImageFromFile(files[0]);
            }
            else {
                this.onError('Please drop an image file');
            }
        }
    }
    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items)
            return;
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
    loadImageFromFile(file) {
        if (!file.type.startsWith('image/')) {
            this.onError('Please select an image file');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => this.onImageLoad(img);
            img.onerror = () => this.onError('Failed to load image');
            img.src = e.target?.result;
        };
        reader.onerror = () => this.onError('Failed to read file');
        reader.readAsDataURL(file);
    }
    loadImageFromURL(url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => this.onImageLoad(img);
        img.onerror = () => this.onError('Failed to load image from URL. Make sure the URL is valid and supports CORS.');
        img.src = url;
    }
}
