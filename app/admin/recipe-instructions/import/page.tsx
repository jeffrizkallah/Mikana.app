'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Flame, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle,
  Check,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react'
import type { RecipeInstruction, InstructionComponent } from '@/lib/data'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface ParsedComponent {
  subRecipeName: string
  servingPerPortion: number
  unit: string
  reheatingSteps: string[]
  quantityControlNotes: string
  presentationGuidelines: string
}

interface ParsedInstruction {
  dishName: string
  components: ParsedComponent[]
}

export default function ImportRecipeInstructionsPage() {
  const router = useRouter()
  const [rawData, setRawData] = useState('')
  const [parsedInstructions, setParsedInstructions] = useState<ParsedInstruction[]>([])
  const [selectedInstruction, setSelectedInstruction] = useState<number | null>(null)
  const [category, setCategory] = useState('Main Course')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseExcelData = () => {
    setIsParsing(true)
    setError(null)

    try {
      const lines = rawData.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('Please paste at least 2 rows of data (header + data)')
      }

      // Parse header row to find column indices
      const header = lines[0].split('\t').map(h => h.trim().toLowerCase())
      
      const dishNameIdx = header.findIndex(h => 
        h.includes('dish name') || h.includes('counter') || h.includes('recipe')
      )
      const subRecipeIdx = header.findIndex(h => 
        h.includes('sub-recipe') || h.includes('sub recipe') || h.includes('component')
      )
      const servingIdx = header.findIndex(h => 
        h.includes('serving') || h.includes('portion') || h.includes('qty')
      )
      const unitIdx = header.findIndex(h => 
        h.includes('unit') || h.includes('uom')
      )
      const step1Idx = header.findIndex(h => 
        h.includes('step 1') || h.includes('procedure') && h.includes('1')
      )
      const step2Idx = header.findIndex(h => 
        h.includes('step 2') || h.includes('procedure') && h.includes('2')
      )
      const step3Idx = header.findIndex(h => 
        h.includes('step 3') || h.includes('procedure') && h.includes('3')
      )
      const qualityIdx = header.findIndex(h => 
        h.includes('quality') || h.includes('control') || h.includes('notes')
      )
      const presentationIdx = header.findIndex(h => 
        h.includes('presentation') || h.includes('guideline')
      )

      // Group rows by dish name
      const instructionMap = new Map<string, ParsedComponent[]>()
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t').map(c => c.trim())
        if (!cols[0]) continue

        const dishName = dishNameIdx >= 0 ? cols[dishNameIdx] || '' : cols[0] || ''
        if (!dishName) continue

        const component: ParsedComponent = {
          subRecipeName: subRecipeIdx >= 0 ? cols[subRecipeIdx] || '' : cols[1] || '',
          servingPerPortion: servingIdx >= 0 ? parseFloat(cols[servingIdx]) || 0 : parseFloat(cols[2]) || 0,
          unit: unitIdx >= 0 ? cols[unitIdx] || 'Gr' : cols[3] || 'Gr',
          reheatingSteps: [
            step1Idx >= 0 ? cols[step1Idx] || '' : cols[4] || '',
            step2Idx >= 0 ? cols[step2Idx] || '' : cols[5] || '',
            step3Idx >= 0 ? cols[step3Idx] || '' : cols[6] || ''
          ].filter(s => s),
          quantityControlNotes: qualityIdx >= 0 ? cols[qualityIdx] || '' : cols[7] || '',
          presentationGuidelines: presentationIdx >= 0 ? cols[presentationIdx] || '' : cols[8] || ''
        }

        if (!instructionMap.has(dishName)) {
          instructionMap.set(dishName, [])
        }
        instructionMap.get(dishName)!.push(component)
      }

      const parsed: ParsedInstruction[] = []
      instructionMap.forEach((components, dishName) => {
        parsed.push({ dishName, components })
      })

      if (parsed.length === 0) {
        throw new Error('No valid data found. Make sure your Excel data follows the expected format.')
      }

      setParsedInstructions(parsed)
      setSelectedInstruction(0)
    } catch (err: any) {
      setError(err.message || 'Failed to parse data')
    } finally {
      setIsParsing(false)
    }
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const saveInstruction = async () => {
    if (selectedInstruction === null) return
    
    const parsed = parsedInstructions[selectedInstruction]
    
    if (!parsed.dishName) {
      setError('Dish name is required')
      return
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one day')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const instructionId = parsed.dishName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const instruction: RecipeInstruction = {
        instructionId,
        dishName: parsed.dishName,
        linkedRecipeId: '',
        category,
        daysAvailable: selectedDays,
        components: parsed.components.map((c, idx) => ({
          componentId: `${instructionId}-${idx}`,
          subRecipeName: c.subRecipeName,
          servingPerPortion: c.servingPerPortion,
          unit: c.unit,
          reheatingSteps: c.reheatingSteps.length > 0 ? c.reheatingSteps : ['', '', ''],
          quantityControlNotes: c.quantityControlNotes,
          presentationGuidelines: c.presentationGuidelines
        })),
        visualPresentation: [`https://picsum.photos/seed/${instructionId}/800/600`],
        branchManagerFeedback: ''
      }

      const res = await fetch('/api/recipe-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instruction)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      // Remove saved instruction from list
      const newParsed = [...parsedInstructions]
      newParsed.splice(selectedInstruction, 1)
      setParsedInstructions(newParsed)
      
      if (newParsed.length > 0) {
        setSelectedInstruction(0)
        setSelectedDays([])
      } else {
        router.push('/admin/recipe-instructions')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save instruction')
    } finally {
      setIsSaving(false)
    }
  }

  const currentInstruction = selectedInstruction !== null ? parsedInstructions[selectedInstruction] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Upload className="h-8 w-8" />
          Import Recipe Instructions
        </h1>
        <p className="text-muted-foreground">Paste data from Excel to import recipe instructions</p>
      </div>

      {/* Step 1: Paste Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Step 1: Paste Excel Data
          </CardTitle>
          <CardDescription>
            Copy and paste your reheating instructions table from Excel. Include headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`Dish Name / Counter Pri...\tSub-recipes\tServing per por...\tUnit\tReheating Procedures Step 1\tReheating Procedures Step 2\tReheating Procedures Step 3\tQuantity Control Notes\tPresentation Guidelines
Hm Oriental Chicken with Rice\tChicken Stuffed For Oriental Chicken 1 KG\t120\tGr\tPut the Vacuum bag of chicken in a hot pot\tWhen Heated take out the chicken and Slice it 2 cm / pc\tAdd it on top of the Oriental Rice\tApply Oriental Sauce over the Slices\tSprinkle cinnamon powder`}
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
          
          <Button 
            onClick={parseExcelData} 
            disabled={!rawData.trim() || isParsing}
            className="gap-2"
          >
            {isParsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Parse Data
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Review & Edit */}
      {parsedInstructions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Instruction List */}
          <Card>
            <CardHeader>
              <CardTitle>Parsed Instructions ({parsedInstructions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {parsedInstructions.map((inst, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedInstruction(idx)
                      setSelectedDays([])
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedInstruction === idx 
                        ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="font-medium text-sm">{inst.dishName}</div>
                    <div className="text-xs text-muted-foreground">
                      {inst.components.length} component{inst.components.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          {currentInstruction && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  {currentInstruction.dishName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category & Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option>Main Course</option>
                      <option>Side</option>
                      <option>Appetizer</option>
                      <option>Dessert</option>
                      <option>Beverage</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Days Available *</Label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                      {DAYS.map(day => (
                        <div key={day} className="flex items-center gap-1">
                          <Checkbox
                            id={`day-${day}`}
                            checked={selectedDays.includes(day)}
                            onCheckedChange={() => toggleDay(day)}
                          />
                          <label htmlFor={`day-${day}`} className="text-xs cursor-pointer">
                            {day.slice(0, 3)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Components */}
                <div className="space-y-4">
                  <Label>Components ({currentInstruction.components.length})</Label>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {currentInstruction.components.map((comp, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Badge variant="outline">{idx + 1}</Badge>
                            {comp.subRecipeName || 'Unnamed Component'}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {comp.servingPerPortion} {comp.unit} / portion
                          </span>
                        </div>
                        
                        {comp.reheatingSteps.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-orange-600">Steps:</span>
                            <ol className="text-xs text-muted-foreground mt-1 space-y-1">
                              {comp.reheatingSteps.map((step, sIdx) => (
                                <li key={sIdx} className="flex gap-2">
                                  <span className="text-orange-500">{sIdx + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {comp.quantityControlNotes && (
                          <div className="text-xs">
                            <span className="font-medium text-yellow-600">Quality Notes:</span>
                            <p className="text-muted-foreground">{comp.quantityControlNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-2">
                  <Button 
                    onClick={saveInstruction}
                    disabled={isSaving || selectedDays.length === 0}
                    className="gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save Instruction
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newParsed = [...parsedInstructions]
                      newParsed.splice(selectedInstruction, 1)
                      setParsedInstructions(newParsed)
                      if (newParsed.length > 0) {
                        setSelectedInstruction(0)
                      } else {
                        setSelectedInstruction(null)
                      }
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

