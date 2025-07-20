import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 400 })
    }

    const { storyData, chapter, editInstructions } = await req.json()

    const prompt = `Edit and improve this chapter based on the story context and instructions:

STORY CONTEXT:
Title: ${storyData.title}
Genres: ${storyData.genre}
Setting: ${storyData.setting}
Theme: ${storyData.theme}
Writing Style: ${storyData.writingStyle}

CHAPTER TO EDIT:
Title: ${chapter.title}
Content: ${chapter.content}

EDIT INSTRUCTIONS: ${editInstructions}

Please improve the chapter by:
1. Enhancing descriptions and imagery
2. Improving dialogue flow and authenticity
3. Ensuring consistency with story elements
4. Maintaining the original plot and structure
5. Improving prose quality and readability
6. Keeping the same approximate length

Return only the improved chapter content.`

    const model = google("gemini-1.5-pro", { apiKey })
    const result = await generateText({ model, prompt, maxTokens: 4000 })

    return Response.json({ editedContent: result.text })
  } catch (error) {
    console.error("Error with AI editing:", error)
    return Response.json({ error: "Failed to edit chapter" }, { status: 500 })
  }
}
