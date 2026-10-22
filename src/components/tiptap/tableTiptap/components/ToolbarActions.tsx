import { ToolbarGroup } from '@/components/tiptap/tiptap-ui-primitive/toolbar'
import type { Editor } from '@tiptap/core'
import { TooltipButton } from './TooltipButton'
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns3,
  PanelTop,
  Rows3,
  TableCellsMerge,
  TableCellsSplit,
  Trash2
} from 'lucide-react'

interface ToolbarActionProps {
  editor: Editor
  executeWithSelection: (command: () => void) => void
}

const MergeSplitActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  const canMergeCells = editor.can().mergeCells()
  const canSplitCell = editor.can().splitCell()

  return (
    <ToolbarGroup>
      <TooltipButton
        icon={TableCellsMerge}
        tooltip={canMergeCells ? 'Gộp ô' : 'Chọn nhiều ô để gộp'}
        onClick={() => executeWithSelection(() => editor.chain().focus().mergeCells().run())}
        disabled={!canMergeCells}
      />

      <TooltipButton
        icon={TableCellsSplit}
        tooltip={canSplitCell ? 'Tách ô' : 'Chỉ có thể tách ô đã gộp'}
        onClick={() => executeWithSelection(() => editor.chain().focus().splitCell().run())}
        disabled={!canSplitCell}
      />
    </ToolbarGroup>
  )
}

const RowActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={BetweenHorizontalStart}
        tooltip='Thêm hàng phía trên'
        onClick={() => executeWithSelection(() => editor.chain().focus().addRowBefore().run())}
      />

      <TooltipButton
        icon={BetweenHorizontalEnd}
        tooltip='Thêm hàng phía dưới'
        onClick={() => executeWithSelection(() => editor.chain().focus().addRowAfter().run())}
      />

      <TooltipButton
        icon={Rows3}
        tooltip='Xóa hàng'
        onClick={() => executeWithSelection(() => editor.chain().focus().deleteRow().run())}
        className='text-red-600'
      />
    </ToolbarGroup>
  )
}

const ColumnActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={BetweenVerticalStart}
        tooltip='Thêm cột bên trái'
        onClick={() => executeWithSelection(() => editor.chain().focus().addColumnBefore().run())}
      />

      <TooltipButton
        icon={BetweenVerticalEnd}
        tooltip='Thêm cột bên phải'
        onClick={() => executeWithSelection(() => editor.chain().focus().addColumnAfter().run())}
      />

      <TooltipButton
        icon={Columns3}
        tooltip='Xóa cột'
        onClick={() => executeWithSelection(() => editor.chain().focus().deleteColumn().run())}
        className='text-red-600'
      />
    </ToolbarGroup>
  )
}

const CellTypeActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={PanelTop}
        tooltip='Bật/tắt ô tiêu đề'
        onClick={() => executeWithSelection(() => editor.chain().focus().toggleHeaderCell().run())}
      />
    </ToolbarGroup>
  )
}

const DeleteTableAction = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={Trash2}
        tooltip='Xóa bảng'
        onClick={() => executeWithSelection(() => editor.chain().focus().deleteTable().run())}
        className='text-red-600 hover:text-red-700 hover:bg-red-50'
      />
    </ToolbarGroup>
  )
}

export {
  MergeSplitActions,
  RowActions,
  ColumnActions,
  CellTypeActions,
  DeleteTableAction
}
