import { memo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import type { PageSettings } from '../types'
import { PageThumbnails } from './PageThumbnails'
import { DocumentOutline } from './DocumentOutline'
import { t } from '@/i18n'

interface EditorSidebarProps {
  editor: Editor
  pageSettings: PageSettings
}

type Tab = 'pages' | 'outline'

const TAB_KEY = 'text-editor-react:sidebar-tab'

function savedTab (): Tab {
  try {
    return localStorage.getItem(TAB_KEY) === 'outline' ? 'outline' : 'pages'
  } catch {
    return 'pages'
  }
}

/** Left sidebar: page thumbnails or the document outline. */
export const EditorSidebar = memo(function EditorSidebar ({ editor, pageSettings }: EditorSidebarProps) {
  const [tab, setTab] = useState<Tab>(savedTab)

  const choose = (next: Tab) => {
    setTab(next)
    try {
      localStorage.setItem(TAB_KEY, next)
    } catch {}
  }

  const tabClass = (value: Tab) => `h-[30px] rounded-md text-[13px] ${
    tab === value ? 'bg-white font-medium text-[#1B1D21] shadow-[0_1px_2px_rgba(20,24,31,0.08)]' : 'text-[#5F6670] hover:text-[#1B1D21]'
  }`

  return (
    <aside className='hidden lg:flex flex-col w-52 shrink-0 border-r border-[#E3E5E8] bg-[#F7F8F9]'>
      <div role='tablist' aria-label={t('sidebar.view')} className='m-4 mb-2 grid grid-cols-2 gap-0.5 rounded-lg bg-[#E8EAED] p-[3px]'>
        <button type='button' role='tab' aria-selected={tab === 'pages'} className={tabClass('pages')} onClick={() => choose('pages')}>
          {t('sidebar.pages')}
        </button>
        <button type='button' role='tab' aria-selected={tab === 'outline'} className={tabClass('outline')} onClick={() => choose('outline')}>
          {t('sidebar.outline')}
        </button>
      </div>
      {tab === 'pages'
        ? <PageThumbnails editor={editor} pageSettings={pageSettings} />
        : <div className='flex-1 min-h-0 overflow-y-auto'><DocumentOutline editor={editor} /></div>}
    </aside>
  )
})
