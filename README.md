# Text Editor React

<div align="center">

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-rolldown--vite_7-646cff?style=flat&logo=vite)](https://vite.dev)
[![TipTap](https://img.shields.io/badge/TipTap-3-4ade80?style=flat)](https://tiptap.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![CI](https://github.com/HuyPhan1232203/Text-editor-react/actions/workflows/ci.yml/badge.svg)](https://github.com/HuyPhan1232203/Text-editor-react/actions/workflows/ci.yml)

A Word / Google Docs–like editor for the web, built with React and TipTap. Real A4 pages, tables that split across pages, comments, link sharing with real-time editing, and PDF export — all in the browser, no backend needed.

**[Live demo →](https://text-editor-react-neon.vercel.app/)** · [How the pagination works](https://dev.to/huy_phan_173c933272803418/how-i-built-word-style-a4-pages-for-tiptap-without-touching-the-document-778)

![Screenshot](docs/screenshot.png)

</div>

## Features

### Pages and layout
- **Real A4 pages**: content flows across separate sheets like Word, portrait or landscape, margin presets and custom margins in mm
- **Tables split across pages** between rows (never inside a `rowspan`) and repeat their header row on each page
- **Header, footer and page numbers**: type in the top or bottom margin of any page; shared by all pages, saved with the document and printed in the PDF
- **Zoom** 50%–200% or fit to width from the status bar, or `Ctrl/Cmd + mouse wheel` / trackpad pinch; page breaks stay identical at every level. Phones open fitted to the width
- **Sidebar** with page thumbnails (click to jump, lazy-rendered) or a document outline built from the headings

### Writing
- **Slash menu**: type `/` to insert headings, lists, checklists, tables, images, formulas, code blocks, dividers or YouTube videos, with the matching Markdown shortcut shown next to each
- **Toolbar** like Google Docs: text style, font, font size stepper, line spacing, bold / italic / underline / strikethrough, text color, highlight, links, alignment, lists, images, tables, an **Insert** menu (quote, code block, divider, formulas, YouTube, open a Word document) and a **…** menu (inline code, subscript, superscript, clear formatting)
- **Links** open from a small menu (address, copy, edit, remove) or with `Ctrl/Cmd + click`
- **Find & replace**: `Ctrl/Cmd + F` / `+ H` or the search button; matches are highlighted and scrolled into view on any page, with match case and replace all in one undo step
- **Images**: paste, drop or upload, resize by dragging, wrap text left or right
- **Tables**: resize columns, add or delete rows and columns, merge and split cells, cell colors and vertical alignment, hide borders
- **More**: checklists, KaTeX math (lazy-loaded), code blocks with syntax highlighting (lazy-loaded), emoji as plain text (`:heart:`), smart typography (`--` → —), block drag handle, word and character count

### Working together
- **Comments**: select text and press `Ctrl/Cmd + Alt + M`; cards sit in the margin next to their text, with replies, resolve and delete (undoable)
- **Share** with one click: the link (with an encryption key in the URL fragment) is copied to your clipboard; everyone with it edits in real time with named cursors, avatars of who is online and a connection status. Peer-to-peer over WebRTC, no server stores the document ([details and limits](#sharing-and-collaboration))

### In and out
- **PDF export** through the browser's print dialog, keeping the page breaks, header, footer and page numbers; optionally one-click download through a Puppeteer backend ([PDF-export-Puppeteer](https://github.com/HuyPhan1232203/PDF-export-Puppeteer))
- **Paste from Google Docs** keeping headings, lists, checklists, tables and indents
- **Open Word documents** (`.docx`) from the Insert menu or by dropping them onto the page
- **Autosave** to IndexedDB, so a reload never loses your work
- **English and Vietnamese UI**, switch with VI / EN in the status bar
- **Welcome tour**: first-time visitors get an editable demo document

## Getting started

Requirements: Node.js 20+ and pnpm 10 or 11.

```bash
git clone https://github.com/HuyPhan1232203/Text-editor-react.git
cd Text-editor-react
pnpm install
pnpm dev
```

Open http://localhost:5173.

### PDF export

No setup needed: click **Export PDF** and choose **Save as PDF** in the print dialog. Only the page is printed, using the orientation and margins from page settings.

For a one-click download instead, run the optional backend and point the editor to it:

```bash
git clone https://github.com/HuyPhan1232203/PDF-export-Puppeteer.git
cd PDF-export-Puppeteer
docker build -t pdf-export .
docker run -p 3000:3000 pdf-export
```

Then copy `.env.example` to `.env`, set `VITE_PDF_API_URL=http://localhost:3000` and restart `pnpm dev`.

### Sharing and collaboration

Click **Share**, enter your name and **Create share link**. Your current document (with its header and footer) is copied into a new room and you get a link like:

```
https://your-host/?room=k3j9x2pq7m#key=4hd9…
```

Send it to the people you want to write with. Everyone in the room edits the same document, sees the others' cursors with their names, and appears as an avatar next to the Share button. **Leave room** takes you back to your private document, which is kept separately.

A dot next to **Share** shows whether you are connected (green), still connecting (amber) or cannot reach the others (red). A name label appears for a few seconds when someone moves their cursor, and clicking their avatar scrolls to it. The Share dialog also lists the shared documents you opened recently, so you can get back to them without the link.

How it works, and what that means:

- **No server stores the document.** The app has no backend: peers sync directly over WebRTC ([y-webrtc](https://github.com/yjs/y-webrtc)), and each person's browser keeps a copy in IndexedDB. Someone who opens the link while nobody else is online gets the copy from their own last visit (or an empty document on a first visit). The latest version reaches them as soon as another member is online.
- **The link is the permission.** There are no accounts, and anyone with the full link can edit. The room key is in the URL fragment (`#key=…`), which browsers never send to servers; it encrypts the signaling, so the signaling server cannot read the content and people without the key cannot join, even if they guess the room name.
- **Signaling server.** Peers find each other through the public y-webrtc signaling server (`wss://y-webrtc-eu.fly.dev`). It only relays encrypted connection offers, but it is a free community service with no uptime guarantee; for production, run your own (`PORT=4444 npx -p y-webrtc y-webrtc-signaling`) and set `VITE_SIGNALING_URLS=wss://your-server` (comma-separated for several) at build time.
- **Restrictive networks.** Without a TURN server, two peers behind strict corporate firewalls or symmetric NATs may not be able to connect. Add TURN servers through the provider's `peerOpts` if you need that.
- **Need a real backend?** For always-on persistence, permissions and many users, swap `y-webrtc` for a server provider such as [Hocuspocus](https://tiptap.dev/docs/hocuspocus) or [y-websocket](https://github.com/yjs/y-websocket); the editor side (Yjs + TipTap Collaboration) stays the same.

Older links with only `?room=<name>` (no key) still work, without encryption.

## Use the pagination in your own editor

The page layout engine is published separately as **[`tiptap-a4-pagination`](packages/tiptap-a4-pagination)** — a free TipTap 3 extension for A4 / Letter pages, table splitting and repeated header rows, without touching your document or CSS.

```bash
npm install tiptap-a4-pagination
```

See the [package README](packages/tiptap-a4-pagination#readme) for setup.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Type-check and build to `dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the unit tests (Vitest) |

## Project structure

```
packages/
└── tiptap-a4-pagination/     # Pagination extension, published to npm
src/
├── i18n/                     # English / Vietnamese UI strings
├── components/
│   ├── tiptap/
│   │   ├── TipTapEditor/     # Editor shell, hooks (config, page settings, autosave)
│   │   ├── TextToolbar/      # Formatting toolbar, pickers, Insert and … menus
│   │   ├── tableTiptap/      # Table creation popover and cell toolbar
│   │   ├── header/           # Heading picker
│   │   ├── tiptap-node/      # Custom nodes (image upload)
│   │   └── tiptap-extension/ # Custom extensions
│   ├── PageSettingDialog.tsx # Orientation and margins
│   └── ui/                   # Radix-based UI primitives
├── lib/                      # Sharing, comments, page header / footer, lazy loaders
├── config/                   # PDF backend, signaling servers
└── utils/                    # PDF export, style inlining, unit conversion
```

## Tech stack

React 19, TypeScript, TipTap 3 (ProseMirror), Yjs (y-webrtc, y-indexeddb), Radix UI, Tailwind CSS 4, KaTeX, lowlight, mammoth, rolldown-vite. Interface in Inter, documents in Source Serif 4.

## Roadmap

- DOCX export
- Split a single long paragraph across pages
- Resolved comments history and @mentions
- Incremental pagination: re-measure only from the first changed block instead of the whole document on every edit

## Support & custom work

- ⭐ **Star the repo** if it's useful — it helps others find it
- 🐛 **Found a bug or a document that breaks the layout?** [Open an issue](https://github.com/HuyPhan1232203/Text-editor-react/issues)
- 💼 **Need a custom document editor?** I build and integrate TipTap / ProseMirror editors: pagination, PDF / DOCX export, Google Docs import, collaboration. Reach me at [huyphan1232203@gmail.com](mailto:huyphan1232203@gmail.com)

## Contributing

Issues and pull requests are welcome. Please run `pnpm lint`, `pnpm test` and `pnpm build` before opening a PR.

## License

[MIT](LICENSE) © Phan Nhật Huy
