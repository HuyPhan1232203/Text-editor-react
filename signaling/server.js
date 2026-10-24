/**
 * Signaling server for "Share" in Text Editor React, speaking the y-webrtc protocol.
 *
 * Browsers subscribe to a room topic and relay WebRTC connection offers to each other through
 * it. The offers are encrypted with the room key from the share link, so this server cannot
 * read them, and it never sees or stores the document itself.
 *
 * Run: npm install && npm start (PORT defaults to 4444). Health check: GET / returns "okay".
 */
import http from 'node:http'
import { WebSocketServer } from 'ws'

const PORT = Number(process.env.PORT) || 4444
// Connections that stop answering pings are dropped
const PING_TIMEOUT_MS = 30_000

/** @type {Map<string, Set<import('ws').WebSocket>>} topic -> subscribers */
const topics = new Map()

function send (conn, message) {
  if (conn.readyState !== conn.OPEN) return
  try {
    conn.send(JSON.stringify(message))
  } catch {
    conn.close()
  }
}

function onConnection (conn) {
  const subscribed = new Set()
  let alive = true

  const pinger = setInterval(() => {
    if (!alive) {
      conn.close()
      return
    }
    alive = false
    try {
      conn.ping()
    } catch {
      conn.close()
    }
  }, PING_TIMEOUT_MS)

  conn.on('pong', () => { alive = true })

  conn.on('close', () => {
    clearInterval(pinger)
    for (const name of subscribed) {
      const subscribers = topics.get(name)

      subscribers?.delete(conn)
      if (subscribers?.size === 0) topics.delete(name)
    }
    subscribed.clear()
  })

  conn.on('message', (data) => {
    let message

    try {
      message = JSON.parse(data.toString())
    } catch {
      return
    }
    if (!message || typeof message.type !== 'string') return

    // Malformed input from any client must never crash the server for everyone
    const names = Array.isArray(message.topics) ? message.topics.filter((name) => typeof name === 'string') : []

    switch (message.type) {
      case 'subscribe':
        for (const name of names) {
          if (!topics.has(name)) topics.set(name, new Set())
          topics.get(name).add(conn)
          subscribed.add(name)
        }
        break
      case 'unsubscribe':
        for (const name of names) {
          topics.get(name)?.delete(conn)
          subscribed.delete(name)
        }
        break
      case 'publish': {
        const subscribers = typeof message.topic === 'string' ? topics.get(message.topic) : undefined

        if (!subscribers) break
        message.clients = subscribers.size
        for (const receiver of subscribers) send(receiver, message)
        break
      }
      case 'ping':
        send(conn, { type: 'pong' })
        break
    }
  })
}

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

const wss = new WebSocketServer({ server })

wss.on('connection', onConnection)
server.listen(PORT, () => console.log(`Signaling server listening on port ${PORT}`))
