import { BubbleMenu } from '@tiptap/react/menus'
import { useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { Copy, Link2Off, Pencil } from 'lucide-react'
import { ToolbarButton } from '@/components/ToolbarButton'
import { openableUrl } from '@/lib/link-url'
import { t } from '@/i18n'

interface LinkBubbleMenuProps {
  editor: Editor
  appendTo?: () => HTMLElement
}

/**
 * Shown when the cursor is in a link, like Google Docs: the address (click to open it in a new
 * tab), copy, edit and remove. Ctrl/Cmd + click on a link also opens it.
 */
function LinkBubbleMenu ({ editor, appendTo }: LinkBubbleMenuProps) {
  const href = useEditorState({
    editor,
    selector: ({ editor }) => (editor.getAttributes('link').href ?? '') as string
  })
  const url = openableUrl(href)

  const edit = () => {
    const next = window.prompt(t('toolbar.linkPrompt'), href)

    if (next === null) return
    if (next.trim() === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: next.trim() }).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={appendTo}
      pluginKey='linkBubbleMenu'
      updateDelay={100}
      // Only for a cursor inside a link; a text selection has the formatting menu
      shouldShow={({ editor, state }) => state.selection.empty && editor.isActive('link')}
    >
      <div
        className='flex max-w-sm items-center gap-1 rounded-lg border border-gray-200 bg-white py-1 pl-3 pr-1 text-gray-800 shadow-xl'
        onMouseDown={(event) => {
          // Keep the cursor in the link, except on the address itself so it can be clicked
          if (!(event.target as HTMLElement).closest('a')) event.preventDefault()
        }}
      >
        {url
          ? (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='min-w-0 flex-1 truncate text-sm text-blue-700 hover:underline'
              title={t('link.open')}
            >
              {href}
            </a>
          )
          : <span className='min-w-0 flex-1 truncate text-sm text-gray-500'>{href}</span>}
        <div className='mx-1 h-6 w-px bg-gray-200' />
        <ToolbarButton
          onClick={() => { navigator.clipboard?.writeText(url ?? href).catch(() => {}) }}
          icon={Copy}
          label={t('link.copy')}
          tooltip={t('link.copy')}
        />
        <ToolbarButton onClick={edit} icon={Pencil} label={t('link.edit')} tooltip={t('link.edit')} />
        <ToolbarButton
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
          icon={Link2Off}
          label={t('link.remove')}
          tooltip={t('link.remove')}
        />
      </div>
    </BubbleMenu>
  )
}

export default LinkBubbleMenu
