"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, BookOpen, Settings } from "lucide-react"
import type { StoryData } from "@/types/story"

interface ExportManagerProps {
  storyData: StoryData
}

export default function ExportManager({ storyData }: ExportManagerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportSettings, setExportSettings] = useState({
    pageSize: "A5",
    margins: "standard",
    fontSize: "12",
    lineSpacing: "1.5",
    includeTableOfContents: true,
    includeChapterNumbers: true,
    includePageNumbers: true,
    primaryFont: storyData.fonts[0]?.name || "Times New Roman",
    titleFont: storyData.fonts[0]?.name || "Times New Roman",
    chapterBreaks: true,
    headerFooter: true,
    exportFormats: ["PDF", "EPUB"],
  })

  const pageSizes = [
    { value: "A4", label: 'A4 (8.27" × 11.69")' },
    { value: "A5", label: 'A5 (5.83" × 8.27") - Recommended for novels' },
    { value: "US Letter", label: 'US Letter (8.5" × 11")' },
    { value: "6x9", label: '6" × 9" - KDP Standard' },
    { value: "5x8", label: '5" × 8" - Compact novel' },
  ]

  const marginOptions = [
    { value: "narrow", label: 'Narrow (0.5")' },
    { value: "standard", label: 'Standard (0.75")' },
    { value: "wide", label: 'Wide (1")' },
    { value: "kdp", label: 'KDP Recommended (0.75" top/bottom, 1" sides)' },
  ]

  const exportBooks = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Export both PDF and EPUB
      for (const format of exportSettings.exportFormats) {
        const response = await fetch(`/api/export-${format.toLowerCase()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyData, settings: exportSettings }),
        })

        if (!response.ok) {
          throw new Error(`Failed to export ${format}`)
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `${storyData.title || "Novel"}.${format.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      clearInterval(progressInterval)
      setExportProgress(100)

      setTimeout(() => {
        setExportProgress(0)
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      console.error("Error exporting:", error)
      alert("Failed to export. Please try again.")
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const totalWords = storyData.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const estimatedPages = Math.ceil(totalWords / 250)

  return (
    <div className="space-y-6">
      {/* Export Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-100">Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{storyData.chapters.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Chapters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalWords.toLocaleString()}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">~{estimatedPages}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Est. Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{storyData.fonts.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Custom Fonts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Export Formats</CardTitle>
          <CardDescription>Choose which formats to export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pdf"
                checked={exportSettings.exportFormats.includes("PDF")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setExportSettings((prev) => ({
                      ...prev,
                      exportFormats: [...prev.exportFormats, "PDF"],
                    }))
                  } else {
                    setExportSettings((prev) => ({
                      ...prev,
                      exportFormats: prev.exportFormats.filter((f) => f !== "PDF"),
                    }))
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <Label htmlFor="pdf">PDF (Print Ready)</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="epub"
                checked={exportSettings.exportFormats.includes("EPUB")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setExportSettings((prev) => ({
                      ...prev,
                      exportFormats: [...prev.exportFormats, "EPUB"],
                    }))
                  } else {
                    setExportSettings((prev) => ({
                      ...prev,
                      exportFormats: prev.exportFormats.filter((f) => f !== "EPUB"),
                    }))
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <Label htmlFor="epub">EPUB (E-book)</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Export Settings
          </CardTitle>
          <CardDescription>Configure your export settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select
                value={exportSettings.pageSize}
                onValueChange={(value) => setExportSettings((prev) => ({ ...prev, pageSize: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margins">Margins</Label>
              <Select
                value={exportSettings.margins}
                onValueChange={(value) => setExportSettings((prev) => ({ ...prev, margins: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {marginOptions.map((margin) => (
                    <SelectItem key={margin.value} value={margin.value}>
                      {margin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Typography */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select
                value={exportSettings.fontSize}
                onValueChange={(value) => setExportSettings((prev) => ({ ...prev, fontSize: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10pt</SelectItem>
                  <SelectItem value="11">11pt</SelectItem>
                  <SelectItem value="12">12pt (Recommended)</SelectItem>
                  <SelectItem value="13">13pt</SelectItem>
                  <SelectItem value="14">14pt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineSpacing">Line Spacing</Label>
              <Select
                value={exportSettings.lineSpacing}
                onValueChange={(value) => setExportSettings((prev) => ({ ...prev, lineSpacing: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single</SelectItem>
                  <SelectItem value="1.15">1.15</SelectItem>
                  <SelectItem value="1.5">1.5 (Recommended)</SelectItem>
                  <SelectItem value="2">Double</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryFont">Body Font</Label>
              <Select
                value={exportSettings.primaryFont}
                onValueChange={(value) => setExportSettings((prev) => ({ ...prev, primaryFont: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Garamond">Garamond</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  {storyData.fonts.map((font) => (
                    <SelectItem key={font.id} value={font.name}>
                      {font.name} (Custom)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Options */}
          <div className="space-y-4">
            <h4 className="font-semibold">Content Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tableOfContents"
                  checked={exportSettings.includeTableOfContents}
                  onCheckedChange={(checked) =>
                    setExportSettings((prev) => ({ ...prev, includeTableOfContents: checked as boolean }))
                  }
                />
                <Label htmlFor="tableOfContents">Include Table of Contents</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="chapterNumbers"
                  checked={exportSettings.includeChapterNumbers}
                  onCheckedChange={(checked) =>
                    setExportSettings((prev) => ({ ...prev, includeChapterNumbers: checked as boolean }))
                  }
                />
                <Label htmlFor="chapterNumbers">Include Chapter Numbers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pageNumbers"
                  checked={exportSettings.includePageNumbers}
                  onCheckedChange={(checked) =>
                    setExportSettings((prev) => ({ ...prev, includePageNumbers: checked as boolean }))
                  }
                />
                <Label htmlFor="pageNumbers">Include Page Numbers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="chapterBreaks"
                  checked={exportSettings.chapterBreaks}
                  onCheckedChange={(checked) =>
                    setExportSettings((prev) => ({ ...prev, chapterBreaks: checked as boolean }))
                  }
                />
                <Label htmlFor="chapterBreaks">Start Chapters on New Page</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Novel</CardTitle>
          <CardDescription>Generate professional files ready for publishing</CardDescription>
        </CardHeader>
        <CardContent>
          {isExporting && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Generating files...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          <Button
            onClick={exportBooks}
            disabled={isExporting || storyData.chapters.length === 0 || exportSettings.exportFormats.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export {exportSettings.exportFormats.join(" & ")}
              </>
            )}
          </Button>

          {storyData.chapters.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
              You need to write at least one chapter before exporting.
            </p>
          )}

          {exportSettings.exportFormats.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
              Please select at least one export format.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
