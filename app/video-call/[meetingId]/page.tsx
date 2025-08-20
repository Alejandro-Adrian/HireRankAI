"use client"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, Settings } from "lucide-react"
import Peer from "peerjs"

export default function VideoCallPage() {
  const params = useParams()
  const meetingId = params.meetingId as string

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
  const [participants, setParticipants] = useState<string[]>([])
  const [meetingUrl, setMeetingUrl] = useState("")
  const [myPeerId, setMyPeerId] = useState("")
  const [remotePeerConnected, setRemotePeerConnected] = useState(false)

  useEffect(() => {
    initializeVideoCall()
    setMeetingUrl(window.location.href)

    return () => {
      cleanup()
    }
  }, [meetingId])

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

        try {
          await localVideoRef.current.play()
        } catch (playError) {
          console.log("Auto-play prevented, waiting for user interaction")
        }
      }

      initializePeer(stream)
    } catch (error) {
      console.error("Failed to access media devices:", error)
      setError("Unable to access camera or microphone. Please check permissions and try again.")
      setConnectionStatus("Failed to connect")
    }
  }

  const initializePeer = (stream: MediaStream) => {
    // Use the meeting ID as the peer ID for the host
    const peerId = `host-${meetingId}`

    // Create peer instance using public PeerJS server
    const peer = new Peer(peerId, {
      host: "broker-connect.herokuapp.com",
      secure: true,
      port: 443,
      path: "/peerjs",
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      },
    })

    peerRef.current = peer
    setMyPeerId(peerId)

    peer.on("open", (id) => {
      console.log("[v0] Peer connected with ID:", id)
      setIsConnected(true)
      setConnectionStatus("Ready - Waiting for participants")
    })

    peer.on("call", (call) => {
      console.log("[v0] Incoming call from:", call.peer)
      // Answer the call with our stream
      call.answer(stream)
      currentCallRef.current = call

      call.on("stream", (remoteStream) => {
        console.log("[v0] Received remote stream")
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play()
        }
        setRemotePeerConnected(true)
        setParticipants(["Interview Participant"])
        setConnectionStatus("Connected")
      })

      call.on("close", () => {
        console.log("[v0] Call ended")
        setRemotePeerConnected(false)
        setParticipants([])
        setConnectionStatus("Ready - Waiting for participants")
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })
    })

    peer.on("error", (error) => {
      console.error("[v0] Peer error:", error)
      setError(`Connection error: ${error.message}`)
      setConnectionStatus("Connection failed")
    })

    peer.on("disconnected", () => {
      console.log("[v0] Peer disconnected")
      setConnectionStatus("Disconnected - Attempting to reconnect...")
      peer.reconnect()
    })
  }

  const callParticipant = (targetPeerId: string) => {
    if (peerRef.current && localStreamRef.current) {
      const call = peerRef.current.call(targetPeerId, localStreamRef.current)
      currentCallRef.current = call

      call.on("stream", (remoteStream) => {
        console.log("[v0] Connected to participant:", targetPeerId)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play()
        }
        setRemotePeerConnected(true)
        setParticipants(["Interview Participant"])
        setConnectionStatus("Connected")
      })

      call.on("close", () => {
        setRemotePeerConnected(false)
        setParticipants([])
        setConnectionStatus("Ready - Waiting for participants")
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

  const copyMeetingUrl = async () => {
    try {
      const urlWithPeerId = `${meetingUrl}?join=${myPeerId}`
      await navigator.clipboard.writeText(urlWithPeerId)
      alert("Meeting URL copied to clipboard! Participants can use this link to join.")
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  const endCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close()
    }
    cleanup()
    window.location.href = "/dashboard"
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

  const retryConnection = () => {
    setError("")
    cleanup()
    initializeVideoCall()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-semibold">Interview Session</h1>
          <p className="text-gray-400 text-sm">Meeting ID: {meetingId}</p>
          {myPeerId && <p className="text-gray-500 text-xs">Peer ID: {myPeerId}</p>}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={copyMeetingUrl}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Link</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participants.length + 1}</span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected && !error
                ? remotePeerConnected
                  ? "bg-green-900 text-green-300"
                  : "bg-yellow-900 text-yellow-300"
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
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-400 text-2xl mb-4">Connection Error</div>
              <div className="text-gray-400 mb-6 max-w-md">{error}</div>
              <button
                onClick={retryConnection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              {remotePeerConnected ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : participants.length > 0 ? (
                <div className="text-center">
                  <Users className="h-24 w-24 text-green-400 mx-auto mb-6" />
                  <div className="text-white text-3xl mb-4">Interview in Progress</div>
                  <div className="text-gray-300 text-lg">Connected with {participants.length} participant(s)</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="animate-pulse mb-6">
                    <Users className="h-24 w-24 text-gray-500 mx-auto" />
                  </div>
                  <div className="text-white text-3xl mb-4">Waiting for Participants</div>
                  <div className="text-gray-400 text-lg mb-6">Share the meeting link to invite others</div>
                  <button
                    onClick={copyMeetingUrl}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
                  >
                    <Copy className="h-5 w-5" />
                    <span>Copy Meeting Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Local Video Preview (Picture-in-Picture) */}
            <div className="absolute top-6 right-6 w-80 h-60 bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl">
              {isVideoOff ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <div className="text-gray-300 text-lg">Camera Off</div>
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
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-80 text-white text-sm px-3 py-1 rounded-full">
                You (Host)
              </div>
              {isMuted && (
                <div className="absolute top-3 right-3 bg-red-600 p-2 rounded-full">
                  <MicOff className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="absolute top-6 left-6 bg-gray-800 bg-opacity-95 rounded-xl p-4 min-w-[220px]">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Participants ({participants.length + 1})
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-300 font-medium">You (Host)</span>
                  </div>
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-300">{participant}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 px-6 py-6">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className={`p-4 rounded-full transition-all duration-200 disabled:opacity-50 ${
              isMuted ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30" : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
          </button>

          <button
            onClick={toggleVideo}
            disabled={!isConnected}
            className={`p-4 rounded-full transition-all duration-200 disabled:opacity-50 ${
              isVideoOff ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30" : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/30"
            title="End call"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>

          <button className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors" title="Settings">
            <Settings className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-400">
            {isConnected
              ? `${isMuted ? "Muted" : "Unmuted"} • ${isVideoOff ? "Camera Off" : "Camera On"} • ${remotePeerConnected ? "In call" : "Ready for interview"}`
              : "Setting up video call..."}
          </p>
        </div>
      </div>
    </div>
  )
}
