import { Quote } from 'lucide-react'
import type { ToolbarSectionProps, EditorToolbarState } from '../../types'
import { ListButton } from '@/components/tiptap/tiptap-ui/list-button'
import { ToolbarButton } from '@/components/ToolbarButton'

interface ListButtonsProps extends ToolbarSectionProps {
  state: EditorToolbarState
}

export function ListButtons ({ editor, state }: ListButtonsProps) {
  return (
    <>
      <ListButton
        editor={editor}
        type='bulletList'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip='Danh sách dấu chấm'
      />
      <ListButton
        editor={editor}
        type='orderedList'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip='Danh sách đánh số'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={state.isBlockquote}
        icon={Quote}
        label='Blockquote'
        tooltip='Trích dẫn'
      />
    </>
  )
}
