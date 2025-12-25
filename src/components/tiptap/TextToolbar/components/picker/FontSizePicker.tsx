// FontSizePicker.tsx
import { useState } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import { cn } from '@/lib/utils'

interface FontSizePickerProps {
  editor: Editor
}

const FONT_SIZES = [
  '8pt', '9pt', '10pt', '11pt', '12pt', '13pt', '14pt',
  '15pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt', '36pt'
] as const

const DEFAULT_FONT_SIZE = '11pt'

export function FontSizePicker ({ editor }: FontSizePickerProps) {
  const [open, setOpen] = useState(false)
  const [customSize, setCustomSize] = useState('')

  const { currentSize } = useEditorState({
    editor,
    selector: ctx => ({
      currentSize: ctx.editor.getAttributes('textStyle').fontSize || DEFAULT_FONT_SIZE
    })
  })

  const handleSizeSelect = (size: string) => {
    editor
      .chain()
      .focus()
      .setFontSize(size)
      .setMark('textStyle', { fontSize: size }) // Đảm bảo mark được set
      .run()
    setOpen(false)
  }

  const handleCustomSize = () => {
    const trimmedSize = customSize.trim()

    if (trimmedSize) {
      const sizeWithUnit = trimmedSize.endsWith('pt') ? trimmedSize : `${trimmedSize}pt`

      editor
        .chain()
        .focus()
        .setFontSize(sizeWithUnit)
        .setMark('textStyle', { fontSize: sizeWithUnit }) // Đảm bảo mark được set
        .run()
      setCustomSize('')
      setOpen(false)
    }
  }

  const isCustomSize = !FONT_SIZES.includes(currentSize as any)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 min-w-[70px] justify-between gap-1 px-2 text-sm font-normal hover:bg-accent'
            >
              <span className='truncate font-medium'>{currentSize}</span>
              <ChevronDown className='h-3.5 w-3.5 opacity-50' />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cỡ chữ</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-52 p-0' align='start' sideOffset={4}>
        <div className='flex flex-col'>
          {/* Custom Size Input */}
          <div className='border-b p-3 bg-muted/30'>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Tùy chỉnh (vd: 22pt)'
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSize()}
                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              />
              <Button
                onClick={handleCustomSize}
                size='sm'
                className='h-9 px-3'
                disabled={!customSize.trim()}
              >
                OK
              </Button>
            </div>
          </div>

          {/* Font Size List */}
          <div className='max-h-[280px] overflow-y-auto p-1'>
            {/* Show current custom size if not in list */}
            {isCustomSize && (
              <>
                <button
                  onClick={() => handleSizeSelect(currentSize)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
                    'bg-accent text-accent-foreground'
                  )}
                >
                  <span className='flex-1 text-left font-medium'>{currentSize}</span>
                  <Check className='h-4 w-4 shrink-0' />
                </button>
                <div className='my-1 h-px bg-border' />
              </>
            )}

            {/* Predefined sizes */}
            {FONT_SIZES.map((size) => {
              const isActive = currentSize === size

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  <span className='flex-1 text-left'>{size}</span>
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
