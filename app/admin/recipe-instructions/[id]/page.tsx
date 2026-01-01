'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, ArrowLeft, Loader2, Flame, GripVertical, ChefHat } from 'lucide-react'
import type { RecipeInstruction, InstructionComponent, Recipe } from '@/lib/data'
import { ImageUpload } from '@/components/ImageUpload'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const EMPTY_COMPONENT: InstructionComponent = {
  componentId: '',
  subRecipeName: '',
  servingPerPortion: 0,
  unit: 'Gr',
  reheatingSteps: ['', '', ''],
  quantityControlNotes: '',
  presentationGuidelines: ''
}

const EMPTY_INSTRUCTION: RecipeInstruction = {
  instructionId: '',
  dishName: '',
  linkedRecipeId: '',
  category: 'Main Course',
  daysAvailable: [],
  components: [],
  visualPresentation: [],
  branchManagerFeedback: ''
}

export default function RecipeInstructionEditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new'
  const router = useRouter()
  const [instruction, setInstruction] = useState<RecipeInstruction>(EMPTY_INSTRUCTION)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    fetchRecipes()
    if (!isNew) {
      fetchInstruction()
    }
  }, [params.id])

  const fetchInstruction = async () => {
    try {
      const res = await fetch(`/api/recipe-instructions/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setInstruction(data)
      } else {
        alert('Instruction not found')
        router.push('/admin/recipe-instructions')
      }
    } catch (error) {
      console.error('Failed to fetch instruction', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes')
      const data = await res.json()
      setRecipes(data)
    } catch (error) {
      console.error('Failed to fetch recipes', error)
    }
  }

  const saveInstruction = async () => {
    if (!instruction.dishName.trim()) {
      alert('Please enter a dish name')
      return
    }
    if (!instruction.instructionId.trim()) {
      alert('Please enter an instruction ID')
      return
    }

    setIsSaving(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/recipe-instructions' : `/api/recipe-instructions/${params.id}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instruction)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      router.push('/admin/recipe-instructions')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof RecipeInstruction, value: any) => {
    setInstruction(prev => ({ ...prev, [field]: value }))
  }

  const toggleDay = (day: string) => {
    setInstruction(prev => {
      const days = prev.daysAvailable.includes(day)
        ? prev.daysAvailable.filter(d => d !== day)
        : [...prev.daysAvailable, day]
      return { ...prev, daysAvailable: days }
    })
  }

  // Component management
  const addComponent = () => {
    const newComponent: InstructionComponent = {
      ...EMPTY_COMPONENT,
      componentId: `component-${Date.now()}`
    }
    setInstruction(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }))
  }

  const updateComponent = (index: number, field: keyof InstructionComponent, value: any) => {
    const newComponents = [...instruction.components]
    newComponents[index] = { ...newComponents[index], [field]: value }
    setInstruction(prev => ({ ...prev, components: newComponents }))
  }

  const updateReheatingStep = (componentIndex: number, stepIndex: number, value: string) => {
    const newComponents = [...instruction.components]
    const newSteps = [...newComponents[componentIndex].reheatingSteps]
    newSteps[stepIndex] = value
    newComponents[componentIndex] = { ...newComponents[componentIndex], reheatingSteps: newSteps }
    setInstruction(prev => ({ ...prev, components: newComponents }))
  }

  const addReheatingStep = (componentIndex: number) => {
    const newComponents = [...instruction.components]
    newComponents[componentIndex] = {
      ...newComponents[componentIndex],
      reheatingSteps: [...newComponents[componentIndex].reheatingSteps, '']
    }
    setInstruction(prev => ({ ...prev, components: newComponents }))
  }

  const removeReheatingStep = (componentIndex: number, stepIndex: number) => {
    const newComponents = [...instruction.components]
    const newSteps = newComponents[componentIndex].reheatingSteps.filter((_, i) => i !== stepIndex)
    newComponents[componentIndex] = { ...newComponents[componentIndex], reheatingSteps: newSteps }
    setInstruction(prev => ({ ...prev, components: newComponents }))
  }

  const removeComponent = (index: number) => {
    setInstruction(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }))
  }

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= instruction.components.length) return

    const newComponents = [...instruction.components]
    const temp = newComponents[index]
    newComponents[index] = newComponents[newIndex]
    newComponents[newIndex] = temp
    setInstruction(prev => ({ ...prev, components: newComponents }))
  }

  // Generate slug from dish name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              {isNew ? 'Create Recipe Instruction' : `Edit: ${instruction.dishName}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Define reheating and assembly instructions for branch staff
            </p>
          </div>
        </div>
        <Button onClick={saveInstruction} disabled={isSaving} className="gap-2 bg-orange-500 hover:bg-orange-600">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Instruction
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="components">
            Components
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
              {instruction.components.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="presentation">Presentation</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about this recipe instruction</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dish Name *</Label>
                  <Input
                    value={instruction.dishName}
                    onChange={e => {
                      updateField('dishName', e.target.value)
                      if (isNew) {
                        updateField('instructionId', generateSlug(e.target.value))
                      }
                    }}
                    placeholder="e.g. Hm Oriental Chicken with Rice"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instruction ID (Slug) *</Label>
                  <Input
                    value={instruction.instructionId}
                    onChange={e => updateField('instructionId', e.target.value)}
                    placeholder="e.g. hm-oriental-chicken-rice"
                    disabled={!isNew}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={instruction.category}
                    onChange={e => updateField('category', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Side">Side</option>
                    <option value="Soup">Soup</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Salad">Salad</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Linked Recipe (Central Kitchen)</Label>
                  <select
                    value={instruction.linkedRecipeId || ''}
                    onChange={e => updateField('linkedRecipeId', e.target.value || undefined)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">No linked recipe</option>
                    {recipes.map(recipe => (
                      <option key={recipe.recipeId} value={recipe.recipeId}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Days Available</Label>
                <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-muted/30">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={instruction.daysAvailable.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">{day}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Components
                </CardTitle>
                <CardDescription>
                  Each component is an ingredient/item with its own reheating instructions
                </CardDescription>
              </div>
              <Button onClick={addComponent} className="gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {instruction.components.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No components added yet.</p>
                  <p className="text-sm">Click "Add Component" to add ingredients with reheating instructions.</p>
                </div>
              )}

              {instruction.components.map((component, idx) => (
                <Card key={component.componentId || idx} className="border-2 border-orange-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          Component {idx + 1}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveComponent(idx, 'up')}
                          disabled={idx === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveComponent(idx, 'down')}
                          disabled={idx === instruction.components.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeComponent(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sub-Recipe / Ingredient Name</Label>
                        <Input
                          value={component.subRecipeName}
                          onChange={e => updateComponent(idx, 'subRecipeName', e.target.value)}
                          placeholder="e.g. Chicken Stuffed For Oriental Chicken 1 KG"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Component ID</Label>
                        <Input
                          value={component.componentId}
                          onChange={e => updateComponent(idx, 'componentId', e.target.value)}
                          placeholder="e.g. chicken-stuffed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Serving Per Portion</Label>
                        <Input
                          type="number"
                          value={component.servingPerPortion}
                          onChange={e => updateComponent(idx, 'servingPerPortion', parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <select
                          value={component.unit}
                          onChange={e => updateComponent(idx, 'unit', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="Gr">Gram (Gr)</option>
                          <option value="KG">Kilogram (KG)</option>
                          <option value="Unit">Unit</option>
                          <option value="ML">Milliliter (ML)</option>
                          <option value="L">Liter (L)</option>
                          <option value="Pcs">Pieces (Pcs)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Reheating Steps</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addReheatingStep(idx)}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Step
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {component.reheatingSteps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex gap-2 items-start">
                            <span className="flex-shrink-0 w-6 h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                              {stepIdx + 1}.
                            </span>
                            <Textarea
                              value={step}
                              onChange={e => updateReheatingStep(idx, stepIdx, e.target.value)}
                              placeholder={`Step ${stepIdx + 1}...`}
                              rows={2}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                              onClick={() => removeReheatingStep(idx, stepIdx)}
                              disabled={component.reheatingSteps.length <= 1}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity Control Notes</Label>
                        <Textarea
                          value={component.quantityControlNotes}
                          onChange={e => updateComponent(idx, 'quantityControlNotes', e.target.value)}
                          placeholder="Notes about portion control, consistency, etc."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Presentation Guidelines</Label>
                        <Textarea
                          value={component.presentationGuidelines}
                          onChange={e => updateComponent(idx, 'presentationGuidelines', e.target.value)}
                          placeholder="How to present this component visually"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presentation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Presentation</CardTitle>
              <CardDescription>Add reference images for the final dish presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                images={instruction.visualPresentation}
                onImagesChange={(images) => updateField('visualPresentation', images)}
                maxImages={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branch Manager Feedback</CardTitle>
              <CardDescription>Notes or feedback from branch managers about this dish</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={instruction.branchManagerFeedback}
                onChange={e => updateField('branchManagerFeedback', e.target.value)}
                placeholder="Any feedback, concerns, or suggestions from branch managers..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

