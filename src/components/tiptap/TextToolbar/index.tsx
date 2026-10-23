import { useEditorToolbarState } from './hooks/useEditorToolbarState'
import { FormattingButtons } from './components/button/FormattingButtons'
import { TextAlignmentButtons } from './components/button/TextAlignmentButtons'
import { HighlightButtons } from './components/button/HighlightButtons'
import { ListButtons } from './components/button/ListButtons'
import { HistoryButtons } from './components/button/HistoryButtons'
import { CommentButton, LinkButton } from './components/button/LinkButton'
import { ExportButton } from './components/button/ExportButton'
import type { TextToolbarProps } from './types'
import { HeadingPopover } from '../header/HeadingPopover'
import { Divider } from '../../Devider'
import { FontFamilyPicker } from './components/picker/FontFamilyPicker'
import { FontSizePicker } from './components/picker/FontSizePicker'
import { LineHeightPicker } from './components/picker/LineHeightPicker'
import { TextColorPicker } from './components/picker/TextColorPicker'
import { MediaButtons } from './components/button/MediaButton'
import { EmojiButton } from './components/button/EmojiButton'
import { MathButtons } from './components/button/MathButton'
import { DocxButtons } from './components/button/DocxButtons'

export function TextToolbar ({
  editor,
  topMargin,
  bottomMargin,
  leftMargin,
  rightMargin,
  orientation,
  zoomControl
}: TextToolbarProps) {
  const state = useEditorToolbarState(editor)

  if (!editor) return null

  return (
    <div className='flex flex-wrap items-center gap-1'>
      {/* Same order as Google Docs: undo, redo, zoom, then text styles */}
      <HistoryButtons editor={editor} state={state} />
      {zoomControl}

      <Divider />
      <HeadingPopover editor={editor} />

      <Divider />
      <FontFamilyPicker editor={editor} />
      <FontSizePicker editor={editor} />
      <LineHeightPicker editor={editor} />

      <Divider />
      <FormattingButtons editor={editor} state={state} />

      <Divider />
      <TextColorPicker editor={editor} />
      <EmojiButton editor={editor} />
      <Divider />
      <HighlightButtons editor={editor} />
      <Divider />
      <MathButtons editor={editor} />
      <Divider />
      <LinkButton editor={editor} state={state} />
      <CommentButton editor={editor} state={state} />

      <Divider />
      <TextAlignmentButtons editor={editor} />

      <Divider />
      <ListButtons editor={editor} state={state} />

      <Divider />
      <MediaButtons editor={editor} />

      <Divider />
      <ExportButton
        editor={editor}
        topMargin={topMargin}
        bottomMargin={bottomMargin}
        leftMargin={leftMargin}
        rightMargin={rightMargin}
        orientation={orientation}
      />
      <DocxButtons editor={editor} />
    </div>
  )
}
