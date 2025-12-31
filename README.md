# NotebookShare

A modern, browser-based Jupyter Notebook viewer built with React, TypeScript, and Vite. View, render, and share .ipynb files with full support for markdown, code syntax highlighting, outputs, plots, and mathematical equations.

## Features

- **File Upload**: Drag-and-drop or select multiple .ipynb files
- **GitHub Integration**: Import notebooks directly from GitHub repositories
- **Rich Rendering**: 
  - Markdown with full formatting (headings, lists, links, tables)
  - Python syntax highlighting via Prism.js
  - LaTeX math equations via KaTeX
  - Cell outputs including images, HTML, and error tracebacks
- **Local Storage**: Notebooks stored in IndexedDB for offline access
- **Dark Mode**: System-aware theme with manual toggle
- **Export**: Download notebooks back to .ipynb format
- **Raw Viewer**: Inspect notebook JSON structure

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Routing**: React Router (HashRouter)
- **Styling**: Tailwind CSS (CDN)
- **Markdown**: marked + DOMPurify
- **Math**: KaTeX
- **Syntax Highlighting**: Prism.js
- **Storage**: IndexedDB
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/A-k-a-sh/NoteBook-share.git
   cd NoteBook-share
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Upload Notebooks

1. Navigate to the home page
2. Drag and drop .ipynb files or click to select
3. Files are validated and stored locally
4. View notebooks in the Local Viewer

### Import from GitHub

1. Paste a GitHub URL in the format:
   - `https://github.com/user/repo/blob/main/notebook.ipynb`
   - `user/repo/notebook.ipynb` (auto-expanded)
2. Raw URLs are automatically converted
3. Notebook is fetched and stored locally

### View and Manage

- **Sidebar**: Browse all stored notebooks
- **Download**: Export notebook as .ipynb
- **View JSON**: Inspect raw notebook structure
- **Delete**: Remove notebooks from storage

## Project Structure

```
notebookshare-frontend/
├── components/
│   ├── CodeCell.tsx          # Python code rendering
│   ├── MarkdownCell.tsx      # Markdown + math rendering
│   ├── NotebookViewer.tsx    # Main notebook renderer
│   ├── OutputCell.tsx        # Cell output handling
│   └── Sidebar.tsx           # Notebook list sidebar
├── pages/
│   ├── HomePage.tsx          # Upload and GitHub import
│   └── LocalViewer.tsx       # Notebook viewer with controls
├── utils/
│   └── storage.ts            # IndexedDB operations
├── App.tsx                   # Main app with routing
├── types.ts                  # TypeScript interfaces
└── index.html                # Entry point with CDN imports
```

## Deployment

This app is ready for deployment on static hosting platforms:

### Vercel

1. Push code to GitHub
2. Import repository on Vercel
3. Deploy (auto-detected as Vite project)

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Deploy

### GitHub Pages

Update `vite.config.ts` base path, then:
```bash
npm run build
gh-pages -d dist
```

## Key Implementation Details

### Math Rendering

Markdown cells use a shield/unshield pattern:
1. Extract math expressions ($$...$$, $...$, \begin{aligned}...)
2. Render with KaTeX to HTML
3. Replace with placeholders before markdown parsing
4. Restore rendered math after markdown processing
5. Sanitize with DOMPurify (configured for MathML)

### Storage

Notebooks stored in IndexedDB:
- Database: `NotebookShareDB`
- Store: `notebooks`
- Schema: `{id, name, data, createdAt, size}`

### GitHub URL Handling

Auto-converts blob URLs to raw:
```
github.com/user/repo/blob/main/file.ipynb
→ raw.githubusercontent.com/user/repo/main/file.ipynb
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any browser with IndexedDB support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Jupyter Project for the .ipynb format specification
- KaTeX for beautiful math rendering
- Prism.js for syntax highlighting
- Tailwind CSS for styling utilities
