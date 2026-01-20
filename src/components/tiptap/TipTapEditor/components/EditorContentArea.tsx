import { TableCellToolbar } from '@/components/tiptap/tableTiptap/TableCellToolbar'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import TextBubbleToolbar from './TextBubbleToolbar'
import { memo, useCallback } from 'react'

export interface EditorContentAreaProps {
  editor: Editor
}

export const EditorContentArea = memo(function EditorContentArea ({
  editor
}: EditorContentAreaProps) {
  const handleContainerClick = useCallback(() => {
    if (!editor?.isFocused) {
      editor?.commands.focus('end')
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className='flex-1 overflow-auto p-8 flex justify-center'>
      <div onClick={handleContainerClick} className='relative'>
        <TextBubbleToolbar editor={editor} />
        <EditorContent editor={editor} />
        <TableCellToolbar editor={editor} />
      </div>
    </div>
  )
})
