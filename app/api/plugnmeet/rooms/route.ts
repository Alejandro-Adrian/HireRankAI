import { type NextRequest, NextResponse } from "next/server"
import { PlugNmeet } from "plugnmeet-sdk-js"

// Initialize plugNmeet client
const getPlugNmeetClient = () => {
  const serverUrl = process.env.PLUGNMEET_SERVER_URL || "http://localhost:8080"
  const apiKey = process.env.PLUGNMEET_API_KEY || "plugnmeet"
  const secret = process.env.PLUGNMEET_SECRET || "zumyyYWqv7KR2kUqvYdq4z4sXg7XTBD2ljT6"

  return new PlugNmeet(serverUrl, apiKey, secret)
}

export async function POST(request: NextRequest) {
  try {
    const { meetingId, isHost, userName } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const pnm = getPlugNmeetClient()

    // Create room configuration
    const roomConfig = {
      room_id: `hireranker-${meetingId}`,
      room_title: `Interview Session - ${meetingId}`,
      welcome_message: "Welcome to your interview session",
      max_participants: 10,
      empty_timeout: 0,
      room_features: {
        allow_webcams: true,
        mute_on_start: false,
        allow_screen_share: true,
        allow_recording: true,
        allow_rtmp: false,
        allow_view_other_webcams: true,
        allow_view_other_users_list: true,
        admin_only_webcams: false,
        allow_polls: false,
        room_duration: 0,
        enable_analytics: true,
        enable_breakout_room: false,
        allowed_number_of_breakout_rooms: 0,
        enable_display_external_link_features: false,
        enable_ingress_features: false,
        enable_speech_to_text_translation_features: false,
        enable_end_to_end_encryption_features: false,
      },
      default_lock_settings: {
        lock_microphone: false,
        lock_webcam: false,
        lock_screen_sharing: false,
        lock_whiteboard: false,
        lock_shared_notepad: false,
        lock_chat: false,
        lock_chat_send_message: false,
        lock_chat_file_share: false,
        lock_private_chat: false,
      },
    }

    // Create the room
    const roomResult = await pnm.createRoom(roomConfig)

    if (!roomResult.status) {
      return NextResponse.json({ error: roomResult.msg || "Failed to create room" }, { status: 500 })
    }

    // Generate join token
    const tokenConfig = {
      room_id: `hireranker-${meetingId}`,
      user_info: {
        name: userName || (isHost ? "Host" : "Participant"),
        user_id: `user-${Date.now()}`,
        is_admin: isHost || false,
        is_hidden: false,
      },
    }

    const tokenResult = await pnm.getJoinToken(tokenConfig)

    if (!tokenResult.status) {
      return NextResponse.json({ error: tokenResult.msg || "Failed to generate join token" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      roomId: `hireranker-${meetingId}`,
      token: tokenResult.token,
      joinUrl: `${process.env.PLUGNMEET_SERVER_URL || "http://localhost:8080"}/room/join/${tokenResult.token}`,
    })
  } catch (error) {
    console.error("Error creating plugNmeet room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("meetingId")

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const pnm = getPlugNmeetClient()
    const roomId = `hireranker-${meetingId}`

    // Check if room is active
    const isActive = await pnm.isRoomActive(roomId)

    if (isActive.status) {
      const roomInfo = await pnm.getActiveRoomInfo(roomId)
      return NextResponse.json({
        active: true,
        roomInfo: roomInfo.result || null,
      })
    }

    return NextResponse.json({ active: false })
  } catch (error) {
    console.error("Error checking room status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
