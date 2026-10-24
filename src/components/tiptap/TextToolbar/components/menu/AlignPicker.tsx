import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TEXT_ALIGNMENTS } from '../../constants'
import { GHOST_TRIGGER, ICON_ACTIVE, ICON_BUTTON, ICON_SIZE, ICON_STROKE } from '../../styles'
import { t } from '@/i18n'

const ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify }

/** Alignment as one button showing the current alignment, with the four options in a popover. */
export function AlignPicker ({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const current = useEditorState({
    editor,
    selector: ({ editor }) => TEXT_ALIGNMENTS.find(({ align }) => editor.isActive({ textAlign: align }))?.align ?? 'left'
  })
  const Icon = ICONS[current]
  const label = TEXT_ALIGNMENTS.find(({ align }) => align === current)?.tooltip ?? ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type='button' className={GHOST_TRIGGER} aria-label={`${t('toolbar.alignment')}: ${label}`} title={t('toolbar.alignment')}>
          <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden='true' />
          <ChevronDown size={12} strokeWidth={2} className='text-[#5F6670]' aria-hidden='true' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-1' align='start'>
        <div className='flex items-center gap-0.5'>
          {TEXT_ALIGNMENTS.map(({ align, tooltip }) => {
            const AlignIcon = ICONS[align]

            return (
              <button
                key={align}
                type='button'
                onClick={() => { editor.chain().focus().setTextAlign(align).run(); setOpen(false) }}
                aria-label={tooltip}
                title={tooltip}
                aria-pressed={current === align}
                className={`${ICON_BUTTON} ${current === align ? ICON_ACTIVE : ''}`}
              >
                <AlignIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden='true' />
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
