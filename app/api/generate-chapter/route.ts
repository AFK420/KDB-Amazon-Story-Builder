import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import type { Character } from "@/types/story"

export async function POST(req: Request) {
  try {
    console.log("=== Chapter Generation API Called ===")

    // Check if API key is configured - try both environment variable names
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    console.log("API Key available:", !!apiKey)
    console.log("API Key length:", apiKey?.length || 0)

    if (!apiKey) {
      console.error("No API key found in environment variables")
      return Response.json(
        {
          error: "Gemini API key not configured. Please configure your API key first.",
        },
        { status: 400 },
      )
    }

    const requestData = await req.json()
    console.log("Request data received:", {
      storyTitle: requestData.storyData?.title,
      chapterTitle: requestData.chapterTitle,
      chapterNumber: requestData.chapterNumber,
      previousChaptersCount: requestData.previousChapters?.length || 0,
    })

    const { storyData, chapterTitle, chapterSummary, previousChapters, chapterNumber } = requestData

    // Validate required data
    if (!storyData?.title || !chapterTitle || !chapterSummary) {
      return Response.json({ error: "Missing required story data, chapter title, or summary" }, { status: 400 })
    }

    // Build context from story data and previous chapters
    const storyContext = `
STORY INFORMATION:
Title: ${storyData.title}
Genres: ${storyData.genre}
Setting: ${storyData.setting}
Theme: ${storyData.theme}
Writing Style: ${storyData.writingStyle}
Target Audience: ${storyData.targetAudience}

PLOT OUTLINE:
${storyData.plotOutline}

CHARACTERS:
${storyData.characters
  .map(
    (char: Character) => `
- ${char.name} (${char.role}): ${char.description}
  Personality: ${char.personality}
  Background: ${char.background}
  Goals: ${char.goals}
`,
  )
  .join("\n")}

PREVIOUS CHAPTERS SUMMARY:
${previousChapters
  .map(
    (chapter: any, index: number) => `
Chapter ${index + 1}: ${chapter.title}
${chapter.summary}
`,
  )
  .join("\n")}
`

    const prompt = `You are a professional novelist writing Chapter ${chapterNumber} of "${storyData.title}".

${storyContext}

CURRENT CHAPTER TO WRITE:
Title: ${chapterTitle}
Summary: ${chapterSummary}

Instructions:
1. Write a complete chapter that fits seamlessly with the established story
2. Maintain consistency with characters, setting, and plot
3. Use the specified writing style (${storyData.writingStyle})
4. Keep the tone appropriate for ${storyData.targetAudience}
5. Include dialogue, action, and descriptive passages
6. Aim for 2000-3000 words
7. End with a natural transition or hook for the next chapter
8. Stay true to the genre conventions of: ${storyData.genre}
9. Blend the selected genres naturally to create a unique narrative voice

Write the complete chapter now:`

    console.log("Prompt length:", prompt.length)
    console.log("Calling Gemini API...")

    // Create the model with the API key in the environment
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey
    const model = google("gemini-1.5-pro")

    const result = await streamText({
      model,
      prompt,
      maxTokens: 4000,
      temperature: 0.7,
    })

    console.log("Gemini API call successful, getting text...")
    const content = await result.text
    console.log("Generated content length:", content.length)

    if (!content || content.length < 100) {
      throw new Error("Generated content is too short or empty")
    }

    return Response.json({ content })
  } catch (error: any) {
    console.error("=== Chapter Generation Error ===")
    console.error("Error type:", error.constructor.name)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    let errorMessage = "Failed to generate chapter"
    let statusCode = 500

    if (error.message?.includes("API key is missing") || error.message?.includes("API_KEY_INVALID")) {
      errorMessage = "Invalid API key. Please reconfigure your Gemini API key."
      statusCode = 401
    } else if (error.message?.includes("QUOTA_EXCEEDED")) {
      errorMessage = "API quota exceeded. Please check your usage limits or try again later."
      statusCode = 429
    } else if (error.message?.includes("PERMISSION_DENIED")) {
      errorMessage = "API key does not have permission. Please check your API key settings."
      statusCode = 403
    } else if (error.message?.includes("SAFETY")) {
      errorMessage = "Content was blocked by safety filters. Please try rephrasing your chapter summary."
      statusCode = 400
    } else if (error.message?.includes("Generative Language API has not been used")) {
      errorMessage =
        "Generative Language API is not enabled. Please enable it at https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview"
      statusCode = 403
    }

    return Response.json({ error: errorMessage }, { status: statusCode })
  }
}
