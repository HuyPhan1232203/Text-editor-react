import { Redo, Undo } from 'lucide-react'
import type { EditorToolbarState, ToolbarSectionProps } from '../../types'
import { ToolbarButton } from '@/components/ToolbarButton'

interface HistoryButtonsProps extends ToolbarSectionProps {
  state: EditorToolbarState
}

export function HistoryButtons ({ editor, state }: HistoryButtonsProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!state.canUndo}
        icon={Undo}
        label='Undo'
        tooltip='Hoàn tác (Ctrl+Z)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!state.canRedo}
        icon={Redo}
        label='Redo'
        tooltip='Làm lại (Ctrl+Y)'
      />
    </>
  )
}
