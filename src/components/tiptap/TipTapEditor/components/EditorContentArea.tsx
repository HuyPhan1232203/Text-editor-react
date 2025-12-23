import { TableCellToolbar } from '@/components/tiptap/tableTiptap/TableCellToolbar'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import TextBubbleToolbar from './TextBubbleToolbar'

export interface EditorContentAreaProps {
  editor: Editor
}

export function EditorContentArea ({ editor }: EditorContentAreaProps) {
  const handleContainerClick = () => {
    if (!editor?.isFocused) {
      editor?.commands.focus('end')
    }
  }

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
}
