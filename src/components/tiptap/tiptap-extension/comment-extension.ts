import { Mark, mergeAttributes } from '@tiptap/core'
import type { Mark as ProseMirrorMark, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { EditorState } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * Comments anchored to text, like Google Docs. The commented text carries a `comment` mark
 * with the thread id; the thread itself (messages, resolved) lives in the Yjs document,
 * see src/lib/comments.ts.
 *
 * While a new comment is being written, its range is a draft: a highlight decoration that
 * follows edits, and only becomes a mark when the comment is posted.
 */

export interface CommentDraft {
  from: number
  to: number
}

export const commentDraftKey = new PluginKey<CommentDraft | null>('commentDraft')

// A thread opened from its card. It stays active until the cursor moves, so a thread can be
// opened even where the cursor position is ambiguous (adjacent one-character comments)
const commentFocusKey = new PluginKey<string | null>('commentFocus')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /** Starts a comment on the selected text, or opens the comment already on it. */
      startCommentDraft: () => ReturnType
      cancelCommentDraft: () => ReturnType
      /** Turns the draft into a comment mark for the thread. */
      applyCommentDraft: (threadId: string) => ReturnType
      /** Makes a thread active (its card expanded), with the cursor at its text. */
      focusCommentThread: (threadId: string) => ReturnType
      /** Removes a thread's highlight everywhere in the document. */
      removeCommentMarks: (threadId: string) => ReturnType
    }
  }
}

/** Range of every thread's text in the document (from the first to the last marked character). */
export function findCommentAnchors (doc: ProseMirrorNode): Map<string, CommentDraft> {
  const anchors = new Map<string, CommentDraft>()

  doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'comment') continue

      const id = mark.attrs.threadId as string
      const anchor = anchors.get(id)

      if (anchor) anchor.to = pos + node.nodeSize
      else anchors.set(id, { from: pos, to: pos + node.nodeSize })
    }
    return false
  })

  return anchors
}

/** The thread under the cursor, if any. */
export function activeCommentId (state: EditorState): string | null {
  const focused = commentFocusKey.getState(state)

  if (focused) return focused

  const { $from, empty } = state.selection
  const commentIn = (marks: readonly ProseMirrorMark[] | undefined) =>
    marks?.find((mark) => mark.type.name === 'comment')?.attrs.threadId as string | undefined

  // Inside a selection, look at the first selected character
  if (!empty) return commentIn(state.doc.resolve(Math.min($from.pos + 1, state.doc.content.size)).marks()) ?? null

  // The mark is not inclusive, so at its edges (always the case for a one-character comment)
  // the characters on either side of the cursor are checked too
  return commentIn($from.marks()) ?? commentIn($from.nodeAfter?.marks) ?? commentIn($from.nodeBefore?.marks) ?? null
}

export const Comment = Mark.create({
  name: 'comment',

  // Typing right after commented text does not extend the comment
  inclusive: false,

  addAttributes () {
    return {
      threadId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-thread'),
        renderHTML: (attributes) => ({ 'data-comment-thread': attributes.threadId })
      }
    }
  },

  parseHTML () {
    return [{ tag: 'span[data-comment-thread]' }]
  },

  renderHTML ({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'comment-mark' }), 0]
  },

  addCommands () {
    return {
      startCommentDraft: () => ({ state, tr, dispatch }) => {
        const { from, to, empty } = state.selection

        if (empty) return false

        // Text can carry one comment: on commented text, open that thread instead (to reply),
        // rather than replacing its mark and losing the thread
        let existing = -1

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (existing === -1 && node.isText && node.marks.some((mark) => mark.type === this.type)) {
            existing = Math.max(pos, from)
          }
        })
        if (existing !== -1) {
          if (dispatch) tr.setSelection(TextSelection.create(tr.doc, existing + 1))
          return true
        }

        if (dispatch) tr.setMeta(commentDraftKey, { from, to })
        return true
      },

      cancelCommentDraft: () => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(commentDraftKey, null)
        return true
      },

      applyCommentDraft: (threadId) => ({ state, tr, dispatch }) => {
        const draft = commentDraftKey.getState(state)

        if (!draft || draft.from >= draft.to) return false
        if (dispatch) {
          tr.addMark(draft.from, draft.to, this.type.create({ threadId }))
          tr.setMeta(commentDraftKey, null)
        }
        return true
      },

      focusCommentThread: (threadId) => ({ state, tr, dispatch }) => {
        const anchor = findCommentAnchors(state.doc).get(threadId)

        if (!anchor) return false
        if (dispatch) {
          tr.setSelection(TextSelection.create(tr.doc, Math.min(anchor.from + 1, anchor.to)))
          tr.setMeta(commentFocusKey, threadId)
        }
        return true
      },

      removeCommentMarks: (threadId) => ({ state, tr, dispatch }) => {
        let found = false

        state.doc.descendants((node, pos) => {
          if (!node.isText) return true

          const mark = node.marks.find((candidate) =>
            candidate.type === this.type && candidate.attrs.threadId === threadId)

          if (mark) {
            found = true
            if (dispatch) tr.removeMark(pos, pos + node.nodeSize, mark)
          }
          return false
        })
        return found
      }
    }
  },

  addKeyboardShortcuts () {
    return {
      // Same shortcut as Google Docs and Word
      'Mod-Alt-m': () => this.editor.commands.startCommentDraft()
    }
  },

  addProseMirrorPlugins () {
    return [
      new Plugin<string | null>({
        key: commentFocusKey,
        state: {
          init: () => null,
          apply: (tr, focused) => {
            const meta = tr.getMeta(commentFocusKey) as string | undefined

            if (meta !== undefined) return meta
            // Any other cursor move or edit hands the choice back to the cursor position
            return tr.selectionSet || tr.docChanged ? null : focused
          }
        }
      }),
      new Plugin<CommentDraft | null>({
        key: commentDraftKey,
        state: {
          init: () => null,
          apply: (tr, draft) => {
            const meta = tr.getMeta(commentDraftKey) as CommentDraft | null | undefined

            if (meta !== undefined) return meta
            if (!draft || !tr.docChanged) return draft

            // Keep the draft on the same text while the document changes
            const from = tr.mapping.map(draft.from, 1)
            const to = tr.mapping.map(draft.to, -1)

            return from < to ? { from, to } : null
          }
        },
        props: {
          decorations: (state) => {
            const draft = commentDraftKey.getState(state)

            return draft
              ? DecorationSet.create(state.doc, [Decoration.inline(draft.from, draft.to, { class: 'comment-mark comment-draft' })])
              : null
          }
        }
      }),
      // The thread under the cursor is shown darker, with its card in the margin
      new Plugin({
        key: new PluginKey('commentActive'),
        props: {
          decorations: (state) => {
            const id = activeCommentId(state)

            if (!id) return null

            const decorations: Decoration[] = []

            state.doc.descendants((node, pos) => {
              if (!node.isText) return true
              if (node.marks.some((mark) => mark.type.name === 'comment' && mark.attrs.threadId === id)) {
                decorations.push(Decoration.inline(pos, pos + node.nodeSize, { class: 'comment-mark-active' }))
              }
              return false
            })
            return DecorationSet.create(state.doc, decorations)
          }
        }
      })
    ]
  }
})
