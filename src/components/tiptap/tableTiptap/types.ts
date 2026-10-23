import type { Editor } from '@tiptap/core'

interface TableCellToolbarProps {
  editor: Editor
  // Where the menu element is attached (outside the zoomed page, so it keeps its size)
  appendTo?: () => HTMLElement
}

interface Position {
  top: number
  left: number
}

interface SelectionInfo {
  isInCell: boolean
  isCellSelection: boolean
  cellsCount: number
}

export type{
  TableCellToolbarProps,
  Position,
  SelectionInfo
}
