import { mmToPx } from '@/utils/convertUnit'
import type { Editor } from '@tiptap/react'
import type { PageSettings } from '../types'
import { TextToolbar } from '@/components/tiptap/TextToolbar'
import { memo } from 'react'

export interface EditorToolbarProps {
  editor: Editor
  pageSettings: PageSettings
}

export const EditorToolbar = memo(function EditorToolbar ({
  editor,
  pageSettings
}: EditorToolbarProps) {
  return (
    <div className='border-b border-gray-300 bg-white p-3 sticky top-0 z-10 shadow-sm'>
      <TextToolbar
        editor={editor}
        topMargin={mmToPx(pageSettings.topMargin)}
        bottomMargin={mmToPx(pageSettings.bottomMargin)}
        leftMargin={mmToPx(pageSettings.leftMargin)}
        rightMargin={mmToPx(pageSettings.rightMargin)}
        orientation={pageSettings.orientation}
      />
    </div>
  )
})
