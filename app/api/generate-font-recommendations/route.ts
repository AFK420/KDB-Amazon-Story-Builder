import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return Response.json({ error: "API key not configured", fallback: true }, { status: 200 })
    }

    const { storyData } = await req.json()

    const prompt = `Based on this story information, recommend 6 specific font names that would be perfect for this book:

Story Title: ${storyData.title}
Genres: ${storyData.genre}
Setting: ${storyData.setting}
Theme: ${storyData.theme}
Target Audience: ${storyData.targetAudience}

Please recommend fonts that:
1. Match the genre and mood
2. Are readable for books
3. Are available on Google Fonts or common font libraries
4. Include both serif and sans-serif options
5. Consider the target audience

Return only the font names, one per line, no explanations.`

    const model = google("gemini-1.5-flash", { apiKey })
    const result = await generateText({ model, prompt, maxTokens: 200 })

    const recommendations = result.text
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, 6)

    return Response.json({ recommendations })
  } catch (error: any) {
    console.error("Error generating font recommendations:", error)

    // Always return fallback fonts with proper JSON structure
    const fallbackFonts = generateFallbackFonts(req)
    return Response.json(
      {
        recommendations: fallbackFonts,
        fallback: true,
        message: "Using default font recommendations",
      },
      { status: 200 },
    )
  }
}

async function generateFallbackFonts(req: Request) {
  try {
    const { storyData } = await req.json()
    const genres = storyData.genre.toLowerCase()

    if (genres.includes("fantasy")) {
      return ["Cinzel", "Almendra", "Uncial Antiqua", "Libre Baskerville", "Cormorant Garamond", "Crimson Text"]
    } else if (genres.includes("romance")) {
      return ["Dancing Script", "Great Vibes", "Playfair Display", "Lora", "Crimson Text", "Libre Baskerville"]
    } else if (genres.includes("sci") || genres.includes("cyberpunk")) {
      return ["Orbitron", "Exo", "Rajdhani", "Roboto", "Source Code Pro", "Titillium Web"]
    } else if (genres.includes("horror")) {
      return ["Creepster", "Nosifer", "Butcherman", "Crimson Text", "Libre Baskerville", "Cormorant Garamond"]
    } else if (genres.includes("mystery") || genres.includes("thriller")) {
      return ["Abril Fatface", "Playfair Display", "Crimson Text", "Libre Baskerville", "Lora", "Cormorant Garamond"]
    } else {
      return ["Merriweather", "Libre Baskerville", "Lora", "Roboto", "Open Sans", "Noto Serif"]
    }
  } catch {
    return ["Merriweather", "Libre Baskerville", "Lora", "Roboto", "Open Sans", "Noto Serif"]
  }
}
