# Text Editor React

<div align="center">

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-rolldown--vite_7-646cff?style=flat&logo=vite)](https://vite.dev)
[![TipTap](https://img.shields.io/badge/TipTap-3-4ade80?style=flat)](https://tiptap.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

A Word-like rich text editor for the web, built with React and TipTap: an A4 page you type on, page margins, tables, math, autosave, optional real-time collaboration and PDF export.

![Screenshot](docs/screenshot.png)

</div>

## Features

- **Formatting**: bold, italic, underline, strikethrough, inline code, text color, highlight
- **Typography**: font family, font size, line height, text alignment
- **Structure**: paragraph and headings H1–H6, bullet and numbered lists
- **Tables**: insert tables, resize columns, add or delete rows and columns, merge and split cells, toggle borders
- **Media**: image upload, links, emoji (`:smile:` and emoticons), inline math with KaTeX
- **A4 page**: portrait or landscape, margin presets and custom margins in mm
- **Autosave**: the document is kept in IndexedDB and page settings in localStorage, so a reload does not lose your work
- **Collaboration (opt-in)**: open the app with `?room=<name>` to edit the same document with others over WebRTC, with live cursors
- **PDF export**: renders the page with Puppeteer through a small backend ([PDF-export-Puppeteer](https://github.com/HuyPhan1232203/PDF-export-Puppeteer))

> The editor UI is currently in Vietnamese.

## Getting started

Requirements: Node.js 20+ and pnpm 10 or 11.

```bash
git clone https://github.com/HuyPhan1232203/Text-editor-react.git
cd Text-editor-react
pnpm install
pnpm dev
```

Open http://localhost:5173.

### PDF export (optional)

PDF export needs the backend running. With Docker:

```bash
git clone https://github.com/HuyPhan1232203/PDF-export-Puppeteer.git
cd PDF-export-Puppeteer
docker build -t pdf-export .
docker run -p 3000:3000 pdf-export
```

The editor calls `http://localhost:3000` by default. To use another URL, copy `.env.example` to `.env` and set `VITE_PDF_API_URL`.

### Collaboration

Collaboration is off by default. To share a document, open the same URL with a room name in two browsers:

```
http://localhost:5173/?room=my-team
```

Peers find each other through the public y-webrtc signaling servers, so anyone who knows the room name can join. Pick a hard-to-guess name for anything private.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Type-check and build to `dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |

## Project structure

```
src/
├── components/
│   ├── tiptap/
│   │   ├── TipTapEditor/     # Editor shell, hooks (config, page settings, autosave)
│   │   ├── TextToolbar/      # Formatting toolbar and pickers
│   │   ├── tableTiptap/      # Table creation popover and cell toolbar
│   │   ├── header/           # Heading picker
│   │   ├── tiptap-node/      # Custom nodes (image upload)
│   │   └── tiptap-extension/ # Custom extensions
│   ├── PageSettingDialog.tsx # Orientation and margins
│   └── ui/                   # Radix-based UI primitives
├── config/                   # API endpoints
└── utils/                    # PDF export, style inlining, unit conversion
```

## Tech stack

React 19, TypeScript, TipTap 3 (ProseMirror), Yjs (y-webrtc, y-indexeddb), Radix UI, Tailwind CSS 4, SCSS, KaTeX, rolldown-vite.

## Roadmap

- DOCX export
- Automatic page breaks across multiple A4 pages
- English UI

## Contributing

Issues and pull requests are welcome. Please run `pnpm lint` and `pnpm build` before opening a PR.

## License

[MIT](LICENSE) © Phan Nhật Huy
