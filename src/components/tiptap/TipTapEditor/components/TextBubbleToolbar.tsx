import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Underline, LinkIcon } from 'lucide-react'
import type { EditorContentAreaProps } from './EditorContentArea'
import { ToolbarButton } from '@/components/ToolbarButton'
import { ColorHighlightButton } from '@/components/tiptap/tiptap-ui/color-highlight-button'
import { HIGHLIGHT_COLORS } from '../../TextToolbar/constants'
import { useBubbleMenuState } from '../hooks/useBubbleMenuState'
import { CellSelection } from '@tiptap/pm/tables'

function TextBubbleToolbar ({ editor }: EditorContentAreaProps) {
  // Sử dụng hook để track state
  const state = useBubbleMenuState(editor)

  if (!editor) return null
  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={100}
      shouldShow={({ state, from, to }) => {
        const { selection } = state

        // Có text được select
        const hasSelection = from !== to

        // Check CHÍNH XÁC xem có phải CellSelection không
        const isCellSelection = selection instanceof CellSelection

        // CHỈ show khi có selection VÀ KHÔNG phải cell selection
        return hasSelection && !isCellSelection
      }}
    >
      <div
        className='flex items-center gap-1 rounded-lg bg-white text-gray-800 px-3 py-2 shadow-xl border border-gray-200'
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {/* Formatting Buttons - sử dụng state từ hook */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={state.isBold}
          icon={Bold}
          label='Bold'
          tooltip='In đậm (Ctrl+B)'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={state.isItalic}
          icon={Italic}
          label='Italic'
          tooltip='In nghiêng (Ctrl+I)'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={state.isUnderline}
          icon={Underline}
          label='Underline'
          tooltip='Gạch chân (Ctrl+U)'
        />
        <div className='w-px h-6 bg-gray-300 mx-1' />
        <ToolbarButton
          onClick={handleLinkClick}
          isActive={state.isLink}
          icon={LinkIcon}
          label='Link'
          tooltip='Thêm liên kết'
        />
        {/* Divider */}
        <div className='w-px h-6 bg-gray-300 mx-1' />

        {/* Highlight Colors */}
        {HIGHLIGHT_COLORS.map(({ color, tooltip }) => (
          <ColorHighlightButton
            key={color}
            editor={editor}
            tooltip={tooltip}
            highlightColor={color}
            hideWhenUnavailable={false}
            showShortcut={false}
          />
        ))}

        {/* Divider */}
        <div className='w-px h-6 bg-gray-300 mx-1' />

        {/* Text Alignment - sử dụng state từ hook */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={state.textAlign === 'left'}
          icon={AlignLeft}
          label='Align Left'
          tooltip='Căn trái'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={state.textAlign === 'center'}
          icon={AlignCenter}
          label='Align Center'
          tooltip='Căn giữa'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={state.textAlign === 'right'}
          icon={AlignRight}
          label='Align Right'
          tooltip='Căn phải'
        />
      </div>
    </BubbleMenu>
  )
}

export default TextBubbleToolbar
