import { useState } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Baseline, Check, X } from 'lucide-react'
import { ICON_BUTTON } from '../../styles'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import { t } from '@/i18n'

interface TextColorPickerProps {
  editor: Editor
}

const TEXT_COLORS = [
  { name: t('color.black'), value: '#000000' },
  { name: t('color.darkGray'), value: '#374151' },
  { name: t('color.gray'), value: '#6B7280' },
  { name: t('color.red'), value: '#EF4444' },
  { name: t('color.orange'), value: '#F97316' },
  { name: t('color.yellow'), value: '#EAB308' },
  { name: t('color.green'), value: '#22C55E' },
  { name: t('color.blue'), value: '#3B82F6' },
  { name: t('color.purple'), value: '#A855F7' },
  { name: t('color.pink'), value: '#EC4899' }
]

export function TextColorPicker ({ editor }: TextColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      currentColor: ctx.editor.getAttributes('textStyle').color || '#000000'
    })
  })

  const currentColor = editorState.currentColor
  const handleColorSelect = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setOpen(false)
  }

  const handleRemoveColor = () => {
    editor.chain().focus().unsetColor().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type='button'
              className={`${ICON_BUTTON} flex-col gap-px`}
              aria-label={t('toolbar.textColor')}
            >
              <Baseline size={16} strokeWidth={2} aria-hidden='true' className='-mb-0.5' />
              <span aria-hidden='true' className='h-[3px] w-4 rounded-sm' style={{ backgroundColor: currentColor }} />
            </button>
          </PopoverTrigger>

        </TooltipTrigger>
        <TooltipContent>
          <p>{t('toolbar.textColor')}</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-64 p-3' align='start'>
        <div className='space-y-3'>
          {/* Predefined Colors */}
          <div>
            <p className='text-xs font-medium text-gray-600 mb-2'>{t('toolbar.presetColors')}</p>
            <div className='grid grid-cols-5 gap-2'>
              {TEXT_COLORS.map((color) => {
                const isActive = currentColor.toLowerCase() === color.value.toLowerCase()

                return (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className='relative w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-500 transition-colors'
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {isActive && (
                      <Check className='w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md' />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div>
            <p className='text-xs font-medium text-gray-600 mb-2'>{t('toolbar.customColor')}</p>
            <div className='flex gap-2'>
              <input
                type='color'
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className='w-12 h-8 rounded border border-gray-300 cursor-pointer'
              />
              <Button
                onClick={() => handleColorSelect(customColor)}
                variant='outline'
                size='sm'
                className='flex-1'
              >
                Áp dụng
              </Button>
            </div>
          </div>

          {/* Remove Color */}
          <div className='pt-2 border-t'>
            <Button
              onClick={handleRemoveColor}
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2'
            >
              <X className='w-4 h-4' />
              Xóa màu
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
