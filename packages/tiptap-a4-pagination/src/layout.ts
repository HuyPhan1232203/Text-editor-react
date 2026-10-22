/**
 * Pure page-break computation: given the measured size of each top-level block,
 * decide where spacers go so the content looks like separate pages.
 * No DOM access here, so it can be unit tested.
 */

export interface PageLayout {
  // All values in px
  /** Height of the writable area of a page (page height minus top and bottom margins) */
  contentHeight: number
  marginTop: number
  marginBottom: number
  /** Gray gap drawn between two pages */
  gap: number
}

export interface TableRowGroup {
  /** Document position of the group's first row */
  pos: number
  height: number
}

export interface TableMetrics {
  /** Offset of the first row from the top of the table block */
  firstOffset: number
  /** Offset of the table block bottom from the last row */
  lastGap: number
  /** Groups of rows a page break may not cut (rows joined by a rowspan); breaks only go between groups */
  rows: TableRowGroup[]
  /** Distance from the table to the page edges, so the gap spans the whole sheet */
  bleedLeft: number
  bleedRight: number
  /** Column count, used as the colspan of the spacer row */
  columns: number
  /** Header row repeated after each break inside the table (HTML of a one-row table) */
  header?: { html: string, height: number }
}

export interface BlockMetrics {
  /** Document position of the block */
  pos: number
  /** Top of the block relative to the page content area; only used for the first block */
  top: number
  height: number
  marginTop: number
  marginBottom: number
  /** Floated blocks (e.g. images with text wrapping) sit beside the following blocks */
  isFloat: boolean
  /** Set for tables that can be split between rows */
  table?: TableMetrics
}

export interface PageBreak {
  /** Position of the spacer widget (before this block or table row) */
  pos: number
  height: number
  /** Offset of the gray gap from the top of the spacer */
  gapTop: number
  /** Break between two table rows: the spacer is a <tr> */
  row?: { bleedLeft: number, bleedRight: number, columns: number, header?: string }
}

export interface PageBreakResult {
  breaks: PageBreak[]
  pageCount: number
}

/**
 * Lays blocks out from their heights and margins (not their current positions, which are
 * already shifted by spacers) and inserts a break before the first block crossing a page bottom.
 * A block that does not fit on a page by itself simply overflows; tables split between row groups.
 */
export function computeBreaks (blocks: BlockMetrics[], layout: PageLayout): PageBreakResult {
  const pitch = layout.contentHeight + layout.marginBottom + layout.gap + layout.marginTop
  const nextContentTopAfter = (pageEnd: number) => pageEnd + layout.marginBottom + layout.gap + layout.marginTop
  const breaks: PageBreak[] = []
  let pageEnd = layout.contentHeight
  let cursor: number | null = null
  let prevMarginBottom = 0

  for (const block of blocks) {
    const { table, marginTop, isFloat } = block
    // Spacer rows already inside a table are excluded from its height
    const height = table
      ? table.firstOffset + table.rows.reduce((sum, row) => sum + row.height, 0) + table.lastGap
      : block.height
    let top: number = cursor === null ? block.top : cursor + Math.max(prevMarginBottom, marginTop)
    let bottom: number = top + height
    const pageStart = pageEnd - layout.contentHeight
    // A table only moves as a whole when even its first row group does not fit
    const overflows = table
      ? top + table.firstOffset + table.rows[0].height > pageEnd
      : bottom > pageEnd

    if (cursor !== null && overflows && top > pageStart + 1) {
      const spacerTop: number = cursor + prevMarginBottom
      // The block's own top margin is absorbed so it starts exactly at the top of the next page
      const spacerHeight = Math.round(Math.max(0, nextContentTopAfter(pageEnd) - marginTop - spacerTop))

      breaks.push({
        pos: block.pos,
        height: spacerHeight,
        gapTop: Math.round(pageEnd + layout.marginBottom - spacerTop)
      })
      top = spacerTop + spacerHeight + marginTop
      bottom = top + height
      pageEnd += pitch
      if (isFloat) {
        // The spacer is in the normal flow, so the next blocks start below it
        cursor = spacerTop + spacerHeight
        prevMarginBottom = 0
      }
    }

    // Split the table between row groups that would cross the bottom of a page
    if (table) {
      let y = top + table.firstOffset

      table.rows.forEach((row, index) => {
        const rowPageStart = pageEnd - layout.contentHeight

        if (index > 0 && y + row.height > pageEnd && y > rowPageStart + 1) {
          // The repeated header takes the first lines of the new page
          const spacerHeight = Math.round(nextContentTopAfter(pageEnd) - y + (table.header?.height ?? 0))

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
      prevMarginBottom = block.marginBottom
    }
  }

  return { breaks, pageCount: Math.round((pageEnd - layout.contentHeight) / pitch) + 1 }
}

/** Paper sizes in mm (portrait) */
export const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 }
} as const

export type PageSize = keyof typeof PAGE_SIZES

/** CSS px for a length in mm (96 dpi) */
export function mmToPx (mm: number): number {
  return Math.round(mm * 96 / 25.4)
}

export interface PageLayoutInput {
  /** @default 'A4' */
  size?: PageSize
  /** @default 'portrait' */
  orientation?: 'portrait' | 'landscape'
  /** Top and bottom margins in mm. @default 25.4 */
  marginTop?: number
  marginBottom?: number
  /** Gap between pages in px. @default 24 */
  gap?: number
}

/** Builds the px layout for `setPageLayout` from a paper size and margins in mm */
export function createPageLayout (input: PageLayoutInput = {}): PageLayout & { pageWidth: number, pageHeight: number } {
  const { size = 'A4', orientation = 'portrait', marginTop = 25.4, marginBottom = 25.4, gap = 24 } = input
  const paper = PAGE_SIZES[size]
  const widthMm = orientation === 'portrait' ? paper.width : paper.height
  const heightMm = orientation === 'portrait' ? paper.height : paper.width
  const top = mmToPx(marginTop)
  const bottom = mmToPx(marginBottom)
  const contentHeight = mmToPx(heightMm - marginTop - marginBottom)

  return {
    contentHeight,
    marginTop: top,
    marginBottom: bottom,
    gap,
    pageWidth: mmToPx(widthMm),
    pageHeight: top + contentHeight + bottom
  }
}
