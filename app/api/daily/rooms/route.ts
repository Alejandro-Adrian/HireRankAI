import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, isHost } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const dailyApiKey = process.env.DAILY_API_KEY

    if (!dailyApiKey) {
      return NextResponse.json(
        {
          error: "Daily.co API key not configured. Please set DAILY_API_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    const roomName = `interview-${meetingId}`

    const existingRoomResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${dailyApiKey}`,
      },
    })

    // If room exists, return it
    if (existingRoomResponse.ok) {
      const existingRoom = await existingRoomResponse.json()
      return NextResponse.json({
        success: true,
        roomUrl: existingRoom.url,
        roomName: existingRoom.name,
      })
    }

    const roomResponse = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 10,
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          owner_only_broadcast: false,
        },
      }),
    })

    if (!roomResponse.ok) {
      const errorData = await roomResponse.json()
      console.error("Daily.co API error:", errorData)

      if (errorData.error === "room-name-already-exists") {
        // Try to get the existing room
        const retryResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${dailyApiKey}`,
          },
        })

        if (retryResponse.ok) {
          const existingRoom = await retryResponse.json()
          return NextResponse.json({
            success: true,
            roomUrl: existingRoom.url,
            roomName: existingRoom.name,
          })
        }
      }

      return NextResponse.json(
        {
          error: "Failed to create Daily.co room",
          details: errorData,
        },
        { status: 500 },
      )
    }

    const roomData = await roomResponse.json()

    return NextResponse.json({
      success: true,
      roomUrl: roomData.url,
      roomName: roomData.name,
    })
  } catch (error) {
    console.error("Error creating Daily.co room:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
