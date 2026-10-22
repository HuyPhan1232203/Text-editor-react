import type { Editor } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'
import { TextSelection } from '@tiptap/pm/state'
import type { Position, SelectionInfo } from '../types'

const isTableCellElement = (element: HTMLElement): boolean => {
  return !!element.closest('.tiptap-table-cell, .tiptap-table-header')
}

const getSelectionInfo = (editor: Editor): SelectionInfo => {
  const { selection } = editor.state
  const { $from } = selection

  const isCellSelection = selection instanceof CellSelection
  const cellNode = $from.node(-1)
  const isInCell = cellNode && (cellNode.type.name === 'tableCell' || cellNode.type.name === 'tableHeader')

  let cellsCount = 1

  if (isCellSelection) {
    const cellSelection = selection as CellSelection
    const anchorPos = cellSelection.$anchorCell.pos
    const headPos = cellSelection.$headCell.pos

    cellsCount = anchorPos !== headPos
      ? Math.abs(headPos - anchorPos) + 1
      : 1
  }

  return {
    isInCell: !!isInCell,
    isCellSelection,
    cellsCount
  }
}

// Approximate size of the context menu, to keep it inside the viewport
const MENU_WIDTH = 600
const MENU_HEIGHT = 56

// The menu is position: fixed, so it uses viewport coordinates
const calculateMenuPosition = (event: MouseEvent): Position => ({
  top: Math.max(8, Math.min(event.clientY + 8, window.innerHeight - MENU_HEIGHT - 8)),
  left: Math.max(8, Math.min(event.clientX + 8, window.innerWidth - MENU_WIDTH - 8))
})

/**
 * Moves the selection into the right-clicked cell, unless that cell is already selected,
 * so the menu commands act on the cell the user clicked.
 */
const selectClickedCell = (event: MouseEvent, editor: Editor) => {
  const { view, state } = editor
  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })

  if (!coords) return

  const $pos = state.doc.resolve(coords.pos)
  let cellStart = -1
  let cellEnd = -1

  for (let depth = $pos.depth; depth > 0; depth--) {
    const role = $pos.node(depth).type.spec.tableRole

    if (role === 'cell' || role === 'header_cell') {
      cellStart = $pos.before(depth)
      cellEnd = $pos.after(depth)
      break
    }
  }
  if (cellStart < 0) return

  const { selection } = state

  if (selection instanceof CellSelection) {
    let selected = false

    selection.forEachCell((_cell, pos) => {
      if (pos === cellStart) selected = true
    })
    if (selected) return
  } else if (selection.from >= cellStart && selection.to <= cellEnd) {
    return
  }

  view.dispatch(state.tr.setSelection(TextSelection.near(state.doc.resolve(coords.pos))))
}

export {
  isTableCellElement,
  getSelectionInfo,
  calculateMenuPosition,
  selectClickedCell
}
