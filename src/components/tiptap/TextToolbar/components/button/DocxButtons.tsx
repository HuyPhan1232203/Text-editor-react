import { FileUp } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { DOCX_MIME, importDocx } from '@/utils/importDocx'
import { t } from '@/i18n'

interface DocxButtonsProps {
  editor: Editor
}

/** Open a .docx: replaces the document, Ctrl+Z brings the previous one back. */
export function DocxButtons ({ editor }: DocxButtonsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      await importDocx(editor, file)
    } catch (error) {
      window.alert(t('docx.importFailed', { error: error instanceof Error ? error.message : 'Unknown error' }))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        accept={`.docx,${DOCX_MIME}`}
        className='hidden'
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        variant='ghost'
        title={t('docx.import')}
        aria-label={t('docx.import')}
      >
        <FileUp className='w-4 h-4' />
      </Button>
    </>
  )
}
