// FontSizePicker.tsx
import { useState } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'

interface FontSizePickerProps {
  editor: Editor
}

const FONT_SIZES = [
  { label: '8pt', value: '8pt' },
  { label: '9pt', value: '9pt' },
  { label: '10pt', value: '10pt' },
  { label: '11pt', value: '11pt' },
  { label: '12pt', value: '12pt' },
  { label: '13pt', value: '13pt' },
  { label: '14pt', value: '14pt' },
  { label: '15pt', value: '15pt' },
  { label: '16pt', value: '16pt' },
  { label: '17pt', value: '17pt' },
  { label: '18pt', value: '18pt' },
  { label: '19pt', value: '19pt' },
  { label: '20pt', value: '20pt' },
  { label: '24pt', value: '24pt' },
  { label: '28pt', value: '28pt' }

]

const DEFAULT_FONT_SIZE = '11pt'

export function FontSizePicker ({ editor }: FontSizePickerProps) {
  const [open, setOpen] = useState(false)
  const [customSize, setCustomSize] = useState('')

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      currentSize: ctx.editor.getAttributes('textStyle').fontSize || DEFAULT_FONT_SIZE
    })
  })

  const currentSize = editorState.currentSize

  const handleSizeSelect = (size: string) => {
    editor.chain().focus().setFontSize(size).run()
    setOpen(false)
  }

  const handleCustomSize = () => {
    if (customSize && customSize.trim()) {
      editor.chain().focus().setFontSize(customSize.trim()).run()
      setCustomSize('')
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 min-w-[60px] justify-start gap-2 text-sm font-medium'
            >
              <span className='truncate'>{currentSize}</span>
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
          <p>Cỡ chữ</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-48 p-2' align='start'>
        <div className='space-y-1 max-h-64 overflow-y-auto'>
          <div className='border-t pt-2 mt-2'>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Tùy chỉnh'
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSize()}
                className='flex-1 px-2 py-1 text-sm border rounded'
              />
              <Button
                onClick={handleCustomSize}
                size='sm'
                variant='outline'
              >
                OK
              </Button>
            </div>
          </div>
          {/* Nếu currentSize không nằm trong danh sách, hiển thị nó riêng */}
          {!FONT_SIZES.some(f => f.value === currentSize) && (
            <button
              onClick={() => handleSizeSelect(currentSize)}
              className='w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-100 bg-blue-50 text-blue-700'
            >
              <span className='flex-1 text-left'>{currentSize}pt</span>
              <Check className='w-4 h-4 text-blue-700 shrink-0' />
            </button>
          )}

          {FONT_SIZES.map((size) => {
            const isActive = currentSize === size.value

            return (
              <button
                key={size.value}
                onClick={() => handleSizeSelect(size.value)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                  transition-colors hover:bg-gray-100
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <span className='flex-1 text-left'>{size.label}</span>
                {isActive && <Check className='w-4 h-4 text-blue-700 flex-shrink-0' />}
              </button>
            )
          })}

        </div>
      </PopoverContent>
    </Popover>
  )
}
