"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, FileText, Type, Download, Settings, Play, Eye } from "lucide-react"
import StorySetup from "@/components/story-setup"
import CharacterManager from "@/components/character-manager"
import ChapterWriter from "@/components/chapter-writer"
import FontManager from "@/components/font-manager"
import ExportManager from "@/components/export-manager"
import PreviewManager from "@/components/preview-manager"
import type { StoryData, Character, Chapter, FontData } from "@/types/story"
import APIKeyManager from "@/components/api-key-manager"
import AIStoryStarter from "@/components/ai-story-starter"

export default function NovelCreatorPlatform() {
  const [activeTab, setActiveTab] = useState("setup")
  const [storyData, setStoryData] = useState<StoryData>({
    title: "",
    genre: "",
    setting: "",
    theme: "",
    plotOutline: "",
    targetAudience: "",
    writingStyle: "",
    chapters: [],
    characters: [],
    fonts: [],
  })

  const [currentChapter, setCurrentChapter] = useState<number>(0)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)
  const [aiStarterCompleted, setAiStarterCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved story data from localStorage
    const savedData = localStorage.getItem("novel-creator-data")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setStoryData(parsed)
        setAiStarterCompleted(parsed.aiStarterCompleted || false)
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Save story data to localStorage
      const dataToSave = { ...storyData, aiStarterCompleted }
      localStorage.setItem("novel-creator-data", JSON.stringify(dataToSave))
    }
  }, [storyData, aiStarterCompleted, mounted])

  useEffect(() => {
    if (mounted) {
      // Check if Gemini API key is configured
      const checkApiKey = async () => {
        try {
          const response = await fetch("/api/check-api-key")
          const data = await response.json()
          setApiKeyConfigured(data.configured)
        } catch (error) {
          console.error("Error checking API key:", error)
        }
      }
      checkApiKey()
    }
  }, [mounted])

  const updateStoryData = (updates: Partial<StoryData>) => {
    setStoryData((prev) => ({ ...prev, ...updates }))
  }

  const addCharacter = (character: Character) => {
    setStoryData((prev) => ({
      ...prev,
      characters: [...prev.characters, { ...character, id: Date.now().toString() }],
    }))
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setStoryData((prev) => ({
      ...prev,
      characters: prev.characters.map((char) => (char.id === id ? { ...char, ...updates } : char)),
    }))
  }

  const deleteCharacter = (id: string) => {
    setStoryData((prev) => ({
      ...prev,
      characters: prev.characters.filter((char) => char.id !== id),
    }))
  }

  const addChapter = (chapter: Chapter) => {
    setStoryData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { ...chapter, id: Date.now().toString() }],
    }))
  }

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setStoryData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => (chapter.id === id ? { ...chapter, ...updates } : chapter)),
    }))
  }

  const deleteChapter = (id: string) => {
    setStoryData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((chapter) => chapter.id !== id),
    }))
  }

  const addFont = (font: FontData) => {
    setStoryData((prev) => ({
      ...prev,
      fonts: [...prev.fonts, font],
    }))
  }

  const canProceedToChapters =
    storyData.title &&
    storyData.genre &&
    storyData.plotOutline &&
    storyData.characters.length > 0 &&
    apiKeyConfigured &&
    aiStarterCompleted

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Novel Creator Studio</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Professional story creation platform with AI assistance for KDP publishing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Story Setup
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="fonts" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-2" disabled={!canProceedToChapters}>
              <BookOpen className="w-4 h-4" />
              Chapters
              {!canProceedToChapters && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={storyData.chapters.length === 0}>
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2" disabled={storyData.chapters.length === 0}>
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* API Key Configuration - Always show if not configured */}
          {!apiKeyConfigured && (
            <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  API Configuration Required
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  Configure your Gemini API key to enable AI features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <APIKeyManager onApiKeyConfigured={() => setApiKeyConfigured(true)} />
              </CardContent>
            </Card>
          )}

          {/* AI Story Starter - Show if API is configured but starter not completed */}
          {apiKeyConfigured && !aiStarterCompleted && (
            <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  AI Story Starter
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Let AI help you get started with font recommendations and character suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIStoryStarter
                  storyData={storyData}
                  updateStoryData={updateStoryData}
                  onAddCharacter={addCharacter}
                  onAddFont={addFont}
                  onComplete={() => setAiStarterCompleted(true)}
                />
              </CardContent>
            </Card>
          )}

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Story Foundation</CardTitle>
                <CardDescription>Define your story's core elements before AI begins writing</CardDescription>
              </CardHeader>
              <CardContent>
                <StorySetup storyData={storyData} updateStoryData={updateStoryData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters">
            <Card>
              <CardHeader>
                <CardTitle>Character Development</CardTitle>
                <CardDescription>Create and manage your story's characters</CardDescription>
              </CardHeader>
              <CardContent>
                <CharacterManager
                  characters={storyData.characters}
                  onAddCharacter={addCharacter}
                  onUpdateCharacter={updateCharacter}
                  onDeleteCharacter={deleteCharacter}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fonts">
            <Card>
              <CardHeader>
                <CardTitle>Typography & Fonts</CardTitle>
                <CardDescription>Upload and manage custom fonts for your book</CardDescription>
              </CardHeader>
              <CardContent>
                <FontManager fonts={storyData.fonts} storyData={storyData} onAddFont={addFont} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chapters">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Creation</CardTitle>
                <CardDescription>Write your story chapter by chapter with AI assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChapterWriter
                  storyData={storyData}
                  chapters={storyData.chapters}
                  onAddChapter={addChapter}
                  onUpdateChapter={updateChapter}
                  onDeleteChapter={deleteChapter}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Preview & Editing</CardTitle>
                <CardDescription>Preview and edit your chapters before export</CardDescription>
              </CardHeader>
              <CardContent>
                <PreviewManager storyData={storyData} onUpdateChapter={updateChapter} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export & Publishing</CardTitle>
                <CardDescription>Generate professional PDF and EPUB for publishing</CardDescription>
              </CardHeader>
              <CardContent>
                <ExportManager storyData={storyData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progress Indicator */}
        <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Progress: {storyData.chapters.length} chapters written</span>
            <span>Characters: {storyData.characters.length}</span>
            <span>Fonts: {storyData.fonts.length}</span>
            <span>API Key: {apiKeyConfigured ? "✓ Configured" : "❌ Missing"}</span>
            <span>AI Starter: {aiStarterCompleted ? "✓ Complete" : "Pending"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
