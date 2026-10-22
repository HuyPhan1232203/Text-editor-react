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

  const tabClass = (value: Tab) => `flex-1 py-2 text-xs font-medium border-b-2 ${
    tab === value ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'
  }`

  return (
    <aside className='hidden lg:flex flex-col w-52 shrink-0 border-r border-gray-300 bg-gray-100'>
      <div role='tablist' className='flex border-b border-gray-300 bg-gray-50'>
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
