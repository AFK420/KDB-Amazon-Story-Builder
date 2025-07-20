"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Download, Users, CheckCircle, Wand2, AlertTriangle, ExternalLink, Edit, Trash2 } from "lucide-react"
import type { StoryData, Character, FontData } from "@/types/story"

interface AIStoryStarterProps {
  storyData: StoryData
  updateStoryData: (updates: Partial<StoryData>) => void
  onAddCharacter: (character: Character) => void
  onAddFont: (font: FontData) => void
  onComplete: () => void
}

export default function AIStoryStarter({
  storyData,
  updateStoryData,
  onAddCharacter,
  onAddFont,
  onComplete,
}: AIStoryStarterProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [generatedFonts, setGeneratedFonts] = useState<string[]>([])
  const [generatedCharacters, setGeneratedCharacters] = useState<Character[]>([])
  const [completed, setCompleted] = useState(false)
  const [showApiWarning, setShowApiWarning] = useState(false)

  const startAIGeneration = async () => {
    if (!storyData.title || !storyData.genre) {
      alert("Please provide at least a story title and genres before starting AI generation")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep("Analyzing your story...")
    setShowApiWarning(false)

    try {
      // Step 1: Generate font recommendations
      setCurrentStep("Generating font recommendations...")
      setProgress(25)

      const fontResponse = await fetch("/api/generate-font-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyData }),
      })

      let fontData
      try {
        fontData = await fontResponse.json()
      } catch (jsonError) {
        console.error("JSON parsing error for fonts:", jsonError)
        fontData = {
          recommendations: ["Merriweather", "Libre Baskerville", "Lora", "Roboto", "Open Sans", "Noto Serif"],
          fallback: true,
        }
      }

      if (fontData.recommendations) {
        setGeneratedFonts(fontData.recommendations)
      }

      if (fontData.fallback) {
        setShowApiWarning(true)
      }

      // Get character count from form
      const characterCount = Number.parseInt(document.getElementById("character-count")?.value || "4")

      // Step 2: Generate character suggestions
      setCurrentStep(`Creating ${characterCount} character suggestions...`)
      setProgress(50)

      const characterResponse = await fetch("/api/generate-character-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyData, characterCount }),
      })

      let characterData
      try {
        characterData = await characterResponse.json()
      } catch (jsonError) {
        console.error("JSON parsing error for characters:", jsonError)
        characterData = {
          characters: [
            {
              id: `fallback-${Date.now()}-1`,
              name: "Alex Morgan",
              role: "Protagonist",
              description: "A determined individual with sharp features and an analytical mind.",
              personality: "Intelligent and resourceful, natural leader with strong moral compass.",
              background: "Has overcome significant challenges in life, shaped by personal loss.",
              goals: "To solve the central mystery while protecting those they care about.",
              relationships: "",
            },
          ],
          fallback: true,
        }
      }

      if (characterData.characters) {
        setGeneratedCharacters(characterData.characters)
      }

      if (characterData.fallback) {
        setShowApiWarning(true)
      }

      // Step 3: Enhance story outline
      setCurrentStep("Enhancing story outline...")
      setProgress(75)

      const outlineResponse = await fetch("/api/enhance-story-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyData }),
      })

      let outlineData
      try {
        outlineData = await outlineResponse.json()
      } catch (jsonError) {
        console.error("JSON parsing error for outline:", jsonError)
        outlineData = {
          enhancedOutline: `ENHANCED STORY OUTLINE FOR "${storyData.title}"\n\nYour story has been structured with a clear beginning, middle, and end to guide chapter creation.`,
          fallback: true,
        }
      }

      if (outlineData.enhancedOutline) {
        updateStoryData({ plotOutline: outlineData.enhancedOutline })
      }

      if (outlineData.fallback) {
        setShowApiWarning(true)
      }

      setCurrentStep("Complete!")
      setProgress(100)
      setCompleted(true)
    } catch (error) {
      console.error("Error in AI generation:", error)

      // Provide fallback data even if there's an error
      setGeneratedFonts(["Merriweather", "Libre Baskerville", "Lora", "Roboto", "Open Sans", "Noto Serif"])
      setGeneratedCharacters([
        {
          id: `fallback-${Date.now()}-1`,
          name: "Alex Morgan",
          role: "Protagonist",
          description: "A determined individual with sharp features and an analytical mind.",
          personality: "Intelligent and resourceful, natural leader with strong moral compass.",
          background: "Has overcome significant challenges in life, shaped by personal loss.",
          goals: "To solve the central mystery while protecting those they care about.",
          relationships: "",
        },
      ])
      setShowApiWarning(true)
      setCompleted(true)
      setCurrentStep("Complete with defaults!")
      setProgress(100)
    } finally {
      setIsGenerating(false)
    }
  }

  const acceptCharacter = (character: Character) => {
    onAddCharacter(character)
    setGeneratedCharacters((prev) => prev.filter((c) => c.id !== character.id))
  }

  const editCharacter = (character: Character) => {
    // For now, just accept the character - editing will be done in the Characters tab
    acceptCharacter(character)
  }

  const deleteCharacterSuggestion = (characterId: string) => {
    setGeneratedCharacters((prev) => prev.filter((c) => c.id !== characterId))
  }

  const acceptAllCharacters = () => {
    generatedCharacters.forEach((character) => onAddCharacter(character))
    setGeneratedCharacters([])
  }

  const finishSetup = () => {
    onComplete()
  }

  return (
    <div className="space-y-6">
      {showApiWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Using Default Recommendations:</strong> The Gemini API is not fully enabled. You're seeing
                default suggestions instead of AI-powered ones.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Enable API
                </Button>
                <span className="text-sm">for AI-powered suggestions</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!completed && (
        <div className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">Ready to Start Your Story?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Get AI-powered font recommendations and character suggestions based on your story details
            </p>

            {/* Character Count Input */}
            <div className="mb-4">
              <label
                htmlFor="character-count"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                How many characters should I generate?
              </label>
              <select
                id="character-count"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                defaultValue="4"
              >
                <option value="2">2 Characters (Minimal cast)</option>
                <option value="3">3 Characters (Small cast)</option>
                <option value="4">4 Characters (Balanced cast)</option>
                <option value="5">5 Characters (Medium cast)</option>
                <option value="6">6 Characters (Large cast)</option>
                <option value="8">8 Characters (Epic cast)</option>
              </select>
            </div>

            <Button
              onClick={startAIGeneration}
              disabled={isGenerating || !storyData.title || !storyData.genre}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start AI Story Setup
                </>
              )}
            </Button>
          </div>

          {(!storyData.title || !storyData.genre) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fill in your story title and genres in the Story Setup tab before starting AI generation.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold">{currentStep}</p>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">{progress}% Complete</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Font Recommendations */}
      {generatedFonts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Recommended Fonts for Your Story
              {showApiWarning && <Badge variant="outline">Default</Badge>}
            </CardTitle>
            <CardDescription>
              Based on your genres: <strong>{storyData.genre}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedFonts.map((font, index) => (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">{font}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Perfect for {storyData.genre.toLowerCase()} stories
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() =>
                          window.open(`https://fonts.google.com/?query=${encodeURIComponent(font)}`, "_blank")
                        }
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open(`https://fonts.google.com/?query=${encodeURIComponent(font)}`, "_blank")
                        }
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Download these fonts and upload them in the Fonts tab for use in your book
                export.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Character Suggestions */}
      {generatedCharacters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Character Suggestions
              {showApiWarning && <Badge variant="outline">Default</Badge>}
            </CardTitle>
            <CardDescription>
              AI-generated character suggestions for your story. You can accept, edit, or skip each one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={acceptAllCharacters} variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept All Characters
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedCharacters.map((character) => (
                  <Card key={character.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{character.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {character.role}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => editCharacter(character)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteCharacterSuggestion(character.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Description:</strong> {character.description}
                        </p>
                        <p>
                          <strong>Personality:</strong> {character.personality}
                        </p>
                        <p>
                          <strong>Background:</strong> {character.background}
                        </p>
                        <p>
                          <strong>Goals:</strong> {character.goals}
                        </p>
                      </div>

                      <Button size="sm" onClick={() => acceptCharacter(character)} className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Character
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {completed && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              AI Story Setup Complete!
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your story foundation is ready. You can now proceed to create chapters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{generatedFonts.length}</div>
                  <div className="text-sm text-green-700">Font Recommendations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {storyData.characters.length + generatedCharacters.length}
                  </div>
                  <div className="text-sm text-green-700">Character Suggestions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-green-700">Enhanced Outline</div>
                </div>
              </div>

              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Next Steps:</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Download recommended fonts and upload them in the Fonts tab</li>
                  <li>• Review and edit characters in the Characters tab</li>
                  <li>• Start writing chapters in the Chapters tab</li>
                </ul>
              </div>

              <Button onClick={finishSetup} className="w-full" size="lg">
                <Wand2 className="w-5 h-5 mr-2" />
                Continue to Chapter Creation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
