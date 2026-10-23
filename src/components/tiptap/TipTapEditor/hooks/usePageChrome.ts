import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type * as Y from 'yjs'
import { chromeMap, readChrome } from '@/lib/page-chrome'
import type { PageChrome } from '@/lib/page-chrome'

/** Header / footer text of the document, live from the Yjs document. */
export function usePageChrome (ydoc: Y.Doc): [PageChrome, (key: keyof PageChrome, value: string) => void] {
  const subscribe = useCallback((onChange: () => void) => {
    const map = chromeMap(ydoc)

    map.observe(onChange)
    return () => map.unobserve(onChange)
  }, [ydoc])

  // Serialized, so the snapshot only changes when the text does
  const snapshot = useSyncExternalStore(subscribe, () => JSON.stringify(readChrome(ydoc)))

  const update = useCallback((key: keyof PageChrome, value: string) => {
    chromeMap(ydoc).set(key, value)
  }, [ydoc])

  const chrome = useMemo(() => JSON.parse(snapshot) as PageChrome, [snapshot])

  return [chrome, update]
}
