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

  const renderItem = (item: SlashItem, index: number) => {
    const Icon = item.icon
    const active = index === selected

    return (
      <button
        key={item.title}
        type='button'
        role='option'
        data-index={index}
        aria-selected={active}
        onMouseEnter={() => setSelected(index)}
        // Keep the editor focused while clicking
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => command(item)}
        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left ${
          active ? 'bg-[#2F5BEA14] shadow-[inset_0_0_0_1px_#2F5BEA33]' : ''
        }`}
      >
        <span aria-hidden='true' className='flex h-8 w-8 flex-none items-center justify-center rounded-md border border-[#E3E5E8] bg-white text-[#3D434B]'>
          <Icon className='h-4 w-4' strokeWidth={1.75} />
        </span>
        <span className='flex min-w-0 flex-1 flex-col gap-px'>
          <span className='text-[13px] font-medium text-[#1B1D21]'>{t(item.title)}</span>
          <span className='truncate text-xs text-[#5F6670]'>{t(item.description)}</span>
        </span>
        {item.shortcut && <span className='font-mono text-[11px] text-[#5F6670]'>{item.shortcut}</span>}
      </button>
    )
  }

  const heading = (key: 'slash.basicBlocks' | 'slash.insertGroup') => (
    <div className='px-2.5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#5F6670]'>{t(key)}</div>
  )

  // Items keep their order, so the arrow keys follow the sections
  const basic = items.filter((item) => item.group === 'basic')
  const insert = items.filter((item) => item.group === 'insert')

  return (
    <div
      ref={listRef}
      role='listbox'
      aria-label={t('slash.menu')}
      className='w-[300px] max-h-96 overflow-y-auto rounded-[10px] border border-[#E3E5E8] bg-white p-1.5 font-[family-name:var(--font-ui)] shadow-[0_12px_32px_rgba(20,24,31,0.14),0_2px_6px_rgba(20,24,31,0.06)]'
    >
      {items.length === 0
        ? <div className='px-3 py-2 text-sm text-[#5F6670]'>{t('slash.empty')}</div>
        : (
          <>
            {basic.length > 0 && heading('slash.basicBlocks')}
            {basic.map((item, index) => renderItem(item, index))}
            {basic.length > 0 && insert.length > 0 && <div className='mx-1 my-1.5 h-px bg-[#EEF0F2]' />}
            {insert.length > 0 && heading('slash.insertGroup')}
            {insert.map((item, index) => renderItem(item, basic.length + index))}
            <div className='mt-1.5 flex justify-between gap-2 border-t border-[#EEF0F2] px-2.5 pb-1 pt-2 text-[11px] text-[#5F6670]'>
              <span>{t('slash.hintNavigate')}</span>
              <span>{t('slash.hintInsert')}</span>
            </div>
          </>
        )}
    </div>
  )
}
