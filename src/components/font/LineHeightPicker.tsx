// LineHeightPicker.tsx
import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { AlignVerticalSpaceAround, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap-ui-primitive/tooltip'
import { Input } from '../ui/input'

interface LineHeightPickerProps {
  editor: Editor
}

const LINE_HEIGHTS = [
  { label: 'Mặc định', value: 'normal' },
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '1.75', value: '1.75' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' }
]

export function LineHeightPicker ({ editor }: LineHeightPickerProps) {
  const [open, setOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')

  // Lấy line-height hiện tại từ paragraph hoặc heading
  const getCurrentLineHeight = () => {
    const { $from } = editor.state.selection
    const node = $from.node($from.depth)

    if (node && (node.type.name === 'paragraph' || node.type.name === 'heading')) {
      return node.attrs.lineHeight || 'normal'
    }
    return 'normal'
  }

  const currentLineHeight = getCurrentLineHeight()
  const currentLabel = LINE_HEIGHTS.find(h => h.value === currentLineHeight)?.label || currentLineHeight

  const handleLineHeightSelect = (value: string) => {
    if (value === 'normal') {
      editor.chain().focus().unsetLineHeight().run()
    } else {
      editor.chain().focus().setLineHeight(value).run()
    }
    setOpen(false)
  }

  const handleCustomValue = () => {
    if (customValue && customValue.trim()) {
      editor.chain().focus().setLineHeight(customValue.trim()).run()
      setCustomValue('')
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
              className='h-8 min-w-[70px] justify-start gap-2 text-sm font-medium'
            >
              <AlignVerticalSpaceAround className='w-4 h-4 flex-shrink-0' />
              <span className='truncate'>{currentLabel}</span>
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
          <p>Khoảng cách dòng</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-48 p-2' align='start'>
        <div className='space-y-1'>
          <div className='border-t pt-2 mt-2'>
            <div className='flex gap-2'>
              <Input
                type='text'
                placeholder='Tùy chỉnh'
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomValue()}
                className='flex-1 px-2 py-1 text-sm border rounded'
              />
              <Button
                onClick={handleCustomValue}
                size='sm'
                variant='outline'
              >
                OK
              </Button>
            </div>
            <p className='text-xs text-gray-500 mt-1 px-2'>VD: 1.8, 2.5</p>
          </div>
          {LINE_HEIGHTS.map((item) => {
            const isActive = currentLineHeight === item.value

            return (
              <button
                key={item.value}
                onClick={() => handleLineHeightSelect(item.value)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                  transition-colors hover:bg-gray-100
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <span className='flex-1 text-left'>{item.label}</span>
                {isActive && <Check className='w-4 h-4 text-blue-700 flex-shrink-0' />}
              </button>
            )
          })}

        </div>
      </PopoverContent>
    </Popover>
  )
}
