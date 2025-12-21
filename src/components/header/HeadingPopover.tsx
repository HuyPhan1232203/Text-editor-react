// HeadingPopover.tsx
import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Type, Heading1, Heading2, Heading3, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap-ui-primitive/tooltip'

interface HeadingPopoverProps {
  editor: Editor
}

const headingOptions = [
  { level: 0, label: 'Paragraph', icon: Type, command: 'paragraph', fontSize: 'text-base' },
  { level: 1, label: 'Heading 1', icon: Heading1, command: 'heading', fontSize: 'text-xl' },
  { level: 2, label: 'Heading 2', icon: Heading2, command: 'heading', fontSize: 'text-lg' },
  { level: 3, label: 'Heading 3', icon: Heading3, command: 'heading', fontSize: 'text-md' }
] as const

export function HeadingPopover ({ editor }: HeadingPopoverProps) {
  const [open, setOpen] = useState(false)

  const getCurrentHeading = () => {
    if (editor.isActive('paragraph')) return { level: 0, label: 'Paragraph', icon: Type }
    if (editor.isActive('heading', { level: 1 })) return { level: 1, label: 'Heading 1', icon: Heading1 }
    if (editor.isActive('heading', { level: 2 })) return { level: 2, label: 'Heading 2', icon: Heading2 }
    if (editor.isActive('heading', { level: 3 })) return { level: 3, label: 'Heading 3', icon: Heading3 }
    return { level: 0, label: 'Paragraph', icon: Type }
  }

  const currentHeading = getCurrentHeading()
  const CurrentIcon = currentHeading.icon

  const handleSelect = (option: typeof headingOptions[number]) => {
    if (option.command === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: option.level as 1 | 2 | 3 }).run()
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
              className='h-8 px-2 gap-1 text-sm font-medium'
            >
              <CurrentIcon className='w-4 h-4' />
              <span className='hidden sm:inline'>{currentHeading.label}</span>
              <svg
                width='15'
                height='15'
                viewBox='0 0 15 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='w-3 h-3 opacity-50'
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
          <p>Chọn kiểu văn bản</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className='w-72 p-2 shadow-lg' align='start'>
        <div className='space-y-1'>
          {headingOptions.map((option) => {
            const Icon = option.icon
            const isActive = option.level === 0
              ? editor.isActive('paragraph')
              : editor.isActive('heading', { level: option.level })

            return (
              <button
                key={option.level}
                onClick={() => handleSelect(option)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                  transition-all duration-150 hover:bg-gray-50
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:text-gray-900'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`flex-1 text-left ${option.fontSize} ${option.level !== 0 ? 'font-semibold' : ''}`}>
                  {option.label}
                </span>
                {isActive && <Check className='w-4 h-4 text-blue-600' />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
