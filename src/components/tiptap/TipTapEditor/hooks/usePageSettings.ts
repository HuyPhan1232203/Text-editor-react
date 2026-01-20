import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { PageSettings } from '../types'
import { DEFAULT_PAGE_SETTINGS } from '../constants'

export function usePageSettings (editor: Editor | null) {
  const [pageSettings, setPageSettings] = useState<PageSettings>(
    DEFAULT_PAGE_SETTINGS
  )

  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    editor
      .chain()
      .setDocumentPageMargins({
        top: pageSettings.topMargin,
        bottom: pageSettings.bottomMargin,
        left: pageSettings.leftMargin,
        right: pageSettings.rightMargin
      })
      .setDocumentPaperOrientation(pageSettings.orientation)
      .run()
  }, [editor, pageSettings])

  const updatePageSettings = useCallback((newSettings: PageSettings) => {
    setPageSettings(newSettings)
  }, [])

  return { pageSettings, setPageSettings: updatePageSettings }
}
