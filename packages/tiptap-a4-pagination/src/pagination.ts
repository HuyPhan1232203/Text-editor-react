import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import { TableMap } from '@tiptap/pm/tables'
import { computeBreaks } from './layout.js'
import type { BlockMetrics, PageBreak, PageLayout, TableMetrics } from './layout.js'

/**
 * Visual pagination without touching the document or its CSS.
 *
 * After each layout change, top-level blocks are measured and a spacer widget is
 * inserted before the first block that would cross the bottom of a page. The spacer
 * fills the rest of the page, the bottom/top margins and a gray gap, so the content
 * looks like separate pages. The document (and exported HTML) is unchanged.
 *
 * Tables are split between rows: the spacer is then a table row. When the table starts
 * with a header row, a copy of it is shown at the top of each following page.
 * Limitation: other blocks (paragraphs, images...) are never split across pages;
 * a block taller than a page simply overflows the gap.
 */

export interface PaginationOptions {
  /**
   * Selector of the page element around the editor. Its top padding is the top margin,
   * and the gap between pages spans its full width.
   * @default '.document-page'
   */
  pageSelector: string
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
      /** Sets the page geometry in px; pagination starts once a layout is set */
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

/**
 * How much the page is scaled on screen (zoom with a CSS transform). Measurements are divided
 * by it, so the layout is computed in the page's own CSS pixels at any zoom level.
 */
export function elementScale (element: HTMLElement): number {
  const width = element.offsetWidth

  return width > 0 ? element.getBoundingClientRect().width / width || 1 : 1
}

// A rectangle in unscaled CSS pixels (positions stay comparable with other unscaled rects)
function unscaled (rect: DOMRect, scale: number): DOMRect {
  return scale === 1 ? rect : new DOMRect(rect.x / scale, rect.y / scale, rect.width / scale, rect.height / scale)
}

// Static copy of a header row, with the measured cell widths so the columns line up
function copyHeaderRow (row: HTMLElement, hideBorders: boolean, scale: number): string {
  const clone = row.cloneNode(true) as HTMLElement
  const cells = Array.from(row.children)

  Array.from(clone.children).forEach((cell, index) => {
    (cell as HTMLElement).style.width = `${cells[index].getBoundingClientRect().width / scale}px`
    cell.classList.remove('selectedCell')
  })
  clone.querySelectorAll('.column-resize-handle').forEach((node) => node.remove())

  return `<table class="${hideBorders ? 'no-border' : ''}"><tbody>${clone.outerHTML}</tbody></table>`
}

// Row geometry of a top-level table, ignoring spacer rows already inserted
function measureTable (
  view: EditorView,
  table: PMNode,
  offset: number,
  blockRect: DOMRect,
  pageRect: DOMRect,
  scale: number
): TableMetrics | undefined {
  const map = TableMap.get(table)
  const rows: TableMetrics['rows'] = []
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

    const rect = unscaled(dom.getBoundingClientRect(), scale)
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

  if (!firstRect || !lastRect || rows.length < 2) return undefined

  const first = firstRect as DOMRect
  const last = lastRect as DOMRect
  // Repeat the first row only if it is a header row on its own (no rowspan into the next rows)
  const headerRow = table.firstChild
  const isHeader = firstGroupRows === 1 && headerRow !== null && headerRow.childCount > 0
    && Array.from({ length: headerRow.childCount }, (_, i) => headerRow.child(i))
      .every((cell) => cell.type.spec.tableRole === 'header_cell')

  return {
    firstOffset: first.top - blockRect.top,
    lastGap: blockRect.bottom - last.bottom,
    rows,
    bleedLeft: Math.round(first.left - pageRect.left),
    bleedRight: Math.round(pageRect.right - first.right),
    columns: map.width,
    header: isHeader && firstRowDom
      ? { html: copyHeaderRow(firstRowDom, table.attrs.hideBorders === true, scale), height: rows[0].height }
      : undefined
  }
}

function measure (view: EditorView, pageSelector: string): PaginationMeta | null {
  const state = paginationKey.getState(view.state)

  if (!state?.layout) return null

  const page = view.dom.closest<HTMLElement>(pageSelector)
  const scale = elementScale(page ?? view.dom)
  const domRect = unscaled(view.dom.getBoundingClientRect(), scale)
  const pageRect = page ? unscaled(page.getBoundingClientRect(), scale) : domRect
  // Top of the page's content area (the first block's top margin may collapse outside the editor)
  const originTop = page
    ? pageRect.top + parseFloat(getComputedStyle(page).paddingTop || '0')
    : domRect.top
  const blocks: BlockMetrics[] = []

  view.state.doc.forEach((node, offset) => {
    const dom = view.nodeDOM(offset)

    if (!(dom instanceof HTMLElement)) return

    const rect = unscaled(dom.getBoundingClientRect(), scale)
    const style = getComputedStyle(dom)
    const isFloat = style.float !== 'none'

    blocks.push({
      pos: offset,
      top: rect.top - originTop,
      height: rect.height,
      marginTop: parseFloat(style.marginTop || '0'),
      marginBottom: parseFloat(style.marginBottom || '0'),
      isFloat,
      table: node.type.name === 'table' && !isFloat
        ? measureTable(view, node, offset, rect, pageRect, scale)
        : undefined
    })
  })

  return {
    ...computeBreaks(blocks, state.layout),
    bleedLeft: Math.round(domRect.left - pageRect.left),
    bleedRight: Math.round(pageRect.right - domRect.right)
  }
}

// Short hash so widget keys change when the repeated header content changes
function hash (text: string): string {
  let value = 0

  for (let i = 0; i < text.length; i++) value = (value * 31 + text.charCodeAt(i)) | 0
  return (value >>> 0).toString(36)
}

function buildDecorations (
  doc: Parameters<typeof DecorationSet.create>[0],
  state: Omit<PaginationState, 'decorations'>
): DecorationSet {
  const full = { ...state, decorations: DecorationSet.empty }

  return DecorationSet.create(
    doc,
    state.breaks.map((pageBreak) => {
      const row = pageBreak.row
      const kind = row ? `row-${row.bleedLeft}-${row.bleedRight}-${row.columns}-${hash(row.header ?? '')}` : 'block'

      return Decoration.widget(pageBreak.pos, () => createSpacer(pageBreak, full), {
        side: -1,
        ignoreSelection: true,
        key: `page-break-${kind}-${pageBreak.height}-${pageBreak.gapTop}-${state.bleedLeft}-${state.bleedRight}`
      })
    })
  )
}

function sameBreaks (a: PageBreak[], b: PageBreak[]): boolean {
  return a.length === b.length
    && a.every((item, i) => item.pos === b[i].pos && item.height === b[i].height && item.gapTop === b[i].gapTop
      && item.row?.bleedLeft === b[i].row?.bleedLeft && item.row?.bleedRight === b[i].row?.bleedRight
      && item.row?.columns === b[i].row?.columns && item.row?.header === b[i].row?.header)
}

export const Pagination = Extension.create<PaginationOptions, PaginationStorage>({
  name: 'pagination',

  addOptions () {
    return { pageSelector: '.document-page' }
  },

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
    const { pageSelector } = this.options

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
              const result = measure(editorView, pageSelector)
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
