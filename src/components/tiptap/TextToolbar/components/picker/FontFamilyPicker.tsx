// FontFamilyPicker.tsx
import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'
import { SELECT_TRIGGER } from '../../styles'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import { t } from '@/i18n'

interface FontFamilyPickerProps {
  editor: Editor
}

const FONT_FAMILIES = [
  { name: t('toolbar.fontDefault'), value: '' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
  { name: 'Impact', value: 'Impact, fantasy' },
  { name: 'Play', value: 'Play, sans-serif' }
]

export function FontFamilyPicker ({ editor }: FontFamilyPickerProps) {
  const [open, setOpen] = useState(false)

  const currentFont = editor.getAttributes('textStyle').fontFamily || ''
  const currentFontName = FONT_FAMILIES.find(f => f.value === currentFont)?.name || t('toolbar.fontDefault')

  const handleFontSelect = (fontValue: string) => {
    if (fontValue === '') {
      editor.chain().focus().unsetFontFamily().run()
    } else {
      editor.chain().focus().setFontFamily(fontValue).run()
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type='button'
              className={`${SELECT_TRIGGER} min-w-[128px] max-w-[160px]`}
              aria-label={`${t('toolbar.font')}: ${currentFontName}`}
            >
              <span className='truncate' style={{ fontFamily: currentFont || 'var(--font-doc)' }}>{currentFontName}</span>
              <ChevronDown size={14} strokeWidth={2} className='shrink-0 text-[#5F6670]' aria-hidden='true' />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('toolbar.font')}</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-64 p-2' align='start'>
        <div className='space-y-1'>
          {FONT_FAMILIES.map((font) => {
            const isActive = currentFont === font.value

            return (
              <button
                key={font.value}
                type='button'
                onClick={() => handleFontSelect(font.value)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                  transition-colors hover:bg-gray-100
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
                style={{ fontFamily: font.value || 'inherit' }}
              >
                <span className='flex-1 text-left'>{font.name}</span>
                {isActive && <Check className='w-4 h-4 text-blue-700 flex-shrink-0' />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
