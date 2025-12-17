// utils/exportPdf.ts - Updated
import { Editor } from '@tiptap/react'
import { inlineStyles } from './inlineStyles'

interface ExportPdfOptions {
  fileName?: string
  pageFormat?: 'A4' | 'A3' | 'Letter'
  pageSettings?: {
    topMargin?: number
    bottomMargin?: number
    leftMargin?: number
    rightMargin?: number
  }
}

export async function exportToPdf (
  editor: Editor,
  options: ExportPdfOptions = {}
): Promise<{ success: boolean, error?: Error | string }> {
  const {
    fileName = 'document.pdf',
    pageFormat = 'A4',
    pageSettings = {
      topMargin: 20,
      bottomMargin: 20,
      leftMargin: 20,
      rightMargin: 20
    }
  } = options

  try {
    const htmlContent = editor.getHTML()
    const styledHtml = inlineStyles(htmlContent)

    const response = await fetch('http://localhost:5002/pdf/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: styledHtml,
        format: pageFormat,
        filename: fileName,
        margins: {
          top: `${pageSettings.topMargin}px`,
          bottom: `${pageSettings.bottomMargin}px`,
          left: `${pageSettings.leftMargin}px`,
          right: `${pageSettings.rightMargin}px`
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData?.message || 'Failed to export PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Export PDF error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
