import type { Editor } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'
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

const calculateMenuPosition = (
  event: MouseEvent,
  editor: Editor
): Position | null => {
  const editorContainer = editor.view.dom.closest('.tiptap-editor-content')?.parentElement
    || editor.view.dom.parentElement

  if (!editorContainer) return null

  const containerRect = editorContainer.getBoundingClientRect()

  return {
    top: event.clientY - containerRect.top + 10,
    left: event.clientX - containerRect.left + 10
  }
}

export {
  isTableCellElement,
  getSelectionInfo,
  calculateMenuPosition
}
