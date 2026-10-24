import { List, ListChecks, ListOrdered } from 'lucide-react'
import type { ToolbarSectionProps, EditorToolbarState } from '../../types'
import { ToolbarButton } from '@/components/ToolbarButton'
import { t } from '@/i18n'

interface ListButtonsProps extends ToolbarSectionProps {
  state: EditorToolbarState
}

export function ListButtons ({ editor, state }: ListButtonsProps) {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={state.isBulletList}
        icon={List}
        label={t('toolbar.bulletList')}
        tooltip={t('toolbar.bulletList')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={state.isOrderedList}
        icon={ListOrdered}
        label={t('toolbar.orderedList')}
        tooltip={t('toolbar.orderedList')}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={state.isTaskList}
        icon={ListChecks}
        label={t('toolbar.taskList')}
        tooltip={t('toolbar.taskList')}
      />
    </>
  )
}
