import { Editor, useEditorState } from '@tiptap/react'
import { ToolbarButton } from './ToolbarButton'
import { Bold, Code, File, Image, Italic, LinkIcon, Quote, Redo, Strikethrough, Table, Underline, Undo } from 'lucide-react'
import { Divider } from './Devider'
import { TextAlignButton } from './tiptap/tiptap-ui/text-align-button'
import { ColorHighlightButton } from './tiptap/tiptap-ui/color-highlight-button'
import CreateTablePopover, { type CreateTablePayload } from './tiptap/tableTiptap/CreateTablePopover'
import { ListButton } from './tiptap/tiptap-ui/list-button'
import { ButtonGroup } from './tiptap/tiptap-ui-primitive/button'
import { Button } from './ui/button'
import { HeadingPopover } from './header/HeadingPopover'
import { TextColorPicker } from './tiptap/text-color/TextColorPicker'
import { FontFamilyPicker } from './font/FontFamilyPicker'
import { FontSizePicker } from './font/FontSizePicker'
import { LineHeightPicker } from './font/LineHeightPicker'
import { exportToPdf } from '@/utils/exportPDF'

interface TextToolbarProps {
  editor: Editor
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
}

export function TextToolbar (
  {
    editor,
    topMargin,
    bottomMargin,
    leftMargin,
    rightMargin,
    orientation
  }: TextToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isUnderline: ctx.editor.isActive('underline'),
      canUnderline: ctx.editor.can().chain().toggleUnderline().run(),
      isItalic: ctx.editor.isActive('italic'),
      canItalic: ctx.editor.can().chain().toggleItalic().run(),
      isStrike: ctx.editor.isActive('strike'),
      canStrike: ctx.editor.can().chain().toggleStrike().run(),
      isCode: ctx.editor.isActive('code'),
      canCode: ctx.editor.can().chain().toggleCode().run(),
      isBlockquote: ctx.editor.isActive('blockquote'),
      isInTable: ctx.editor.isActive('table'),
      isLink: ctx.editor.isActive('link'),
      canUndo: ctx.editor.can().chain().undo().run(),
      canRedo: ctx.editor.can().chain().redo().run()
    })
  })
  const handleExportPDF = async () => {
    await exportToPdf(editor, {
      fileName: 'my-document.pdf',
      pageFormat: 'A4',
      pageSettings: {
        topMargin,
        bottomMargin,
        leftMargin,
        rightMargin,
        orientation
      }
    })
  }
  const handleCreateTable = (payload: CreateTablePayload) => {
    editor.chain().focus().insertTable(payload).run()
  }

  const handleImageClick = () => {
    editor.chain().focus().setImageUploadNode().run()
  }

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
    <div className='flex flex-wrap items-center gap-1 '>
      <HeadingPopover editor={editor} />

      <Divider />
      <FontFamilyPicker editor={editor} />
      <FontSizePicker editor={editor} />
      <LineHeightPicker editor={editor} />
      <Divider />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editorState.isBold}
        disabled={!editorState.canBold}
        icon={Bold}
        label='Bold'
        tooltip='In đậm (Ctrl+B)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editorState.isItalic}
        disabled={!editorState.canItalic}
        icon={Italic}
        label='Italic'
        tooltip='In nghiêng (Ctrl+I)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editorState.isUnderline}
        disabled={!editorState.canUnderline}
        icon={Underline}
        label='Underline'
        tooltip='Gạch chân (Ctrl+U)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editorState.isStrike}
        disabled={!editorState.canStrike}
        icon={Strikethrough}
        label='Strike'
        tooltip='Gạch ngang'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editorState.isCode}
        disabled={!editorState.canCode}
        icon={Code}
        label='Code'
        tooltip='Code inline'
      />

      <Divider />
      <TextColorPicker editor={editor} />

      <Divider />
      <ButtonGroup orientation='horizontal'>
        <ColorHighlightButton
          editor={editor}
          tooltip='Highlight màu vàng'
          highlightColor='#fef08a'
          hideWhenUnavailable={false}
          showShortcut={false}
        />
        <ColorHighlightButton
          editor={editor}
          tooltip='Highlight màu xanh lá'
          highlightColor='#bbf7d0'
          hideWhenUnavailable={false}
          showShortcut={false}
        />
        <ColorHighlightButton
          editor={editor}
          tooltip='Highlight màu xanh dương'
          highlightColor='#bfdbfe'
          hideWhenUnavailable={false}
          showShortcut={false}
        />
        <ColorHighlightButton
          editor={editor}
          tooltip='Highlight màu hồng'
          highlightColor='#fbcfe8'
          hideWhenUnavailable={false}
          showShortcut={false}
        />
        <ColorHighlightButton
          editor={editor}
          tooltip='Highlight màu cam'
          highlightColor='#fed7aa'
          hideWhenUnavailable={false}
          showShortcut={false}
        />
      </ButtonGroup>

      <Divider />

      {/* Link Button */}
      <ToolbarButton
        onClick={handleLinkClick}
        isActive={editorState.isLink}
        icon={LinkIcon}
        label='Link'
        tooltip='Thêm liên kết'
      />

      <Divider />

      {/* Text Alignment Buttons */}
      <TextAlignButton
        editor={editor}
        align='left'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip='Căn trái'
      />
      <TextAlignButton
        editor={editor}
        align='center'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip='Căn giữa'
      />
      <TextAlignButton
        editor={editor}
        align='right'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip='Căn phải'
      />
      <TextAlignButton
        editor={editor}
        align='justify'
        hideWhenUnavailable={false}
        showShortcut={false}
        tooltip='Căn đều'
      />

      <Divider />

      {/* Lists */}
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
        isActive={editorState.isBlockquote}
        icon={Quote}
        label='Blockquote'
        tooltip='Trích dẫn'
      />

      <Divider />

      {/* Image Upload */}
      <Button onClick={handleImageClick} variant='ghost' title='Chèn hình ảnh'>
        <Image className='w-4 h-4' />
      </Button>

      <Divider />

      {/* Table Operations */}
      <CreateTablePopover createTable={handleCreateTable}>
        <Button variant='ghost' title='Chèn bảng'>
          <Table className='w-4 h-4' />
        </Button>
      </CreateTablePopover>
      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
        icon={Undo}
        label='Undo'
        tooltip='Hoàn tác (Ctrl+Z)'
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
        icon={Redo}
        label='Redo'
        tooltip='Làm lại (Ctrl+Y)'
      />
      <Divider />

      <Button onClick={handleExportPDF} variant='ghost' title='Xuất file PDF'>
        <File className='w-4 h-4 mr-2' />
        Xuất PDF
      </Button>
    </div>
  )
}
