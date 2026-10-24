import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tiptap/tiptap-ui-primitive/tooltip'
import type { LucideIcon } from 'lucide-react'
import { ICON_ACTIVE, ICON_BUTTON, ICON_SIZE, ICON_STROKE } from '@/components/tiptap/TextToolbar/styles'

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
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`${ICON_BUTTON} ${isActive ? ICON_ACTIVE : ''}`}
      aria-label={label}
      aria-pressed={isActive}
    >
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
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
