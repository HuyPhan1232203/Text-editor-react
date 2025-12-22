import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export const ydoc = new Y.Doc()

// URL server y-websocket của bạn
export const provider = new WebsocketProvider(
  'wss://your-y-websocket-server', // ví dụ: 'wss://demos.yjs.dev'
  'your-room-id',                  // id tài liệu, ví dụ: 'demo-room-1'
  ydoc
)
