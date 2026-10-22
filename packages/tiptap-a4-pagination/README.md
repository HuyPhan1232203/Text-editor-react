# tiptap-a4-pagination

[![npm](https://img.shields.io/npm/v/tiptap-a4-pagination?style=flat)](https://www.npmjs.com/package/tiptap-a4-pagination)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**Free, open-source page layout for [TipTap 3](https://tiptap.dev)** — your content flows across real A4 / Letter sheets, like Word or Google Docs.

- Page breaks with margins and a gap between sheets
- **Tables split between rows** and **repeat their header row** on each page
- Rows joined by a `rowspan` are never cut
- Floated images (text wrapping) are handled
- **Your document and CSS are untouched** — breaks are ProseMirror decorations, so `getHTML()` / `getJSON()` stay clean
- ~5 KB, no dependencies besides TipTap

[Live demo →](https://text-editor-react-neon.vercel.app/) · Used in [Text Editor React](https://github.com/HuyPhan1232203/Text-editor-react)

## Install

```bash
npm install tiptap-a4-pagination
```

## Usage

The extension paginates the editor inside a **page element** whose padding is the page margins:

```tsx
import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Pagination, createPageLayout } from 'tiptap-a4-pagination'
import 'tiptap-a4-pagination/styles.css'

const layout = createPageLayout({ size: 'A4', marginTop: 25.4, marginBottom: 25.4 }) // mm

export function Editor () {
  const editor = useEditor({
    extensions: [StarterKit, Pagination.configure({ pageSelector: '.page' })]
  })

  useEffect(() => {
    editor?.commands.setPageLayout(layout)
  }, [editor])

  return (
    <div
      className='page'
      style={{
        width: layout.pageWidth,
        padding: '25.4mm',
        // grow with the number of pages
        minHeight: (editor?.storage.pagination.pageCount ?? 1) * (layout.pageHeight + layout.gap) - layout.gap,
        background: 'white'
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
```

`editor.storage.pagination.pageCount` gives the current number of pages (listen to the editor's `transaction` event to re-render).

## API

### `Pagination` options

| Option | Default | Description |
| --- | --- | --- |
| `pageSelector` | `'.document-page'` | Selector of the page element around the editor. Its top padding is the top margin; the gap spans its full width. |

### Commands

- `setPageLayout(layout: PageLayout)` — sets the page geometry (px) and starts paginating. Call it again when margins or orientation change.

### Helpers

- `createPageLayout({ size?, orientation?, marginTop?, marginBottom?, gap? })` — builds a `PageLayout` from a paper size (`'A4' | 'A5' | 'Letter' | 'Legal'`) and margins in mm. Also returns `pageWidth` and `pageHeight` in px.
- `computeBreaks(blocks, layout)` — the pure layout algorithm, if you want to reuse it.

### Styling

`styles.css` styles the spacers. Override these classes to change the look:

| Class | Element |
| --- | --- |
| `.page-break-gap` | The gray band between two sheets |
| `.page-break-spacer` | The invisible spacer before a block that starts a page |
| `.page-break-header` | The repeated table header row |

## Printing / PDF

Spacers are editor-only. When printing, remove `.page-break-spacer` elements and set `break-before: page` on the block after each of them, so the PDF breaks exactly where the editor does. Move a table's header row into `<thead>` and browsers repeat it on every printed page.

## Limitations

- A single paragraph taller than the remaining space moves to the next page as a whole; one paragraph is never split across two pages.
- A table row (or rowspan group) taller than a page overflows the gap.

## License

[MIT](LICENSE) © Phan Nhật Huy
