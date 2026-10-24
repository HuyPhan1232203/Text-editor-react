// HeadingPopover.tsx
import { useState } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Type, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Check, ChevronDown } from 'lucide-react'
import { SELECT_TRIGGER } from '@/components/tiptap/TextToolbar/styles'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import { t } from '@/i18n'

interface HeadingPopoverProps {
  editor: Editor
}

// The language is fixed for the page's lifetime (switching reloads), so labels can be built once
const headingOptions = [
  { level: 0, label: t('heading.paragraph'), icon: Type, command: 'paragraph', fontSize: 'text-base' },
  { level: 1, label: t('heading.level', { n: 1 }), icon: Heading1, command: 'heading', fontSize: 'text-xl' },
  { level: 2, label: t('heading.level', { n: 2 }), icon: Heading2, command: 'heading', fontSize: 'text-lg' },
  { level: 3, label: t('heading.level', { n: 3 }), icon: Heading3, command: 'heading', fontSize: 'text-md' },
  { level: 4, label: t('heading.level', { n: 4 }), icon: Heading4, command: 'heading', fontSize: 'text-base' },
  { level: 5, label: t('heading.level', { n: 5 }), icon: Heading5, command: 'heading', fontSize: 'text-sm' },
  { level: 6, label: t('heading.level', { n: 6 }), icon: Heading6, command: 'heading', fontSize: 'text-xs' }
]

export function HeadingPopover ({ editor }: HeadingPopoverProps) {
  const [open, setOpen] = useState(false)

  // Re-renders when the cursor moves into another block type (the toolbar around it may not)
  const currentLevel = useEditorState({
    editor,
    selector: ({ editor }) => {
      for (let level = 1; level <= 6; level++) {
        if (editor.isActive('heading', { level })) return level
      }
      return 0
    }
  })

  const currentHeading = headingOptions.find((option) => option.level === currentLevel) ?? headingOptions[0]

  const handleSelect = (option: typeof headingOptions[number]) => {
    if (option.command === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: option.level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
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
              className={`${SELECT_TRIGGER} min-w-[112px]`}
              aria-label={t('toolbar.textStyleLabel', { style: currentHeading.label })}
            >
              <span className='truncate'>{currentHeading.label}</span>
              <ChevronDown size={14} strokeWidth={2} className='shrink-0 text-[#5F6670]' aria-hidden='true' />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('toolbar.textStyle')}</p>
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
