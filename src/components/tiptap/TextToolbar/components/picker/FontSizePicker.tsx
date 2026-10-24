// FontSizePicker.tsx
import { useState } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, Minus, Plus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import { cn } from '@/lib/utils'
import { t } from '@/i18n'

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

  // Next size in the list (or 1pt more / less for a custom size)
  const stepSize = (direction: 1 | -1) => {
    const value = parseFloat(currentSize)
    const sizes = FONT_SIZES.map((size) => parseFloat(size))
    const next = direction === 1
      ? sizes.find((size) => size > value) ?? value + 1
      : [...sizes].reverse().find((size) => size < value) ?? Math.max(value - 1, 1)

    handleSizeSelect(`${next}pt`)
  }

  const stepButton = 'flex h-full w-7 items-center justify-center text-[#3D434B] hover:bg-[#F1F3F5]'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className='flex h-[34px] items-center overflow-hidden rounded-md border border-[#E3E5E8] bg-white'>
        <button type='button' className={stepButton} onClick={() => stepSize(-1)} aria-label={t('toolbar.fontSizeDown')}>
          <Minus size={14} strokeWidth={2} aria-hidden='true' />
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='h-full min-w-[30px] px-1 text-center text-[13px] tabular-nums text-[#1B1D21] hover:bg-[#F1F3F5]'
                aria-label={`${t('toolbar.fontSize')}: ${currentSize}`}
              >
                {parseFloat(currentSize)}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('toolbar.fontSize')}</p>
          </TooltipContent>
        </Tooltip>
        <button type='button' className={stepButton} onClick={() => stepSize(1)} aria-label={t('toolbar.fontSizeUp')}>
          <Plus size={14} strokeWidth={2} aria-hidden='true' />
        </button>
      </div>

      <PopoverContent className='w-52 p-0' align='start' sideOffset={4}>
        <div className='flex flex-col'>
          {/* Custom Size Input */}
          <div className='border-b p-3 bg-muted/30'>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder={t('toolbar.fontSizeCustom')}
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
          <div className='max-h-70 overflow-y-auto p-1'>
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
