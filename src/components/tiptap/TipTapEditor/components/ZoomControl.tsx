import { memo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown, Minus, Plus } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MAX_ZOOM, MIN_ZOOM } from '../hooks/useZoom'
import type { Zoom } from '../hooks/useZoom'
import { t } from '@/i18n'

interface ZoomControlProps {
  zoom: Zoom
  // The scale actually in use (for 'fit', what fits the window)
  scale: number
  onZoomChange: (zoom: Zoom) => void
}

// The levels Google Docs offers
const MENU_LEVELS = [50, 75, 90, 100, 125, 150, 200]

// The next level of the menu up or down from a percentage
function step (percent: number, direction: 1 | -1): number {
  if (direction === 1) return MENU_LEVELS.find((level) => level > percent) ?? MAX_ZOOM
  return [...MENU_LEVELS].reverse().find((level) => level < percent) ?? MIN_ZOOM
}

const stepButton = 'flex h-7 w-7 items-center justify-center rounded-md text-[#3D434B] hover:bg-[#F1F3F5] disabled:text-[#A9AEB5] disabled:hover:bg-transparent'

/**
 * Zoom box like Google Docs: type a percentage and press Enter, or pick a level (or Fit)
 * from the menu. Ctrl/Cmd + mouse wheel zooms too.
 */
export const ZoomControl = memo(function ZoomControl ({ zoom, scale, onZoomChange }: ZoomControlProps) {
  const percent = Math.round(scale * 100)
  // While typing, the box shows the draft instead of the current level
  const [draft, setDraft] = useState<string | null>(null)
  // Set when Enter or Escape already handled the edit, so the blur that follows does nothing
  const handledRef = useRef(false)

  const apply = () => {
    if (handledRef.current) {
      handledRef.current = false
      return
    }

    const value = parseInt(draft ?? '', 10)

    // Unchanged text keeps the current zoom, so Fit width stays Fit width
    if (Number.isFinite(value) && value !== percent) onZoomChange(Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM))
    setDraft(null)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      apply()
      handledRef.current = true
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      setDraft(null)
      handledRef.current = true
      event.currentTarget.blur()
    }
  }

  return (
    <div className='flex items-center gap-0.5'>
      <button
        type='button'
        className={stepButton}
        onClick={() => onZoomChange(step(percent, -1))}
        disabled={percent <= MIN_ZOOM}
        aria-label={t('zoom.out')}
        title={t('zoom.out')}
      >
        <Minus size={14} strokeWidth={2} aria-hidden='true' />
      </button>
      <div
        className='flex h-7 items-center rounded-md border border-transparent hover:border-[#E3E5E8] focus-within:border-[#2F5BEA]'
        title={t('zoom.label')}
      >
        {/* The % sign sits outside the box, so its text does not change on focus and can be
          selected right away: typing replaces the number */}
        <input
          value={draft ?? String(percent)}
          onChange={(event) => setDraft(event.target.value.replace(/[^\d]/g, '').slice(0, 3))}
          onFocus={(event) => event.target.select()}
          onBlur={apply}
          onKeyDown={onKeyDown}
          inputMode='numeric'
          aria-label={t('zoom.label')}
          className='h-full w-9 bg-transparent pl-1 text-right text-xs tabular-nums text-[#1B1D21] outline-none'
        />
        <span className='pr-0.5 text-xs text-[#1B1D21]'>%</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='flex h-full items-center rounded-r-md px-1 text-gray-600 hover:bg-gray-100'
              aria-label={t('zoom.choose')}
            >
              <ChevronDown className='h-3.5 w-3.5' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='min-w-28'>
            <DropdownMenuItem onSelect={() => onZoomChange('fit')}>
              <Check className={`h-4 w-4 ${zoom === 'fit' ? '' : 'invisible'}`} />
              {t('zoom.fit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {MENU_LEVELS.map((level) => (
              <DropdownMenuItem key={level} onSelect={() => onZoomChange(level)}>
                <Check className={`h-4 w-4 ${zoom === level ? '' : 'invisible'}`} />
                {level}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <button
        type='button'
        className={stepButton}
        onClick={() => onZoomChange(step(percent, 1))}
        disabled={percent >= MAX_ZOOM}
        aria-label={t('zoom.in')}
        title={t('zoom.in')}
      >
        <Plus size={14} strokeWidth={2} aria-hidden='true' />
      </button>
    </div>
  )
})
