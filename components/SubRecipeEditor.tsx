'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { 
  SubRecipe, 
  Ingredient, 
  PreparationStep, 
  MachineToolRequirement, 
  QualitySpecification, 
  PackingLabeling 
} from '@/lib/data'

interface SubRecipeEditorProps {
  subRecipes: SubRecipe[]
  onChange: (subRecipes: SubRecipe[]) => void
}

export function SubRecipeEditor({ subRecipes, onChange }: SubRecipeEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<Record<number, string>>({})

  const addSubRecipe = () => {
    onChange([
      ...subRecipes,
      {
        subRecipeId: `sub-recipe-${Date.now()}`,
        name: '',
        yield: '',
        ingredients: [],
        notes: ''
      }
    ])
    setExpandedIndex(subRecipes.length)
  }

  const updateSubRecipe = (index: number, field: keyof SubRecipe, value: any) => {
    const updated = [...subRecipes]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeSubRecipe = (index: number) => {
    onChange(subRecipes.filter((_, i) => i !== index))
    if (expandedIndex === index) {
      setExpandedIndex(null)
    }
  }

  const addIngredient = (subRecipeIndex: number) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].ingredients.push({
      item: '',
      quantity: '',
      unit: '',
      notes: ''
    })
    onChange(updated)
  }

  const updateIngredient = (
    subRecipeIndex: number,
    ingredientIndex: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].ingredients[ingredientIndex] = {
      ...updated[subRecipeIndex].ingredients[ingredientIndex],
      [field]: value
    }
    onChange(updated)
  }

  const removeIngredient = (subRecipeIndex: number, ingredientIndex: number) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].ingredients = updated[subRecipeIndex].ingredients.filter(
      (_, i) => i !== ingredientIndex
    )
    onChange(updated)
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  // Preparation steps handlers
  const addPreparationStep = (subRecipeIndex: number) => {
    const updated = [...subRecipes]
    if (!updated[subRecipeIndex].preparation) {
      updated[subRecipeIndex].preparation = []
    }
    updated[subRecipeIndex].preparation!.push({
      step: updated[subRecipeIndex].preparation!.length + 1,
      instruction: '',
      time: '',
      critical: false,
      hint: ''
    })
    onChange(updated)
  }

  const updatePreparationStep = (
    subRecipeIndex: number,
    stepIndex: number,
    field: keyof PreparationStep,
    value: any
  ) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].preparation![stepIndex] = {
      ...updated[subRecipeIndex].preparation![stepIndex],
      [field]: value
    }
    onChange(updated)
  }

  const removePreparationStep = (subRecipeIndex: number, stepIndex: number) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].preparation = updated[subRecipeIndex].preparation!.filter(
      (_, i) => i !== stepIndex
    )
    onChange(updated)
  }

  // Machine/Tool handlers
  const addMachineTool = (subRecipeIndex: number) => {
    const updated = [...subRecipes]
    if (!updated[subRecipeIndex].requiredMachinesTools) {
      updated[subRecipeIndex].requiredMachinesTools = []
    }
    updated[subRecipeIndex].requiredMachinesTools!.push({
      name: '',
      purpose: '',
      specifications: ''
    })
    onChange(updated)
  }

  const updateMachineTool = (
    subRecipeIndex: number,
    toolIndex: number,
    field: keyof MachineToolRequirement,
    value: string
  ) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].requiredMachinesTools![toolIndex] = {
      ...updated[subRecipeIndex].requiredMachinesTools![toolIndex],
      [field]: value
    }
    onChange(updated)
  }

  const removeMachineTool = (subRecipeIndex: number, toolIndex: number) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].requiredMachinesTools = updated[subRecipeIndex].requiredMachinesTools!.filter(
      (_, i) => i !== toolIndex
    )
    onChange(updated)
  }

  // Quality spec handlers
  const addQualitySpec = (subRecipeIndex: number) => {
    const updated = [...subRecipes]
    if (!updated[subRecipeIndex].qualitySpecifications) {
      updated[subRecipeIndex].qualitySpecifications = []
    }
    updated[subRecipeIndex].qualitySpecifications!.push({
      aspect: '',
      specification: '',
      checkMethod: ''
    })
    onChange(updated)
  }

  const updateQualitySpec = (
    subRecipeIndex: number,
    specIndex: number,
    field: keyof QualitySpecification,
    value: string
  ) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].qualitySpecifications![specIndex] = {
      ...updated[subRecipeIndex].qualitySpecifications![specIndex],
      [field]: value
    }
    onChange(updated)
  }

  const removeQualitySpec = (subRecipeIndex: number, specIndex: number) => {
    const updated = [...subRecipes]
    updated[subRecipeIndex].qualitySpecifications = updated[subRecipeIndex].qualitySpecifications!.filter(
      (_, i) => i !== specIndex
    )
    onChange(updated)
  }

  // Packing/Labeling handlers
  const updatePackingLabeling = (
    subRecipeIndex: number,
    field: keyof PackingLabeling,
    value: any
  ) => {
    const updated = [...subRecipes]
    if (!updated[subRecipeIndex].packingLabeling) {
      updated[subRecipeIndex].packingLabeling = {
        packingType: '',
        serviceItems: [],
        labelRequirements: '',
        storageCondition: '',
        shelfLife: ''
      }
    }
    updated[subRecipeIndex].packingLabeling = {
      ...updated[subRecipeIndex].packingLabeling!,
      [field]: value
    }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Define sub-recipes that can be referenced in main ingredients
        </p>
        <Button onClick={addSubRecipe} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Sub-Recipe
        </Button>
      </div>

      {subRecipes.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No sub-recipes defined. Click &quot;Add Sub-Recipe&quot; to create one.
          </CardContent>
        </Card>
      )}

      {subRecipes.map((subRecipe, subIndex) => (
        <Card key={subRecipe.subRecipeId} className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(subIndex)}
                  className="p-1"
                >
                  {expandedIndex === subIndex ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <CardTitle className="text-base">
                  {subRecipe.name || `Sub-Recipe ${subIndex + 1}`}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  ({subRecipe.ingredients.length} ingredients)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeSubRecipe(subIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {expandedIndex === subIndex && (
            <CardContent className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sub-Recipe Name *</Label>
                  <Input
                    placeholder="e.g. Grilled Fish Hamour Marination 1 KG"
                    value={subRecipe.name}
                    onChange={(e) => updateSubRecipe(subIndex, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub-Recipe ID (Slug) *</Label>
                  <Input
                    placeholder="e.g. grilled-fish-hamour"
                    value={subRecipe.subRecipeId}
                    onChange={(e) => updateSubRecipe(subIndex, 'subRecipeId', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Yield *</Label>
                  <Input
                    placeholder="e.g. 1 KG"
                    value={subRecipe.yield}
                    onChange={(e) => updateSubRecipe(subIndex, 'yield', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Additional notes"
                    value={subRecipe.notes || ''}
                    onChange={(e) => updateSubRecipe(subIndex, 'notes', e.target.value)}
                  />
                </div>
              </div>

              <Tabs 
                value={activeSubTab[subIndex] || 'ingredients'} 
                onValueChange={(value) => setActiveSubTab(prev => ({ ...prev, [subIndex]: value }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="preparation">Preparation</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="packing">Packing</TabsTrigger>
                </TabsList>

                <TabsContent value="ingredients" className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Ingredients</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addIngredient(subIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Ingredient
                    </Button>
                  </div>

                  {subRecipe.ingredients.map((ingredient, ingIndex) => (
                    <div key={ingIndex} className="flex gap-2 items-start p-3 bg-muted/50 rounded-md">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Item"
                          value={ingredient.item}
                          onChange={(e) =>
                            updateIngredient(subIndex, ingIndex, 'item', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Quantity"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(subIndex, ingIndex, 'quantity', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Unit"
                          value={ingredient.unit || ''}
                          onChange={(e) =>
                            updateIngredient(subIndex, ingIndex, 'unit', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Notes"
                          value={ingredient.notes || ''}
                          onChange={(e) =>
                            updateIngredient(subIndex, ingIndex, 'notes', e.target.value)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeIngredient(subIndex, ingIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {subRecipe.ingredients.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No ingredients added yet
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="preparation" className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Preparation Steps</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addPreparationStep(subIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Step
                    </Button>
                  </div>

                  {(subRecipe.preparation || []).map((step, stepIndex) => (
                    <div key={stepIndex} className="border p-3 rounded-md space-y-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Step {stepIndex + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => removePreparationStep(subIndex, stepIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Instruction"
                        value={step.instruction}
                        onChange={(e) =>
                          updatePreparationStep(subIndex, stepIndex, 'instruction', e.target.value)
                        }
                        className="min-h-[60px]"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Time (e.g. 5 mins)"
                          value={step.time}
                          onChange={(e) =>
                            updatePreparationStep(subIndex, stepIndex, 'time', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Hint/Tip"
                          value={step.hint || ''}
                          onChange={(e) =>
                            updatePreparationStep(subIndex, stepIndex, 'hint', e.target.value)
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={step.critical}
                            onCheckedChange={(checked) =>
                              updatePreparationStep(subIndex, stepIndex, 'critical', !!checked)
                            }
                          />
                          <label className="text-sm">Critical Step</label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!subRecipe.preparation || subRecipe.preparation.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No preparation steps added yet
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="equipment" className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Required Equipment & Tools</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addMachineTool(subIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Equipment
                    </Button>
                  </div>

                  {(subRecipe.requiredMachinesTools || []).map((tool, toolIndex) => (
                    <div key={toolIndex} className="flex gap-2 items-start p-3 bg-muted/50 rounded-md">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Name"
                          value={tool.name}
                          onChange={(e) =>
                            updateMachineTool(subIndex, toolIndex, 'name', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Purpose"
                          value={tool.purpose}
                          onChange={(e) =>
                            updateMachineTool(subIndex, toolIndex, 'purpose', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Specifications"
                          value={tool.specifications || ''}
                          onChange={(e) =>
                            updateMachineTool(subIndex, toolIndex, 'specifications', e.target.value)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeMachineTool(subIndex, toolIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {(!subRecipe.requiredMachinesTools || subRecipe.requiredMachinesTools.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No equipment added yet
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="quality" className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Quality Specifications</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addQualitySpec(subIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Specification
                    </Button>
                  </div>

                  {(subRecipe.qualitySpecifications || []).map((spec, specIndex) => (
                    <div key={specIndex} className="flex gap-2 items-start p-3 bg-muted/50 rounded-md">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Aspect (e.g. Temperature)"
                          value={spec.aspect}
                          onChange={(e) =>
                            updateQualitySpec(subIndex, specIndex, 'aspect', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Specification"
                          value={spec.specification}
                          onChange={(e) =>
                            updateQualitySpec(subIndex, specIndex, 'specification', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Check Method"
                          value={spec.checkMethod}
                          onChange={(e) =>
                            updateQualitySpec(subIndex, specIndex, 'checkMethod', e.target.value)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeQualitySpec(subIndex, specIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {(!subRecipe.qualitySpecifications || subRecipe.qualitySpecifications.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No quality specifications added yet
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="packing" className="space-y-3 mt-4">
                  <Label>Packing & Labeling</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Packing Type</Label>
                      <Input
                        placeholder="e.g. Hot holding pan"
                        value={subRecipe.packingLabeling?.packingType || ''}
                        onChange={(e) =>
                          updatePackingLabeling(subIndex, 'packingType', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Shelf Life</Label>
                      <Input
                        placeholder="e.g. 2 hours maximum"
                        value={subRecipe.packingLabeling?.shelfLife || ''}
                        onChange={(e) =>
                          updatePackingLabeling(subIndex, 'shelfLife', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Service Items (comma-separated)</Label>
                    <Input
                      placeholder="e.g. Tongs, Serving tray"
                      value={subRecipe.packingLabeling?.serviceItems?.join(', ') || ''}
                      onChange={(e) =>
                        updatePackingLabeling(
                          subIndex,
                          'serviceItems',
                          e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Label Requirements</Label>
                    <Textarea
                      placeholder="e.g. Keep hot - serve within 2 hours"
                      value={subRecipe.packingLabeling?.labelRequirements || ''}
                      onChange={(e) =>
                        updatePackingLabeling(subIndex, 'labelRequirements', e.target.value)
                      }
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Storage Condition</Label>
                    <Textarea
                      placeholder="e.g. Hold at 65°C+ until service"
                      value={subRecipe.packingLabeling?.storageCondition || ''}
                      onChange={(e) =>
                        updatePackingLabeling(subIndex, 'storageCondition', e.target.value)
                      }
                      className="min-h-[60px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

