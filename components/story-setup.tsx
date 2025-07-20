"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StoryData } from "@/types/story"

interface StorySetupProps {
  storyData: StoryData
  updateStoryData: (updates: Partial<StoryData>) => void
}

export default function StorySetup({ storyData, updateStoryData }: StorySetupProps) {
  const writingStyles = [
    "First Person",
    "Third Person Limited",
    "Third Person Omniscient",
    "Multiple POV",
    "Epistolary",
    "Stream of Consciousness",
  ]

  const targetAudiences = [
    "Young Adult (13-17)",
    "New Adult (18-25)",
    "Adult (25+)",
    "Middle Grade (8-12)",
    "General Audience",
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Story Title *</Label>
          <Input
            id="title"
            value={storyData.title}
            onChange={(e) => updateStoryData({ title: e.target.value })}
            placeholder="Enter your story title"
            className="text-lg font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Genres * (Separate with commas)</Label>
          <Textarea
            id="genre"
            value={storyData.genre}
            onChange={(e) => updateStoryData({ genre: e.target.value })}
            placeholder="Fantasy, Urban Fantasy, Romance, Adventure..."
            className="min-h-[80px]"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter genres separated by commas. Examples: "High Fantasy, Romance", "Cyberpunk, Thriller, Mystery"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="writingStyle">Writing Style</Label>
          <Select value={storyData.writingStyle} onValueChange={(value) => updateStoryData({ writingStyle: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select writing style" />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Select
            value={storyData.targetAudience}
            onValueChange={(value) => updateStoryData({ targetAudience: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              {targetAudiences.map((audience) => (
                <SelectItem key={audience} value={audience}>
                  {audience}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting">Setting & World</Label>
        <Textarea
          id="setting"
          value={storyData.setting}
          onChange={(e) => updateStoryData({ setting: e.target.value })}
          placeholder="Describe the world, time period, and locations where your story takes place..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Theme & Message</Label>
        <Textarea
          id="theme"
          value={storyData.theme}
          onChange={(e) => updateStoryData({ theme: e.target.value })}
          placeholder="What themes, messages, or ideas do you want to explore in your story?"
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plotOutline">Plot Outline *</Label>
        <Textarea
          id="plotOutline"
          value={storyData.plotOutline}
          onChange={(e) => updateStoryData({ plotOutline: e.target.value })}
          placeholder="Provide a detailed plot outline including beginning, middle, and end. This will guide the AI in maintaining story consistency..."
          className="min-h-[150px]"
        />
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">AI Writing Guidelines</CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            The AI will use this information to maintain consistency and style throughout your story
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Story genres (comma-separated) will influence the AI's writing tone and style</li>
            <li>Plot outline ensures narrative consistency across chapters</li>
            <li>Character details will be referenced in every chapter</li>
            <li>Setting and theme guide scene descriptions and dialogue</li>
            <li>Writing style determines narrative perspective and voice</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
