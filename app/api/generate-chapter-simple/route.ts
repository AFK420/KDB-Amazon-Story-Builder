import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    console.log("=== Simple Chapter Generation API Called ===")

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key not configured. Please configure your API key first." },
        { status: 400 },
      )
    }

    const { chapterTitle, chapterSummary, storyGenre } = await req.json()

    if (!chapterTitle || !chapterSummary) {
      return Response.json({ error: "Missing chapter title or summary" }, { status: 400 })
    }

    // Simplified prompt for faster generation
    const prompt = `Write a complete chapter for a ${storyGenre || "fiction"} story.

Chapter Title: ${chapterTitle}
Chapter Summary: ${chapterSummary}

Write a well-structured chapter with:
- Engaging opening
- Character development
- Dialogue and action
- Descriptive passages
- Natural chapter ending
- Approximately 1500-2000 words

Write the complete chapter now:`

    console.log("Using simplified prompt, calling Gemini...")

    // Set API key in environment
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey
    const model = google("gemini-1.5-flash") // Use faster model

    const result = await generateText({
      model,
      prompt,
      maxTokens: 2000, // Reduced for faster generation
      temperature: 0.7,
    })

    const content = result.text

    if (!content || content.length < 100) {
      throw new Error("Generated content is too short")
    }

    return Response.json({ content })
  } catch (error: any) {
    console.error("Simple chapter generation error:", error)

    let errorMessage = "Failed to generate chapter"

    if (error.message?.includes("API key")) {
      errorMessage = "Invalid API key. Please reconfigure your Gemini API key."
    } else if (error.message?.includes("QUOTA_EXCEEDED")) {
      errorMessage = "API quota exceeded. Please try again later."
    } else if (error.message?.includes("PERMISSION_DENIED")) {
      errorMessage = "API permission denied. Please check your API key."
    } else if (error.message?.includes("Generative Language API has not been used")) {
      errorMessage = "Generative Language API needs to be enabled. Please enable it in Google Cloud Console."
    }

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
