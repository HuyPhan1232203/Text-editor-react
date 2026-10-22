import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TableRow } from '@tiptap/extension-table'
import { ChecklistExtensions } from './checklist-extension'
import { BorderedTable } from './table-border-extension'
import { StyledTableCell, StyledTableHeader } from './table-cell-style-extension'
import { ImageWrapExtension } from './image-wrap-extension'

// What the editor stores when HTML (e.g. from Google Docs) is pasted or loaded
let editor: Editor | null = null

function parse (html: string): JSONContent {
  editor = new Editor({
    extensions: [
      StarterKit,
      ...ChecklistExtensions,
      BorderedTable,
      TableRow,
      StyledTableCell,
      StyledTableHeader,
      ImageWrapExtension.configure({ allowBase64: true })
    ],
    content: html
  })
  return editor.getJSON() as JSONContent
}

afterEach(() => {
  editor?.destroy()
  editor = null
})

describe('Google Docs checklist', () => {
  it('keeps checked and unchecked items', () => {
    const doc = parse(
      '<ul><li role="checkbox" aria-checked="true"><p>done</p></li>'
      + '<li role="checkbox" aria-checked="false"><p>todo</p></li></ul>'
    )
    const list = doc.content?.[0]

    expect(list?.type).toBe('taskList')
    expect(list?.content?.map((item) => item.attrs?.checked)).toEqual([true, false])
  })

  it('keeps an ordinary bullet list as a bullet list', () => {
    expect(parse('<ul><li><p>a</p></li></ul>').content?.[0].type).toBe('bulletList')
  })
})

describe('tables', () => {
  it('keeps the indent Google Docs puts on a wrapping div', () => {
    const doc = parse('<div style="margin-left: 36pt"><table><tbody><tr><td><p>x</p></td></tr></tbody></table></div>')

    expect(doc.content?.[0].attrs?.indent).toBe('36pt')
  })

  it('keeps cell background color and vertical alignment', () => {
    const doc = parse(
      '<table><tbody><tr><td style="background-color: rgb(255, 242, 204); vertical-align: middle"><p>x</p></td></tr></tbody></table>'
    )
    const cell = doc.content?.[0].content?.[0].content?.[0]

    expect(cell?.attrs?.backgroundColor).toBe('rgb(255, 242, 204)')
    expect(cell?.attrs?.verticalAlign).toBe('middle')
  })

  it('reads hidden borders from the no-border class', () => {
    expect(parse('<table class="no-border"><tbody><tr><td><p>x</p></td></tr></tbody></table>').content?.[0].attrs?.hideBorders)
      .toBe(true)
  })
})

describe('images', () => {
  it('keeps text wrapping', () => {
    const doc = parse('<img src="/a.png" data-wrap="right"><p>text</p>')

    expect(doc.content?.[0]).toMatchObject({ type: 'image', attrs: { wrap: 'right' } })
  })
})
