import type { Editor } from '@tiptap/react'
import { Code, Eraser, MoreHorizontal, Subscript, Superscript } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToolbarButton } from '@/components/ToolbarButton'
import type { EditorToolbarState } from '../../types'
import { ICON_BUTTON, ICON_SIZE } from '../../styles'
import { t } from '@/i18n'

/** "…": less frequent inline formatting. */
export function MoreMenu ({ editor, state }: { editor: Editor, state: EditorToolbarState }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type='button' className={ICON_BUTTON} aria-label={t('toolbar.more')} title={t('toolbar.more')}>
          <MoreHorizontal size={ICON_SIZE} strokeWidth={2} aria-hidden='true' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-1' align='end'>
        <div className='flex items-center gap-0.5'>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={state.isCode}
            disabled={!state.canCode}
            icon={Code}
            label={t('toolbar.code')}
            tooltip={t('toolbar.code')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={state.isSubscript}
            icon={Subscript}
            label={t('toolbar.subscript')}
            tooltip={t('toolbar.subscript')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={state.isSuperscript}
            icon={Superscript}
            label={t('toolbar.superscript')}
            tooltip={t('toolbar.superscript')}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            icon={Eraser}
            label={t('toolbar.clearFormatting')}
            tooltip={t('toolbar.clearFormatting')}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
