import { useCallback, useEffect, useRef, useState } from 'react'
import type { TableCellToolbarProps } from './types'
import { useContextMenuHandlers } from './hooks/use-context-menu'
import { Toolbar, ToolbarSeparator } from '../tiptap-ui-primitive/toolbar'
import {
  CellTypeActions,
  ColumnActions,
  DeleteTableAction,
  MergeSplitActions,
  RowActions
} from './components/ToolbarActions'
import { BubbleMenu } from '@tiptap/react/menus'
import { CellSelection } from '@tiptap/pm/tables'


export function TableCellToolbar ({ editor }: TableCellToolbarProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 })
  const [updateKey, setUpdateKey] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<never>(null)

  const { handleContextMenu, handleMouseDown } = useContextMenuHandlers(
    editor,
    savedSelectionRef,
    setContextMenuPosition,
    setShowContextMenu
  )

  const executeWithSelection = useCallback((command: () => void) => {
    if (savedSelectionRef.current) {
      const { tr } = editor.state
      tr.setSelection(savedSelectionRef.current)
      editor.view.dispatch(tr)
    }
    command()
    setShowContextMenu(false)
  }, [editor])

  // Force update khi editor selection thay đổi
  useEffect(() => {
    if (!editor) return
    
    const updateHandler = () => {
      setUpdateKey(prev => prev + 1)
    }
    
    editor.on('selectionUpdate', updateHandler)
    editor.on('update', updateHandler)
    
    return () => {
      editor.off('selectionUpdate', updateHandler)
      editor.off('update', updateHandler)
    }
  }, [editor])

  // Handle click outside và escape cho context menu
  useEffect(() => {
    if (!showContextMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowContextMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showContextMenu])

  // Setup context menu listener
  useEffect(() => {
    const editorElement = editor.view.dom

    editorElement.addEventListener('mousedown', handleMouseDown)
    editorElement.addEventListener('contextmenu', handleContextMenu as EventListener)

    return () => {
      editorElement.removeEventListener('mousedown', handleMouseDown)
      editorElement.removeEventListener('contextmenu', handleContextMenu as EventListener)
    }
  }, [editor, handleContextMenu, handleMouseDown])

  if (!editor) return null

  return (
    <>
      {/* BubbleMenu - Show khi select cells */}
      <BubbleMenu
        editor={editor}
        updateDelay={100}
        shouldShow={({ state }) => {
          if (showContextMenu) return false
          
          const { selection } = state
          const isCellSelection = selection instanceof CellSelection
          const isInTable = editor.isActive('table')
          
          return isInTable && isCellSelection
        }}
      >
        <div
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Toolbar variant='floating' className='shadow-lg border border-gray-200'>
            <MergeSplitActions
              key={updateKey}
              editor={editor}
              executeWithSelection={(cmd) => cmd()}
            />
            <ToolbarSeparator />

            <RowActions
              editor={editor}
              executeWithSelection={(cmd) => cmd()}
            />
            <ToolbarSeparator />

            <ColumnActions
              editor={editor}
              executeWithSelection={(cmd) => cmd()}
            />
            <ToolbarSeparator />

            <CellTypeActions
              editor={editor}
              executeWithSelection={(cmd) => cmd()}
            />
            <ToolbarSeparator />

            <DeleteTableAction
              editor={editor}
              executeWithSelection={(cmd) => cmd()}
            />
          </Toolbar>
        </div>
      </BubbleMenu>

      {/* Context Menu - Show khi right-click cell */}
      {showContextMenu && (
        <div
          ref={menuRef}
          className='fixed z-50 animate-in fade-in duration-150'
          style={{
            top: `${contextMenuPosition.top}px`,
            left: `${contextMenuPosition.left}px`
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Toolbar variant='floating' className='shadow-lg border border-gray-200'>
            <MergeSplitActions
              editor={editor}
              executeWithSelection={executeWithSelection}
            />
            <ToolbarSeparator />

            <RowActions
              editor={editor}
              executeWithSelection={executeWithSelection}
            />
            <ToolbarSeparator />

            <ColumnActions
              editor={editor}
              executeWithSelection={executeWithSelection}
            />
            <ToolbarSeparator />

            <CellTypeActions
              editor={editor}
              executeWithSelection={executeWithSelection}
            />
            <ToolbarSeparator />

            <DeleteTableAction
              editor={editor}
              executeWithSelection={executeWithSelection}
            />
          </Toolbar>
        </div>
      )}
    </>
  )
}
