"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, BookOpen, Wand2, Save, Trash2 } from "lucide-react"
import type { StoryData, Chapter } from "@/types/story"

interface ChapterWriterProps {
  storyData: StoryData
  chapters: Chapter[]
  onAddChapter: (chapter: Chapter) => void
  onUpdateChapter: (id: string, updates: Partial<Chapter>) => void
  onDeleteChapter: (id: string) => void
}

export default function ChapterWriter({
  storyData,
  chapters,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
}: ChapterWriterProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<Partial<Chapter>>({
    title: "",
    summary: "",
    content: "",
    wordCount: 0,
    status: "draft",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      summary: "",
      content: "",
      wordCount: 0,
      status: "draft",
    })
    setEditingChapter(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    const wordCount = formData.content?.split(/\s+/).length || 0
    const chapterData = {
      ...formData,
      wordCount,
      chapterNumber: editingChapter?.chapterNumber || chapters.length + 1,
    }

    if (editingChapter) {
      onUpdateChapter(editingChapter.id, chapterData)
    } else {
      onAddChapter(chapterData as Chapter)
    }

    resetForm()
    setIsDialogOpen(false)
  }

  // Update the generateChapterWithAI function with better error handling and shorter timeout
  const generateChapterWithAI = async () => {
    // Don't generate if we're editing an existing chapter with content
    if (editingChapter && editingChapter.content && editingChapter.content.trim().length > 0) {
      const confirmRegenerate = confirm(
        "This chapter already has content. Do you want to regenerate it? This will replace the existing content.",
      )
      if (!confirmRegenerate) {
        return
      }
    }

    if (!formData.title || !formData.summary) {
      alert("Please provide a chapter title and summary first")
      return
    }

    setIsGenerating(true)

    try {
      console.log("Starting chapter generation...")

      // Check if API key is configured first
      const apiCheckResponse = await fetch("/api/check-api-key")
      const apiCheck = await apiCheckResponse.json()

      if (!apiCheck.configured) {
        throw new Error("API key not configured. Please configure your Gemini API key first.")
      }

      // Shorter timeout to prevent long waits
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/generate-chapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyData,
          chapterTitle: formData.title,
          chapterSummary: formData.summary,
          previousChapters: chapters,
          chapterNumber: editingChapter?.chapterNumber || chapters.length + 1,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.content) {
        throw new Error("No content received from AI")
      }

      setFormData((prev) => ({
        ...prev,
        content: data.content,
        wordCount: data.content.split(/\s+/).length,
      }))

      alert("Chapter generated successfully!")
    } catch (error: any) {
      console.error("Chapter generation error:", error)

      let errorMessage = "Failed to generate chapter.\n\n"

      if (error.name === "AbortError") {
        errorMessage += "⏱️ Request timed out after 30 seconds.\n\n"
        errorMessage += "This usually means:\n"
        errorMessage += "• The Gemini API is overloaded\n"
        errorMessage += "• Your API key may not be properly configured\n"
        errorMessage += "• The API service is temporarily unavailable\n\n"
        errorMessage += "💡 Try these solutions:\n"
        errorMessage += "1. Wait a few minutes and try again\n"
        errorMessage += "2. Check your API key configuration\n"
        errorMessage += "3. Try with a shorter chapter summary\n"
        errorMessage += "4. Write the chapter manually for now"
      } else if (error.message.includes("API key not configured")) {
        errorMessage += "🔑 Please configure your Gemini API key in the setup section first."
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage += "🌐 Network connection error. Please check your internet connection and try again."
      } else if (error.message.includes("QUOTA_EXCEEDED")) {
        errorMessage += "📊 API quota exceeded. Please try again later or check your usage limits."
      } else if (error.message.includes("PERMISSION_DENIED")) {
        errorMessage += "🚫 API permission denied. Please check your API key permissions."
      } else if (error.message.includes("Generative Language API has not been used")) {
        errorMessage += "⚙️ The Generative Language API needs to be enabled.\n"
        errorMessage += "Please enable it in the Google Cloud Console."
      } else {
        errorMessage += "❌ " + error.message
      }

      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // Add a simpler fallback generation function
  const generateChapterSimple = async () => {
    if (!formData.title || !formData.summary) {
      alert("Please provide a chapter title and summary first")
      return
    }

    setIsGenerating(true)

    try {
      console.log("Using simple chapter generation...")

      const response = await fetch("/api/generate-chapter-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapterTitle: formData.title,
          chapterSummary: formData.summary,
          storyGenre: storyData.genre,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate chapter")
      }

      const data = await response.json()

      if (!data.content) {
        throw new Error("No content received")
      }

      setFormData((prev) => ({
        ...prev,
        content: data.content,
        wordCount: data.content.split(/\s+/).length,
      }))

      alert("Chapter generated successfully with simplified AI!")
    } catch (error: any) {
      console.error("Simple generation error:", error)
      alert("Simple generation also failed: " + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setFormData({
      title: chapter.title,
      summary: chapter.summary,
      content: chapter.content,
      wordCount: chapter.wordCount,
      status: chapter.status,
    })
    setIsDialogOpen(true)
  }

  const deleteChapter = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (chapter && confirm(`Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`)) {
      onDeleteChapter(chapterId)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const averageWordsPerChapter = chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0

  return (
    <div className="space-y-6">
      {/* Story Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Story Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chapters.length}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Chapters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalWords.toLocaleString()}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {averageWordsPerChapter.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Avg/Chapter</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {chapters.filter((c) => c.status === "complete").length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Management */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Chapters</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Write your story chapter by chapter with AI assistance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChapter ? "Edit Chapter" : "Create New Chapter"}</DialogTitle>
              <DialogDescription>Plan your chapter and use AI to generate professional content</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Chapter Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Chapter title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Chapter Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary of what happens in this chapter..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-between items-center">
                <Label htmlFor="content">Chapter Content</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={generateChapterSimple}
                    disabled={isGenerating || !formData.title || !formData.summary}
                    variant="outline"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Quick AI
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={generateChapterWithAI}
                    disabled={isGenerating || !formData.title || !formData.summary}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        {editingChapter && editingChapter.content ? "Regenerate Full AI" : "Full AI"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Chapter content will appear here after AI generation, or write manually..."
                className="min-h-[300px] font-mono text-sm"
              />

              {formData.content && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Word count: {formData.content.split(/\s+/).length.toLocaleString()}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingChapter ? "Update Chapter" : "Save Chapter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Chapters Yet</h3>
            <p className="text-slate-500 dark:text-slate-500 mb-4">
              Create your first chapter to begin writing your story
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Chapter {chapter.chapterNumber}: {chapter.title}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getStatusColor(chapter.status)}>{chapter.status}</Badge>
                      <Badge variant="outline">{chapter.wordCount.toLocaleString()} words</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(chapter)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteChapter(chapter.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chapter.summary && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{chapter.summary}</p>
                )}
                {chapter.content && (
                  <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    {chapter.content.substring(0, 200)}
                    {chapter.content.length > 200 ? "..." : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
