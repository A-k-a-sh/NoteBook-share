# NotebookShare Frontend - AI Copilot Instructions

## Project Overview
Vite + React + TypeScript app for rendering Jupyter notebooks (.ipynb) in the browser. Supports upload, GitHub import, and local storage via IndexedDB. Uses TailwindCSS for dark/light mode theming.

## Architecture

### Two-Page Structure
- **HomePage** ([pages/HomePage.tsx](pages/HomePage.tsx)): Handles file upload (drag-drop or multi-select), GitHub URL fetching (supports raw.githubusercontent.com conversion), and redirects to LocalViewer
- **LocalViewer** ([pages/LocalViewer.tsx](pages/LocalViewer.tsx)): Displays notebooks from IndexedDB with sidebar navigation, raw JSON viewer, and delete functionality

### Core Data Flow
1. User uploads `.ipynb` files or provides GitHub URL
2. Files parsed and validated in `processNotebookData()` (HomePage)
3. Stored in IndexedDB via [utils/storage.ts](utils/storage.ts) with metadata: `{id, name, data, createdAt, size}`
4. LocalViewer retrieves all notebooks on mount, renders active notebook via NotebookViewer

### Cell Rendering Components
- **NotebookViewer** ([components/NotebookViewer.tsx](components/NotebookViewer.tsx)): Iterates `notebook.cells[]` and delegates to cell-type components
- **CodeCell**: Python syntax highlighting via Prism.js (loaded in index.html), execution count display, copy button
- **MarkdownCell**: Parses with `marked`, sanitizes with `DOMPurify`, uses Tailwind prose classes
- **OutputCell**: Handles 4 output types - `stream` (stdout/stderr), `execute_result`, `display_data` (images as base64, HTML), `error` (traceback display)

### Storage Architecture
- IndexedDB database: `NotebookShareDB`, store: `notebooks`, keyPath: `id`
- Functions: `saveNotebook()`, `getAllNotebooks()`, `deleteNotebook()`
- Auto-initializes schema on first access via `initDB()`

## Key Conventions

### Type System ([types.ts](types.ts))
All notebook structures mirror Jupyter's .ipynb spec:
- `NotebookData` = top-level container (cells, metadata, nbformat)
- `NotebookCell` = union type supporting code/markdown/raw
- `NotebookOutput` = union of stream/display_data/execute_result/error
- `StoredNotebook` = wrapper adding storage metadata (id, createdAt, size)

### Styling Patterns
- Dark mode via Tailwind's `dark:` variant + localStorage persistence
- Cell containers use `notebook-cell` class (defined in global CSS)
- All cell renderers use `flex` layout with 64px (w-16) left gutter for In/Out labels
- Execution counts styled as `In [n]:` (blue) / `Out [n]:` (red)

### GitHub URL Handling
- Accepts full URLs (`github.com/user/repo/blob/...`) or short paths (`user/repo/file.ipynb`)
- Auto-converts `github.com` → `raw.githubusercontent.com` and removes `/blob/`
- Supports direct raw URLs and catches route patterns in `useEffect` on HomePage

## Development Workflows

### Dev Server
```bash
npm run dev  # Runs on http://localhost:3000 (configured in vite.config.ts)
```

### Build & Preview
```bash
npm run build   # Outputs to dist/
npm run preview # Serves production build
```

### Debugging Notes
- React Router uses HashRouter for GitHub Pages compatibility
- Vite config exposes `GEMINI_API_KEY` as `process.env.API_KEY` (not currently used in code)
- Prism.js syntax highlighting requires manual highlight calls via `Prism.highlightElement()`

## Critical Integration Points

### External Dependencies
- **marked**: Markdown → HTML parser (used in MarkdownCell)
- **DOMPurify**: XSS sanitization before dangerouslySetInnerHTML
- **lucide-react**: Icon library (Upload, Github, Eye, etc.)
- **Prism.js**: Loaded via CDN in index.html, accessed via `window.Prism`

### State Management
- No Redux/Zustand - uses React hooks exclusively
- Theme state: localStorage + `dark` class on `<html>`
- Notebooks state: IndexedDB as source of truth, React state mirrors it

### File Size Limits
- HomePage enforces 15MB per .ipynb file
- Consider memory usage when rendering large outputs (no virtualization)

## Common Patterns to Follow

### Adding New Cell Output Types
1. Extend `NotebookOutput` interface in [types.ts](types.ts)
2. Add case in `OutputCell.renderContent()` switch statement
3. Test with sample notebook containing that output type

### Theme-Aware Components
Always pair light/dark styles:
```tsx
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50"
```

### Error Handling in Storage
All IndexedDB operations wrapped in try/catch with Promise-based API. Example:
```typescript
try {
  await saveNotebook(data);
} catch (err) {
  console.error('Storage error:', err);
  // Display user-friendly message
}
```

### File Upload Multi-Processing
HomePage iterates files sequentially (not Promise.all) to show partial success if some fail. Errors accumulated in array and displayed together.
