"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, Wand2, BookOpen } from "lucide-react"
import type { StoryData, Chapter } from "@/types/story"

interface PreviewManagerProps {
  storyData: StoryData
  onUpdateChapter: (id: string, updates: Partial<Chapter>) => void
}

export default function PreviewManager({ storyData, onUpdateChapter }: PreviewManagerProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
    storyData.chapters.length > 0 ? storyData.chapters[0] : null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [isAIEditing, setIsAIEditing] = useState(false)
  const [previewFont, setPreviewFont] = useState("serif")

  const handleChapterSelect = (chapterId: string) => {
    const chapter = storyData.chapters.find((c) => c.id === chapterId)
    if (chapter) {
      setSelectedChapter(chapter)
      setEditContent(chapter.content)
      setIsEditing(false)
    }
  }

  const handleSaveEdit = () => {
    if (selectedChapter) {
      const wordCount = editContent.split(/\s+/).length
      onUpdateChapter(selectedChapter.id, {
        content: editContent,
        wordCount: wordCount,
      })
      setSelectedChapter({ ...selectedChapter, content: editContent, wordCount })
      setIsEditing(false)
    }
  }

  const handleAIEdit = async () => {
    if (!selectedChapter) return

    setIsAIEditing(true)
    try {
      const response = await fetch("/api/ai-edit-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyData,
          chapter: selectedChapter,
          editInstructions: "Improve the writing quality, enhance descriptions, and ensure consistency with the story",
        }),
      })

      const data = await response.json()
      if (data.editedContent) {
        setEditContent(data.editedContent)
        setIsEditing(true)
      }
    } catch (error) {
      console.error("Error with AI editing:", error)
      alert("Failed to edit with AI. Please try again.")
    } finally {
      setIsAIEditing(false)
    }
  }

  const getPreviewStyle = () => {
    const baseStyle = {
      fontFamily: previewFont,
      lineHeight: "1.6",
      fontSize: "16px",
      color: "inherit",
    }

    if (storyData.fonts.length > 0 && previewFont !== "serif" && previewFont !== "sans-serif") {
      const customFont = storyData.fonts.find((f) => f.name === previewFont)
      if (customFont) {
        baseStyle.fontFamily = customFont.name
      }
    }

    return baseStyle
  }

  const formatChapterContent = (content: string) => {
    if (!content) return ""

    // Split content into paragraphs
    const paragraphs = content.split("\n\n").filter((p) => p.trim())

    return paragraphs
      .map((paragraph, index) => {
        const trimmed = paragraph.trim()
        if (!trimmed) return ""

        // First paragraph gets a drop cap
        if (index === 0) {
          const firstLetter = trimmed.charAt(0)
          const restOfFirstWord = trimmed.slice(1).split(" ")[0]
          const restOfParagraph = trimmed.slice(firstLetter.length + restOfFirstWord.length)

          return `
          <p style="margin-bottom: 1.5em; text-indent: 0;">
            <span style="float: left; font-size: 4em; line-height: 0.8; padding-right: 8px; padding-top: 4px; font-weight: bold; color: #374151;">
              ${firstLetter}
            </span>
            <span style="font-variant: small-caps; font-weight: 500;">
              ${restOfFirstWord}
            </span>${restOfParagraph}
          </p>
        `
        }

        // Regular paragraphs with proper indentation
        return `<p style="margin-bottom: 1.5em; text-indent: 2em;">${trimmed}</p>`
      })
      .join("")
  }

  return (
    <div className="space-y-6">
      {/* Chapter Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Selection</CardTitle>
          <CardDescription>Choose a chapter to preview and edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Chapter</label>
              <Select value={selectedChapter?.id || ""} onValueChange={handleChapterSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a chapter" />
                </SelectTrigger>
                <SelectContent>
                  {storyData.chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      Chapter {chapter.chapterNumber}: {chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preview Font</label>
              <Select value={previewFont} onValueChange={setPreviewFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif (Default)</SelectItem>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  {storyData.fonts.map((font) => (
                    <SelectItem key={font.id} value={font.name}>
                      {font.name} (Custom)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedChapter && (
            <div className="mt-4 flex gap-2">
              <Badge variant="outline">{selectedChapter.wordCount.toLocaleString()} words</Badge>
              <Badge variant="outline">Status: {selectedChapter.status}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview/Edit Area */}
      {selectedChapter && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                </CardTitle>
                <CardDescription>{selectedChapter.summary}</CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      onClick={() => {
                        setEditContent(selectedChapter.content)
                        setIsEditing(true)
                      }}
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleAIEdit}
                      disabled={isAIEditing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isAIEditing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI Editing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Edit
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSaveEdit}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Edit your chapter content..."
                />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Word count: {editContent.split(/\s+/).length.toLocaleString()}
                </div>
              </div>
            ) : (
              <div
                className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
                style={getPreviewStyle()}
              >
                {/* Professional Chapter Header */}
                <div className="text-center mb-12">
                  <div className="text-sm font-semibold tracking-widest text-slate-600 dark:text-slate-400 mb-4">
                    CHAPTER {selectedChapter.chapterNumber}
                  </div>
                  <div className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                    {selectedChapter.title.toUpperCase()}
                  </div>
                  <div className="w-16 h-px bg-slate-400 mx-auto mb-8"></div>
                  <div className="text-lg text-slate-600 dark:text-slate-400">∼</div>
                </div>

                {/* Professional Chapter Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert leading-relaxed">
                  <div
                    className="chapter-content"
                    style={{
                      textAlign: "justify",
                      lineHeight: "1.8",
                      fontSize: "16px",
                      fontFamily:
                        previewFont === "serif"
                          ? "Georgia, serif"
                          : previewFont === "sans-serif"
                            ? "system-ui, sans-serif"
                            : previewFont,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formatChapterContent(selectedChapter.content),
                    }}
                  />
                </div>

                {/* Chapter End Decoration */}
                <div className="text-center mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-slate-400">∼ ∼ ∼</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {storyData.chapters.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Chapters to Preview</h3>
            <p className="text-slate-500 dark:text-slate-500">
              Create some chapters first to preview and edit them here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
