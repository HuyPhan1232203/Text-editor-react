import { memo } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { Loader2, WifiOff } from 'lucide-react'
import { ROOM_NAME } from '@/lib/share'
import type { RoomStatus } from '../hooks/useRoomStatus'
import { t } from '@/i18n'

interface RoomNoticeProps {
  editor: Editor
  room: RoomStatus
}

/**
 * Explains an empty shared document: with no server, its content comes from the other
 * people in the room, so it stays empty until one of them is online.
 */
export const RoomNotice = memo(function RoomNotice ({ editor, room }: RoomNoticeProps) {
  const isEmpty = useEditorState({ editor, selector: ({ editor }) => editor.isEmpty })

  if (!ROOM_NAME) return null

  const offline = room.status === 'offline'

  // Unreachable is worth saying even with content; waiting only matters while it is empty
  if (!offline && !(isEmpty && room.others === 0)) return null

  return (
    <div
      role='status'
      className={`absolute left-1/2 top-4 z-20 flex max-w-md -translate-x-1/2 items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
        offline ? 'border-red-200 bg-red-50 text-red-800' : 'border-blue-200 bg-blue-50 text-blue-900'
      }`}
    >
      {offline
        ? <WifiOff className='mt-0.5 h-4 w-4 shrink-0' />
        : <Loader2 className='mt-0.5 h-4 w-4 shrink-0 animate-spin' />}
      <span>{offline ? t('share.offlineNotice') : t('share.waitingNotice')}</span>
    </div>
  )
})
