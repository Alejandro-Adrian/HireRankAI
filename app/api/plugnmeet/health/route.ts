import { type NextRequest, NextResponse } from "next/server"
import { AbortSignal } from "abort-controller"

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are configured
    const serverUrl = process.env.PLUGNMEET_SERVER_URL
    const apiKey = process.env.PLUGNMEET_API_KEY
    const secret = process.env.PLUGNMEET_SECRET

    console.log("[v0] PlugNmeet health check - Server URL:", serverUrl)
    console.log("[v0] PlugNmeet health check - API Key:", apiKey ? "configured" : "missing")
    console.log("[v0] PlugNmeet health check - Secret:", secret ? "configured" : "missing")

    if (!serverUrl || !apiKey || !secret) {
      return NextResponse.json(
        {
          error: "PlugNmeet environment variables not configured",
          missing: {
            serverUrl: !serverUrl,
            apiKey: !apiKey,
            secret: !secret,
          },
          suggestion:
            "For demo, use: https://demo.plugnmeet.com with API key 'plugnmeet' and secret 'zumyyYWqv7KR2kUqvYdq4z4sXg7XTBD2ljT6'",
        },
        { status: 500 },
      )
    }

    // Try to ping the plugNmeet server
    let healthResponse
    try {
      healthResponse = await fetch(`${serverUrl}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })
    } catch (error) {
      // Try alternative endpoint
      console.log("[v0] Primary health endpoint failed, trying alternative...")
      healthResponse = await fetch(`${serverUrl}/`, {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      })
    }

    console.log("[v0] PlugNmeet server response status:", healthResponse.status)

    if (!healthResponse.ok) {
      throw new Error(`Server responded with status: ${healthResponse.status}`)
    }

    const isDemo = serverUrl.includes("demo.plugnmeet.com")

    return NextResponse.json({
      status: "healthy",
      serverUrl,
      isDemo,
      message: isDemo ? "Connected to demo server" : "Connected to custom server",
    })
  } catch (error) {
    console.error("[v0] PlugNmeet health check failed:", error)
    return NextResponse.json(
      {
        error: "PlugNmeet server is not accessible",
        details: error instanceof Error ? error.message : "Unknown error",
        serverUrl: process.env.PLUGNMEET_SERVER_URL,
      },
      { status: 500 },
    )
  }
}
