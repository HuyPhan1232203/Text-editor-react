import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { findMatches, SearchReplace, searchPluginKey } from './search-replace-extension'

let editor: Editor | null = null

function createEditor (content: string): Editor {
  editor = new Editor({ extensions: [StarterKit, SearchReplace], content })
  return editor
}

afterEach(() => {
  editor?.destroy()
  editor = null
})

describe('findMatches', () => {
  it('finds matches across marks, ignoring case by default', () => {
    const { state } = createEditor('<p>Hello <strong>Wor</strong>ld and world</p>')
    const matches = findMatches(state.doc, 'world', false)

    expect(matches.map(({ from, to }) => state.doc.textBetween(from, to))).toEqual(['World', 'world'])
  })

  it('respects case sensitivity and does not match across blocks', () => {
    const { state } = createEditor('<p>World</p><p>world</p><p>wor</p><p>ld</p>')

    expect(findMatches(state.doc, 'world', true)).toHaveLength(1)
    expect(findMatches(state.doc, 'world', false)).toHaveLength(2)
  })
})

describe('SearchReplace commands', () => {
  it('replaces the current match, then all remaining ones', () => {
    const editor = createEditor('<p>cat cat cat</p>')

    editor.commands.setSearchTerm('cat')
    expect(searchPluginKey.getState(editor.state)?.matches).toHaveLength(3)

    editor.commands.replaceSearchMatch('dog')
    expect(editor.getText()).toBe('dog cat cat')
    expect(searchPluginKey.getState(editor.state)?.matches).toHaveLength(2)

    editor.commands.replaceAllSearchMatches('bird')
    expect(editor.getText()).toBe('dog bird bird')
    expect(searchPluginKey.getState(editor.state)?.matches).toHaveLength(0)
  })

  it('cycles through matches in both directions', () => {
    const editor = createEditor('<p>a b a b a</p>')

    editor.commands.setSearchTerm('a')
    editor.commands.goToSearchMatch(-1)
    expect(searchPluginKey.getState(editor.state)?.index).toBe(2)
    editor.commands.goToSearchMatch(1)
    expect(searchPluginKey.getState(editor.state)?.index).toBe(0)
  })
})
