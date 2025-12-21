import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { LucideIcon } from 'lucide-react'

interface TooltipButtonProps {
  icon: LucideIcon
  tooltip: string
  onClick: () => void
  disabled?: boolean
  variant?: 'ghost' | 'destructive'
  className?: string
}

export const TooltipButton = ({
  icon: Icon,
  tooltip,
  onClick,
  disabled = false,
  variant = 'ghost',
  className = ''
}: TooltipButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size='sm'
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
          className={className}
        >
          <Icon className='w-4 h-4' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
