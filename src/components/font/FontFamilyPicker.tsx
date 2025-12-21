// FontFamilyPicker.tsx
import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Type, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'

interface FontFamilyPickerProps {
  editor: Editor
}

const FONT_FAMILIES = [
  { name: 'Mặc định', value: '' },
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
  const currentFontName = FONT_FAMILIES.find(f => f.value === currentFont)?.name || 'Mặc định'

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
            <Button
              variant='ghost'
              size='sm'
              className='h-8 min-w-[100px] justify-start gap-2 text-sm font-medium'
            >
              <Type className='w-4 h-4 flex-shrink-0' />
              <span className='truncate'>{currentFontName}</span>
              <svg
                width='15'
                height='15'
                viewBox='0 0 15 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='w-3 h-3 opacity-50 ml-auto'
              >
                <path
                  d='M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z'
                  fill='currentColor'
                  fillRule='evenodd'
                  clipRule='evenodd'
                />
              </svg>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Font chữ</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-64 p-2' align='start'>
        <div className='space-y-1'>
          {FONT_FAMILIES.map((font) => {
            const isActive = currentFont === font.value

            return (
              <button
                key={font.value}
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
