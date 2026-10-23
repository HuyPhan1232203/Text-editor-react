import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type * as Y from 'yjs'
import { commentsMap, messagesMap, readThreads } from '@/lib/comments'
import type { CommentThread } from '@/lib/comments'

/** All comment threads of the document, live from the Yjs document. */
export function useCommentThreads (ydoc: Y.Doc): CommentThread[] {
  const subscribe = useCallback((onChange: () => void) => {
    const maps = [commentsMap(ydoc), messagesMap(ydoc)] as Y.Map<unknown>[]

    maps.forEach((map) => map.observe(onChange))
    return () => maps.forEach((map) => map.unobserve(onChange))
  }, [ydoc])

  // Serialized, so the snapshot only changes when a thread does
  const snapshot = useSyncExternalStore(subscribe, () => JSON.stringify(readThreads(ydoc)))

  return useMemo(() => JSON.parse(snapshot) as CommentThread[], [snapshot])
}
