/**
 * Moves a table's leading header row into <thead>, so the browser (or Puppeteer)
 * repeats it at the top of every printed page the table continues on.
 */
export function repeatTableHeaders (root: ParentNode): void {
  root.querySelectorAll('table').forEach((table) => {
    if (table.tHead) return

    const first = table.tBodies[0]?.rows[0]

    if (!first || first.cells.length === 0) return

    const cells = Array.from(first.cells)

    // Only a real header row, not joined to the next rows by a rowspan
    if (!cells.every((cell) => cell.tagName === 'TH') || cells.some((cell) => cell.rowSpan > 1)) return

    table.createTHead().appendChild(first)
  })
}
