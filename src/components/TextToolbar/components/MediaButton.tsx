import { Image, Table } from 'lucide-react'
import type { ToolbarSectionProps } from '../types'
import { Button } from '@/components/ui/button'
import type { CreateTablePayload } from '@/components/tableTiptap/CreateTablePopover'
import CreateTablePopover from '@/components/tableTiptap/CreateTablePopover'

export function MediaButtons ({ editor }: ToolbarSectionProps) {
  const handleImageClick = () => {
    editor.chain().focus().setImageUploadNode().run()
  }

  const handleCreateTable = (payload: CreateTablePayload) => {
    editor.chain().focus().insertTable(payload).run()
  }

  return (
    <>
      <Button onClick={handleImageClick} variant='ghost' title='Chèn hình ảnh'>
        <Image className='w-4 h-4' />
      </Button>

      <CreateTablePopover createTable={handleCreateTable}>
        <Button variant='ghost' title='Chèn bảng'>
          <Table className='w-4 h-4' />
        </Button>
      </CreateTablePopover>
    </>
  )
}
