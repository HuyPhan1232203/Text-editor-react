import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import type * as Y from 'yjs'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { Check, Trash2 } from 'lucide-react'
import { activeCommentId, commentDraftKey, findCommentAnchors } from '@/components/tiptap/tiptap-extension/comment-extension'
import { addReply, addThread, commentsMap, deleteMessage, deleteThread, messagesMap, newId, setResolved } from '@/lib/comments'
import { ySyncPluginKey, yUndoPluginKey } from '@tiptap/y-tiptap'
import type { CommentAuthor, CommentMessage, CommentThread } from '@/lib/comments'
import { colorFor, savedUserName, saveUserName, userId } from '@/lib/share'
import { useCommentThreads } from '../hooks/useCommentThreads'
import { t } from '@/i18n'
import { elementScale } from 'tiptap-a4-pagination'

interface CommentsPanelProps {
  editor: Editor
  ydoc: Y.Doc
}

const DRAFT_ID = '__draft__'
const CARD_GAP = 8
const MAX_QUOTE = 80

function currentAuthor (): CommentAuthor {
  const name = savedUserName() || t('share.anonymous')

  return { id: userId(), name, color: colorFor(name) }
}

function timeAgo (time: number): string {
  const minutes = Math.round((Date.now() - time) / 60000)

  if (minutes < 1) return t('comments.justNow')
  if (minutes < 60) return t('comments.minutesAgo', { n: minutes })

  const hours = Math.round(minutes / 60)

  if (hours < 24) return t('comments.hoursAgo', { n: hours })
  return new Date(time).toLocaleDateString()
}

// Resolving or deleting a thread removes its highlight (a document change) and changes the
// thread. Done as tracked changes, the same Ctrl+Z restores both.
function undoableOrigin (editor: Editor, ydoc: Y.Doc): unknown {
  yUndoPluginKey.getState(editor.state)?.undoManager.addToScope([commentsMap(ydoc), messagesMap(ydoc)])
  return ySyncPluginKey
}

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?'

// Clicks in the panel must not reach the page, which would move the focus into the editor
const keepFocus = (event: MouseEvent) => event.stopPropagation()

function Avatar ({ name, color }: { name: string, color: string }) {
  return (
    <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white' style={{ backgroundColor: color }}>
      {initial(name)}
    </span>
  )
}

function MessageView ({ message, onDelete }: { message: CommentMessage, onDelete?: () => void }) {
  return (
    <div className='group/message flex gap-2'>
      <Avatar name={message.authorName} color={message.color} />
      <div className='min-w-0 flex-1'>
        <div className='flex items-baseline gap-2'>
          <span className='truncate text-sm font-medium text-gray-900'>{message.authorName}</span>
          <span className='shrink-0 text-xs text-gray-500'>{timeAgo(message.createdAt)}</span>
          {onDelete && (
            <button
              type='button'
              onClick={onDelete}
              className='ml-auto hidden text-xs text-gray-500 hover:text-red-600 group-hover/message:inline'
            >
              {t('comments.delete')}
            </button>
          )}
        </div>
        <p className='whitespace-pre-wrap break-words text-sm text-gray-800'>{message.text}</p>
      </div>
    </div>
  )
}

interface ComposerProps {
  placeholder: string
  submitLabel: string
  autoFocus?: boolean
  askName?: boolean
  onSubmit: (text: string) => void
  onCancel: () => void
}

// Text box for a new comment or a reply: Ctrl/Cmd+Enter posts, Escape cancels
function Composer ({ placeholder, submitLabel, autoFocus, askName, onSubmit, onCancel }: ComposerProps) {
  const [text, setText] = useState('')
  const [name, setName] = useState(savedUserName)
  const textRef = useRef<HTMLTextAreaElement>(null)

  // Focus after the editor has settled: TipTap's focus() runs a frame later and would take it back
  useEffect(() => {
    if (!autoFocus) return

    const frame = requestAnimationFrame(() => requestAnimationFrame(() => textRef.current?.focus()))

    return () => cancelAnimationFrame(frame)
  }, [autoFocus])

  const submit = () => {
    if (!text.trim()) return
    if (askName && name.trim()) saveUserName(name.trim())
    onSubmit(text.trim())
    setText('')
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      submit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  return (
    <div className='grid gap-2'>
      {askName && !savedUserName() && (
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('share.name')}
          aria-label={t('share.name')}
          maxLength={40}
          className='h-8 rounded border border-gray-300 px-2 text-sm outline-none focus:border-blue-500'
        />
      )}
      <textarea
        ref={textRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={2}
        className='w-full resize-none rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500'
      />
      <div className='flex justify-end gap-2'>
        <button type='button' onClick={onCancel} className='h-8 rounded px-3 text-sm text-gray-700 hover:bg-gray-100'>
          {t('comments.cancel')}
        </button>
        <button
          type='button'
          onClick={submit}
          disabled={!text.trim()}
          className='h-8 rounded bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40'
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * Comment cards in the right margin, each next to its text, like Google Docs.
 * The card of the thread under the cursor is expanded and sits exactly next to its text;
 * the others make room above and below it.
 */
export const CommentsPanel = memo(function CommentsPanel ({ editor, ydoc }: CommentsPanelProps) {
  const threads = useCommentThreads(ydoc)
  const { anchors, draft, activeId } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const found = findCommentAnchors(editor.state.doc)

      return {
        // Only the ids matter for rendering; positions are measured from the DOM
        anchors: [...found.keys()].join(','),
        draft: commentDraftKey.getState(editor.state),
        activeId: activeCommentId(editor.state)
      }
    }
  })

  const panelRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<string, HTMLDivElement>())
  const [tops, setTops] = useState<Record<string, number>>({})
  // Bumped on reflow (typing, images loading, page setup changes), so the cards are placed again
  const [layoutVersion, setLayoutVersion] = useState(0)

  const anchorIds = new Set(anchors ? anchors.split(',') : [])
  // A card shows while its text is marked: resolving removes the mark (Ctrl+Z brings the
  // mark and the card back), and a thread whose text was deleted has none
  const visible = threads.filter((thread) => anchorIds.has(thread.id))
  const cardIds = [...(draft ? [DRAFT_ID] : []), ...visible.map((thread) => thread.id)]
  const focusedId = draft ? DRAFT_ID : activeId
  // Changes whenever a card appears, grows (new reply) or the focus moves
  const layoutKey = JSON.stringify([cardIds, focusedId, visible.map((thread) => thread.messages.length)])

  useEffect(() => {
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setLayoutVersion((version) => version + 1))
    }
    const observer = new ResizeObserver(schedule)

    observer.observe(editor.view.dom)
    editor.on('update', schedule)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      editor.off('update', schedule)
    }
  }, [editor])

  // Place each card next to its text without overlapping the others (after the cards rendered,
  // so their heights are known)
  useEffect(() => {
    const [ids, focused] = JSON.parse(layoutKey) as [string[], string | null]
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current

      if (!panel) return

      const origin = panel.getBoundingClientRect().top
      // Cards are positioned in page pixels; screen distances are divided by the zoom
      const scale = elementScale(panel)
      const wanted = new Map<string, number>()

      for (const id of ids) {
        const selector = id === DRAFT_ID ? '.comment-draft' : `.comment-mark[data-comment-thread="${CSS.escape(id)}"]`
        const anchor = editor.view.dom.querySelector(selector)

        if (anchor) wanted.set(id, (anchor.getBoundingClientRect().top - origin) / scale)
      }

      const ordered = [...wanted.keys()].sort((a, b) => (wanted.get(a) ?? 0) - (wanted.get(b) ?? 0))
      const height = (id: string) => cardRefs.current.get(id)?.offsetHeight ?? 80
      const next: Record<string, number> = {}
      const pivot = focused && wanted.has(focused) ? ordered.indexOf(focused) : -1

      if (pivot === -1) {
        let bottom = -Infinity

        for (const id of ordered) {
          next[id] = Math.max(wanted.get(id) ?? 0, bottom + CARD_GAP)
          bottom = next[id] + height(id)
        }
      } else {
        // The focused card stays next to its text; cards below move down, cards above move up
        next[ordered[pivot]] = wanted.get(ordered[pivot]) ?? 0

        let bottom = next[ordered[pivot]] + height(ordered[pivot])

        for (const id of ordered.slice(pivot + 1)) {
          next[id] = Math.max(wanted.get(id) ?? 0, bottom + CARD_GAP)
          bottom = next[id] + height(id)
        }

        let top = next[ordered[pivot]]

        for (const id of ordered.slice(0, pivot).reverse()) {
          next[id] = Math.min(wanted.get(id) ?? 0, top - CARD_GAP - height(id))
          top = next[id]
        }
      }

      setTops((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    })

    return () => cancelAnimationFrame(frame)
  }, [editor, layoutKey, layoutVersion])

  // Keeps each card's element, to measure its height
  const cardRef = (id: string) => (element: HTMLDivElement | null) => {
    if (element) cardRefs.current.set(id, element)
    else cardRefs.current.delete(id)
  }

  const focusThread = useCallback((id: string) => {
    editor.commands.focusCommentThread(id)
  }, [editor])

  const postThread = (text: string) => {
    if (!draft) return

    const id = newId()
    const quote = editor.state.doc.textBetween(draft.from, draft.to, ' ').slice(0, MAX_QUOTE)

    addThread(ydoc, id, quote, currentAuthor(), text)
    editor.chain().focus().applyCommentDraft(id).run()
  }

  const resolve = (thread: CommentThread) => {
    editor.chain().focus().removeCommentMarks(thread.id).run()
    setResolved(ydoc, thread.id, true, undoableOrigin(editor, ydoc))
  }

  const remove = (thread: CommentThread) => {
    editor.chain().focus().removeCommentMarks(thread.id).run()
    deleteThread(ydoc, thread.id, undoableOrigin(editor, ydoc))
  }

  if (!cardIds.length) return null

  const author = currentAuthor()

  return (
    <div
      ref={panelRef}
      className='comments-panel absolute right-0 top-0 w-72'
      aria-label={t('comments.panel')}
      onClick={keepFocus}
    >
      {draft && (
        <div
          ref={cardRef(DRAFT_ID)}
          className='comment-card is-focused absolute w-72 rounded-lg border border-blue-200 bg-white p-3 shadow-lg'
          style={{ top: tops[DRAFT_ID] ?? 0, opacity: DRAFT_ID in tops ? 1 : 0 }}
        >
          <div className='mb-2 flex items-center gap-2'>
            <Avatar name={author.name} color={author.color} />
            <span className='text-sm font-medium text-gray-900'>{author.name}</span>
          </div>
          <Composer
            placeholder={t('comments.placeholder')}
            submitLabel={t('comments.post')}
            autoFocus
            askName
            onSubmit={postThread}
            onCancel={() => editor.chain().focus().cancelCommentDraft().run()}
          />
        </div>
      )}
      {visible.map((thread) => {
        const focused = thread.id === focusedId
        const [first, ...replies] = thread.messages

        return (
          <div
            key={thread.id}
            ref={cardRef(thread.id)}
            role='button'
            tabIndex={0}
            onClick={() => { if (!focused) focusThread(thread.id) }}
            onKeyDown={(event) => { if (event.key === 'Enter' && !focused && event.target === event.currentTarget) focusThread(thread.id) }}
            className={`comment-card absolute w-72 rounded-lg border bg-white p-3 transition-[top,transform,box-shadow] duration-150 ${
              focused ? 'is-focused -translate-x-3 border-blue-200 shadow-lg' : 'cursor-pointer border-gray-200 shadow-sm hover:shadow-md'
            }`}
            style={{ top: tops[thread.id] ?? 0, opacity: thread.id in tops ? 1 : 0 }}
          >
            {first && (
              <div className='flex items-start gap-2'>
                <div className='min-w-0 flex-1'><MessageView message={first} /></div>
                {focused && (
                  <div className='flex shrink-0 gap-0.5'>
                    <button
                      type='button'
                      onClick={() => resolve(thread)}
                      className='rounded p-1 text-blue-600 hover:bg-blue-50'
                      title={t('comments.resolve')}
                      aria-label={t('comments.resolve')}
                    >
                      <Check className='h-4 w-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() => remove(thread)}
                      className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600'
                      title={t('comments.deleteThread')}
                      aria-label={t('comments.deleteThread')}
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </div>
            )}
            {focused
              ? (
                <>
                  {replies.length > 0 && (
                    <div className='mt-3 grid gap-3 border-t border-gray-100 pt-3'>
                      {replies.map((reply) => (
                        <MessageView
                          key={reply.id}
                          message={reply}
                          onDelete={reply.authorId === author.id
                            ? () => deleteMessage(ydoc, reply.id)
                            : undefined}
                        />
                      ))}
                    </div>
                  )}
                  <div className='mt-3'>
                    <Composer
                      placeholder={t('comments.reply')}
                      submitLabel={t('comments.replyButton')}
                      onSubmit={(text) => addReply(ydoc, thread.id, currentAuthor(), text)}
                      onCancel={() => editor.commands.focus()}
                    />
                  </div>
                </>
              )
              : replies.length > 0 && (
                <p className='mt-2 text-xs font-medium text-blue-700'>
                  {replies.length === 1 ? t('comments.oneReply') : t('comments.replies', { n: replies.length })}
                </p>
              )}
          </div>
        )
      })}
    </div>
  )
})
