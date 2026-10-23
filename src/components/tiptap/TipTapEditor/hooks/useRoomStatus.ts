import { useEffect, useState } from 'react'
import type { WebrtcProvider } from 'y-webrtc'
import { colorFor } from '@/lib/share'

export type ConnectionStatus = 'connecting' | 'connected' | 'offline'

export interface Peer {
  // One entry per person (user id), even with several tabs open
  key: string
  clientIds: number[]
  name: string
  color: string
  self: boolean
}

export interface RoomStatus {
  status: ConnectionStatus
  peers: Peer[]
  // Number of other people in the room
  others: number
}

// How long to wait for the signaling server before reporting the room as unreachable
const CONNECT_TIMEOUT_MS = 10_000
const CHECK_INTERVAL_MS = 2_000

function readPeers (provider: WebrtcProvider): Peer[] {
  const { awareness } = provider
  const byKey = new Map<string, Peer>()

  awareness.getStates().forEach((state, clientId) => {
    const user = state.user as { id?: string, name?: string, color?: string } | undefined

    if (!user?.name) return

    const self = clientId === awareness.clientID
    const key = user.id ?? String(clientId)
    const peer = byKey.get(key)

    if (peer) {
      peer.clientIds.push(clientId)
      peer.self ||= self
    } else {
      byKey.set(key, { key, clientIds: [clientId], name: user.name, color: user.color ?? colorFor(user.name), self })
    }
  })

  // You first, then the others in a stable order
  return [...byKey.values()].sort((a, b) => Number(b.self) - Number(a.self) || a.clientIds[0] - b.clientIds[0])
}

/** Who is in the room and whether this tab can reach the others. */
export function useRoomStatus (provider: WebrtcProvider | null): RoomStatus {
  const [state, setState] = useState<RoomStatus>({ status: 'connecting', peers: [], others: 0 })

  useEffect(() => {
    if (!provider) return

    const startedAt = Date.now()
    const update = () => {
      const peers = readPeers(provider)
      const others = peers.filter((peer) => !peer.self).length
      const signaling = provider.signalingConns.some((conn: { connected?: boolean }) => conn.connected)
      const status: ConnectionStatus = signaling || others > 0
        ? 'connected'
        : Date.now() - startedAt < CONNECT_TIMEOUT_MS ? 'connecting' : 'offline'

      setState((previous) =>
        previous.status === status && JSON.stringify(previous.peers) === JSON.stringify(peers)
          ? previous
          : { status, peers, others })
    }

    update()
    provider.awareness.on('change', update)
    provider.on('peers', update)
    // The signaling connection has no event on the provider, so it is checked periodically
    const timer = window.setInterval(update, CHECK_INTERVAL_MS)

    return () => {
      provider.awareness.off('change', update)
      provider.off('peers', update)
      window.clearInterval(timer)
    }
  }, [provider])

  return state
}
