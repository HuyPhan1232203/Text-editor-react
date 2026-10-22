import { Image, Table, Youtube } from 'lucide-react'
import { promptYoutube } from '@/components/tiptap/tiptap-extension/slash-command-extension'
import type { ToolbarSectionProps } from '../../types'
import { Button } from '@/components/ui/button'
import type { CreateTablePayload } from '@/components/tiptap/tableTiptap/CreateTablePopover'
import CreateTablePopover from '@/components/tiptap/tableTiptap/CreateTablePopover'
import { memo, useCallback } from 'react'
import { t } from '@/i18n'

export const MediaButtons = memo(function MediaButtons ({
  editor
}: ToolbarSectionProps) {
  const handleImageClick = useCallback(() => {
    editor.chain().focus().setImageUploadNode().run()
  }, [editor])

  const handleCreateTable = useCallback(
    (payload: CreateTablePayload) => {
      editor.chain().focus().insertTable(payload).run()
    },
    [editor]
  )

  return (
    <>
      <Button onClick={handleImageClick} variant='ghost' title={t('toolbar.image')} aria-label={t('toolbar.image')}>
        <Image className='w-4 h-4' />
      </Button>

      <CreateTablePopover createTable={handleCreateTable}>
        <Button variant='ghost' title={t('toolbar.table')} aria-label={t('toolbar.table')}>
          <Table className='w-4 h-4' />
        </Button>
      </CreateTablePopover>

      <Button onClick={() => promptYoutube(editor)} variant='ghost' title={t('toolbar.youtube')} aria-label={t('toolbar.youtube')}>
        <Youtube className='w-4 h-4' />
      </Button>
    </>
  )
})
