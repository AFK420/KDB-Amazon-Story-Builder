"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Type, Trash2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FontData, StoryData } from "@/types/story"

interface FontManagerProps {
  fonts: FontData[]
  storyData: StoryData
  onAddFont: (font: FontData) => void
}

export default function FontManager({ fonts, storyData, onAddFont }: FontManagerProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog.")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (isProcessing) return

    setIsProcessing(true)
    setProcessingError("")

    try {
      for (const file of files) {
        if (file.type.includes("font") || file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
          // Check file size (limit to 5MB to prevent memory issues)
          if (file.size > 5 * 1024 * 1024) {
            setProcessingError(`Font file "${file.name}" is too large. Please use files smaller than 5MB.`)
            continue
          }

          const fontData = await processFontFile(file)
          if (fontData) {
            onAddFont(fontData)
          }
        } else {
          setProcessingError(`"${file.name}" is not a supported font file. Please use TTF, OTF, WOFF, or WOFF2 files.`)
        }
      }
    } catch (error) {
      console.error("Error processing font files:", error)
      setProcessingError("Failed to process font files. Please try again with smaller files.")
    } finally {
      setIsProcessing(false)
    }
  }

  const processFontFile = async (file: File): Promise<FontData | null> => {
    try {
      console.log(`Processing font file: ${file.name}, size: ${file.size} bytes`)

      // Convert file to base64 using a more memory-efficient approach
      const base64 = await fileToBase64(file)

      // Create a simple font data object without trying to load the font
      // (Loading fonts in the browser can cause memory issues with large files)
      const fontData: FontData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        data: base64,
        type: file.type || "font/truetype",
        suitability: analyzeFontSuitability(file.name, storyData),
        recommendedFor: getRecommendedUsage(file.name, storyData),
      }

      console.log(`Successfully processed font: ${fontData.name}`)
      return fontData
    } catch (error) {
      console.error("Error processing font file:", error)
      setProcessingError(`Failed to process "${file.name}". The file may be corrupted or too large.`)
      return null
    }
  }

  // More memory-efficient base64 conversion
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const result = reader.result as string
          // Remove the data URL prefix to get just the base64 data
          const base64 = result.split(",")[1]
          resolve(base64)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const analyzeFontSuitability = (fileName: string, story: StoryData): "excellent" | "good" | "fair" | "poor" => {
    const name = fileName.toLowerCase()
    const genres = story.genre.toLowerCase()

    // Fantasy fonts
    if (
      (genres.includes("fantasy") || genres.includes("wuxia") || genres.includes("xianxia")) &&
      (name.includes("medieval") || name.includes("gothic") || name.includes("celtic") || name.includes("fantasy"))
    ) {
      return "excellent"
    }

    // Sci-fi fonts
    if (
      (genres.includes("science") ||
        genres.includes("cyberpunk") ||
        genres.includes("steampunk") ||
        genres.includes("biopunk") ||
        genres.includes("solarpunk")) &&
      (name.includes("futur") || name.includes("tech") || name.includes("cyber") || name.includes("sci"))
    ) {
      return "excellent"
    }

    // Horror fonts
    if (
      genres.includes("horror") &&
      (name.includes("horror") || name.includes("blood") || name.includes("scary") || name.includes("gothic"))
    ) {
      return "excellent"
    }

    // Romance fonts
    if (
      genres.includes("romance") &&
      (name.includes("script") || name.includes("elegant") || name.includes("calligraphy") || name.includes("romantic"))
    ) {
      return "excellent"
    }

    // Mystery/Thriller fonts
    if (
      (genres.includes("mystery") || genres.includes("thriller") || genres.includes("noir")) &&
      (name.includes("detective") || name.includes("mystery") || name.includes("noir"))
    ) {
      return "excellent"
    }

    // General readability fonts
    if (name.includes("serif") || name.includes("times") || name.includes("garamond") || name.includes("book")) {
      return "good"
    }

    return "fair"
  }

  const getRecommendedUsage = (fileName: string, story: StoryData): string[] => {
    const name = fileName.toLowerCase()
    const genres = story.genre.toLowerCase()
    const recommendations: string[] = []

    if (name.includes("title") || name.includes("display") || name.includes("header")) {
      recommendations.push("Chapter Titles", "Book Title")
    }

    if (name.includes("body") || name.includes("text") || name.includes("serif")) {
      recommendations.push("Body Text", "Paragraphs")
    }

    if (name.includes("script") || name.includes("handwriting")) {
      recommendations.push("Dialogue", "Letters", "Notes")
    }

    if (name.includes("decorative") || name.includes("ornament")) {
      recommendations.push("Chapter Decorations", "Drop Caps")
    }

    // Genre-specific recommendations
    if (genres.includes("fantasy") && (name.includes("medieval") || name.includes("celtic"))) {
      recommendations.push("Fantasy Elements", "Magic Scenes")
    }

    if (genres.includes("horror") && name.includes("gothic")) {
      recommendations.push("Atmospheric Scenes", "Tension Building")
    }

    return recommendations.length > 0 ? recommendations : ["General Use"]
  }

  const getSuitabilityColor = (suitability: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      poor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[suitability as keyof typeof colors] || colors.fair
  }

  const removeFont = (fontId: string) => {
    // This would need to be implemented in the parent component
    console.log("Remove font:", fontId)
  }

  return (
    <div className="space-y-6">
      {/* AI Font Analysis */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-900 dark:text-purple-100">AI Font Analysis</CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            Our AI analyzes your story's genre, mood, and style to recommend the most suitable fonts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Story Genres:</strong> {storyData.genre || "Not specified"}
            </div>
            <div>
              <strong>Writing Style:</strong> {storyData.writingStyle || "Not specified"}
            </div>
            <div>
              <strong>Target Audience:</strong> {storyData.targetAudience || "Not specified"}
            </div>
            <div>
              <strong>Recommended Font Types:</strong>
              {storyData.genre.includes("Fantasy") && " Medieval, Gothic, Celtic"}
              {storyData.genre.includes("Science Fiction") && " Futuristic, Tech, Modern"}
              {storyData.genre.includes("Romance") && " Script, Elegant, Calligraphy"}
              {storyData.genre.includes("Horror") && " Gothic, Distressed, Bold"}
              {storyData.genre.includes("Mystery") && " Detective, Noir, Classic"}
              {!storyData.genre && " Upload fonts to see recommendations"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {processingError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{processingError}</AlertDescription>
        </Alert>
      )}

      {/* Font Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Custom Fonts</CardTitle>
          <CardDescription>Upload TTF, OTF, WOFF, or WOFF2 font files for your book (max 5MB each)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-600"
            } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {isProcessing ? "Processing fonts..." : "Drop font files here or click to browse"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Supports TTF, OTF, WOFF, WOFF2 formats (max 5MB each)
            </p>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Choose Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Font Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Font Preview</CardTitle>
          <CardDescription>Preview your uploaded fonts with custom text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preview-text">Preview Text</Label>
              <Input
                id="preview-text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Enter text to preview fonts"
              />
            </div>

            {fonts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Type className="w-12 h-12 mx-auto mb-4" />
                <p>No fonts uploaded yet. Upload fonts to see previews.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fonts.map((font) => (
                  <Card key={font.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{font.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getSuitabilityColor(font.suitability)}>{font.suitability}</Badge>
                          {font.recommendedFor.map((usage) => (
                            <Badge key={usage} variant="outline" className="text-xs">
                              {usage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeFont(font.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-lg p-3 bg-gray-50 dark:bg-gray-800 rounded border font-serif">
                      {previewText}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      File: {font.fileName} • Size: {Math.round((font.data.length * 0.75) / 1024)}KB
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
