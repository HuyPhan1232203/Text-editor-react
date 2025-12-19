import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import type { LucideIcon } from 'lucide-react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  icon: LucideIcon
  label: string
  tooltip?: string
}

export function ToolbarButton ({
  onClick,
  isActive,
  disabled,
  icon: Icon,
  label,
  tooltip
}: ToolbarButtonProps) {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 rounded-lg transition-all flex items-center justify-center
        ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={label}
      aria-pressed={isActive}
    >
      <Icon className='w-4 h-4' />
    </button>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p className='text-sm'>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}
