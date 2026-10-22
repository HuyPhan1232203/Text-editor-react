import { useState, useCallback } from 'react'
import type { PageSettings } from '../types'
import { DEFAULT_PAGE_SETTINGS } from '../constants'

const STORAGE_KEY = 'text-editor-react:page-settings'

function loadPageSettings (): PageSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    return saved ? { ...DEFAULT_PAGE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_PAGE_SETTINGS
  } catch {
    return DEFAULT_PAGE_SETTINGS
  }
}

export function usePageSettings () {
  const [pageSettings, setPageSettings] = useState<PageSettings>(loadPageSettings)

  const updatePageSettings = useCallback((newSettings: PageSettings) => {
    setPageSettings(newSettings)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    } catch {
      // Storage may be unavailable (private mode); settings still apply for this session
    }
  }, [])

  return { pageSettings, setPageSettings: updatePageSettings }
}
