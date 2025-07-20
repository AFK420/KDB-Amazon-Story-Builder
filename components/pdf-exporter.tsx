"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Download, Settings, Eye } from "lucide-react"
import type { StoryData } from "@/types/story"

interface PDFExporterProps {
  storyData: StoryData
}

export default function PDFExporter({ storyData }: PDFExporterProps) {
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

  const exportToPDF = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyData,
          settings: exportSettings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to export PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${storyData.title || "Novel"}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      clearInterval(progressInterval)
      setExportProgress(100)

      setTimeout(() => {
        setExportProgress(0)
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const previewPDF = async () => {
    // Generate preview with first few pages
    alert("PDF preview functionality would open a preview window with the first few pages")
  }

  const totalWords = storyData.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const estimatedPages = Math.ceil(totalWords / 250) // Rough estimate: 250 words per page

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

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Export Settings
          </CardTitle>
          <CardDescription>Configure your PDF export for professional KDP publishing</CardDescription>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="headerFooter"
                  checked={exportSettings.headerFooter}
                  onCheckedChange={(checked) =>
                    setExportSettings((prev) => ({ ...prev, headerFooter: checked as boolean }))
                  }
                />
                <Label htmlFor="headerFooter">Include Headers/Footers</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Novel</CardTitle>
          <CardDescription>Generate a professional PDF ready for KDP Amazon publishing</CardDescription>
        </CardHeader>
        <CardContent>
          {isExporting && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Generating PDF...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={previewPDF} variant="outline" disabled={isExporting || storyData.chapters.length === 0}>
              <Eye className="w-4 h-4 mr-2" />
              Preview PDF
            </Button>

            <Button
              onClick={exportToPDF}
              disabled={isExporting || storyData.chapters.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>

          {storyData.chapters.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              You need to write at least one chapter before exporting.
            </p>
          )}
        </CardContent>
      </Card>

      {/* KDP Guidelines */}
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">KDP Publishing Guidelines</CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Your PDF will be optimized for Amazon KDP requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200">
            <li>PDF will be generated in high resolution (300 DPI) for print quality</li>
            <li>Margins and spacing optimized for professional book layout</li>
            <li>Custom fonts embedded for consistent appearance</li>
            <li>Table of contents with proper navigation links</li>
            <li>Chapter breaks and page numbering for easy reading</li>
            <li>Compatible with KDP's manuscript requirements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
