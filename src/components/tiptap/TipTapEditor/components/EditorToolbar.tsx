import { mmToPx } from '@/utils/convertUnit'
import type { Editor } from '@tiptap/react'
import type { PageSettings } from '../types'
import { TextToolbar } from '@/components/tiptap/TextToolbar'
import { memo } from 'react'
import type { ReactNode } from 'react'
import type * as Y from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import { ShareButton } from './ShareButton'
import type { RoomStatus } from '../hooks/useRoomStatus'

export interface EditorToolbarProps {
  editor: Editor
  pageSettings: PageSettings
  ydoc: Y.Doc
  provider: WebrtcProvider | null
  room: RoomStatus
  zoomControl: ReactNode
}

export const EditorToolbar = memo(function EditorToolbar ({
  editor,
  pageSettings,
  ydoc,
  provider,
  room,
  zoomControl
}: EditorToolbarProps) {
  return (
    <div className='border-b border-gray-300 bg-white p-3 sticky top-0 z-10 shadow-sm flex items-start gap-3'>
      <div className='min-w-0 flex-1'>
        <TextToolbar
          editor={editor}
          topMargin={mmToPx(pageSettings.topMargin)}
          bottomMargin={mmToPx(pageSettings.bottomMargin)}
          leftMargin={mmToPx(pageSettings.leftMargin)}
          rightMargin={mmToPx(pageSettings.rightMargin)}
          orientation={pageSettings.orientation}
          zoomControl={zoomControl}
        />
      </div>
      <ShareButton ydoc={ydoc} provider={provider} room={room} />
    </div>
  )
})
