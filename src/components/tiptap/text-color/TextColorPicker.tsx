import { useState } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'

interface TextColorPickerProps {
  editor: Editor
}

const TEXT_COLORS = [
  { name: 'Đen', value: '#000000' },
  { name: 'Xám đậm', value: '#374151' },
  { name: 'Xám', value: '#6B7280' },
  { name: 'Đỏ', value: '#EF4444' },
  { name: 'Cam', value: '#F97316' },
  { name: 'Vàng', value: '#EAB308' },
  { name: 'Xanh lá', value: '#22C55E' },
  { name: 'Xanh dương', value: '#3B82F6' },
  { name: 'Tím', value: '#A855F7' },
  { name: 'Hồng', value: '#EC4899' }
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
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 relative'
            >
              {/* ✅ Icon chữ A thay vì Palette */}
              <span
                className='text-lg font-bold'
                style={{ color: currentColor }}
              >
                A
              </span>
              {/* Thanh màu bên dưới */}
              <div
                className='absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded'
                style={{ backgroundColor: currentColor }}
              />
            </Button>
          </PopoverTrigger>

        </TooltipTrigger>
        <TooltipContent>
          <p>Màu chữ</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-64 p-3' align='start'>
        <div className='space-y-3'>
          {/* Predefined Colors */}
          <div>
            <p className='text-xs font-medium text-gray-600 mb-2'>Màu sẵn có</p>
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
            <p className='text-xs font-medium text-gray-600 mb-2'>Màu tùy chỉnh</p>
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
