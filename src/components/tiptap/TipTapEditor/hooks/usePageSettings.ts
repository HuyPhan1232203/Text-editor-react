import { useState, useCallback } from 'react'
import type { PageSettings } from '../types'
import { DEFAULT_PAGE_SETTINGS } from '../constants'

export function usePageSettings () {
  const [pageSettings, setPageSettings] = useState<PageSettings>(
    DEFAULT_PAGE_SETTINGS
  )

  const updatePageSettings = useCallback((newSettings: PageSettings) => {
    setPageSettings(newSettings)
  }, [])

  return { pageSettings, setPageSettings: updatePageSettings }
}
