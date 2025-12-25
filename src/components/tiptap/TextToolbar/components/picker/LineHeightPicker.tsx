import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import { cn } from '@/lib/utils'

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
      return node.attrs.lineHeight || '1'
    }
    return '1'
  }

  const currentLineHeight = getCurrentLineHeight()
  const currentLabel = LINE_HEIGHTS.find(h => h.value === currentLineHeight)?.label || currentLineHeight
  const isCustomHeight = !LINE_HEIGHTS.find(h => h.value === currentLineHeight)

  const handleLineHeightSelect = (value: string) => {
    if (value === 'normal') {
      editor.chain().focus().unsetLineHeight().run()
    } else {
      editor.chain().focus().setLineHeight(value).run()
    }
    setOpen(false)
  }

  const handleCustomValue = () => {
    const trimmedValue = customValue.trim()

    if (trimmedValue) {
      editor.chain().focus().setLineHeight(trimmedValue).run()
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
              className='h-8 min-w-17.5 justify-between gap-1 px-2 text-sm font-normal hover:bg-accent'
            >
              <span className='truncate font-medium'>{currentLabel}</span>
              <ChevronDown className='h-3.5 w-3.5 opacity-50' />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Khoảng cách dòng</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-52 p-0' align='start' sideOffset={4}>
        <div className='flex flex-col'>
          {/* Custom Size Input */}
          <div className='border-b p-3 bg-muted/30'>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Tùy chỉnh (vd: 1.8)'
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomValue()}
                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              />
              <Button
                onClick={handleCustomValue}
                size='sm'
                className='h-9 px-3'
                disabled={!customValue.trim()}
              >
                OK
              </Button>
            </div>
          </div>

          {/* Line Height List */}
          <div className='max-h-70 overflow-y-auto p-1'>
            {/* Show current custom height if not in list */}
            {isCustomHeight && (
              <>
                <button
                  onClick={() => handleLineHeightSelect(currentLineHeight)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
                    'bg-accent text-accent-foreground'
                  )}
                >
                  <span className='flex-1 text-left font-medium'>{currentLineHeight}</span>
                  <Check className='h-4 w-4 shrink-0' />
                </button>
                <div className='my-1 h-px bg-border' />
              </>
            )}

            {/* Predefined heights */}
            {LINE_HEIGHTS.map((item) => {
              const isActive = currentLineHeight === item.value

              return (
                <button
                  key={item.value}
                  onClick={() => handleLineHeightSelect(item.value)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  <span className='flex-1 text-left'>{item.label}</span>
                  {isActive && <Check className='h-4 w-4 shrink-0' />}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
