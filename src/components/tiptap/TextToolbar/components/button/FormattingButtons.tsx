import { Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline } from 'lucide-react'
import type { ToolbarSectionProps, EditorToolbarState } from '../../types'
import { ToolbarButton } from '@/components/ToolbarButton'
import { memo } from 'react'
import { t } from '@/i18n'

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
        tooltip={t('toolbar.bold')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={state.isItalic}
        disabled={!state.canItalic}
        icon={Italic}
        label='Italic'
        tooltip={t('toolbar.italic')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={state.isUnderline}
        disabled={!state.canUnderline}
        icon={Underline}
        label='Underline'
        tooltip={t('toolbar.underline')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={state.isStrike}
        disabled={!state.canStrike}
        icon={Strikethrough}
        label='Strike'
        tooltip={t('toolbar.strike')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={state.isCode}
        disabled={!state.canCode}
        icon={Code}
        label='Code'
        tooltip='Code inline'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={state.isSubscript}
        icon={Subscript}
        label='Subscript'
        tooltip={t('toolbar.subscript')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={state.isSuperscript}
        icon={Superscript}
        label='Superscript'
        tooltip={t('toolbar.superscript')}
      />
    </>
  )
})
