import { BubbleMenu } from '@tiptap/react/menus'
import { useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { PanelLeft, PanelRight, RectangleHorizontal, Trash2 } from 'lucide-react'
import { ToolbarButton } from '@/components/ToolbarButton'
import type { ImageWrap } from '@/components/tiptap/tiptap-extension/image-wrap-extension'
import { t } from '@/i18n'

interface ImageBubbleToolbarProps {
  editor: Editor
}

const WRAP_OPTIONS: { wrap: ImageWrap, icon: typeof PanelLeft, label: string }[] = [
  { wrap: 'none', icon: RectangleHorizontal, label: t('image.inline') },
  { wrap: 'left', icon: PanelLeft, label: t('image.wrapLeft') },
  { wrap: 'right', icon: PanelRight, label: t('image.wrapRight') }
]

function ImageBubbleToolbar ({ editor }: ImageBubbleToolbarProps) {
  const currentWrap = useEditorState({
    editor,
    selector: ({ editor }) => (editor.getAttributes('image').wrap ?? 'none') as ImageWrap
  })

  return (
    <BubbleMenu
      editor={editor}
      pluginKey='imageBubbleMenu'
      updateDelay={100}
      shouldShow={({ editor }) => editor.isActive('image')}
    >
      <div
        className='flex items-center gap-1 rounded-lg bg-white text-gray-800 px-2 py-1 shadow-xl border border-gray-200'
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {WRAP_OPTIONS.map(({ wrap, icon, label }) => (
          <ToolbarButton
            key={wrap}
            onClick={() => editor.chain().focus().setImageWrap(wrap).run()}
            isActive={currentWrap === wrap}
            icon={icon}
            label={label}
            tooltip={label}
          />
        ))}
        <div className='w-px h-6 bg-gray-200 mx-1' />
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteSelection().run()}
          icon={Trash2}
          label={t('image.delete')}
          tooltip={t('image.delete')}
        />
      </div>
    </BubbleMenu>
  )
}

export default ImageBubbleToolbar
