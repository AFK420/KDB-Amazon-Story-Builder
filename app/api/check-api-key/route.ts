import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is configured in environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    return NextResponse.json({
      configured: !!(geminiApiKey || googleApiKey),
    })
  } catch (error) {
    console.error("Error checking API key:", error)
    return NextResponse.json({ configured: false })
  }
}
