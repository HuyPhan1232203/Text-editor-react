import type { Editor } from '@tiptap/core'

interface TableCellToolbarProps {
  editor: Editor
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
