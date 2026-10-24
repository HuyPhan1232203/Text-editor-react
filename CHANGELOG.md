# Changelog

All notable changes to Text Editor React. The `tiptap-a4-pagination` package has its own version on npm (0.2.0 adds zoom support: pages scaled with a CSS transform keep the same page breaks, and an `elementScale` helper).

## [0.3.3] - 2026-10-24

### Fixed

- Signaling server: rooms left with `unsubscribe` stayed in memory forever; a room is now dropped when its last member leaves.

## [0.3.2] - 2026-10-24

### Fixed

- Signaling server: a malformed message (for example `topics` that is not a list) could crash the server and drop every shared session; malformed input is now ignored.

## [0.3.1] - 2026-10-24

### Added

- A small signaling server in `signaling/` (y-webrtc protocol, deployable for free on Render) so Share works without the public y-webrtc server, which is currently unreachable. Point the editor at it with `VITE_SIGNALING_URLS`.

## [0.3.0] - 2026-10-24

### Changed

- **New interface design**: Inter for the interface and Source Serif 4 for documents, a cool gray workspace and one blue accent.
  - A top bar with the product name and author, the save state, find, Share and Export PDF.
  - A single-row formatting toolbar: bordered text style and font menus, a `− 11 +` font size stepper, line spacing, one highlight button with a color dot, an alignment menu, an **Insert** menu (quote, code block, divider, formulas, YouTube, open a Word document) and a **…** menu (inline code, subscript, superscript, clear formatting).
  - Sidebar with a segmented Pages / Outline switch; thumbnails outlined in the accent color.
  - Status bar with page setup, counts, zoom (`−  100%  +`) and a VI / EN switch.
  - The slash menu groups blocks into "Basic blocks" and "Insert" and shows the Markdown shortcut of each.
- On a narrow screen the page fits the width on the first visit.
- Find & replace scrolls the current match into view on any page (it stayed selected off screen while typing in the search box).

### Fixed

- Selecting to the end of a line and pressing Ctrl/Cmd+F added a trailing space to the search.
- Closing the search box kept the replace text for next time.
- Double-clicking Replace all replaced twice.
- The search box overflowed narrow screens.

### Added

- `VITE_SIGNALING_URLS` to share through your own signaling servers.

## [0.2.2] - 2026-10-23

### Fixed

- Links in the document could not be opened. Putting the cursor in a link now shows a menu like Google Docs, with the address (click to open it in a new tab), copy, edit and remove; Ctrl/Cmd + click opens a link directly. Bare domains such as `example.com` open as https, and other schemes are never opened.

## [0.2.1] - 2026-10-23

### Fixed

- Switching the sidebar to Outline and back to Pages showed only the first page thumbnail until the next edit.
- The text style button kept showing "Paragraph" when the cursor moved into a heading.
- Text style names (Paragraph, Heading 1–6) are now translated in the Vietnamese UI.

### Docs

- Link to the article on how the pagination works.

## [0.2.0] - 2026-10-23

### Added

- **Zoom**: a Google Docs–style zoom box after undo / redo (type a percentage, or pick 50%–200% or Fit width), plus `Ctrl/Cmd + mouse wheel` / trackpad pinch. Page breaks, comments, menus and the drag handle stay aligned at every level, and the zoom is remembered.
- **Comments**: select text and press `Ctrl/Cmd + Alt + M` to start a thread. Cards sit in the right margin next to their text, with replies, resolve and delete (both undoable). Comments are stored in the document and sync live in shared rooms.
- **Share button**: one click creates a room with your current document and copies an encrypted link (the key stays in the URL fragment). Avatars of who is online, named cursors that show the name while someone types, click an avatar to jump to their cursor, connection status, a notice while waiting for others, and recent shared documents.
- **Header, footer and page numbers** in the page margins, shared by all pages, synced in rooms and printed in the PDF export.
- **Open Word documents**: `.docx` from the toolbar or dropped onto the page.
- **Slash menu**: type `/` to insert headings, lists, checklists, tables, images, formulas, code blocks, dividers or YouTube videos.
- **Find & replace** (`Ctrl/Cmd + F`, `Ctrl/Cmd + H`) with match case and replace all in one undo step.
- **Drag handle** to move blocks, **outline** tab in the sidebar, **status bar** with page, word and character count.
- Subscript, superscript, smart typography, placeholder, YouTube embeds, code blocks with lazily loaded syntax highlighting.

### Fixed

- Clicking in the page margin jumped to the end of the document; it now puts the cursor on the nearest line.
- Collaborators' cursors were drawn at the start of the next line instead of at their text position.
- PDF page numbers were always in Vietnamese; they now follow the UI language.

## [0.1.0] - 2026-10-22

First public release: real A4 pages with tables that split across pages and repeat their header row, PDF export without a server, Google Docs paste, images with text wrapping, table tools, checklists, math, emoji, autosave, optional real-time collaboration, page thumbnails, English and Vietnamese UI.

[0.3.3]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/HuyPhan1232203/Text-editor-react/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/HuyPhan1232203/Text-editor-react/releases/tag/v0.1.0
