import { ButtonGroup } from '@/components/tiptap/tiptap-ui-primitive/button'
import { HIGHLIGHT_COLORS } from '../constants'
import type { ToolbarSectionProps } from '../types'
import { ColorHighlightButton } from '@/components/tiptap/tiptap-ui/color-highlight-button'

export function HighlightButtons ({ editor }: ToolbarSectionProps) {
  return (
    <ButtonGroup orientation='horizontal'>
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
    </ButtonGroup>
  )
}
