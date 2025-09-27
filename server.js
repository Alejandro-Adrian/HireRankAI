// Custom server to handle WebSocket connections alongside Next.js
const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { WebSocketServer } = require("ws")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// WebSocket signaling server implementation
class SignalingServer {
  constructor() {
    this.clients = new Map()
    this.rooms = new Map()
  }

  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/api/ws-signaling",
    })

    this.wss.on("connection", (ws, request) => {
      console.log("[v0] New WebSocket connection")

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error) {
          console.error("[v0] Error parsing message:", error)
        }
      })

      ws.on("close", () => {
        this.handleDisconnect(ws)
      })

      ws.on("error", (error) => {
        console.error("[v0] WebSocket error:", error)
      })
    })

    console.log("[v0] WebSocket signaling server initialized")
  }

  handleMessage(ws, message) {
    const { type, meetingId, peerId, isHost, signalType, signalData } = message

    switch (type) {
      case "join-room":
        this.handleJoinRoom(ws, meetingId, peerId, isHost)
        break
      case "signal":
        this.handleSignal(meetingId, peerId, signalType, signalData)
        break
      default:
        console.warn("[v0] Unknown message type:", type)
    }
  }

  handleJoinRoom(ws, meetingId, peerId, isHost) {
    // Store client info
    this.clients.set(peerId, { ws, meetingId, peerId, isHost })

    // Add to room
    if (!this.rooms.has(meetingId)) {
      this.rooms.set(meetingId, new Set())
    }
    this.rooms.get(meetingId).add(peerId)

    console.log(`[v0] ${isHost ? "Host" : "Participant"} ${peerId} joined room ${meetingId}`)

    // Notify others in the room
    this.broadcastToRoom(meetingId, peerId, {
      type: "peer-joined",
      peerId,
      isHost,
    })
  }

  handleSignal(meetingId, fromPeerId, signalType, signalData) {
    console.log(`[v0] Relaying ${signalType} signal from ${fromPeerId} in room ${meetingId}`)

    // Broadcast signal to all other peers in the room
    this.broadcastToRoom(meetingId, fromPeerId, {
      type: "signal",
      fromPeerId,
      signalType,
      signalData,
    })
  }

  broadcastToRoom(meetingId, excludePeerId, message) {
    const room = this.rooms.get(meetingId)
    if (!room) return

    room.forEach((peerId) => {
      if (peerId !== excludePeerId) {
        const client = this.clients.get(peerId)
        if (client && client.ws.readyState === 1) {
          // WebSocket.OPEN
          client.ws.send(JSON.stringify(message))
        }
      }
    })
  }

  handleDisconnect(ws) {
    // Find and remove the client
    let disconnectedPeerId = null
    let meetingId = null

    for (const [peerId, client] of this.clients.entries()) {
      if (client.ws === ws) {
        disconnectedPeerId = peerId
        meetingId = client.meetingId
        this.clients.delete(peerId)
        break
      }
    }

    if (disconnectedPeerId && meetingId) {
      // Remove from room
      const room = this.rooms.get(meetingId)
      if (room) {
        room.delete(disconnectedPeerId)
        if (room.size === 0) {
          this.rooms.delete(meetingId)
        }
      }

      console.log(`[v0] Peer ${disconnectedPeerId} disconnected from room ${meetingId}`)

      // Notify others in the room
      this.broadcastToRoom(meetingId, disconnectedPeerId, {
        type: "peer-left",
        peerId: disconnectedPeerId,
      })
    }
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Initialize WebSocket signaling server
  const signalingServer = new SignalingServer()
  signalingServer.initialize(server)

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
