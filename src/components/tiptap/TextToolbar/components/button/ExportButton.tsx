import { File } from 'lucide-react'
import { exportToPdf } from '@/utils/exportPDF'
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
    await exportToPdf(editor, {
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
  }

  return (
    <Button onClick={handleExportPDF} variant='ghost' title='Xuất file PDF'>
      <File className='w-4 h-4 mr-2' />
      Xuất PDF
    </Button>
  )
}
