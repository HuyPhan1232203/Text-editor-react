// utils/exportDocx.ts
import { Editor } from '@tiptap/react'
import { inlineStyles } from './inlineStyles'

interface ExportOptions {
  fileName?: string
  pageSettings?: {
    topMargin: number
    bottomMargin: number
    leftMargin: number
    rightMargin: number
  }
}

export async function exportToDocx (
  editor: Editor,
  options: ExportOptions = {}
): Promise<{ success: boolean, error?: Error | string }> {
  const {
    fileName = 'document.docx',
    pageSettings = {
      topMargin: 25.4,
      bottomMargin: 25.4,
      leftMargin: 25.4,
      rightMargin: 25.4
    }
  } = options

  try {
    const htmlContent = editor.getHTML()
    const styledHtml = inlineStyles(htmlContent)

    const response = await fetch('http://localhost:5002/docx/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: styledHtml,
        fileName,
        topMargin: pageSettings.topMargin,
        bottomMargin: pageSettings.bottomMargin,
        leftMargin: pageSettings.leftMargin,
        rightMargin: pageSettings.rightMargin,
        title: 'Tài liệu kỹ thuật',
        creator: 'T.A CONSULTANTS',
        orientation: 'portrait'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData?.message || 'Failed to export DOCX')
    }

    // Tải file xuống
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

    console.error('Export DOCX error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
