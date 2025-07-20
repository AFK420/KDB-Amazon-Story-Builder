import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      const enhancedOutline = await generateFallbackOutline(req)
      return Response.json({ enhancedOutline, fallback: true }, { status: 200 })
    }

    const { storyData } = await req.json()

    const prompt = `Enhance and expand this story outline to be more detailed and structured:

Current Outline: ${storyData.plotOutline}

Story Details:
- Title: ${storyData.title}
- Genres: ${storyData.genre}
- Setting: ${storyData.setting}
- Theme: ${storyData.theme}
- Target Audience: ${storyData.targetAudience}

Please enhance the outline by:
1. Adding more specific plot points
2. Including character development arcs
3. Ensuring proper story structure (beginning, middle, end)
4. Adding conflict and resolution details
5. Making it more detailed for AI chapter generation

Keep the same core story but make it more comprehensive and structured.`

    const model = google("gemini-1.5-pro", { apiKey })
    const result = await generateText({ model, prompt, maxTokens: 1500 })

    return Response.json({ enhancedOutline: result.text })
  } catch (error: any) {
    console.error("Error enhancing story outline:", error)

    // Always return fallback enhancement with proper JSON structure
    const enhancedOutline = await generateFallbackOutline(req)
    return Response.json(
      {
        enhancedOutline,
        fallback: true,
        message: "Using structured outline enhancement",
      },
      { status: 200 },
    )
  }
}

async function generateFallbackOutline(req: Request) {
  try {
    const { storyData } = await req.json()
    const originalOutline = storyData.plotOutline

    const enhancedOutline = `ENHANCED STORY OUTLINE FOR "${storyData.title}"

GENRE: ${storyData.genre}
SETTING: ${storyData.setting}
THEME: ${storyData.theme}
TARGET AUDIENCE: ${storyData.targetAudience}

ORIGINAL OUTLINE:
${originalOutline}

ENHANCED STRUCTURE:

ACT I - SETUP (Chapters 1-3):
- Introduction of main character(s) and their ordinary world
- Establish the setting, tone, and initial conflict
- Inciting incident that propels the story forward
- Character's initial reaction and decision to act
- Introduction of key supporting characters

ACT II - CONFRONTATION (Chapters 4-8):
- Rising action with escalating challenges and obstacles
- Character development and relationship building
- Exploration of themes through character interactions
- Midpoint crisis that changes everything and raises stakes
- Obstacles that test the character's resolve and growth
- Darkest moment where all seems lost

ACT III - RESOLUTION (Chapters 9-12):
- Final confrontation with the main conflict
- Character uses lessons learned throughout the story
- Climax where the central problem is addressed
- Resolution that ties up loose ends and character arcs
- New equilibrium showing character growth and change

KEY PLOT POINTS TO DEVELOP:
1. Opening hook that immediately engages readers
2. Character motivation and stakes clearly established
3. Progressive complications that build tension
4. Emotional character arcs that resonate with themes
5. Satisfying conclusion that delivers on promises made

SUGGESTED CHAPTER BREAKDOWN:
- Each chapter should advance both plot and character development
- Include moments of conflict, revelation, and growth
- Balance action with character introspection and dialogue
- End chapters with hooks to maintain reader engagement
- Ensure each chapter serves the overall story arc

GENRE-SPECIFIC CONSIDERATIONS:
${getGenreSpecificGuidance(storyData.genre)}

This enhanced outline provides a solid foundation for AI-assisted chapter generation while maintaining the core elements of your original story concept.`

    return enhancedOutline
  } catch {
    return `ENHANCED STORY OUTLINE

Your original story concept has been structured into a three-act format with clear character development arcs and plot progression. This provides a strong foundation for chapter-by-chapter writing with consistent pacing and character growth.`
  }
}

function getGenreSpecificGuidance(genres: string) {
  const genreList = genres.toLowerCase()

  if (genreList.includes("fantasy")) {
    return `- Establish magic system rules and limitations early
- Build the world gradually through character experiences
- Include moments of wonder and discovery
- Balance action with character development`
  } else if (genreList.includes("romance")) {
    return `- Focus on emotional character development
- Build romantic tension gradually
- Include obstacles that test the relationship
- Ensure both characters have individual growth arcs`
  } else if (genreList.includes("mystery") || genreList.includes("thriller")) {
    return `- Plant clues and red herrings strategically
- Maintain suspense through pacing
- Reveal information gradually to build tension
- Ensure fair play with readers regarding clues`
  } else {
    return `- Focus on character-driven plot development
- Ensure themes are woven naturally into the story
- Balance dialogue, action, and description
- Maintain consistent tone throughout`
  }
}
