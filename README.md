# ASCII Buddy

A web-based ASCII art generator that converts images to ASCII art using shape-based character matching.

**[Try it live](https://YOUR_USERNAME.github.io/ascii-buddy/)** | [How it works](#how-it-works)

![ASCII Buddy Screenshot](https://via.placeholder.com/800x450/1a1a1a/ffffff?text=ASCII+Buddy+Screenshot)

## Features

- **Multiple input methods**: File upload, drag-and-drop, paste from clipboard, or load from URL
- **Smart character matching**: Uses 6D shape vectors to find the best ASCII character for each region
- **Export options**: Copy to clipboard, download as TXT, or download as PNG
- **Fully portable**: Single HTML file that works offline
- **No server required**: Runs entirely in your browser

## Usage

### Online

Visit the [live demo](https://YOUR_USERNAME.github.io/ascii-buddy/) and drop an image.

### Local

Download `dist/index.html` and open it directly in your browser. No server needed.

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build single HTML file
npm run build

# Preview production build
npm run preview
```

## How It Works

This project implements the shape-based ASCII rendering technique described in Alex Harri's excellent blog post:

> **[ASCII Rendering](https://alexharri.com/blog/ascii-rendering)** by Alex Harri

### The Algorithm

Traditional ASCII art generators map pixel brightness to characters (dark → `@`, light → `.`). This produces decent results but ignores the *shape* of characters.

ASCII Buddy uses a smarter approach:

1. **Character Analysis**: Each printable ASCII character is rendered to a small canvas and sampled at 6 circular regions (top, bottom, left, right, center-inner, center-outer), creating a 6-dimensional "shape vector"

2. **K-d Tree Indexing**: All 95 character vectors are indexed in a k-d tree for fast nearest-neighbor lookup

3. **Image Processing**: The input image is divided into a grid. Each cell is sampled the same way to produce a 6D vector, then matched to the closest character using the k-d tree

4. **Contrast Enhancement**: A power function enhances the differences between regions, improving character selection for low-contrast images

This approach selects characters that actually *look like* the image region, not just characters with similar brightness.

```
Image Input → Canvas → Grid Sampling → 6D Vectors → K-d Tree Lookup → ASCII Grid
```

## Project Structure

```
src/
├── main.ts                 # App initialization
├── engine/
│   ├── ASCIIEngine.ts      # Core algorithm implementation
│   ├── KDTree.ts           # K-d tree for fast lookup
│   └── types.ts            # TypeScript interfaces
├── input/
│   └── InputHandler.ts     # Input method handlers
├── output/
│   ├── Renderer.ts         # ASCII display
│   └── ExportManager.ts    # Export functionality
└── styles/
    └── main.css            # Styling
```

## Tech Stack

- **TypeScript** for type-safe code
- **Vite** for fast development and building
- **vite-plugin-singlefile** to compile everything into one HTML file
- **Pure browser APIs** (Canvas) for image processing

## Acknowledgments

- [ASCII Rendering](https://alexharri.com/blog/ascii-rendering) by Alex Harri - The blog post that inspired this project and explains the shape-based character matching algorithm in detail

## License

MIT
