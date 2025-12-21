import { useCallback, useEffect, useRef, useState } from 'react'
import type { Position, TableCellToolbarProps } from './types'
import { useContextMenuHandlers, useMenuClose } from './hooks/use-context-menu'
import { Toolbar, ToolbarSeparator } from '../tiptap-ui-primitive/toolbar'
import { CellTypeActions, ColumnActions, DeleteTableAction, MergeSplitActions, RowActions } from './components/ToolbarActions'

export function TableCellToolbar ({ editor }: TableCellToolbarProps) {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const menuRef = useRef<HTMLDivElement>(null!)
  const savedSelectionRef = useRef<never>(null)

  const { handleContextMenu, handleMouseDown } = useContextMenuHandlers(
    editor,
    savedSelectionRef,
    setPosition,
    setIsVisible
  )

  const { handleClickOutside, handleEscape } = useMenuClose(menuRef, setIsVisible)

  const executeWithSelection = useCallback((command: () => void) => {
    if (savedSelectionRef.current) {
      const { tr } = editor.state

      tr.setSelection(savedSelectionRef.current)
      editor.view.dispatch(tr)
    }

    command()
    setIsVisible(false)
  }, [editor])

  useEffect(() => {
    const editorElement = editor.view.dom

    editorElement.addEventListener('mousedown', handleMouseDown)
    editorElement.addEventListener('contextmenu', handleContextMenu as EventListener)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      editorElement.removeEventListener('mousedown', handleMouseDown)
      editorElement.removeEventListener('contextmenu', handleContextMenu as EventListener)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [editor, handleContextMenu, handleMouseDown, handleClickOutside, handleEscape])

  if (!isVisible) return null

  return (
    <div
      ref={menuRef}
      className='absolute z-50 animate-in fade-in duration-150'
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Toolbar variant='floating' className='shadow-lg border border-gray-200'>
        <MergeSplitActions editor={editor} executeWithSelection={executeWithSelection} />
        <ToolbarSeparator />

        <RowActions editor={editor} executeWithSelection={executeWithSelection} />
        <ToolbarSeparator />

        <ColumnActions editor={editor} executeWithSelection={executeWithSelection} />
        <ToolbarSeparator />

        <CellTypeActions editor={editor} executeWithSelection={executeWithSelection} />
        <ToolbarSeparator />

        <DeleteTableAction editor={editor} executeWithSelection={executeWithSelection} />
      </Toolbar>
    </div>
  )
}
