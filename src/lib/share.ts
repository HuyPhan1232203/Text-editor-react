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
  const link = roomLink(room, key)

  // Copy the link right away, while the click still counts as a user action (Safari needs that)
  const copied = navigator.clipboard?.writeText(link).then(() => true, () => false) ?? Promise.resolve(false)

  const roomDoc = new Y.Doc()
  const persistence = new IndexeddbPersistence(`room:${room}`, roomDoc)

  await persistence.whenSynced
  Y.applyUpdate(roomDoc, Y.encodeStateAsUpdate(ydoc))
  await storeState(persistence, true)
  await persistence.destroy()
  roomDoc.destroy()
  try {
    // The room tab opens the Share dialog again, saying whether the link is on the clipboard
    sessionStorage.setItem(JUST_SHARED_KEY, JSON.stringify({ room, copied: await copied }))
  } catch {}
  window.location.assign(link)
}

const JUST_SHARED_KEY = 'text-editor-react:just-shared'

/** Set once, in the tab that just created this room: whether its link was copied. */
export function takeJustShared (): { copied: boolean } | null {
  if (!ROOM_NAME) return null
  try {
    const value = JSON.parse(sessionStorage.getItem(JUST_SHARED_KEY) ?? 'null') as { room?: string, copied?: boolean } | null

    sessionStorage.removeItem(JUST_SHARED_KEY)
    return value?.room === ROOM_NAME ? { copied: Boolean(value.copied) } : null
  } catch {
    return null
  }
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

const USER_ID_KEY = 'text-editor-react:user-id'

/** A random id per browser, so one person with several tabs shows up once. */
export function userId (): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY)

    if (!id) {
      id = randomId(12)
      localStorage.setItem(USER_ID_KEY, id)
    }
    return id
  } catch {
    return randomId(12)
  }
}

// Shared documents opened in this browser, to find them again without the link
const RECENT_KEY = 'text-editor-react:recent-rooms'
const MAX_RECENT = 10

export interface RecentRoom {
  room: string
  key: string | null
  title: string
  openedAt: number
}

export function recentRooms (): RecentRoom[] {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as RecentRoom[]

    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveRecent (list: RecentRoom[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {}
}

/** Records the current room (most recent first), keeping its last known title. */
export function rememberRoom (title?: string): void {
  if (!ROOM_NAME) return

  const list = recentRooms()
  const existing = list.find((entry) => entry.room === ROOM_NAME)

  saveRecent([
    { room: ROOM_NAME, key: ROOM_KEY, title: title ?? existing?.title ?? '', openedAt: Date.now() },
    ...list.filter((entry) => entry.room !== ROOM_NAME)
  ])
}

export function forgetRoom (room: string): void {
  saveRecent(recentRooms().filter((entry) => entry.room !== room))
}
