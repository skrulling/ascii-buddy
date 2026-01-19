# ascii-buddy npm Library Specification

## Summary

Add an npm library to the existing project with:
- Simple function-based API: `imageToAscii()`
- Browser + Node.js support
- `canvas` as optional peer dependency for Node.js
- Published as `ascii-buddy@1.0.0`

## Public API

```typescript
import { imageToAscii } from 'ascii-buddy';

// Browser
const result = await imageToAscii(imgElement, { resolution: 150, contrastExponent: 2.0 });

// Node.js (requires `npm install canvas`)
const result = await imageToAscii('./photo.jpg');
const result = await imageToAscii(buffer);

// Result
result.grid      // ASCIICell[][] 
result.width     // number
result.height    // number
result.toString() // "ABC\nDEF\n..."
```

## File Changes

```
src/
├── lib/                        # NEW
│   ├── index.ts                # Public exports: imageToAscii, types
│   ├── imageToAscii.ts         # Main function
│   ├── canvas-provider.ts      # Browser/Node canvas abstraction
│   └── input-loader.ts         # Load from Element/path/Buffer/ImageData
├── engine/                     # MODIFY
│   ├── ASCIIEngine.ts          # Refactor to accept canvas factory
│   ├── KDTree.ts               # No changes
│   └── types.ts                # Add toString() to ASCIIResult
├── input/                      # No changes (web app)
├── output/                     # No changes (web app)
├── styles/                     # No changes (web app)
└── main.ts                     # Minor update to use refactored engine
```

## New Files

| File | Purpose |
|------|---------|
| `src/lib/index.ts` | Export `imageToAscii` and types |
| `src/lib/imageToAscii.ts` | Main library function |
| `src/lib/canvas-provider.ts` | Abstract canvas creation for browser/Node |
| `src/lib/input-loader.ts` | Load images from various input types |
| `vite.config.lib.ts` | Library build config (ESM + CJS) |
| `tsconfig.lib.json` | TypeScript config for .d.ts generation |

## Implementation Steps

1. **Refactor ASCIIEngine** - Accept canvas factory via constructor instead of using `document.createElement` directly

2. **Create canvas-provider.ts** - Detect environment and return appropriate canvas factory (browser DOM or node-canvas)

3. **Create input-loader.ts** - Handle `HTMLImageElement`, `ImageData`, file path string, URL string, and Buffer

4. **Create imageToAscii.ts** - Main function that wires everything together

5. **Create lib/index.ts** - Export public API and types

6. **Add toString() to ASCIIResult** - Convenience method in types.ts

7. **Update main.ts** - Use refactored engine (minimal changes)

8. **Add vite.config.lib.ts** - Build library to `dist/lib/` as ESM + CJS, externalize `canvas`

9. **Add tsconfig.lib.json** - Generate type declarations

10. **Update package.json** - Add exports, main, module, types, files, peer dependencies, build scripts

11. **Update README.md** - Add library usage documentation

12. **Test** - Verify both web app and library builds work

## package.json Changes

```json
{
  "name": "ascii-buddy",
  "version": "1.0.0",
  "main": "./dist/lib/ascii-buddy.cjs",
  "module": "./dist/lib/ascii-buddy.js",
  "types": "./dist/lib/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/lib/ascii-buddy.js",
      "require": "./dist/lib/ascii-buddy.cjs",
      "types": "./dist/lib/index.d.ts"
    }
  },
  "files": ["dist/lib"],
  "peerDependencies": {
    "canvas": "^2.11.0"
  },
  "peerDependenciesMeta": {
    "canvas": { "optional": true }
  },
  "scripts": {
    "dev": "vite",
    "build": "npm run build:web && npm run build:lib",
    "build:web": "tsc && vite build",
    "build:lib": "vite build --config vite.config.lib.ts",
    "prepublishOnly": "npm run build:lib"
  }
}
```

## Build Output

After `npm run build`:
```
dist/
├── index.html              # Web app (single file)
└── lib/
    ├── ascii-buddy.js      # ESM
    ├── ascii-buddy.cjs     # CommonJS
    └── index.d.ts          # TypeScript declarations
```

## Types

```typescript
export interface ASCIICell {
  char: string;
  color: string; // hex color like "#ff0000"
}

export interface ASCIIResult {
  grid: ASCIICell[][];
  width: number;
  height: number;
  toString(): string;
}

export interface ProcessOptions {
  resolution?: number;        // grid width, default 150
  contrastExponent?: number;  // edge detail, default 2.0
}

export type ImageInput = 
  | HTMLImageElement 
  | ImageData 
  | string    // file path (Node.js) or data URL
  | Buffer;   // Node.js buffer
```

## Canvas Provider Logic

```typescript
export function getCanvasProvider(): CanvasProvider {
  // Browser environment
  if (typeof document !== 'undefined') {
    return {
      createCanvas: (w, h) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        return canvas;
      },
      getContext: (canvas) => canvas.getContext('2d')!
    };
  }
  
  // Node.js environment
  try {
    const { createCanvas } = require('canvas');
    return {
      createCanvas: (w, h) => createCanvas(w, h),
      getContext: (canvas) => canvas.getContext('2d')
    };
  } catch {
    throw new Error(
      'Node.js usage requires the "canvas" package. Install it with: npm install canvas'
    );
  }
}
```

## Input Loader Logic

```typescript
export async function loadImage(
  input: ImageInput,
  provider: CanvasProvider
): Promise<ImageData> {
  // Already ImageData
  if (input instanceof ImageData) {
    return input;
  }
  
  // HTMLImageElement (browser)
  if (typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement) {
    return imageElementToImageData(input, provider);
  }
  
  // Buffer (Node.js)
  if (Buffer.isBuffer(input)) {
    return bufferToImageData(input, provider);
  }
  
  // String - file path or data URL
  if (typeof input === 'string') {
    if (typeof document !== 'undefined') {
      // Browser - treat as URL/data URL
      return urlToImageData(input, provider);
    } else {
      // Node.js - treat as file path
      return filePathToImageData(input, provider);
    }
  }
  
  throw new Error('Unsupported input type');
}
```
