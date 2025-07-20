export interface StoryData {
  title: string
  genre: string
  setting: string
  theme: string
  plotOutline: string
  targetAudience: string
  writingStyle: string
  chapters: Chapter[]
  characters: Character[]
  fonts: FontData[]
}

export interface Character {
  id: string
  name: string
  role: string
  description: string
  personality: string
  background: string
  goals: string
  relationships: string
}

export interface Chapter {
  id: string
  chapterNumber: number
  title: string
  summary: string
  content: string
  wordCount: number
  status: "draft" | "review" | "complete"
}

export interface FontData {
  id: string
  name: string
  fileName: string
  data: string // base64 encoded font data
  type: string
  suitability: "excellent" | "good" | "fair" | "poor"
  recommendedFor: string[]
}
