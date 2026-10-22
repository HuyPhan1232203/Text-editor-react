import { memo, useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { CaseSensitive, ChevronDown, ChevronRight, ChevronUp, X } from 'lucide-react'
import { searchPluginKey } from '@/components/tiptap/tiptap-extension/search-replace-extension'
import { t } from '@/i18n'

interface SearchBarProps {
  editor: Editor
}

const iconButton = 'flex h-7 w-7 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent'
const textButton = 'h-7 rounded px-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent'

/** Find & replace box: Ctrl/Cmd+F opens it, Ctrl/Cmd+H opens it with replace, Escape closes it. */
export const SearchBar = memo(function SearchBar ({ editor }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [term, setTerm] = useState('')
  const [replacement, setReplacement] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { count, index, caseSensitive } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const state = searchPluginKey.getState(editor.state)

      return {
        count: state?.matches.length ?? 0,
        index: state?.index ?? -1,
        caseSensitive: state?.caseSensitive ?? false
      }
    }
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (mod && (key === 'f' || key === 'h')) {
        event.preventDefault()
        setOpen(true)
        if (key === 'h') setShowReplace(true)

        // Start from the selected text, like most editors
        const { from, to } = editor.state.selection
        const selected = editor.state.doc.textBetween(from, to, ' ')

        if (selected && !selected.includes('\n') && selected.length < 200) {
          setTerm(selected)
          editor.commands.setSearchTerm(selected)
        }
        requestAnimationFrame(() => inputRef.current?.select())
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editor])

  const close = () => {
    setOpen(false)
    // The highlights go away, so the box starts empty next time too
    setTerm('')
    editor.commands.setSearchTerm('')
    editor.commands.focus()
  }

  if (!open) return null

  const onFindKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      editor.commands.goToSearchMatch(event.shiftKey ? -1 : 1)
    } else if (event.key === 'Escape') {
      close()
    }
  }

  return (
    <div
      role='search'
      className='absolute right-6 top-3 z-20 flex items-start gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg'
    >
      <button
        type='button'
        className={iconButton}
        onClick={() => setShowReplace((value) => !value)}
        aria-label={t('search.toggleReplace')}
        aria-expanded={showReplace}
        title={t('search.toggleReplace')}
      >
        {showReplace ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
      </button>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1'>
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => {
              setTerm(event.target.value)
              editor.commands.setSearchTerm(event.target.value)
            }}
            onKeyDown={onFindKeyDown}
            placeholder={t('search.find')}
            aria-label={t('search.find')}
            className='h-7 w-48 rounded border border-gray-300 px-2 text-sm outline-none focus:border-blue-500'
          />
          <span className='w-14 text-center text-xs tabular-nums text-gray-500' aria-live='polite'>
            {term ? (count ? `${index + 1}/${count}` : t('search.noResults')) : ''}
          </span>
          <button
            type='button'
            className={`${iconButton} ${caseSensitive ? 'bg-blue-100 text-blue-700' : ''}`}
            onClick={() => editor.commands.setSearchCaseSensitive(!caseSensitive)}
            aria-label={t('search.caseSensitive')}
            aria-pressed={caseSensitive}
            title={t('search.caseSensitive')}
          >
            <CaseSensitive className='h-4 w-4' />
          </button>
          <button
            type='button'
            className={iconButton}
            disabled={!count}
            onClick={() => editor.commands.goToSearchMatch(-1)}
            aria-label={t('search.previous')}
            title={t('search.previous')}
          >
            <ChevronUp className='h-4 w-4' />
          </button>
          <button
            type='button'
            className={iconButton}
            disabled={!count}
            onClick={() => editor.commands.goToSearchMatch(1)}
            aria-label={t('search.next')}
            title={t('search.next')}
          >
            <ChevronDown className='h-4 w-4' />
          </button>
          <button type='button' className={iconButton} onClick={close} aria-label={t('search.close')} title={t('search.close')}>
            <X className='h-4 w-4' />
          </button>
        </div>
        {showReplace && (
          <div className='flex items-center gap-1'>
            <input
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') editor.commands.replaceSearchMatch(replacement)
                else if (event.key === 'Escape') close()
              }}
              placeholder={t('search.replace')}
              aria-label={t('search.replace')}
              className='h-7 w-48 rounded border border-gray-300 px-2 text-sm outline-none focus:border-blue-500'
            />
            <button type='button' className={textButton} disabled={!count} onClick={() => editor.commands.replaceSearchMatch(replacement)}>
              {t('search.replaceOne')}
            </button>
            <button type='button' className={textButton} disabled={!count} onClick={() => editor.commands.replaceAllSearchMatches(replacement)}>
              {t('search.replaceAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
