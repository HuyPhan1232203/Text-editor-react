import { Extension } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion'
import {
  CheckSquare, Code2, Heading1, Heading2, Heading3, Image, List, ListOrdered,
  Minus, Pilcrow, Quote, Sigma, Table, Youtube
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SlashMenu } from '@/components/tiptap/TipTapEditor/components/SlashMenu'
import type { SlashMenuHandle } from '@/components/tiptap/TipTapEditor/components/SlashMenu'
import { t } from '@/i18n'
import type { MessageKey } from '@/i18n'

/**
 * Notion-style block menu: type "/" at the start of a line or after a space,
 * filter by typing, pick with the arrow keys and Enter.
 */

export interface SlashItem {
  title: MessageKey
  description: MessageKey
  icon: LucideIcon
  // Extra words the filter matches (English and Vietnamese)
  keywords: string
  group: 'basic' | 'insert'
  // Markdown shortcut that does the same while typing
  shortcut?: string
  run: (editor: Editor, range: Range) => void
}

export function promptYoutube (editor: Editor, range?: Range) {
  const src = window.prompt(t('slash.youtubePrompt'))
  const chain = editor.chain().focus()

  if (range) chain.deleteRange(range)
  if (src) chain.setYoutubeVideo({ src })
  chain.run()
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: 'slash.text',
    group: 'basic',
    description: 'slash.textHint',
    icon: Pilcrow,
    keywords: 'paragraph text van ban',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run()
  },
  {
    title: 'slash.heading1',
    group: 'basic',
    shortcut: '#',
    description: 'slash.heading1Hint',
    icon: Heading1,
    keywords: 'h1 title heading tieu de',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
  },
  {
    title: 'slash.heading2',
    group: 'basic',
    shortcut: '##',
    description: 'slash.heading2Hint',
    icon: Heading2,
    keywords: 'h2 subtitle heading tieu de',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
  },
  {
    title: 'slash.heading3',
    group: 'basic',
    shortcut: '###',
    description: 'slash.heading3Hint',
    icon: Heading3,
    keywords: 'h3 heading tieu de',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
  },
  {
    title: 'slash.bulletList',
    group: 'basic',
    shortcut: '-',
    description: 'slash.bulletListHint',
    icon: List,
    keywords: 'ul bullet unordered danh sach',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run()
  },
  {
    title: 'slash.orderedList',
    group: 'basic',
    shortcut: '1.',
    description: 'slash.orderedListHint',
    icon: ListOrdered,
    keywords: 'ol numbered ordered danh sach so',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run()
  },
  {
    title: 'slash.taskList',
    group: 'basic',
    shortcut: '[]',
    description: 'slash.taskListHint',
    icon: CheckSquare,
    keywords: 'todo task checkbox checklist viec',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run()
  },
  {
    title: 'slash.quote',
    group: 'basic',
    shortcut: '>',
    description: 'slash.quoteHint',
    icon: Quote,
    keywords: 'blockquote quote trich dan',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run()
  },
  {
    title: 'slash.codeBlock',
    group: 'insert',
    shortcut: '```',
    description: 'slash.codeBlockHint',
    icon: Code2,
    keywords: 'code snippet pre ma',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
  },
  {
    title: 'slash.table',
    group: 'insert',
    description: 'slash.tableHint',
    icon: Table,
    keywords: 'table grid bang',
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  },
  {
    title: 'slash.image',
    group: 'insert',
    description: 'slash.imageHint',
    icon: Image,
    keywords: 'image picture photo upload anh hinh',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setImageUploadNode().run()
  },
  {
    title: 'slash.math',
    group: 'insert',
    description: 'slash.mathHint',
    icon: Sigma,
    keywords: 'math formula latex equation cong thuc toan',
    run: (editor, range) => {
      const latex = window.prompt(t('toolbar.blockMathPrompt'))
      const chain = editor.chain().focus().deleteRange(range)

      if (latex) chain.insertBlockMath({ latex })
      chain.run()
    }
  },
  {
    title: 'slash.divider',
    group: 'insert',
    shortcut: '---',
    description: 'slash.dividerHint',
    icon: Minus,
    keywords: 'hr divider line separator duong ke',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run()
  },
  {
    title: 'slash.youtube',
    group: 'insert',
    description: 'slash.youtubeHint',
    icon: Youtube,
    keywords: 'youtube video embed',
    run: promptYoutube
  }
]

// Lowercase without Vietnamese accents, so "tieu de" matches "Tiêu đề"
const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

export function filterSlashItems (query: string): SlashItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)

  return SLASH_ITEMS.filter((item) => {
    const haystack = normalize(`${t(item.title)} ${item.keywords}`)

    return words.every((word) => haystack.includes(word))
  })
}

function renderMenu () {
  let renderer: ReactRenderer<SlashMenuHandle> | null = null

  const place = (props: SuggestionProps<SlashItem>) => {
    const rect = props.clientRect?.()
    const element = renderer?.element as HTMLElement | undefined

    if (!rect || !element) return

    // Below the cursor, or above it when there is no room left in the window
    const height = element.offsetHeight
    const below = rect.bottom + 6
    const top = below + height > window.innerHeight - 8 ? Math.max(8, rect.top - height - 6) : below

    element.style.top = `${top}px`
    element.style.left = `${Math.min(rect.left, window.innerWidth - element.offsetWidth - 8)}px`
  }

  return {
    onStart: (props: SuggestionProps<SlashItem>) => {
      renderer = new ReactRenderer(SlashMenu, { props, editor: props.editor })

      const element = renderer.element as HTMLElement

      element.style.position = 'fixed'
      element.style.zIndex = '50'
      document.body.appendChild(element)
      requestAnimationFrame(() => place(props))
    },
    onUpdate: (props: SuggestionProps<SlashItem>) => {
      renderer?.updateProps(props)
      requestAnimationFrame(() => place(props))
    },
    // Escape is handled by the suggestion plugin, which then calls onExit
    onKeyDown: (props: SuggestionKeyDownProps) => renderer?.ref?.onKeyDown(props.event) ?? false,
    onExit: () => {
      renderer?.destroy()
      renderer?.element.remove()
      renderer = null
    }
  }
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins () {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        pluginKey: new PluginKey('slashCommand'),
        char: '/',
        items: ({ query }) => filterSlashItems(query),
        command: ({ editor, range, props }) => props.run(editor, range),
        // Not inside code, where "/" is ordinary text
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)

          return $from.parent.type.name !== 'codeBlock' && !$from.marks().some((mark) => mark.type.name === 'code')
        },
        render: renderMenu
      })
    ]
  }
})
