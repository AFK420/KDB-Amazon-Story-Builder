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
import { Plus, Edit, Trash2, User } from "lucide-react"
import type { Character } from "@/types/story"

interface CharacterManagerProps {
  characters: Character[]
  onAddCharacter: (character: Character) => void
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void
  onDeleteCharacter: (id: string) => void
}

export default function CharacterManager({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}: CharacterManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [formData, setFormData] = useState<Partial<Character>>({
    name: "",
    role: "",
    description: "",
    personality: "",
    background: "",
    goals: "",
    relationships: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      description: "",
      personality: "",
      background: "",
      goals: "",
      relationships: "",
    })
    setEditingCharacter(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.role) return

    if (editingCharacter) {
      onUpdateCharacter(editingCharacter.id, formData)
    } else {
      onAddCharacter(formData as Character)
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (character: Character) => {
    setEditingCharacter(character)
    setFormData(character)
    setIsDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      Protagonist: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Antagonist: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Supporting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Minor: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }
    return colors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Character Roster</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create detailed character profiles to guide AI writing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCharacter ? "Edit Character" : "Create New Character"}</DialogTitle>
              <DialogDescription>
                Provide detailed information about your character for AI consistency
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full character name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <option value="Protagonist">Protagonist</option>
                    <option value="Antagonist">Antagonist</option>
                    <option value="Supporting">Supporting Character</option>
                    <option value="Minor">Minor Character</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Physical Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the character's appearance, age, distinctive features..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality">Personality & Traits</Label>
                <Textarea
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  placeholder="Character's personality, quirks, habits, speech patterns..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background & History</Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="Character's past, family, education, significant events..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals & Motivations</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="What does this character want? What drives them?"
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationships">Relationships</Label>
                <Textarea
                  id="relationships"
                  value={formData.relationships}
                  onChange={(e) => setFormData({ ...formData, relationships: e.target.value })}
                  placeholder="How this character relates to other characters..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingCharacter ? "Update Character" : "Create Character"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {characters.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <User className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Characters Yet</h3>
            <p className="text-slate-500 dark:text-slate-500 mb-4">
              Create your first character to begin building your story world
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Card key={character.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <Badge className={getRoleColor(character.role)} variant="secondary">
                      {character.role}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(character)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteCharacter(character.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {character.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {character.description.substring(0, 100)}
                    {character.description.length > 100 ? "..." : ""}
                  </p>
                )}
                {character.personality && (
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    <strong>Personality:</strong> {character.personality.substring(0, 80)}
                    {character.personality.length > 80 ? "..." : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
