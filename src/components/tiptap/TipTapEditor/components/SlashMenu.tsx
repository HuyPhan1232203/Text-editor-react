import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { SuggestionProps } from '@tiptap/suggestion'
import type { SlashItem } from '@/components/tiptap/tiptap-extension/slash-command-extension'
import { t } from '@/i18n'

export interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

interface SlashMenuProps extends SuggestionProps<SlashItem> {
  ref?: Ref<SlashMenuHandle>
}

export function SlashMenu ({ items, command, ref }: SlashMenuProps) {
  const [selected, setSelected] = useState(0)
  const [shownItems, setShownItems] = useState(items)
  const listRef = useRef<HTMLDivElement>(null)

  // A new filter starts from the top again
  if (items !== shownItems) {
    setShownItems(items)
    setSelected(0)
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (!items.length) return false
      if (event.key === 'ArrowDown') {
        setSelected((index) => (index + 1) % items.length)
        return true
      }
      if (event.key === 'ArrowUp') {
        setSelected((index) => (index - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        const item = items[selected]

        if (item) command(item)
        return true
      }
      return false
    }
  }), [items, selected, command])

  return (
    <div
      ref={listRef}
      role='listbox'
      aria-label={t('slash.menu')}
      className='w-72 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-xl'
    >
      {items.length === 0
        ? <div className='px-3 py-2 text-sm text-gray-500'>{t('slash.empty')}</div>
        : items.map((item, index) => {
          const Icon = item.icon

          return (
            <button
              key={item.title}
              type='button'
              role='option'
              data-index={index}
              aria-selected={index === selected}
              onMouseEnter={() => setSelected(index)}
              // Keep the editor focused while clicking
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command(item)}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left ${
                index === selected ? 'bg-blue-50' : ''
              }`}
            >
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700'>
                <Icon className='h-4 w-4' />
              </span>
              <span className='min-w-0'>
                <span className='block text-sm font-medium text-gray-900'>{t(item.title)}</span>
                <span className='block truncate text-xs text-gray-500'>{t(item.description)}</span>
              </span>
            </button>
          )
        })}
    </div>
  )
}
