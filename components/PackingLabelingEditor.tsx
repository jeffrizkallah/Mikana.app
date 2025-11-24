'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import type { PackingLabeling } from '@/lib/data'

interface PackingLabelingEditorProps {
  packingLabeling: PackingLabeling
  onChange: (packingLabeling: PackingLabeling) => void
}

export function PackingLabelingEditor({ packingLabeling, onChange }: PackingLabelingEditorProps) {
  const updateField = (field: keyof PackingLabeling, value: any) => {
    onChange({ ...packingLabeling, [field]: value })
  }

  const addServiceItem = () => {
    updateField('serviceItems', [...packingLabeling.serviceItems, ''])
  }

  const updateServiceItem = (index: number, value: string) => {
    const updated = [...packingLabeling.serviceItems]
    updated[index] = value
    updateField('serviceItems', updated)
  }

  const removeServiceItem = (index: number) => {
    updateField('serviceItems', packingLabeling.serviceItems.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Packing & Labeling Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Packing Type *</Label>
          <Input
            placeholder="e.g. Black Base 2 Comp Container"
            value={packingLabeling.packingType}
            onChange={(e) => updateField('packingType', e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Service Items</Label>
            <Button size="sm" variant="outline" onClick={addServiceItem}>
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
          {packingLabeling.serviceItems.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="e.g. 1x Black HD Fork"
                value={item}
                onChange={(e) => updateServiceItem(index, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => removeServiceItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {packingLabeling.serviceItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No service items added
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Label Requirements</Label>
          <Textarea
            placeholder="e.g. Production date & Expiration Date"
            value={packingLabeling.labelRequirements}
            onChange={(e) => updateField('labelRequirements', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Storage Condition</Label>
          <Textarea
            placeholder="e.g. Chilled: 0-5°C - Frozen: -18°C"
            value={packingLabeling.storageCondition}
            onChange={(e) => updateField('storageCondition', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Shelf Life</Label>
          <Input
            placeholder="e.g. Chilled: max 3 days - Frozen: max 3 months"
            value={packingLabeling.shelfLife}
            onChange={(e) => updateField('shelfLife', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

