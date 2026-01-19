# ASCII Buddy - Project Specification

## Project Overview

Build a web-based ASCII art generator implementing the shape-based character selection technique from [alexharri.com/blog/ascii-rendering](https://alexharri.com/blog/ascii-rendering). The application will use TypeScript and Vite for development, but compile to a single, fully portable `index.html` file.

## Requirements

### Functional Requirements
- **Input Methods**: Support image file upload, URL loading, drag-and-drop, and paste from clipboard
- **Processing**: Convert images to ASCII art using 6D shape vector matching
- **Output**: Display ASCII art and provide export as plain text, clipboard copy, and PNG image
- **Rendering**: Monochrome ASCII with good default settings (no user controls)

### Technical Requirements
- Single `index.html` output file (fully portable)
- TypeScript + Vite development environment
- Full implementation of 6D shape vector technique with k-d tree optimization
- Responsive design, works across modern browsers

## Architecture

### Tech Stack
- **Language**: TypeScript
- **Build Tool**: Vite with `vite-plugin-singlefile`
- **Runtime**: Pure browser APIs (Canvas, Web Workers)
- **Dependencies**: Minimal (k-d tree library only, inlined in build)

### Core Components

1. **InputHandler**
   - Manages file upload, URL loading, drag-drop, and paste events
   - Normalizes all inputs to HTMLImageElement
   - Validates file types and handles errors

2. **ASCIIEngine**
   - Pre-computes 6D shape vectors for 95 ASCII characters
   - Builds k-d tree index for fast lookups
   - Processes images: grid sampling → vector generation → character lookup
   - Applies contrast enhancement techniques

3. **Renderer**
   - Displays ASCII grid in HTML `<pre>` element
   - Renders ASCII to canvas for image export

4. **ExportManager**
   - Clipboard copy functionality
   - Text file download
   - PNG image download

### Data Flow
```
Image Input → Canvas → Grid Sampling → 6D Vectors → K-d Tree Lookup → ASCII Grid → Display/Export
```

## Technical Details

### 6D Shape Vector System

Each ASCII character is represented by a 6-dimensional vector based on sampling 6 circular regions:
1. Top region
2. Bottom region
3. Left region
4. Right region
5. Center-inner region
6. Center-outer region

Character rendering canvas: 20x30 pixels
Font: 24px monospace

### Image Processing Pipeline

1. **Load and Prepare Image**
   - Draw to canvas
   - Default grid: ~120 characters wide
   - Adjust height for character aspect ratio (0.5x)

2. **Grid Sampling**
   - Divide image into grid cells
   - Sample 6 circular regions per cell
   - Generate 6D vector for each cell

3. **Contrast Enhancement**
   - Apply global contrast enhancement
   - Use exponential function to enhance differences
   - Normalize results

4. **Character Matching**
   - Use k-d tree to find nearest character vector
   - O(log n) lookup time

### K-d Tree Implementation

- 6-dimensional space
- Euclidean distance metric
- Nearest neighbor search
- ~10x speedup over brute force

## File Structure

```
ascii-buddy/
├── src/
│   ├── main.ts                 # App initialization & main class
│   ├── engine/
│   │   ├── ASCIIEngine.ts      # Core processing engine
│   │   ├── KDTree.ts           # K-d tree implementation
│   │   └── types.ts            # Shared types
│   ├── input/
│   │   └── InputHandler.ts     # All input methods
│   ├── output/
│   │   ├── Renderer.ts         # Display ASCII
│   │   └── ExportManager.ts    # Export functionality
│   └── styles/
│       └── main.css            # All styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## UI Components

### Input Section
- Drop zone for drag-and-drop
- File input button
- URL input field with load button
- Paste support (document-level listener)

### Output Section
- ASCII art display (`<pre>` element)
- Export controls:
  - Copy to Clipboard button
  - Download TXT button
  - Download PNG button
  - New Image button

### Loading State
- Full-screen overlay
- Spinner animation
- Status message

## Build Configuration

### package.json
```json
{
  "name": "ascii-buddy",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "vite-plugin-singlefile": "^2.0.0"
  }
}
```

### vite.config.ts
- Use `vite-plugin-singlefile`
- Inline all assets
- No code splitting
- Target: esnext

### tsconfig.json
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- DOM libraries included

## Implementation Phases

### Phase 1: Project Setup
- Initialize project structure
- Install dependencies
- Setup configuration files
- Verify single-file build works

### Phase 2: Core ASCII Engine
- Implement character vector pre-computation
- Implement k-d tree
- Implement image processing pipeline
- Implement contrast enhancement
- Test with sample images

### Phase 3: Input Handling
- File upload
- URL loading (with CORS)
- Drag-and-drop
- Clipboard paste
- Error handling

### Phase 4: Output & Export
- ASCII display
- Clipboard copy
- Text file download
- PNG export
- New image functionality

### Phase 5: UI/UX Polish
- CSS styling
- Responsive design
- Loading states
- Visual feedback
- Error messages

### Phase 6: Optimization & Testing
- Performance testing
- Cross-browser testing
- Parameter tuning
- Final verification

## Testing Checklist

### Input Methods
- [ ] File upload (PNG, JPG, GIF, WebP)
- [ ] URL loading (valid/invalid URLs)
- [ ] Drag-and-drop
- [ ] Paste from clipboard

### Export Functions
- [ ] Copy to clipboard
- [ ] Download TXT file
- [ ] Download PNG image

### Image Variety
- [ ] Small images (< 100px)
- [ ] Large images (> 2000px)
- [ ] High-contrast images
- [ ] Low-contrast images
- [ ] Photos
- [ ] Logos/graphics

### Build & Compatibility
- [ ] Single index.html works standalone
- [ ] File size under 500KB
- [ ] Chrome compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility
- [ ] Mobile device testing

## Quality Standards

1. **ASCII Output Quality**: Matches or exceeds blog post examples
2. **Performance**: No issues with images < 2MB
3. **Code Quality**: Clean, typed TypeScript code
4. **File Size**: Final build under 500KB
5. **Offline Support**: Works without internet after download

## Notes & Considerations

1. **Image Size Limits**: Downsample very large images to prevent performance issues
2. **CORS**: URL loading requires CORS-enabled images
3. **Font Consistency**: Use web-safe monospace fonts
4. **Character Aspect Ratio**: Adjust grid height by ~0.5x
5. **Browser Compatibility**: Target modern browsers (ES2020+)
6. **Performance**: K-d tree provides ~10x speedup
7. **Portability**: Must work with file:// protocol

## Critical Implementation Details

### Character Vector Sampling
- Canvas size: 20x30 pixels
- Font: 24px monospace
- Sample 16 points around each circular region
- Use relative luminance formula: 0.2126R + 0.7152G + 0.0722B

### Contrast Enhancement
- Calculate mean of 6D vector
- Normalize by subtracting mean
- Apply power function (exponent: 1.5)
- Denormalize back

### Grid Processing
- Cell width = image width / grid width
- Cell height = image height / grid height
- Sample center positions for each region
- Radius = min(cell width, cell height) * 0.4

### Export PNG Settings
- Character width: 10px
- Character height: 16px
- Font: 14px "Courier New"
- Background: #1a1a1a
- Text color: #ffffff

## Color Scheme

```css
--bg-dark: #1a1a1a
--bg-medium: #2a2a2a
--text-light: #ffffff
--text-dim: #aaaaaa
--accent: #4a9eff
--accent-hover: #6bb0ff
```

## Default Settings

- Grid width: 120 characters
- ASCII range: Characters 32-126 (95 printable ASCII)
- Font: Courier New, monospace
- Font size (display): 10px
- Line height: 1
