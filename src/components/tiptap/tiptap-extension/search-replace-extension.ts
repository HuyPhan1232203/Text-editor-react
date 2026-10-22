import { Extension } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * Find & replace. Matches are found inside each text block (so a match can span bold or
 * colored text) and shown as decorations; the document is only changed by replace.
 */

export interface SearchMatch {
  from: number
  to: number
}

export interface SearchState {
  term: string
  caseSensitive: boolean
  matches: SearchMatch[]
  index: number
  decorations: DecorationSet
}

type SearchMeta = Partial<Pick<SearchState, 'term' | 'caseSensitive' | 'index'>>

export const searchPluginKey = new PluginKey<SearchState>('searchReplace')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchReplace: {
      setSearchTerm: (term: string) => ReturnType
      setSearchCaseSensitive: (caseSensitive: boolean) => ReturnType
      goToSearchMatch: (direction: 1 | -1) => ReturnType
      replaceSearchMatch: (replacement: string) => ReturnType
      replaceAllSearchMatches: (replacement: string) => ReturnType
    }
  }
}

export function findMatches (doc: ProseMirrorNode, term: string, caseSensitive: boolean): SearchMatch[] {
  if (!term) return []

  const needle = caseSensitive ? term : term.toLowerCase()
  const matches: SearchMatch[] = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true

    // The block's text, with the document position of every character
    let text = ''
    const positions: number[] = []

    node.forEach((child, offset) => {
      const start = pos + 1 + offset

      if (child.isText && child.text) {
        text += child.text
        for (let i = 0; i < child.text.length; i++) positions.push(start + i)
      } else {
        // Inline nodes (images, formulas) break a match
        text += '￼'
        positions.push(start)
      }
    })

    const haystack = caseSensitive ? text : text.toLowerCase()
    let index = haystack.indexOf(needle)

    while (index !== -1) {
      matches.push({ from: positions[index], to: positions[index + needle.length - 1] + 1 })
      index = haystack.indexOf(needle, index + needle.length)
    }
    return false
  })

  return matches
}

function buildDecorations (doc: ProseMirrorNode, matches: SearchMatch[], index: number): DecorationSet {
  return DecorationSet.create(doc, matches.map((match, i) =>
    Decoration.inline(match.from, match.to, { class: i === index ? 'search-match search-match-current' : 'search-match' })
  ))
}

function computeState (doc: ProseMirrorNode, term: string, caseSensitive: boolean, index: number): SearchState {
  const matches = findMatches(doc, term, caseSensitive)
  const clamped = matches.length ? Math.min(Math.max(index, 0), matches.length - 1) : -1

  return { term, caseSensitive, matches, index: clamped, decorations: buildDecorations(doc, matches, clamped) }
}

// Selects the current match and scrolls it into view (without moving focus out of the search box)
function revealMatch (tr: Transaction, state: SearchState) {
  const match = state.matches[state.index]

  if (match) tr.setSelection(TextSelection.create(tr.doc, match.from, match.to)).scrollIntoView()
}

function nextState (state: EditorState, meta: SearchMeta): SearchState {
  const current = searchPluginKey.getState(state) as SearchState

  return computeState(
    state.doc,
    meta.term ?? current.term,
    meta.caseSensitive ?? current.caseSensitive,
    meta.index ?? current.index
  )
}

export const SearchReplace = Extension.create({
  name: 'searchReplace',

  addCommands () {
    return {
      setSearchTerm: (term) => ({ state, tr, dispatch }) => {
        if (dispatch) {
          // Jump to the first match after the cursor, like browsers do
          const matches = findMatches(state.doc, term, (searchPluginKey.getState(state) as SearchState).caseSensitive)
          const after = matches.findIndex((match) => match.from >= state.selection.from)
          const index = after === -1 ? 0 : after

          tr.setMeta(searchPluginKey, { term, index })
          revealMatch(tr, nextState(state, { term, index }))
        }
        return true
      },

      setSearchCaseSensitive: (caseSensitive) => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(searchPluginKey, { caseSensitive, index: 0 })
        return true
      },

      goToSearchMatch: (direction) => ({ state, tr, dispatch }) => {
        const current = searchPluginKey.getState(state) as SearchState

        if (!current.matches.length) return false
        if (dispatch) {
          const index = (current.index + direction + current.matches.length) % current.matches.length

          tr.setMeta(searchPluginKey, { index })
          revealMatch(tr, nextState(state, { index }))
        }
        return true
      },

      replaceSearchMatch: (replacement) => ({ state, tr, dispatch }) => {
        const current = searchPluginKey.getState(state) as SearchState
        const match = current.matches[current.index]

        if (!match) return false
        if (dispatch) {
          if (replacement) tr.insertText(replacement, match.from, match.to)
          else tr.delete(match.from, match.to)
          // The next match takes this one's place in the list
          tr.setMeta(searchPluginKey, { index: current.index })
        }
        return true
      },

      replaceAllSearchMatches: (replacement) => ({ state, tr, dispatch }) => {
        const current = searchPluginKey.getState(state) as SearchState

        if (!current.matches.length) return false
        if (dispatch) {
          // One transaction (one undo step), from the end so earlier positions stay valid
          for (const match of [...current.matches].reverse()) {
            if (replacement) tr.insertText(replacement, match.from, match.to)
            else tr.delete(match.from, match.to)
          }
        }
        return true
      }
    }
  },

  addProseMirrorPlugins () {
    return [
      new Plugin<SearchState>({
        key: searchPluginKey,
        state: {
          init: (_, { doc }) => computeState(doc, '', false, -1),
          apply: (tr, value) => {
            const meta = tr.getMeta(searchPluginKey) as SearchMeta | undefined

            if (meta) {
              return computeState(
                tr.doc,
                meta.term ?? value.term,
                meta.caseSensitive ?? value.caseSensitive,
                meta.index ?? value.index
              )
            }
            if (tr.docChanged && value.term) return computeState(tr.doc, value.term, value.caseSensitive, value.index)
            return value
          }
        },
        props: {
          decorations: (state) => searchPluginKey.getState(state)?.decorations
        }
      })
    ]
  }
})
