/**
 * Sharing without a server: a document is shared through a room link such as
 * `/?room=k3j9x2#key=…`. Peers find each other through the public y-webrtc signaling server
 * and then sync directly over WebRTC.
 *
 * The key sits in the URL fragment, which browsers never send to any server; y-webrtc uses it
 * to encrypt signaling, so only people with the full link can join the room.
 */
import * as Y from 'yjs'
import { IndexeddbPersistence, storeState } from 'y-indexeddb'

const params = new URLSearchParams(window.location.search)
const hash = new URLSearchParams(window.location.hash.slice(1))

export const ROOM_NAME: string | null = params.get('room')

export const ROOM_KEY: string | null = hash.get('key')

const NAME_KEY = 'text-editor-react:user-name'

const COLORS = ['#f97316', '#2563eb', '#16a34a', '#db2777', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626']

function randomId (length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))

  return Array.from(bytes, (byte) => 'abcdefghijkmnpqrstuvwxyz23456789'[byte % 32]).join('')
}

export function roomLink (room: string, key: string | null): string {
  const url = new URL(window.location.pathname, window.location.origin)

  url.searchParams.set('room', room)
  if (key) url.hash = `key=${key}`
  return url.toString()
}

/**
 * Copies the current document (with its header and footer) into a new room and opens it.
 * The copy is written to the room's IndexedDB store, which the room tab loads on start.
 */
export async function startSharing (ydoc: Y.Doc): Promise<void> {
  const room = randomId(10)
  const key = randomId(24)
  const roomDoc = new Y.Doc()
  const persistence = new IndexeddbPersistence(`room:${room}`, roomDoc)

  await persistence.whenSynced
  Y.applyUpdate(roomDoc, Y.encodeStateAsUpdate(ydoc))
  await storeState(persistence, true)
  await persistence.destroy()
  roomDoc.destroy()
  window.location.assign(roomLink(room, key))
}

export function leaveRoom (): void {
  window.location.assign(window.location.pathname)
}

export function savedUserName (): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveUserName (name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {}
}

/** A stable color per name, so a person keeps their color across visits. */
export function colorFor (name: string): string {
  let hash = 0

  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return COLORS[Math.abs(hash) % COLORS.length]
}
