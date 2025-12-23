// hooks/useBubbleMenuState.ts hoặc sử dụng useEditorToolbarState đã có
import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'

export function useBubbleMenuState (editor: Editor | null) {
  const [state, setState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isLink: false,
    textAlign: 'left' as 'left' | 'center' | 'right'
  })

  useEffect(() => {
    if (!editor) return

    const updateState = () => {
      setState({
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isUnderline: editor.isActive('underline'),
        isLink: editor.isActive('link'),
        textAlign: editor.isActive({ textAlign: 'center' })
          ? 'center'
          : editor.isActive({ textAlign: 'right' })
            ? 'right'
            : 'left'
      })
    }

    // Update state khi selection thay đổi
    editor.on('selectionUpdate', updateState)
    editor.on('transaction', updateState)

    updateState()

    return () => {
      editor.off('selectionUpdate', updateState)
      editor.off('transaction', updateState)
    }
  }, [editor])

  return state
}
