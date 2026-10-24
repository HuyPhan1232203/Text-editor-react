import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { Highlighter, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HIGHLIGHT_COLORS } from '../../constants'
import { GHOST_TRIGGER, ICON_ACTIVE, ICON_SIZE, ICON_STROKE } from '../../styles'
import { t } from '@/i18n'

/** One highlight button with the current color as a dot; the colors are in its popover. */
export function HighlightPicker ({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const current = useEditorState({
    editor,
    selector: ({ editor }) => editor.isActive('highlight') ? (editor.getAttributes('highlight').color as string ?? HIGHLIGHT_COLORS[0].color) : null
  })

  const apply = (color: string | null) => {
    if (color) editor.chain().focus().setHighlight({ color }).run()
    else editor.chain().focus().unsetHighlight().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={`${GHOST_TRIGGER} ${current ? ICON_ACTIVE : ''}`}
          aria-label={t('toolbar.highlight')}
          title={t('toolbar.highlight')}
        >
          <Highlighter size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden='true' />
          <span
            aria-hidden='true'
            className='h-2.5 w-2.5 rounded-full border border-black/15'
            style={{ backgroundColor: current ?? HIGHLIGHT_COLORS[0].color }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-2' align='start'>
        <div className='flex items-center gap-1.5'>
          {HIGHLIGHT_COLORS.map(({ color, tooltip }) => (
            <button
              key={color}
              type='button'
              onClick={() => apply(color)}
              aria-label={tooltip}
              title={tooltip}
              aria-pressed={current === color}
              className={`h-7 w-7 rounded-full border border-black/15 ${current === color ? 'ring-2 ring-[#2F5BEA] ring-offset-1' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type='button'
            onClick={() => apply(null)}
            aria-label={t('toolbar.highlightNone')}
            title={t('toolbar.highlightNone')}
            className='flex h-7 w-7 items-center justify-center rounded-full border border-[#E3E5E8] text-[#5F6670] hover:bg-[#F1F3F5]'
          >
            <X size={14} aria-hidden='true' />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
