import { Bold, Code, Italic, Strikethrough, Underline } from 'lucide-react'
import type { ToolbarSectionProps, EditorToolbarState } from '../../types'
import { ToolbarButton } from '@/components/ToolbarButton'
import { memo } from 'react'

interface FormattingButtonsProps extends ToolbarSectionProps {
  state: EditorToolbarState
}

export const FormattingButtons = memo(function FormattingButtons ({
  editor,
  state
}: FormattingButtonsProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={state.isBold}
        disabled={!state.canBold}
        icon={Bold}
        label='Bold'
        tooltip='In đậm (Ctrl+B)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={state.isItalic}
        disabled={!state.canItalic}
        icon={Italic}
        label='Italic'
        tooltip='In nghiêng (Ctrl+I)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={state.isUnderline}
        disabled={!state.canUnderline}
        icon={Underline}
        label='Underline'
        tooltip='Gạch chân (Ctrl+U)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={state.isStrike}
        disabled={!state.canStrike}
        icon={Strikethrough}
        label='Strike'
        tooltip='Gạch ngang'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={state.isCode}
        disabled={!state.canCode}
        icon={Code}
        label='Code'
        tooltip='Code inline'
      />
    </>
  )
})
