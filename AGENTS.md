# AGENTS.md

Guidelines for AI agents working on this codebase.

## Project Context

ASCII Buddy is a single-page web application that converts images to ASCII art. The entire app compiles to one HTML file with no external dependencies.

## Before Making Changes

1. **Run the build** to ensure the project compiles: `npm run build`
2. **Understand the data flow**: Image → Canvas → Grid sampling → 6D vectors → K-d tree lookup → ASCII grid → Display
3. **Check the output**: The `dist/index.html` should remain under 500KB and work when opened directly in a browser

## Code Style

- TypeScript strict mode is enabled
- Use explicit types for function parameters and return values
- Keep classes focused on single responsibilities
- No external runtime dependencies (everything must inline into the HTML)

## Testing Changes

There are no automated tests. Verify changes by:

1. Running `npm run dev` and testing in browser
2. Testing all input methods: file upload, drag-drop, paste, URL
3. Testing all exports: clipboard, TXT download, PNG download
4. Running `npm run build` and opening `dist/index.html` directly (file:// protocol)
5. Testing with various image types: photos, logos, high/low contrast

## Common Tasks

### Adjusting ASCII Output Quality

Modify `src/engine/ASCIIEngine.ts`:
- Change `targetWidth` for different grid sizes
- Adjust the contrast exponent (currently `1.5`) in `enhanceContrast()`
- Modify circle sampling points for accuracy vs performance tradeoff

### Adding New Input Methods

Add handlers in `src/input/InputHandler.ts`. All inputs should resolve to an `HTMLImageElement` passed to the `onImageLoad` callback.

### Adding New Export Formats

Add methods to `src/output/ExportManager.ts` and wire up buttons in `src/main.ts`.

### Styling Changes

All styles are in `src/styles/main.css`. The app uses CSS custom properties for theming.

## Constraints

- **No new dependencies** unless absolutely necessary (increases bundle size)
- **Must work offline** after download
- **Must work on file:// protocol** (no service workers, no fetch for local resources)
- **Single HTML output** is a hard requirement

## Performance Considerations

- The k-d tree provides ~10x speedup over brute-force character matching
- Large images (>2000px) may cause UI lag during processing
- Character vector pre-computation runs once on page load (~95 characters)
