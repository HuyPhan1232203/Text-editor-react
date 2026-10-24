import { memo, useEffect, useState } from 'react'
import type * as Y from 'yjs'
import type { Editor } from '@tiptap/react'
import type { WebrtcProvider } from 'y-webrtc'
import { CloudCheck, FileText, Search } from 'lucide-react'
import { ExportButton } from '@/components/tiptap/TextToolbar/components/button/ExportButton'
import { mmToPx } from '@/utils/convertUnit'
import type { PageSettings } from '../types'
import type { RoomStatus } from '../hooks/useRoomStatus'
import { ShareButton } from './ShareButton'
import { OPEN_SEARCH_EVENT } from './SearchBar'
import { t } from '@/i18n'
import { COPYRIGHT, REPO_URL } from '@/config/constants'

interface AppHeaderProps {
  editor: Editor
  ydoc: Y.Doc
  provider: WebrtcProvider | null
  room: RoomStatus
  pageSettings: PageSettings
}

// "Saved just now / n min ago": every edit is written to IndexedDB right away
function useSavedLabel (editor: Editor): string {
  const [savedAt, setSavedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const onUpdate = () => setSavedAt(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)

    editor.on('update', onUpdate)
    return () => {
      editor.off('update', onUpdate)
      window.clearInterval(timer)
    }
  }, [editor])

  const minutes = Math.floor((Math.max(now, savedAt) - savedAt) / 60_000)

  return minutes < 1 ? t('header.savedNow') : t('header.savedMinutes', { n: minutes })
}

/** Top bar: product name, author and save state on the left; find, share and export on the right. */
export const AppHeader = memo(function AppHeader ({ editor, ydoc, provider, room, pageSettings }: AppHeaderProps) {
  const savedLabel = useSavedLabel(editor)

  return (
    <header className='flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E5E8] bg-white px-4 py-2.5'>
      <a href={REPO_URL} target='_blank' rel='noreferrer' className='flex min-w-0 items-center gap-3 rounded-lg' title={t('header.openRepo')}>
        <span className='flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#2F5BEA] text-white'>
          <FileText size={18} strokeWidth={1.75} aria-hidden='true' />
        </span>
        <span className='flex min-w-0 flex-col gap-0.5'>
          <span className='text-[15px] font-semibold text-[#1B1D21]'>Text Editor React</span>
          <span className='flex items-center gap-1.5 text-xs text-[#5F6670]'>
            <span>{COPYRIGHT}</span>
            <span aria-hidden='true'>·</span>
            <CloudCheck size={14} strokeWidth={1.75} aria-hidden='true' />
            <span title={t('header.savedLocal')}>{savedLabel}</span>
          </span>
        </span>
      </a>
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
          aria-label={t('header.find')}
          title={t('header.find')}
          className='flex h-9 w-9 items-center justify-center rounded-lg text-[#3D434B] hover:bg-[#F1F3F5]'
        >
          <Search size={18} strokeWidth={1.75} aria-hidden='true' />
        </button>
        <ShareButton ydoc={ydoc} provider={provider} room={room} />
        <ExportButton
          editor={editor}
          topMargin={mmToPx(pageSettings.topMargin)}
          bottomMargin={mmToPx(pageSettings.bottomMargin)}
          leftMargin={mmToPx(pageSettings.leftMargin)}
          rightMargin={mmToPx(pageSettings.rightMargin)}
          orientation={pageSettings.orientation}
        />
      </div>
    </header>
  )
})
