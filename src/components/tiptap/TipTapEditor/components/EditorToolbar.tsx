import type { Editor } from '@tiptap/react'
import type { PageSettings } from '../types'
import { TextToolbar } from '@/components/tiptap/TextToolbar'
import { memo } from 'react'
import type * as Y from 'yjs'
import type { WebrtcProvider } from 'y-webrtc'
import type { RoomStatus } from '../hooks/useRoomStatus'
import { AppHeader } from './AppHeader'

export interface EditorToolbarProps {
  editor: Editor
  pageSettings: PageSettings
  ydoc: Y.Doc
  provider: WebrtcProvider | null
  room: RoomStatus
}

/** Top bar (title, share, export) and the formatting toolbar below it. */
export const EditorToolbar = memo(function EditorToolbar ({
  editor,
  pageSettings,
  ydoc,
  provider,
  room
}: EditorToolbarProps) {
  return (
    <div className='sticky top-0 z-10'>
      <AppHeader editor={editor} ydoc={ydoc} provider={provider} room={room} pageSettings={pageSettings} />
      <div className='border-b border-[#E3E5E8] bg-white px-3 py-1.5'>
        <TextToolbar editor={editor} />
      </div>
    </div>
  )
})
