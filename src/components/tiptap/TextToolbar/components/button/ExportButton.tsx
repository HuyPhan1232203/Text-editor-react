import { Download } from 'lucide-react'
import { useRef, useState } from 'react'
import { exportToPdf } from '@/utils/exportPDF'
import { printToPdf } from '@/utils/printPDF'
import { PDF_API_URL } from '@/config/constants'
import type { Editor } from '@tiptap/react'
import { t } from '@/i18n'

interface ExportButtonProps {
  editor: Editor
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
}

export function ExportButton ({
  editor,
  topMargin,
  bottomMargin,
  leftMargin,
  rightMargin,
  orientation
}: ExportButtonProps) {
  // Ignore repeated clicks (e.g. a double click) while an export is running
  const exportingRef = useRef(false)
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    if (exportingRef.current) return
    exportingRef.current = true
    setExporting(true)
    try {
      await runExport()
    } finally {
      exportingRef.current = false
      setExporting(false)
    }
  }

  const runExport = async () => {
    // No backend configured: let the browser print the document to PDF
    if (!PDF_API_URL) {
      try {
        await printToPdf(editor, {
          title: 'document',
          topMargin,
          bottomMargin,
          leftMargin,
          rightMargin,
          orientation
        })
      } catch (error) {
        window.alert(t('export.failed', { error: error instanceof Error ? error.message : 'Unknown error' }))
      }
      return
    }

    const result = await exportToPdf(editor, {
      fileName: 'document.pdf',
      pageFormat: 'A4',
      pageSettings: {
        topMargin,
        bottomMargin,
        leftMargin,
        rightMargin,
        orientation
      }
    })

    if (!result.success) {
      window.alert(t('export.failed', { error: result.error ?? 'Unknown error' }))
    }
  }

  return (
    <button
      type='button'
      onClick={handleExportPDF}
      disabled={exporting}
      title={t('export.title')}
      className='flex h-9 items-center gap-2 rounded-lg bg-[#2F5BEA] px-3.5 text-[13px] font-medium text-white hover:bg-[#1F3FB0] disabled:opacity-60'
    >
      <Download size={16} strokeWidth={2} aria-hidden='true' />
      {t('export.button')}
    </button>
  )
}
