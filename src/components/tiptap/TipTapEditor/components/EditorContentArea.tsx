import { TableCellToolbar } from '@/components/tiptap/tableTiptap/TableCellToolbar'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import TextBubbleToolbar from './TextBubbleToolbar'
import { memo, useCallback } from 'react'
import type { PageSettings } from '../types'

export interface EditorContentAreaProps {
  editor: Editor
  pageSettings: PageSettings
}

export const EditorContentArea = memo(function EditorContentArea ({
  editor,
  pageSettings
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
        <div className='document-page bg-white' style={{
          width: pageSettings.orientation === 'portrait' ? '210mm' : '297mm',
          minHeight: pageSettings.orientation === 'portrait' ? '297mm' : '210mm',
          paddingTop: `${pageSettings.topMargin}mm`,
          paddingBottom: `${pageSettings.bottomMargin}mm`,
          paddingLeft: `${pageSettings.leftMargin}mm`,
          paddingRight: `${pageSettings.rightMargin}mm`,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <EditorContent editor={editor} />
        </div>
        <TableCellToolbar editor={editor} />
      </div>
    </div>
  )
})
