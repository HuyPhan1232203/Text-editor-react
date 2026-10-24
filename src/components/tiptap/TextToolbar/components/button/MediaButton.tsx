import { Image, Table } from 'lucide-react'
import type { ToolbarSectionProps } from '../../types'
import type { CreateTablePayload } from '@/components/tiptap/tableTiptap/CreateTablePopover'
import CreateTablePopover from '@/components/tiptap/tableTiptap/CreateTablePopover'
import { memo, useCallback } from 'react'
import { ICON_BUTTON, ICON_SIZE, ICON_STROKE } from '../../styles'
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
      <button type='button' onClick={handleImageClick} className={ICON_BUTTON} title={t('toolbar.image')} aria-label={t('toolbar.image')}>
        <Image size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden='true' />
      </button>

      <CreateTablePopover createTable={handleCreateTable}>
        <button type='button' className={ICON_BUTTON} title={t('toolbar.table')} aria-label={t('toolbar.table')}>
          <Table size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden='true' />
        </button>
      </CreateTablePopover>
    </>
  )
})
