import { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { CellSelection } from '@tiptap/pm/tables'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from '@/components/tiptap/tiptap-ui-primitive/toolbar'
import { Button } from '@/components/ui/button'
import {
  Merge,
  Split,
  Trash2,
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Plus
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'

interface TableCellToolbarProps {
  editor: Editor
}

export function TableCellToolbar ({ editor }: TableCellToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCellsCount, setSelectedCellsCount] = useState(0)

  useEffect(() => {
    const updatePosition = () => {
      const { selection } = editor.state
      const { $from } = selection

      // ✅ Kiểm tra xem có đang select nhiều cells không (CellSelection)
      const isCellSelection = selection instanceof CellSelection

      // Kiểm tra xem có đang trong table cell không
      const cellNode = $from.node(-1)
      const isInCell = cellNode && (cellNode.type.name === 'tableCell' || cellNode.type.name === 'tableHeader')

      if (!isInCell && !isCellSelection) {
        setIsVisible(false)
        return
      }

      let targetRect: DOMRect | null = null
      let cellsCount = 1

      if (isCellSelection) {
        // ✅ Đang select nhiều cells
        const cellSelection = selection as CellSelection

        cellsCount = cellSelection.$anchorCell.pos !== cellSelection.$headCell.pos
          ? Math.abs(cellSelection.$headCell.pos - cellSelection.$anchorCell.pos) + 1
          : 1

        // Lấy DOM element của cell đầu tiên và cuối cùng để tính vị trí toolbar
        const anchorDOM = editor.view.nodeDOM(cellSelection.$anchorCell.pos) as HTMLElement
        const headDOM = editor.view.nodeDOM(cellSelection.$headCell.pos) as HTMLElement

        if (anchorDOM && headDOM) {
          const anchorRect = anchorDOM.getBoundingClientRect()
          const headRect = headDOM.getBoundingClientRect()

          // Tạo rect bao quanh tất cả cells đã chọn
          const combinedRect = new DOMRect(
            Math.min(anchorRect.left, headRect.left),
            Math.min(anchorRect.top, headRect.top),
            Math.max(anchorRect.right, headRect.right) - Math.min(anchorRect.left, headRect.left),
            Math.max(anchorRect.bottom, headRect.bottom) - Math.min(anchorRect.top, headRect.top)
          )

          targetRect = combinedRect
        }
      } else {
        // Đang ở trong 1 cell đơn
        const cellDOM = editor.view.nodeDOM($from.pos - $from.parentOffset - 1) as HTMLElement

        if (cellDOM) {
          targetRect = cellDOM.getBoundingClientRect()
        }
      }

      if (!targetRect) {
        setIsVisible(false)
        return
      }

      const editorDOM = editor.view.dom
      const editorRect = editorDOM.getBoundingClientRect()

      setPosition({
        top: targetRect.bottom - editorRect.top + 8,
        left: targetRect.left - editorRect.left + (targetRect.width / 2) - 200 // Center toolbar
      })
      setSelectedCellsCount(cellsCount)
      setIsVisible(true)
    }

    // Update khi selection thay đổi
    editor.on('selectionUpdate', updatePosition)
    editor.on('transaction', updatePosition)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('transaction', updatePosition)
    }
  }, [editor])

  if (!isVisible) return null

  const canMergeCells = editor.can().mergeCells()
  const canSplitCell = editor.can().splitCell()

  return (
    <div
      className='absolute z-50 animate-in fade-in slide-in-from-top-2 duration-200'
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <Toolbar variant='floating'>
        {/* ✅ Hiển thị số cells đang chọn */}
        {selectedCellsCount > 1 && (
          <>
            <ToolbarGroup>
              <div className='px-2 py-1 text-xs text-gray-600 font-medium'>
                {selectedCellsCount} ô đã chọn
              </div>
            </ToolbarGroup>
            <ToolbarSeparator />
          </>
        )}

        {/* Merge/Split Actions */}
        <ToolbarGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                disabled={!canMergeCells}
                onClick={() => editor.chain().focus().mergeCells().run()}
              >
                <Merge className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canMergeCells ? 'Gộp ô' : 'Chọn nhiều ô để gộp'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                disabled={!canSplitCell}
                onClick={() => editor.chain().focus().splitCell().run()}
              >
                <Split className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canSplitCell ? 'Tách ô' : 'Chỉ có thể tách ô đã gộp'}
            </TooltipContent>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Row Actions */}
        <ToolbarGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                <ArrowUpFromLine className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm hàng phía trên</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <ArrowDownFromLine className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm hàng phía dưới</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                <Trash2 className='w-4 h-4 text-red-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa hàng</TooltipContent>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Column Actions */}
        <ToolbarGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                <ArrowLeftFromLine className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm cột bên trái</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <ArrowRightFromLine className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thêm cột bên phải</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                <Trash2 className='w-4 h-4 text-red-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa cột</TooltipContent>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Cell Type Toggle */}
        <ToolbarGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().toggleHeaderCell().run()}
              >
                <Plus className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chuyển sang header cell</TooltipContent>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Delete Table */}
        <ToolbarGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => editor.chain().focus().deleteTable().run()}
                className='text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa bảng</TooltipContent>
          </Tooltip>
        </ToolbarGroup>
      </Toolbar>
    </div>
  )
}
