import { memo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
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
    <div
      className='flex h-8 items-center rounded-md border border-transparent hover:border-gray-300 focus-within:border-blue-500'
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
        className='h-full w-10 bg-transparent pl-1 text-right text-sm tabular-nums text-gray-700 outline-none'
      />
      <span className='pr-0.5 text-sm text-gray-700'>%</span>
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
  )
})
