/**
 * Comment threads, stored in the Yjs document so they are saved with it and synced to everyone
 * in a shared room. The commented text is marked in the document itself (comment-extension.ts).
 *
 * Threads ("comments" map) and messages ("commentMessages" map, keyed by message id) are kept
 * apart, so two people replying to the same thread at once both keep their reply.
 */
import type * as Y from 'yjs'

export interface CommentMessage {
  id: string
  threadId: string
  authorId: string
  authorName: string
  color: string
  text: string
  createdAt: number
}

interface StoredThread {
  id: string
  // The commented text when the thread was created
  quote: string
  resolved: boolean
  createdAt: number
}

export interface CommentThread extends StoredThread {
  messages: CommentMessage[]
}

export interface CommentAuthor {
  id: string
  name: string
  color: string
}

export function commentsMap (ydoc: Y.Doc): Y.Map<StoredThread> {
  return ydoc.getMap<StoredThread>('comments')
}

export function messagesMap (ydoc: Y.Doc): Y.Map<CommentMessage> {
  return ydoc.getMap<CommentMessage>('commentMessages')
}

export function newId (): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Messages are ordered by time; two written in the same millisecond keep their order
let lastCreatedAt = 0

function now (): number {
  lastCreatedAt = Math.max(Date.now(), lastCreatedAt + 1)
  return lastCreatedAt
}

function addMessage (ydoc: Y.Doc, threadId: string, author: CommentAuthor, text: string): void {
  const id = newId()

  messagesMap(ydoc).set(id, {
    id, threadId, authorId: author.id, authorName: author.name, color: author.color, text, createdAt: now()
  })
}

export function readThreads (ydoc: Y.Doc): CommentThread[] {
  const byThread = new Map<string, CommentMessage[]>()

  for (const message of messagesMap(ydoc).values()) {
    const list = byThread.get(message.threadId) ?? []

    list.push(message)
    byThread.set(message.threadId, list)
  }

  return [...commentsMap(ydoc).values()]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((thread) => ({
      ...thread,
      messages: (byThread.get(thread.id) ?? []).sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
    }))
}

export function addThread (ydoc: Y.Doc, id: string, quote: string, author: CommentAuthor, text: string): void {
  ydoc.transact(() => {
    commentsMap(ydoc).set(id, { id, quote, resolved: false, createdAt: now() })
    addMessage(ydoc, id, author, text)
  })
}

export function addReply (ydoc: Y.Doc, threadId: string, author: CommentAuthor, text: string): void {
  addMessage(ydoc, threadId, author, text)
}

export function deleteMessage (ydoc: Y.Doc, messageId: string): void {
  messagesMap(ydoc).delete(messageId)
}

export function setResolved (ydoc: Y.Doc, threadId: string, resolved: boolean, origin?: unknown): void {
  const map = commentsMap(ydoc)
  const thread = map.get(threadId)

  if (thread) ydoc.transact(() => map.set(threadId, { ...thread, resolved }), origin)
}

/** Deletes a thread with all its messages. */
export function deleteThread (ydoc: Y.Doc, threadId: string, origin?: unknown): void {
  ydoc.transact(() => {
    commentsMap(ydoc).delete(threadId)

    const messages = messagesMap(ydoc)

    for (const [id, message] of messages.entries()) {
      if (message.threadId === threadId) messages.delete(id)
    }
  }, origin)
}
