# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

ASCII Buddy is a web-based ASCII art generator that converts images to ASCII art using 6D shape vector matching. It compiles to a single portable HTML file.

## Tech Stack

- **Language**: TypeScript
- **Build Tool**: Vite with `vite-plugin-singlefile`
- **Runtime**: Pure browser APIs (Canvas for image processing)
- **Output**: Single `index.html` file (no external dependencies)

## Common Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Compile to dist/index.html (single file)
npm run preview  # Preview production build
```

## Architecture

### Core Algorithm

The app uses the shape-based character selection technique from [alexharri.com/blog/ascii-rendering](https://alexharri.com/blog/ascii-rendering):

1. **Character pre-computation**: Each ASCII character (32-126) is rendered to a small canvas and sampled at 6 circular regions (top, bottom, left, right, center-inner, center-outer) to create a 6D shape vector
2. **K-d tree indexing**: Character vectors are indexed in a k-d tree for O(log n) nearest-neighbor lookup
3. **Image processing**: Input images are divided into a grid, each cell sampled into a 6D vector, contrast-enhanced, then matched to the closest character

### File Structure

```
src/
├── main.ts                 # App bootstrap and UI orchestration
├── engine/
│   ├── ASCIIEngine.ts      # Character vector computation + image processing
│   ├── KDTree.ts           # 6D k-d tree implementation
│   └── types.ts            # TypeScript interfaces
├── input/
│   └── InputHandler.ts     # File, URL, drag-drop, paste handlers
├── output/
│   ├── Renderer.ts         # ASCII display in <pre> element
│   └── ExportManager.ts    # Clipboard, TXT, PNG export
└── styles/
    └── main.css            # Dark theme, responsive design
```

### Key Classes

- **ASCIIEngine** (`src/engine/ASCIIEngine.ts`): Core processing. `initialize()` pre-computes character vectors, `processImage()` converts images to ASCII grid
- **KDTree** (`src/engine/KDTree.ts`): Generic k-d tree with `nearest()` method for finding closest character match
- **InputHandler** (`src/input/InputHandler.ts`): Normalizes all input methods to `HTMLImageElement`
- **ExportManager** (`src/output/ExportManager.ts`): Handles all export formats

## Build Output

The build produces a single `dist/index.html` (~14KB) with all JS and CSS inlined. This file:
- Works offline
- Can be opened directly in any browser (file:// protocol)
- Has no external dependencies

## Tuning Parameters

Key values that affect output quality (in `ASCIIEngine.ts`):
- `targetWidth = 120`: Default ASCII grid width in characters
- `0.5` aspect ratio factor: Compensates for characters being taller than wide
- `1.5` contrast exponent: Power function for contrast enhancement
- Circle sampling uses 16-24 points per region
