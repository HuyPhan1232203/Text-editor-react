import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'
import { activeCommentId, Comment, commentDraftKey, findCommentAnchors } from './comment-extension'
import { addReply, addThread, deleteMessage, deleteThread, readThreads, setResolved } from '@/lib/comments'

let editor: Editor | null = null

function createEditor (content: string): Editor {
  editor = new Editor({ extensions: [StarterKit, Comment], content })
  return editor
}

afterEach(() => {
  editor?.destroy()
  editor = null
})

// Position of a piece of text in the document
function find (editor: Editor, text: string): { from: number, to: number } {
  let from = -1

  editor.state.doc.descendants((node, pos) => {
    if (from === -1 && node.isText && node.text?.includes(text)) from = pos + node.text.indexOf(text)
  })
  return { from, to: from + text.length }
}

describe('comment extension', () => {
  it('turns a draft into a comment mark that follows edits', () => {
    const editor = createEditor('<p>Hello brave new world</p>')
    const range = find(editor, 'brave')

    editor.chain().setTextSelection(range).startCommentDraft().run()
    expect(commentDraftKey.getState(editor.state)).toEqual(range)

    // Typing before the draft moves it along
    editor.chain().insertContentAt(1, 'Oh, ').run()
    editor.commands.applyCommentDraft('t1')

    const anchor = findCommentAnchors(editor.state.doc).get('t1')

    expect(anchor && editor.state.doc.textBetween(anchor.from, anchor.to)).toBe('brave')
    expect(commentDraftKey.getState(editor.state)).toBeNull()
    expect(editor.getHTML()).toContain('<span data-comment-thread="t1" class="comment-mark">brave</span>')
  })

  it('does not start a comment without selected text, and can cancel a draft', () => {
    const editor = createEditor('<p>Hello</p>')

    expect(editor.commands.startCommentDraft()).toBe(false)
    editor.chain().setTextSelection({ from: 1, to: 3 }).startCommentDraft().run()
    editor.commands.cancelCommentDraft()
    expect(commentDraftKey.getState(editor.state)).toBeNull()
    expect(editor.commands.applyCommentDraft('t1')).toBe(false)
  })

  it('opens the existing thread instead of stacking a second comment on the same text', () => {
    const editor = createEditor('<p>one <span data-comment-thread="a">two</span> three</p>')
    const two = find(editor, 'two')

    editor.chain().setTextSelection({ from: two.from - 2, to: two.to }).startCommentDraft().run()
    expect(commentDraftKey.getState(editor.state)).toBeNull()
    expect(activeCommentId(editor.state)).toBe('a')
  })

  it('finds a one-character comment under the cursor', () => {
    const editor = createEditor('<p>a<span data-comment-thread="x">b</span>c</p>')
    const b = find(editor, 'b')

    editor.commands.setTextSelection(b.from)
    expect(activeCommentId(editor.state)).toBe('x')
    editor.commands.setTextSelection(b.to)
    expect(activeCommentId(editor.state)).toBe('x')
  })

  it('opens a thread from its card, even between adjacent one-character comments', () => {
    const editor = createEditor('<p><span data-comment-thread="x">a</span><span data-comment-thread="y">b</span><span data-comment-thread="z">c</span></p>')

    editor.commands.focusCommentThread('y')
    expect(activeCommentId(editor.state)).toBe('y')
    // Moving the cursor goes back to the thread at the cursor
    editor.commands.setTextSelection(1)
    expect(activeCommentId(editor.state)).toBe('x')
  })

  it('finds the thread under the cursor and removes a thread everywhere', () => {
    const editor = createEditor('<p>one <span data-comment-thread="a">two</span> three <span data-comment-thread="a">four</span></p>')

    editor.commands.setTextSelection(find(editor, 'two').from + 1)
    expect(activeCommentId(editor.state)).toBe('a')
    editor.commands.setTextSelection(find(editor, 'three').from + 1)
    expect(activeCommentId(editor.state)).toBeNull()

    // One anchor spanning from the first to the last marked text
    const anchor = findCommentAnchors(editor.state.doc).get('a')

    expect(anchor && editor.state.doc.textBetween(anchor.from, anchor.to)).toBe('two three four')

    editor.commands.removeCommentMarks('a')
    expect(findCommentAnchors(editor.state.doc).size).toBe(0)
    expect(editor.getText()).toBe('one two three four')
  })
})

describe('comment threads', () => {
  const alice = { id: 'u1', name: 'Alice', color: '#f97316' }
  const bob = { id: 'u2', name: 'Bob', color: '#2563eb' }

  it('stores threads, replies, resolution and deletion in the Yjs document', () => {
    const ydoc = new Y.Doc()

    addThread(ydoc, 't1', 'brave', alice, 'Too dramatic?')
    addReply(ydoc, 't1', bob, 'Keep it')
    expect(readThreads(ydoc)[0].messages.map((message) => message.authorName)).toEqual(['Alice', 'Bob'])

    deleteMessage(ydoc, readThreads(ydoc)[0].messages[1].id)
    expect(readThreads(ydoc)[0].messages).toHaveLength(1)

    setResolved(ydoc, 't1', true)
    expect(readThreads(ydoc)[0].resolved).toBe(true)

    deleteThread(ydoc, 't1')
    expect(readThreads(ydoc)).toHaveLength(0)
  })

  it('keeps both replies when two people reply at the same time', () => {
    const a = new Y.Doc()
    const b = new Y.Doc()

    addThread(a, 't1', 'quote', alice, 'Question')
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a))
    // Offline from each other, then synced
    addReply(a, 't1', alice, 'From Alice')
    addReply(b, 't1', bob, 'From Bob')
    Y.applyUpdate(a, Y.encodeStateAsUpdate(b))
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a))

    expect(readThreads(a)[0].messages.map((message) => message.text).sort()).toEqual(['From Alice', 'From Bob', 'Question'])
    expect(readThreads(b)[0].messages).toHaveLength(3)
  })

  it('syncs threads between two documents', () => {
    const a = new Y.Doc()
    const b = new Y.Doc()

    a.on('update', (update: Uint8Array) => Y.applyUpdate(b, update))
    addThread(a, 't1', 'quote', alice, 'Hi')
    expect(readThreads(b)[0].messages[0].text).toBe('Hi')
  })
})
