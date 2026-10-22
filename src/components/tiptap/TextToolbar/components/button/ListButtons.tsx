import { Code2, Quote } from 'lucide-react'
import type { ToolbarSectionProps, EditorToolbarState } from '../../types'
import { ListButton } from '@/components/tiptap/tiptap-ui/list-button'
import { ToolbarButton } from '@/components/ToolbarButton'
import { t } from '@/i18n'

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
        tooltip={t('toolbar.bulletList')}
      />
      <ListButton
        editor={editor}
        type='orderedList'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip={t('toolbar.orderedList')}
      />
      <ListButton
        editor={editor}
        type='taskList'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip={t('toolbar.taskList')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={state.isBlockquote}
        icon={Quote}
        label='Blockquote'
        tooltip={t('toolbar.blockquote')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={state.isCodeBlock}
        icon={Code2}
        label='Code block'
        tooltip={t('toolbar.codeBlock')}
      />
    </>
  )
}
