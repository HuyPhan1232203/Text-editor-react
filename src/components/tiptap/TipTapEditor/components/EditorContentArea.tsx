import { TableCellToolbar } from '@/components/tiptap/tableTiptap/TableCellToolbar'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import TextBubbleToolbar from './TextBubbleToolbar'
import ImageBubbleToolbar from './ImageBubbleToolbar'
import { memo, useCallback, useEffect } from 'react'
import type { PageSettings } from '../types'
import { PAGE_GAP_PX } from '../constants'
import { usePageCount, usePageLayout } from '../hooks/usePageLayout'

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

  const layout = usePageLayout(pageSettings)
  const pageCount = usePageCount(editor)

  useEffect(() => {
    editor?.commands.setPageLayout({
      contentHeight: layout.contentHeight,
      marginTop: layout.marginTop,
      marginBottom: layout.marginBottom,
      gap: PAGE_GAP_PX
    })
  }, [editor, layout])

  if (!editor) return null

  return (
    <div className='editor-scroll-container flex-1 overflow-auto p-8'>
      <div onClick={handleContainerClick} className='relative mx-auto w-fit'>
        <TextBubbleToolbar editor={editor} />
        <ImageBubbleToolbar editor={editor} />
        <div
          className='document-page bg-white' style={{
            width: pageSettings.orientation === 'portrait' ? '210mm' : '297mm',
            minHeight: `${pageCount * layout.pitch - PAGE_GAP_PX}px`,
            paddingTop: `${pageSettings.topMargin}mm`,
            paddingBottom: `${pageSettings.bottomMargin}mm`,
            paddingLeft: `${pageSettings.leftMargin}mm`,
            paddingRight: `${pageSettings.rightMargin}mm`,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}
        >
          <EditorContent editor={editor} />
        </div>
        <TableCellToolbar editor={editor} />
      </div>
    </div>
  )
})
