import { TextAlignButton } from '@/components/tiptap-ui/text-align-button'
import { TEXT_ALIGNMENTS } from '../constants'
import type { ToolbarSectionProps } from '../types'

export function TextAlignmentButtons ({ editor }: ToolbarSectionProps) {
  return (
    <>
      {TEXT_ALIGNMENTS.map(({ align, tooltip }) => (
        <TextAlignButton
          key={align}
          editor={editor}
          align={align}
          hideWhenUnavailable={false}
          showShortcut={false}
          tooltip={tooltip}
        />
      ))}
    </>
  )
}
