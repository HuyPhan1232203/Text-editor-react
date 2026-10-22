/**
 * Lazy syntax highlighting for code blocks: lowlight and its highlight.js grammars are
 * downloaded in their own chunk, off the critical path.
 *
 * `lazyLowlight` is handed to CodeBlockLowlight right away. Until the grammars arrive it returns
 * no highlighting; `loadLowlight()` then registers them and re-highlights the code blocks.
 */
import type { Editor } from '@tiptap/core'
import type { createLowlight } from 'lowlight'

type Lowlight = ReturnType<typeof createLowlight>

type Root = ReturnType<Lowlight['highlight']>

let lowlight: Lowlight | null = null
let loading: Promise<void> | null = null

const EMPTY: Root = { type: 'root', children: [], data: { language: undefined, relevance: 0 } }

export const lazyLowlight = {
  highlight: (language: string, value: string): Root => lowlight ? lowlight.highlight(language, value) : EMPTY,
  highlightAuto: (value: string): Root => lowlight ? lowlight.highlightAuto(value) : EMPTY,
  listLanguages: (): string[] => lowlight?.listLanguages() ?? [],
  registered: (language: string): boolean => lowlight?.registered(language) ?? false
}

export function loadLowlight (editor: Editor): Promise<void> {
  loading ??= import('lowlight').then(({ common, createLowlight }) => {
    lowlight = createLowlight(common)
  })

  return loading.then(() => {
    if (editor.isDestroyed) return

    // The highlight plugin only recomputes on document changes, so touch each code block
    // with its own attributes (no visible change, kept out of the undo history)
    const { tr } = editor.state

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'codeBlock') tr.setNodeMarkup(pos, undefined, node.attrs)
      return !node.isTextblock
    })
    if (tr.docChanged) editor.view.dispatch(tr.setMeta('addToHistory', false))
  })
}
