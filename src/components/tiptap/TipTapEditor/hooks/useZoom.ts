import { useCallback, useState } from 'react'

export const ZOOM_LEVELS = [50, 67, 75, 90, 100, 110, 125, 150, 175, 200]

export const MIN_ZOOM = ZOOM_LEVELS[0]

export const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1]

// 'fit' scales the page to the width of the window
export type Zoom = number | 'fit'

const STORAGE_KEY = 'text-editor-react:zoom'

function loadZoom (): Zoom {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === 'fit') return 'fit'

    const value = Number(saved)

    return value >= MIN_ZOOM && value <= MAX_ZOOM ? value : 100
  } catch {
    return 100
  }
}

/** Zoom level of the page view, remembered in this browser. */
export function useZoom () {
  const [zoom, setZoomState] = useState<Zoom>(loadZoom)

  const setZoom = useCallback((next: Zoom) => {
    const value = next === 'fit' ? 'fit' : Math.min(Math.max(Math.round(next), MIN_ZOOM), MAX_ZOOM)

    setZoomState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {}
  }, [])

  return { zoom, setZoom }
}
