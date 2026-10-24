import { useEditorToolbarState } from './hooks/useEditorToolbarState'
import { FormattingButtons } from './components/button/FormattingButtons'
import { ListButtons } from './components/button/ListButtons'
import { HistoryButtons } from './components/button/HistoryButtons'
import { CommentButton, LinkButton } from './components/button/LinkButton'
import type { TextToolbarProps } from './types'
import { HeadingPopover } from '../header/HeadingPopover'
import { Divider } from '../../Devider'
import { FontFamilyPicker } from './components/picker/FontFamilyPicker'
import { FontSizePicker } from './components/picker/FontSizePicker'
import { LineHeightPicker } from './components/picker/LineHeightPicker'
import { TextColorPicker } from './components/picker/TextColorPicker'
import { MediaButtons } from './components/button/MediaButton'
import { EmojiButton } from './components/button/EmojiButton'
import { HighlightPicker } from './components/menu/HighlightPicker'
import { AlignPicker } from './components/menu/AlignPicker'
import { InsertMenu } from './components/menu/InsertMenu'
import { MoreMenu } from './components/menu/MoreMenu'

export function TextToolbar ({ editor }: TextToolbarProps) {
  const state = useEditorToolbarState(editor)

  if (!editor) return null

  return (
    <div role='toolbar' aria-label='Formatting' className='flex flex-wrap items-center gap-1'>
      <HistoryButtons editor={editor} state={state} />

      <Divider />
      <HeadingPopover editor={editor} />
      <FontFamilyPicker editor={editor} />
      <FontSizePicker editor={editor} />
      <LineHeightPicker editor={editor} />

      <Divider />
      <FormattingButtons editor={editor} state={state} />
      <TextColorPicker editor={editor} />
      <HighlightPicker editor={editor} />
      <LinkButton editor={editor} state={state} />
      <CommentButton editor={editor} state={state} />

      <Divider />
      <AlignPicker editor={editor} />
      <ListButtons editor={editor} state={state} />

      <Divider />
      <MediaButtons editor={editor} />
      <EmojiButton editor={editor} />
      <InsertMenu editor={editor} />
      <MoreMenu editor={editor} state={state} />
    </div>
  )
}
