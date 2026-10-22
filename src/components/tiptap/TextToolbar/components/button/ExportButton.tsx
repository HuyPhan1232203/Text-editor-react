import { File } from 'lucide-react'
import { exportToPdf } from '@/utils/exportPDF'
import { printToPdf } from '@/utils/printPDF'
import { PDF_API_URL } from '@/config/constants'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'

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
  const handleExportPDF = async () => {
    // No backend configured: let the browser print the document to PDF
    if (!PDF_API_URL) {
      try {
        await printToPdf(editor, {
          title: 'my-document',
          topMargin,
          bottomMargin,
          leftMargin,
          rightMargin,
          orientation
        })
      } catch (error) {
        window.alert(`Xuất PDF thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      return
    }

    const result = await exportToPdf(editor, {
      fileName: 'my-document.pdf',
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
      window.alert(`Xuất PDF thất bại: ${result.error}`)
    }
  }

  return (
    <Button onClick={handleExportPDF} variant='ghost' title='Xuất file PDF'>
      <File className='w-4 h-4 mr-2' />
      Xuất PDF
    </Button>
  )
}
