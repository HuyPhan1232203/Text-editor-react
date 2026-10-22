// utils/exportPdf.ts - Optimized
import { Editor } from '@tiptap/react'
import { inlineStyles } from './inlineStyles'
import { repeatTableHeaders } from './tableHeaders'
import { API_ENDPOINTS } from '@/config/constants'

type PageFormat = 'A4' | 'A3' | 'Letter'

interface PageSettings {
  topMargin?: number
  bottomMargin?: number
  leftMargin?: number
  rightMargin?: number
  orientation?: 'landscape' | 'portrait'
}

interface ExportPdfOptions {
  fileName?: string
  pageFormat?: PageFormat
  pageSettings?: PageSettings
}

interface ExportResult {
  success: boolean
  error?: string
}

const DEFAULT_PAGE_SETTINGS: Required<PageSettings> = {
  topMargin: 20,
  bottomMargin: 20,
  leftMargin: 20,
  rightMargin: 20,
  orientation: 'portrait'
}

export async function exportToPdf (
  editor: Editor,
  options: ExportPdfOptions = {}
): Promise<ExportResult> {
  const {
    fileName = 'document.pdf',
    pageFormat = 'A4',
    pageSettings = {}
  } = options

  const margins = { ...DEFAULT_PAGE_SETTINGS, ...pageSettings }

  try {
    // Hidden table borders are a table attribute, rendered as the no-border class
    const doc = new DOMParser().parseFromString(editor.getHTML(), 'text/html')

    repeatTableHeaders(doc.body)

    const htmlContent = doc.body.innerHTML

    const styledHtml = inlineStyles(htmlContent)

    // Backend nhận multipart: HTML gửi dạng file đính kèm, margins là chuỗi JSON
    const formData = new FormData()

    formData.append('file', new Blob([styledHtml], { type: 'text/html' }), 'document.html')
    formData.append('format', pageFormat)
    formData.append('filename', fileName)
    formData.append('margins', JSON.stringify({
      top: `${margins.topMargin}px`,
      bottom: `${margins.bottomMargin}px`,
      left: `${margins.leftMargin}px`,
      right: `${margins.rightMargin}px`
    }))
    formData.append('orientation', margins.orientation)

    const response = await fetch(API_ENDPOINTS.GENERATE_PDF, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }))

      throw new Error(errorData?.message || 'Failed to export PDF')
    }

    const blob = await response.blob()

    downloadBlob(blob, fileName)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Export PDF error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Helper function để download blob
function downloadBlob (blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
