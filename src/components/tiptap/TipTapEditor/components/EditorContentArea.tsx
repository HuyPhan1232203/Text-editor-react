import { TableCellToolbar } from '@/components/tiptap/tableTiptap/TableCellToolbar'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import TextBubbleToolbar from './TextBubbleToolbar'
import { memo, useCallback, useEffect, useState } from 'react'
import { mmToPx } from '@/utils/convertUnit'
import type { PageSettings } from '../types'

// Gray gap between A4 sheets, in px
const PAGE_GAP = 24

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

  const pageHeightMm = pageSettings.orientation === 'portrait' ? 297 : 210
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    editor?.commands.setPageLayout({
      contentHeight: mmToPx(pageHeightMm - pageSettings.topMargin - pageSettings.bottomMargin),
      marginTop: mmToPx(pageSettings.topMargin),
      marginBottom: mmToPx(pageSettings.bottomMargin),
      gap: PAGE_GAP
    })
  }, [editor, pageHeightMm, pageSettings.topMargin, pageSettings.bottomMargin])

  useEffect(() => {
    if (!editor) return

    const syncPageCount = () => setPageCount(editor.storage.pagination.pageCount)

    editor.on('transaction', syncPageCount)
    return () => {
      editor.off('transaction', syncPageCount)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className='flex-1 overflow-auto p-8'>
      <div onClick={handleContainerClick} className='relative mx-auto w-fit'>
        <TextBubbleToolbar editor={editor} />
        <div
          className='document-page bg-white' style={{
            width: pageSettings.orientation === 'portrait' ? '210mm' : '297mm',
            minHeight: `calc(${pageCount} * ${pageHeightMm}mm + ${(pageCount - 1) * PAGE_GAP}px)`,
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
