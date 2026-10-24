import { memo } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import type { PageSettings } from '../types'
import { usePageCount, usePageLayout } from '../hooks/usePageLayout'
import { t } from '@/i18n'
import { elementScale } from 'tiptap-a4-pagination'

interface StatusBarProps {
  editor: Editor
  pageSettings: PageSettings
}

/** Word and character count, and the page the cursor is on. */
export const StatusBar = memo(function StatusBar ({ editor, pageSettings }: StatusBarProps) {
  const layout = usePageLayout(pageSettings)
  const pageCount = usePageCount(editor)

  const { words, characters, cursorTop } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const page = editor.view.dom.closest('.document-page')
      let cursorTop = 0

      try {
        if (page instanceof HTMLElement) {
          // On-screen distance, divided by the zoom to get page pixels
          cursorTop = (editor.view.coordsAtPos(editor.state.selection.head).top - page.getBoundingClientRect().top)
            / elementScale(page)
        }
      } catch {}

      return {
        words: editor.storage.characterCount.words() as number,
        characters: editor.storage.characterCount.characters() as number,
        cursorTop
      }
    }
  })

  const currentPage = Math.min(Math.max(Math.floor(cursorTop / layout.pitch) + 1, 1), pageCount)

  return (
    <div className='flex items-center gap-3 text-xs tabular-nums text-[#5F6670]' aria-live='off'>
      <span>{t('status.page', { n: currentPage, total: pageCount })}</span>
      <span aria-hidden='true' className='h-3 w-px bg-[#E3E5E8]' />
      <span>{words === 1 ? t('status.word') : t('status.words', { n: words.toLocaleString() })}</span>
      <span aria-hidden='true' className='h-3 w-px bg-[#E3E5E8]' />
      <span>{t('status.characters', { n: characters.toLocaleString() })}</span>
    </div>
  )
})
