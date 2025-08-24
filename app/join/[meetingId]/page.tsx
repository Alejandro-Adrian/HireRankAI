"use client"
import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, UserCheck } from "lucide-react"
import Peer from "peerjs"
import type { HTMLVideoElement } from "react"

export default function JoinVideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const meetingId = params.meetingId as string
  const accessToken = searchParams.get("token")
  const candidateName = searchParams.get("name") || "Participant"

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const currentCallRef = useRef<any>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Initializing...")
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [hostConnected, setHostConnected] = useState(false)
  const [myPeerId, setMyPeerId] = useState("")

  useEffect(() => {
    if (accessToken) {
      validateAccess()
    } else {
      setError("Access token required to join this meeting")
      setIsValidating(false)
    }
  }, [accessToken, meetingId])

  const validateAccess = async () => {
    try {
      const response = await fetch(`/api/video-sessions/validate-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: meetingId,
          access_token: accessToken,
        }),
      })

      if (response.ok) {
        setIsAuthorized(true)
        initializeVideoCall()
      } else {
        const data = await response.json()
        setError(data.error || "Access denied")
      }
    } catch (error) {
      console.error("Access validation error:", error)
      setError("Failed to validate access")
    } finally {
      setIsValidating(false)
    }
  }

  const initializeVideoCall = async () => {
    try {
      setConnectionStatus("Accessing camera and microphone...")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.muted = true
        localVideoRef.current.playsInline = true
        await localVideoRef.current.play()
      }

      initializePeer(stream)
    } catch (error) {
      console.error("Failed to access media devices:", error)
      setError("Unable to access camera or microphone. Please check permissions and try again.")
      setConnectionStatus("Failed to connect")
    }
  }

  const initializePeer = (stream: MediaStream) => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const peerId = `participant-${meetingId}-${timestamp}-${randomId}`

    console.log("[v0] Creating participant peer with ID:", peerId)

    const peer = new Peer(peerId, {
      // Use multiple reliable PeerJS servers as fallbacks
      host: "0.peerjs.com",
      port: 443,
      path: "/",
      secure: true,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
        iceCandidatePoolSize: 10,
      },
      debug: 2, // Enable debug logging
    })

    peerRef.current = peer
    setMyPeerId(peerId)

    peer.on("open", (id) => {
      console.log("[v0] Participant peer connected with ID:", id)
      setIsConnected(true)
      setConnectionStatus("Connecting to host...")

      setTimeout(() => {
        const hostPeerId = `host-${meetingId}`
        console.log("[v0] Attempting to call host with ID:", hostPeerId)
        callHost(hostPeerId, stream)
      }, 1000)
    })

    peer.on("call", (call) => {
      console.log("[v0] Incoming call from host:", call.peer)
      call.answer(stream)
      currentCallRef.current = call

      call.on("stream", (remoteStream) => {
        console.log("[v0] Received host stream")
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play()
        }
        setHostConnected(true)
        setConnectionStatus("Connected to interview")
      })

      call.on("close", () => {
        console.log("[v0] Host disconnected")
        setHostConnected(false)
        setConnectionStatus("Host disconnected")
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })
    })

    peer.on("error", (error) => {
      console.error("[v0] Peer error:", error)

      if (error.type === "unavailable-id") {
        setError(`Connection error: Unable to join with this ID. Please refresh and try again.`)
        setConnectionStatus("ID conflict - Please retry")
      } else if (error.type === "network" || error.type === "server-error") {
        setError(
          `Connection error: Unable to connect to signaling server. Please check your internet connection and try again.`,
        )
        setConnectionStatus("Connection failed")
      } else if (error.type === "peer-unavailable") {
        setError(`Host not available. The interviewer may not have started the session yet.`)
        setConnectionStatus("Host unavailable")
      } else {
        setError(`Connection error: ${error.message || "Unknown error occurred"}`)
        setConnectionStatus("Connection failed")
      }
    })
  }

  const callHost = (hostPeerId: string, stream: MediaStream) => {
    if (peerRef.current) {
      const call = peerRef.current.call(hostPeerId, stream)
      currentCallRef.current = call

      call.on("stream", (remoteStream) => {
        console.log("[v0] Connected to host")
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play()
        }
        setHostConnected(true)
        setConnectionStatus("Connected to interview")
      })

      call.on("close", () => {
        setHostConnected(false)
        setConnectionStatus("Host disconnected")
      })

      call.on("error", (error) => {
        console.error("[v0] Call error:", error)
        setConnectionStatus("Failed to connect to host")
      })
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const leaveCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close()
    }
    cleanup()
    window.close() // Close the tab/window
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerRef.current) {
      peerRef.current.destroy()
    }
    if (currentCallRef.current) {
      currentCallRef.current.close()
    }
  }

  // Show loading/validation screen
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-white text-xl mb-2">Validating Access</h2>
          <p className="text-gray-400">Please wait while we verify your invitation...</p>
        </div>
      </div>
    )
  }

  // Show error screen
  if (!isAuthorized || error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-6">⚠️</div>
          <h2 className="text-white text-2xl mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-lg sm:text-xl font-semibold">Interview Session</h1>
          <p className="text-gray-400 text-sm">Participant: {candidateName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="h-4 w-4" />
            <span>{hostConnected ? "2" : "1"}</span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              hostConnected
                ? "bg-green-900 text-green-300"
                : error
                  ? "bg-red-900 text-red-300"
                  : "bg-yellow-900 text-yellow-300"
            }`}
          >
            {error ? "Error" : connectionStatus}
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          {hostConnected ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="animate-pulse mb-6">
                <UserCheck className="h-24 w-24 text-gray-500 mx-auto" />
              </div>
              <div className="text-white text-2xl sm:text-3xl mb-4">Waiting for Interviewer</div>
              <div className="text-gray-400 text-base sm:text-lg">
                Please wait while the interviewer joins the session
              </div>
            </div>
          )}
        </div>

        {/* Local Video Preview */}
        <div className="absolute top-4 right-4 w-48 sm:w-80 h-36 sm:h-60 bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl">
          {isVideoOff ? (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="h-8 sm:h-16 w-8 sm:w-16 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-gray-300 text-sm sm:text-lg">Camera Off</div>
              </div>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs sm:text-sm px-2 py-1 rounded-full">
            You
          </div>
          {isMuted && (
            <div className="absolute top-2 right-2 bg-red-600 p-1 sm:p-2 rounded-full">
              <MicOff className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 disabled:opacity-50 ${
              isMuted ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30" : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            disabled={!isConnected}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 disabled:opacity-50 ${
              isVideoOff ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30" : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? (
              <VideoOff className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </button>

          <button
            onClick={leaveCall}
            className="p-3 sm:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/30"
            title="Leave interview"
          >
            <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            {isConnected
              ? `${isMuted ? "Muted" : "Unmuted"} • ${isVideoOff ? "Camera Off" : "Camera On"} • ${hostConnected ? "In interview" : "Waiting for host"}`
              : "Setting up video call..."}
          </p>
        </div>
      </div>
    </div>
  )
}
