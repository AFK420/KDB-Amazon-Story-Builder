import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      const fallbackCharacters = await generateFallbackCharacters(req)
      return Response.json({ characters: fallbackCharacters, fallback: true }, { status: 200 })
    }

    const { storyData, characterCount = 4 } = await req.json()

    const prompt = `Create ${characterCount} character suggestions for this story:

Story Title: ${storyData.title}
Genres: ${storyData.genre}
Setting: ${storyData.setting}
Theme: ${storyData.theme}
Plot Outline: ${storyData.plotOutline}

Create exactly ${characterCount} diverse characters with different roles:
- At least 1 Protagonist
- At least 1 Antagonist (if more than 2 characters)
- Supporting characters as needed
- Ensure good balance of roles and diversity

For each character, provide:
- Name
- Role (Protagonist, Antagonist, Supporting, Minor)
- Physical description (2-3 sentences)
- Personality traits (2-3 sentences)
- Background (2-3 sentences)
- Goals and motivations (1-2 sentences)

Format as JSON array with objects containing: name, role, description, personality, background, goals`

    const model = google("gemini-1.5-pro", { apiKey })
    const result = await generateText({ model, prompt, maxTokens: 2000 })

    try {
      const characters = JSON.parse(result.text).map((char: any, index: number) => ({
        ...char,
        id: `ai-${Date.now()}-${index}`,
        relationships: "",
      }))

      return Response.json({ characters })
    } catch (parseError) {
      const fallbackCharacters = await generateFallbackCharacters(req)
      return Response.json({ characters: fallbackCharacters, fallback: true }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error generating character suggestions:", error)

    // Always return fallback characters with proper JSON structure
    const fallbackCharacters = await generateFallbackCharacters(req)
    return Response.json(
      {
        characters: fallbackCharacters,
        fallback: true,
        message: "Using default character suggestions",
      },
      { status: 200 },
    )
  }
}

async function generateFallbackCharacters(req: Request) {
  try {
    const { storyData, characterCount = 4 } = await req.json()
    const genres = storyData.genre.toLowerCase()
    const characters = []

    // Generate the requested number of characters
    for (let i = 0; i < characterCount; i++) {
      let character

      if (i === 0) {
        // First character is always protagonist
        character = {
          id: `fallback-${Date.now()}-${i}`,
          name: getRandomName(),
          role: "Protagonist",
          description: "A determined individual with sharp features and an analytical mind.",
          personality: "Intelligent and resourceful, natural leader with strong moral compass.",
          background: "Has overcome significant challenges in life, shaped by personal loss.",
          goals: "To solve the central mystery while protecting those they care about.",
          relationships: "",
        }
      } else if (i === 1 && characterCount > 2) {
        // Second character is antagonist if we have more than 2 characters
        character = {
          id: `fallback-${Date.now()}-${i}`,
          name: getRandomName(),
          role: "Antagonist",
          description: "A formidable opponent with complex motivations.",
          personality: "Cunning and determined, believes their cause is just.",
          background: "Has their own tragic backstory that drives their actions.",
          goals: "To achieve their vision, regardless of the cost to others.",
          relationships: "",
        }
      } else {
        // Supporting characters
        character = {
          id: `fallback-${Date.now()}-${i}`,
          name: getRandomName(),
          role: "Supporting",
          description: "A loyal ally with unique skills and perspective.",
          personality: "Supportive and reliable, with their own interesting quirks.",
          background: "Has their own story arc that intersects with the main plot.",
          goals: "To support the protagonist while pursuing their own objectives.",
          relationships: "",
        }
      }

      characters.push(character)
    }

    return characters
  } catch {
    // Return minimum viable characters if error
    return Array.from({ length: 4 }, (_, i) => ({
      id: `fallback-${Date.now()}-${i}`,
      name: `Character ${i + 1}`,
      role: i === 0 ? "Protagonist" : "Supporting",
      description: "A character created for your story.",
      personality: "Determined and resourceful.",
      background: "Has an interesting backstory.",
      goals: "To achieve their objectives.",
      relationships: "",
    }))
  }
}

function getRandomName() {
  const names = [
    "Alex Morgan",
    "Riley Chen",
    "Jordan Blake",
    "Casey Rivera",
    "Taylor Swift",
    "Morgan Lee",
    "Avery Johnson",
    "Quinn Davis",
    "Sage Wilson",
    "River Stone",
    "Phoenix Wright",
    "Skylar Moon",
  ]
  return names[Math.floor(Math.random() * names.length)]
}
