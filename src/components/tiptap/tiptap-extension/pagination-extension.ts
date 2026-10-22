import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import { TableMap } from '@tiptap/pm/tables'

/**
 * Visual pagination without touching the document or its CSS.
 *
 * After each layout change, top-level blocks are measured and a spacer widget is
 * inserted before the first block that would cross the bottom of a page. The spacer
 * fills the rest of the page, the bottom/top margins and a gray gap, so the content
 * looks like separate A4 sheets. The document (and exported HTML) is unchanged.
 *
 * Tables are split between rows: the spacer is then a table row. When the table starts
 * with a header row, a copy of it is shown at the top of each following page.
 * Limitation: other blocks (paragraphs, images...) are never split across pages;
 * a block taller than a page simply overflows the gap.
 */

export interface PageLayout {
  // All values in px
  contentHeight: number
  marginTop: number
  marginBottom: number
  gap: number
}

interface PageBreak {
  pos: number
  height: number
  // Offset of the gray gap from the top of the spacer
  gapTop: number
  // Break between two table rows: the spacer is a <tr>, with its own distance to the page edges
  row?: { bleedLeft: number, bleedRight: number, columns: number, header?: string }
}

interface TableRows {
  // Offset of the first row from the top of the table block, and of the block bottom from the last row
  firstOffset: number
  lastGap: number
  // Groups of rows a page break may not cut (rows joined by a rowspan); a break can only go before a group
  rows: { pos: number, height: number }[]
  bleedLeft: number
  bleedRight: number
  columns: number
  // Copy of the header row repeated after each break inside the table
  header?: { html: string, height: number }
}

interface PaginationState {
  layout: PageLayout | null
  breaks: PageBreak[]
  // Distance from the editor to the page edges, so the gap spans the whole sheet
  bleedLeft: number
  bleedRight: number
  decorations: DecorationSet
}

interface PaginationMeta {
  layout?: PageLayout
  breaks?: PageBreak[]
  bleedLeft?: number
  bleedRight?: number
  pageCount?: number
}

export interface PaginationStorage {
  pageCount: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pagination: {
      setPageLayout: (layout: PageLayout) => ReturnType
    }
  }

  interface Storage {
    pagination: PaginationStorage
  }
}

export const paginationKey = new PluginKey<PaginationState>('pagination')

function createSpacer (pageBreak: PageBreak, state: PaginationState): HTMLElement {
  const spacer = document.createElement(pageBreak.row ? 'tr' : 'div')
  // Inside a table the spacer is a full-width row; the gap is drawn in its single cell
  const holder = pageBreak.row ? document.createElement('td') : spacer
  const bleed = pageBreak.row ?? state

  spacer.className = 'page-break-spacer'
  spacer.contentEditable = 'false'

  if (pageBreak.row) {
    const cell = holder as HTMLTableCellElement

    cell.className = 'page-break-cell'
    // Exact column count: with table-layout: fixed, a larger colspan would add phantom columns
    cell.colSpan = pageBreak.row.columns
    spacer.appendChild(cell)
  }
  holder.style.height = `${pageBreak.height}px`

  if (pageBreak.row?.header) {
    // Repeated header row, at the bottom of the spacer = the top of the next page
    const header = document.createElement('div')

    header.className = 'page-break-header'
    header.innerHTML = pageBreak.row.header
    holder.appendChild(header)
  }

  const gap = document.createElement('div')

  gap.className = 'page-break-gap'
  gap.style.top = `${pageBreak.gapTop}px`
  gap.style.height = `${state.layout?.gap ?? 0}px`
  gap.style.left = `${-bleed.bleedLeft}px`
  gap.style.right = `${-bleed.bleedRight}px`
  holder.appendChild(gap)

  return spacer
}

// Row geometry of a top-level table, ignoring spacer rows already inserted
function measureTableRows (
  view: EditorView,
  table: PMNode,
  offset: number,
  blockRect: DOMRect,
  pageRect: DOMRect
): TableRows | null {
  const map = TableMap.get(table)
  const rows: TableRows['rows'] = []
  let firstRect: DOMRect | null = null
  let lastRect: DOMRect | null = null
  let rowIndex = 0
  let firstGroupRows = 0
  let firstRowDom: HTMLElement | null = null

  table.forEach((_row, rowOffset) => {
    const pos = offset + 1 + rowOffset
    const dom = view.nodeDOM(pos)
    const index = rowIndex++

    if (!(dom instanceof HTMLElement)) return

    const rect = dom.getBoundingClientRect()
    // A cell from the row above reaching into this row (rowspan) joins the two rows
    const joined = index > 0 && map.map
      .slice(index * map.width, (index + 1) * map.width)
      .some((cell, column) => cell === map.map[(index - 1) * map.width + column])

    firstRect ??= rect
    firstRowDom ??= dom
    lastRect = rect
    if (joined && rows.length > 0) rows[rows.length - 1].height += rect.height
    else rows.push({ pos, height: rect.height })
    if (rows.length === 1) firstGroupRows++
  })

  if (!firstRect || !lastRect || rows.length < 2) return null

  const first = firstRect as DOMRect
  const last = lastRect as DOMRect
  // Repeat the first row only if it is a header row on its own (no rowspan into the next rows)
  const headerRow = table.firstChild
  const isHeader = firstGroupRows === 1 && headerRow !== null && headerRow.childCount > 0
    && Array.from({ length: headerRow.childCount }, (_, i) => headerRow.child(i))
      .every((cell) => cell.type.spec.tableRole === 'header_cell')
  const header = isHeader && firstRowDom
    ? { html: copyHeaderRow(firstRowDom, table.attrs.hideBorders === true), height: rows[0].height }
    : undefined

  return {
    firstOffset: first.top - blockRect.top,
    lastGap: blockRect.bottom - last.bottom,
    rows,
    bleedLeft: Math.round(first.left - pageRect.left),
    bleedRight: Math.round(pageRect.right - first.right),
    columns: map.width,
    header
  }
}

function buildDecorations (doc: Parameters<typeof DecorationSet.create>[0], state: Omit<PaginationState, 'decorations'>): DecorationSet {
  const full = { ...state, decorations: DecorationSet.empty }

  return DecorationSet.create(
    doc,
    state.breaks.map((pageBreak) =>
      Decoration.widget(pageBreak.pos, () => createSpacer(pageBreak, full), {
        side: -1,
        ignoreSelection: true,
        key: `page-break-${pageBreak.row ? `row-${pageBreak.row.bleedLeft}-${pageBreak.row.bleedRight}-${pageBreak.row.columns}-${hash(pageBreak.row.header ?? '')}` : 'block'}-${pageBreak.height}-${pageBreak.gapTop}-${state.bleedLeft}-${state.bleedRight}`
      })
    )
  )
}

// Short hash so widget keys change when the repeated header content changes
function hash (text: string): string {
  let value = 0

  for (let i = 0; i < text.length; i++) value = (value * 31 + text.charCodeAt(i)) | 0
  return (value >>> 0).toString(36)
}

// Static copy of a header row, with the measured cell widths so the columns line up
function copyHeaderRow (row: HTMLElement, hideBorders: boolean): string {
  const clone = row.cloneNode(true) as HTMLElement
  const cells = Array.from(row.children)

  Array.from(clone.children).forEach((cell, index) => {
    (cell as HTMLElement).style.width = `${cells[index].getBoundingClientRect().width}px`
    cell.classList.remove('selectedCell')
  })
  clone.querySelectorAll('.column-resize-handle').forEach((node) => node.remove())

  return `<table class="${hideBorders ? 'no-border' : ''}"><tbody>${clone.outerHTML}</tbody></table>`
}

function sameBreaks (a: PageBreak[], b: PageBreak[]): boolean {
  return a.length === b.length
    && a.every((item, i) => item.pos === b[i].pos && item.height === b[i].height && item.gapTop === b[i].gapTop
      && item.row?.bleedLeft === b[i].row?.bleedLeft && item.row?.bleedRight === b[i].row?.bleedRight
      && item.row?.columns === b[i].row?.columns && item.row?.header === b[i].row?.header)
}

function measure (view: EditorView): PaginationMeta | null {
  const state = paginationKey.getState(view.state)

  if (!state?.layout) return null

  const { layout } = state
  const page = view.dom.closest('.document-page')
  const domRect = view.dom.getBoundingClientRect()
  const pageRect = page?.getBoundingClientRect() ?? domRect
  // Top of the page's content area (the first block's top margin may collapse outside the editor)
  const originTop = page
    ? pageRect.top + parseFloat(getComputedStyle(page).paddingTop || '0')
    : domRect.top

  // Lay blocks out from their heights and margins rather than their current positions,
  // which are already shifted by spacers (and spacers stop margins from collapsing)
  const pitch = layout.contentHeight + layout.marginBottom + layout.gap + layout.marginTop
  const breaks: PageBreak[] = []
  let pageEnd = layout.contentHeight
  let cursor: number | null = null
  let prevMarginBottom = 0

  view.state.doc.forEach((node, offset) => {
    const dom = view.nodeDOM(offset)

    if (!(dom instanceof HTMLElement)) return

    const rect = dom.getBoundingClientRect()
    const style = getComputedStyle(dom)
    const marginTop = parseFloat(style.marginTop || '0')
    const marginBottom = parseFloat(style.marginBottom || '0')
    // Floated images (text wrapping) sit beside the following blocks instead of above them
    const isFloat = style.float !== 'none'
    const table = node.type.name === 'table' && !isFloat
      ? measureTableRows(view, node, offset, rect, pageRect)
      : null
    // Spacer rows already inside the table are excluded from its height
    const height = table
      ? table.firstOffset + table.rows.reduce((sum, row) => sum + row.height, 0) + table.lastGap
      : rect.height
    let top = cursor === null ? rect.top - originTop : cursor + Math.max(prevMarginBottom, marginTop)
    let bottom = top + height
    const pageStart = pageEnd - layout.contentHeight
    // A table only moves as a whole when even its first row does not fit
    const overflows = table
      ? top + table.firstOffset + table.rows[0].height > pageEnd
      : bottom > pageEnd

    if (cursor !== null && overflows && top > pageStart + 1) {
      const spacerTop = cursor + prevMarginBottom
      const nextContentTop = pageEnd + layout.marginBottom + layout.gap + layout.marginTop
      // The block's own top margin is absorbed so it starts exactly at the top of the next page
      const spacerHeight = Math.round(Math.max(0, nextContentTop - marginTop - spacerTop))

      breaks.push({ pos: offset, height: spacerHeight, gapTop: Math.round(pageEnd + layout.marginBottom - spacerTop) })
      top = spacerTop + spacerHeight + marginTop
      bottom = top + height
      pageEnd += pitch
      if (isFloat) {
        // The spacer is in the normal flow, so the next blocks start below it
        cursor = spacerTop + spacerHeight
        prevMarginBottom = 0
      }
    }

    // Split the table between rows that would cross the bottom of a page
    if (table) {
      let y = top + table.firstOffset

      table.rows.forEach((row, index) => {
        const rowPageStart = pageEnd - layout.contentHeight

        if (index > 0 && y + row.height > pageEnd && y > rowPageStart + 1) {
          const nextContentTop = pageEnd + layout.marginBottom + layout.gap + layout.marginTop
          // The repeated header takes the first lines of the new page
          const spacerHeight = Math.round(nextContentTop - y + (table.header?.height ?? 0))

          breaks.push({
            pos: row.pos,
            height: spacerHeight,
            gapTop: Math.round(pageEnd + layout.marginBottom - y),
            row: {
              bleedLeft: table.bleedLeft,
              bleedRight: table.bleedRight,
              columns: table.columns,
              header: table.header?.html
            }
          })
          y += spacerHeight
          pageEnd += pitch
        }
        y += row.height
        while (y > pageEnd) pageEnd += pitch
      })
      bottom = y + table.lastGap
    }
    while (bottom > pageEnd) pageEnd += pitch

    if (!isFloat) {
      cursor = bottom
      prevMarginBottom = marginBottom
    }
  })

  return {
    breaks,
    bleedLeft: Math.round(domRect.left - pageRect.left),
    bleedRight: Math.round(pageRect.right - domRect.right),
    pageCount: Math.round((pageEnd - layout.contentHeight) / pitch) + 1
  }
}

export const Pagination = Extension.create<Record<string, never>, PaginationStorage>({
  name: 'pagination',

  addStorage () {
    return { pageCount: 1 }
  },

  addCommands () {
    return {
      setPageLayout:
        (layout: PageLayout) =>
          ({ tr, dispatch }) => {
            if (dispatch) {
              tr.setMeta(paginationKey, { layout } satisfies PaginationMeta)
              tr.setMeta('addToHistory', false)
            }
            return true
          }
    }
  },

  onTransaction ({ transaction }) {
    const meta = transaction.getMeta(paginationKey) as PaginationMeta | undefined

    if (meta?.pageCount !== undefined) {
      this.storage.pageCount = meta.pageCount
    }
  },

  addProseMirrorPlugins () {
    return [
      new Plugin<PaginationState>({
        key: paginationKey,

        state: {
          init: () => ({
            layout: null,
            breaks: [],
            bleedLeft: 0,
            bleedRight: 0,
            decorations: DecorationSet.empty
          }),

          apply: (tr, prev, _oldState, newState) => {
            const meta = tr.getMeta(paginationKey) as PaginationMeta | undefined

            if (!meta && !tr.docChanged) return prev

            const next = {
              layout: meta?.layout ?? prev.layout,
              breaks: meta?.breaks
                ?? prev.breaks.map((pageBreak) => ({ ...pageBreak, pos: tr.mapping.map(pageBreak.pos) })),
              bleedLeft: meta?.bleedLeft ?? prev.bleedLeft,
              bleedRight: meta?.bleedRight ?? prev.bleedRight
            }

            return { ...next, decorations: buildDecorations(newState.doc, next) }
          }
        },

        props: {
          decorations: (state) => paginationKey.getState(state)?.decorations
        },

        view: (editorView) => {
          let frame = 0

          const relayout = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
              const result = measure(editorView)
              const current = paginationKey.getState(editorView.state)

              if (!result || !current) return
              if (
                sameBreaks(result.breaks ?? [], current.breaks)
                && result.bleedLeft === current.bleedLeft
                && result.bleedRight === current.bleedRight
              ) {
                if (result.pageCount !== this.storage.pageCount) {
                  editorView.dispatch(editorView.state.tr
                    .setMeta(paginationKey, { pageCount: result.pageCount })
                    .setMeta('addToHistory', false))
                }
                return
              }

              editorView.dispatch(editorView.state.tr
                .setMeta(paginationKey, result)
                .setMeta('addToHistory', false))
            })
          }

          // Height changes cover typing, images and fonts loading
          const observer = new ResizeObserver(relayout)

          observer.observe(editorView.dom)

          return {
            update: (view, prevState) => {
              const layoutChanged = paginationKey.getState(view.state)?.layout
                !== paginationKey.getState(prevState)?.layout

              if (layoutChanged || view.state.doc !== prevState.doc) relayout()
            },
            destroy: () => {
              cancelAnimationFrame(frame)
              observer.disconnect()
            }
          }
        }
      })
    ]
  }
})
