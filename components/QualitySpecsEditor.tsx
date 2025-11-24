'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import type { QualitySpecification } from '@/lib/data'

interface QualitySpecsEditorProps {
  qualitySpecs: QualitySpecification[]
  onChange: (qualitySpecs: QualitySpecification[]) => void
}

export function QualitySpecsEditor({ qualitySpecs, onChange }: QualitySpecsEditorProps) {
  const addQualitySpec = () => {
    onChange([
      ...qualitySpecs,
      {
        aspect: '',
        specification: '',
        checkMethod: '',
        parameter: '',
        texture: '',
        tasteFlavorProfile: '',
        aroma: ''
      }
    ])
  }

  const updateQualitySpec = (index: number, field: keyof QualitySpecification, value: string) => {
    const updated = [...qualitySpecs]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeQualitySpec = (index: number) => {
    onChange(qualitySpecs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Define quality standards for appearance, texture, taste, and aroma
        </p>
        <Button onClick={addQualitySpec} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Quality Spec
        </Button>
      </div>

      {qualitySpecs.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No quality specifications added yet
          </CardContent>
        </Card>
      )}

      {qualitySpecs.map((spec, index) => (
        <Card key={index} className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold">Quality Specification {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeQualitySpec(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Aspect *</Label>
                <Input
                  placeholder="e.g. Appearance, Texture, Taste, Aroma"
                  value={spec.aspect || ''}
                  onChange={(e) => updateQualitySpec(index, 'aspect', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Specification *</Label>
                <Textarea
                  placeholder="e.g. Fish golden, clean grill marks; Vegetables bright, not dull"
                  value={spec.specification || ''}
                  onChange={(e) => updateQualitySpec(index, 'specification', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Check Method *</Label>
                <Input
                  placeholder="e.g. Visual inspection, Taste test, Texture test"
                  value={spec.checkMethod || ''}
                  onChange={(e) => updateQualitySpec(index, 'checkMethod', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Parameter</Label>
                <Textarea
                  placeholder="e.g. Fish golden, clean grill marks; Vegetables bright, not dull"
                  value={spec.parameter || ''}
                  onChange={(e) => updateQualitySpec(index, 'parameter', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Texture</Label>
                <Textarea
                  placeholder="e.g. Fish moist, flakes easily; Vegetables tender but firm"
                  value={spec.texture || ''}
                  onChange={(e) => updateQualitySpec(index, 'texture', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Taste / Flavor Profile</Label>
                <Textarea
                  placeholder="e.g. Creamy herb sauce, balanced dill; Seasoned lightly"
                  value={spec.tasteFlavorProfile || ''}
                  onChange={(e) => updateQualitySpec(index, 'tasteFlavorProfile', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Aroma</Label>
                <Input
                  placeholder="e.g. Fresh dill + lemon; Roasted potatoes smell"
                  value={spec.aroma || ''}
                  onChange={(e) => updateQualitySpec(index, 'aroma', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

