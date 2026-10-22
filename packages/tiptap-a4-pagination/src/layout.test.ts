import { describe, expect, it } from 'vitest'
import { computeBreaks, createPageLayout } from './layout'
import type { BlockMetrics, PageLayout, TableMetrics } from './layout'

// A small page: 100px of content, 10px margins, 20px gap -> one page every 140px
const layout: PageLayout = { contentHeight: 100, marginTop: 10, marginBottom: 10, gap: 20 }

function block (pos: number, height: number, extra: Partial<BlockMetrics> = {}): BlockMetrics {
  return { pos, top: 0, height, marginTop: 0, marginBottom: 0, isFloat: false, ...extra }
}

function table (rows: number[], extra: Partial<TableMetrics> = {}): TableMetrics {
  return {
    firstOffset: 0,
    lastGap: 0,
    rows: rows.map((height, i) => ({ pos: 1000 + i, height })),
    bleedLeft: 5,
    bleedRight: 5,
    columns: 3,
    ...extra
  }
}

describe('computeBreaks', () => {
  it('keeps everything on one page when it fits', () => {
    expect(computeBreaks([block(0, 40), block(1, 50)], layout)).toEqual({ breaks: [], pageCount: 1 })
  })

  it('moves the first block crossing the page bottom to the next page', () => {
    const { breaks, pageCount } = computeBreaks([block(0, 60), block(1, 60)], layout)

    // Spacer fills the 40px left on page 1, the bottom margin, the gap and the next top margin
    expect(breaks).toEqual([{ pos: 1, height: 40 + 10 + 20 + 10, gapTop: 40 + 10 }])
    expect(pageCount).toBe(2)
  })

  it('absorbs the top margin of a block that starts a new page', () => {
    const blocks = [block(0, 90, { marginBottom: 8 }), block(1, 30, { marginTop: 12 })]
    const { breaks } = computeBreaks(blocks, layout)

    // The spacer starts after the previous margin and ends where the block's margin would start
    expect(breaks[0].pos).toBe(1)
    expect(breaks[0].height).toBe(Math.round(140 - 12 - (90 + 8)))
    expect(breaks[0].gapTop).toBe(100 + 10 - (90 + 8))
  })

  it('collapses adjacent margins like CSS', () => {
    // max(8, 12) = 12 between the blocks: 40 + 12 + 40 = 92 fits on one page
    const blocks = [block(0, 40, { marginBottom: 8 }), block(1, 40, { marginTop: 12 })]

    expect(computeBreaks(blocks, layout).breaks).toEqual([])
  })

  it('lets a block taller than a page overflow instead of looping', () => {
    const { breaks, pageCount } = computeBreaks([block(0, 30), block(1, 250)], layout)

    // Moved to page 2 (140-240), it runs through page 3 (280-380) and ends on page 4
    expect(breaks).toHaveLength(1)
    expect(pageCount).toBe(4)
  })

  it('does not break before a block that already starts a page', () => {
    expect(computeBreaks([block(0, 250)], layout).breaks).toEqual([])
  })

  it('keeps following blocks beside a floated image', () => {
    // The float does not push the next block down
    const blocks = [block(0, 20), block(1, 70, { isFloat: true }), block(2, 30)]

    expect(computeBreaks(blocks, layout).breaks).toEqual([])
  })

  it('splits a table between rows and marks the spacer as a row', () => {
    const blocks = [block(0, 40), block(1, 0, { table: table([20, 20, 20, 20]) })]
    const { breaks } = computeBreaks(blocks, layout)

    // Rows at 40-60, 60-80, 80-100 fit; the 4th row (100-120) moves to page 2
    expect(breaks).toHaveLength(1)
    expect(breaks[0]).toMatchObject({ pos: 1003, row: { bleedLeft: 5, bleedRight: 5, columns: 3 } })
  })

  it('reserves room for a repeated header row on the next page', () => {
    const header = { html: '<table></table>', height: 20 }
    const withHeader = computeBreaks([block(0, 40), block(1, 0, { table: table([20, 20, 20, 20], { header }) })], layout)
    const without = computeBreaks([block(0, 40), block(1, 0, { table: table([20, 20, 20, 20]) })], layout)

    expect(withHeader.breaks[0].height).toBe(without.breaks[0].height + 20)
    expect(withHeader.breaks[0].row?.header).toBe(header.html)
  })

  it('moves the whole table when even its first row does not fit', () => {
    const blocks = [block(0, 90), block(1, 0, { table: table([30, 30]) })]
    const { breaks } = computeBreaks(blocks, layout)

    expect(breaks).toHaveLength(1)
    expect(breaks[0].pos).toBe(1)
    expect(breaks[0].row).toBeUndefined()
  })

  it('never breaks inside a row group (rowspan)', () => {
    // One group of 60px: it moves to the next page as a whole
    const blocks = [block(0, 50), block(1, 0, { table: table([20, 60]) })]
    const { breaks } = computeBreaks(blocks, layout)

    expect(breaks.map((b) => b.pos)).toEqual([1001])
  })
})

describe('createPageLayout', () => {
  it('computes A4 portrait with 25.4mm margins', () => {
    const page = createPageLayout()

    expect(page.pageWidth).toBe(794)
    expect(page.marginTop).toBe(96)
    expect(page.marginBottom).toBe(96)
    expect(page.pageHeight).toBe(page.marginTop + page.contentHeight + page.marginBottom)
    expect(page.pageHeight).toBeCloseTo(1123, -1)
  })

  it('swaps width and height in landscape', () => {
    const page = createPageLayout({ size: 'Letter', orientation: 'landscape', marginTop: 10, marginBottom: 10, gap: 0 })

    expect(page.pageWidth).toBe(1056)
    expect(page.gap).toBe(0)
  })
})
