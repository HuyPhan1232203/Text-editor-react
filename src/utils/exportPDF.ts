// utils/exportPdf.ts - Optimized
import { Editor } from '@tiptap/react'
import { inlineStyles } from './inlineStyles'
import { API_ENDPOINTS } from '@/config/constants'

type PageFormat = 'A4' | 'A3' | 'Letter'

interface PageSettings {
  topMargin?: number
  bottomMargin?: number
  leftMargin?: number
  rightMargin?: number
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
  rightMargin: 20
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
    let htmlContent = editor.getHTML()

    // Preserve no-border class từ DOM
    const domTables = document.querySelectorAll('.tiptap table')

    if (domTables.length > 0) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      const exportTables = doc.querySelectorAll('table')

      domTables.forEach((table, index) => {
        if (table.classList.contains('no-border') && exportTables[index]) {
          exportTables[index].classList.add('no-border')
        }
      })

      htmlContent = doc.body.innerHTML
    }

    const styledHtml = inlineStyles(htmlContent)

    console.log({
      html: styledHtml
    })
    const response = await fetch(API_ENDPOINTS.GENERATE_PDF, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: styledHtml,
        format: pageFormat,
        filename: fileName,
        margins: {
          top: `${margins.topMargin}px`,
          bottom: `${margins.bottomMargin}px`,
          left: `${margins.leftMargin}px`,
          right: `${margins.rightMargin}px`
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))

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
