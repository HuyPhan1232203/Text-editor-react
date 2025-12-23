import { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

// Singleton instances
let ydoc: Y.Doc | null = null
let provider: WebrtcProvider | null = null

export function useCollaboration (roomName = 'tiptap-collaboration-room-v1') {
  const initialized = useRef(false)

  useEffect(() => {
    // Chỉ khởi tạo 1 lần
    if (!initialized.current) {
      ydoc = new Y.Doc()
      provider = new WebrtcProvider(roomName, ydoc)
      initialized.current = true
    }

    // Cleanup khi unmount App
    return () => {
      if (initialized.current) {
        provider?.destroy()
        ydoc?.destroy()
        provider = null
        ydoc = null
        initialized.current = false
      }
    }
  }, [roomName])

  return { ydoc, provider }
}
