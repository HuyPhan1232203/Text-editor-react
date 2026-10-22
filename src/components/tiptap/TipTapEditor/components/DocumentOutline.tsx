import { memo } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { t } from '@/i18n'

interface DocumentOutlineProps {
  editor: Editor
}

interface OutlineItem {
  level: number
  text: string
  pos: number
}

/** Headings of the document; the one containing the cursor is highlighted, a click jumps to it. */
export const DocumentOutline = memo(function DocumentOutline ({ editor }: DocumentOutlineProps) {
  const { items, active } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const items: OutlineItem[] = []
      const cursor = editor.state.selection.from
      let active = -1

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const text = node.textContent.trim()

          if (text) {
            if (pos <= cursor) active = items.length
            items.push({ level: node.attrs.level as number, text, pos })
          }
          return false
        }
        // Headings can sit inside blockquotes or table cells, but not inside text blocks
        return !node.isTextblock
      })
      return { items, active }
    }
  })

  const goTo = (pos: number) => {
    const container = editor.view.dom.closest('.editor-scroll-container')
    const target = editor.view.nodeDOM(pos)

    editor.chain().setTextSelection(pos + 1).focus(undefined, { scrollIntoView: false }).run()
    if (container && target instanceof HTMLElement) {
      const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top

      container.scrollTo({ top: container.scrollTop + offset - 48, behavior: 'smooth' })
    }
  }

  if (!items.length) {
    return <p className='px-4 py-6 text-sm text-gray-500'>{t('outline.empty')}</p>
  }

  // Indent relative to the biggest heading used, so a document starting at H2 is not indented
  const minLevel = Math.min(...items.map((item) => item.level))

  return (
    <ul className='w-full px-2 py-4'>
      {items.map((item, index) => (
        <li key={`${item.pos}-${index}`}>
          <button
            type='button'
            onClick={() => goTo(item.pos)}
            title={item.text}
            aria-current={index === active ? 'location' : undefined}
            className={`block w-full truncate rounded px-2 py-1 text-left text-sm ${
              index === active ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-200'
            }`}
            style={{ paddingLeft: 8 + (item.level - minLevel) * 12 }}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  )
})
