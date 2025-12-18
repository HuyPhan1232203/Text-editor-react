// utils/exportDocx.ts - Optimized
import { Editor } from '@tiptap/react'
import { inlineStyles } from './inlineStyles'

interface PageSettings {
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
}

interface ExportOptions {
  fileName?: string
  pageSettings?: PageSettings
}

interface ExportResult {
  success: boolean
  error?: string
}

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  topMargin: 25.4,
  bottomMargin: 25.4,
  leftMargin: 25.4,
  rightMargin: 25.4
}

const DOCX_API_ENDPOINT = 'http://localhost:5002/docx/convert'

export async function exportToDocx (
  editor: Editor,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const {
    fileName = 'document.docx',
    pageSettings = DEFAULT_PAGE_SETTINGS
  } = options

  try {
    const htmlContent = editor.getHTML()
    const styledHtml = inlineStyles(htmlContent)

    const response = await fetch(DOCX_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: styledHtml,
        fileName,
        ...pageSettings,
        title: 'Tài liệu kỹ thuật',
        creator: 'T.A CONSULTANTS',
        orientation: 'portrait'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))

      throw new Error(errorData?.message || 'Failed to export DOCX')
    }

    // Tải file xuống
    const blob = await response.blob()

    downloadBlob(blob, fileName)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Export DOCX error:', errorMessage)
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
