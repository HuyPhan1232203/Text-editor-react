import { useEffect, useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { mmToPx } from '@/utils/convertUnit'
import type { PageSettings } from '../types'
import { PAGE_GAP_PX } from '../constants'

export interface PageLayoutPx {
  pageWidth: number
  pageHeight: number
  marginTop: number
  marginBottom: number
  contentHeight: number
  // Distance from the top of one page to the top of the next
  pitch: number
}

// Page geometry in px, shared by the pagination extension and the page thumbnails
export function usePageLayout (pageSettings: PageSettings): PageLayoutPx {
  const { orientation, topMargin, bottomMargin } = pageSettings

  return useMemo(() => {
    const pageWidthMm = orientation === 'portrait' ? 210 : 297
    const pageHeightMm = orientation === 'portrait' ? 297 : 210
    const marginTop = mmToPx(topMargin)
    const marginBottom = mmToPx(bottomMargin)
    const contentHeight = mmToPx(pageHeightMm - topMargin - bottomMargin)

    return {
      pageWidth: mmToPx(pageWidthMm),
      pageHeight: marginTop + contentHeight + marginBottom,
      marginTop,
      marginBottom,
      contentHeight,
      pitch: marginTop + contentHeight + marginBottom + PAGE_GAP_PX
    }
  }, [orientation, topMargin, bottomMargin])
}

// Number of pages computed by the pagination extension
export function usePageCount (editor: Editor | null): number {
  // Start from the current count: components mounted later (e.g. the page list after switching
  // sidebar tabs) must not show a single page until the next edit
  const [pageCount, setPageCount] = useState<number>(() => editor?.storage.pagination.pageCount ?? 1)

  useEffect(() => {
    if (!editor) return

    const sync = () => setPageCount(editor.storage.pagination.pageCount)

    editor.on('transaction', sync)
    return () => {
      editor.off('transaction', sync)
    }
  }, [editor])

  return pageCount
}
