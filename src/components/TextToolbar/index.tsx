import { useEditorToolbarState } from './hooks/useEditorToolbarState'
import { FormattingButtons } from './components/FormattingButtons'
import { TextAlignmentButtons } from './components/TextAlignmentButtons'
import { HighlightButtons } from './components/HighlightButtons'
import { ListButtons } from './components/ListButtons'
import { HistoryButtons } from './components/HistoryButtons'
import { LinkButton } from './components/LinkButton'
import { ExportButton } from './components/ExportButton'
import type { TextToolbarProps } from './types'
import { HeadingPopover } from '../header/HeadingPopover'
import { Divider } from '../Devider'
import { FontFamilyPicker } from '../font/FontFamilyPicker'
import { FontSizePicker } from '../font/FontSizePicker'
import { LineHeightPicker } from '../font/LineHeightPicker'
import { TextColorPicker } from '../text-color/TextColorPicker'
import { MediaButtons } from './components/MediaButton'

export function TextToolbar ({
  editor,
  topMargin,
  bottomMargin,
  leftMargin,
  rightMargin,
  orientation
}: TextToolbarProps) {
  const state = useEditorToolbarState(editor)

  if (!editor) return null

  return (
    <div className='flex flex-wrap items-center gap-1'>
      <HeadingPopover editor={editor} />

      <Divider />
      <FontFamilyPicker editor={editor} />
      <FontSizePicker editor={editor} />
      <LineHeightPicker editor={editor} />

      <Divider />
      <FormattingButtons editor={editor} state={state} />

      <Divider />
      <TextColorPicker editor={editor} />

      <Divider />
      <HighlightButtons editor={editor} />

      <Divider />
      <LinkButton editor={editor} state={state} />

      <Divider />
      <TextAlignmentButtons editor={editor} />

      <Divider />
      <ListButtons editor={editor} state={state} />

      <Divider />
      <MediaButtons editor={editor} />

      <Divider />
      <HistoryButtons editor={editor} state={state} />

      <Divider />
      <ExportButton
        editor={editor}
        topMargin={topMargin}
        bottomMargin={bottomMargin}
        leftMargin={leftMargin}
        rightMargin={rightMargin}
        orientation={orientation}
      />
    </div>
  )
}
