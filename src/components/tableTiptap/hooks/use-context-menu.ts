import type { Editor } from '@tiptap/core'
import type { Position } from '../types'
import { useCallback } from 'react'
import { calculateMenuPosition, getSelectionInfo, isTableCellElement } from '../helper/utils'

const useContextMenuHandlers = (
  editor: Editor,
  savedSelectionRef: React.MutableRefObject<any>,
  setPosition: (pos: Position) => void,
  setIsVisible: (visible: boolean) => void
) => {
  const handleContextMenu = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement

    if (!isTableCellElement(target)) {
      setIsVisible(false)
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const { selection } = editor.state

    savedSelectionRef.current = selection

    const selectionInfo = getSelectionInfo(editor)

    if (!selectionInfo.isInCell && !selectionInfo.isCellSelection) {
      setIsVisible(false)
      return
    }

    const position = calculateMenuPosition(event, editor)

    if (!position) {
      setIsVisible(false)
      return
    }

    setPosition(position)
    setIsVisible(true)
  }, [editor, savedSelectionRef, setPosition, setIsVisible])

  const handleMouseDown = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement

    if (event.button === 2 && isTableCellElement(target)) {
      savedSelectionRef.current = editor.state.selection
    }
  }, [editor, savedSelectionRef])

  return { handleContextMenu, handleMouseDown }
}

const useMenuClose = (
  menuRef: React.RefObject<HTMLDivElement>,
  setIsVisible: (visible: boolean) => void
) => {
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsVisible(false)
    }
  }, [menuRef, setIsVisible])

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsVisible(false)
    }
  }, [setIsVisible])

  return { handleClickOutside, handleEscape }
}

export {
  useContextMenuHandlers,
  useMenuClose
}
