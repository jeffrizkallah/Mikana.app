'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { MachineToolRequirement } from '@/lib/data'

interface MachineToolEditorProps {
  machinesTools: MachineToolRequirement[]
  onChange: (machinesTools: MachineToolRequirement[]) => void
}

export function MachineToolEditor({ machinesTools, onChange }: MachineToolEditorProps) {
  const addMachineTool = () => {
    onChange([
      ...machinesTools,
      {
        name: '',
        setting: '',
        purpose: '',
        notes: ''
      }
    ])
  }

  const updateMachineTool = (index: number, field: keyof MachineToolRequirement, value: string) => {
    const updated = [...machinesTools]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeMachineTool = (index: number) => {
    onChange(machinesTools.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          List all required machines and tools with their settings
        </p>
        <Button onClick={addMachineTool} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Machine/Tool
        </Button>
      </div>

      {machinesTools.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No machines or tools added yet
          </CardContent>
        </Card>
      )}

      {machinesTools.map((item, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Machine/Tool Name *</Label>
                    <Input
                      placeholder="e.g. Flat Grill or Pan"
                      value={item.name}
                      onChange={(e) => updateMachineTool(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Setting *</Label>
                    <Input
                      placeholder="e.g. Medium or 180°C"
                      value={item.setting}
                      onChange={(e) => updateMachineTool(index, 'setting', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeMachineTool(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purpose *</Label>
                  <Input
                    placeholder="e.g. Cooking fish"
                    value={item.purpose}
                    onChange={(e) => updateMachineTool(index, 'purpose', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Additional instructions"
                    value={item.notes || ''}
                    onChange={(e) => updateMachineTool(index, 'notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

