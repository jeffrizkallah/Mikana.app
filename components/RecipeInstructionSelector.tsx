'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, ChevronRight, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RecipeInstruction } from '@/lib/data'

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface RecipeInstructionSelectorProps {
  branchSlug: string
}

export function RecipeInstructionSelector({ branchSlug }: RecipeInstructionSelectorProps) {
  const [instructions, setInstructions] = useState<RecipeInstruction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Get current day of the week
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = days[new Date().getDay()]
    setSelectedDay(today)
  }, [])

  // Fetch instructions
  useEffect(() => {
    async function fetchInstructions() {
      try {
        const res = await fetch('/api/recipe-instructions')
        const data = await res.json()
        setInstructions(data)
      } catch (error) {
        console.error('Failed to fetch instructions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInstructions()
  }, [])

  // Get unique days from instructions, sorted
  const days = Array.from(
    new Set(instructions.flatMap(i => i.daysAvailable))
  ).sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))

  // Filter instructions by selected day
  const filteredInstructions = selectedDay
    ? instructions.filter(i => i.daysAvailable.includes(selectedDay))
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-2 flex-wrap">
        {days.map(day => (
          <Button
            key={day}
            variant={selectedDay === day ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDay(day)}
            className="text-xs sm:text-sm"
          >
            {day}
          </Button>
        ))}
      </div>

      {/* Instructions list */}
      {selectedDay && (
        <div className="space-y-3 mt-4">
          {filteredInstructions.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredInstructions.length} item{filteredInstructions.length !== 1 ? 's' : ''} available on {selectedDay}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {filteredInstructions.map(instruction => (
                  <Link
                    key={instruction.instructionId}
                    href={`/branch/${branchSlug}/recipe-instructions/${instruction.instructionId}`}
                    className="group"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                      {/* Image thumbnail */}
                      <div className="w-16 h-12 rounded overflow-hidden shrink-0 bg-muted">
                        <img
                          src={instruction.visualPresentation[0] || 'https://picsum.photos/seed/food/200/150'}
                          alt={instruction.dishName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {instruction.dishName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {instruction.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {instruction.components.length} component{instruction.components.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* View All Link */}
              <div className="pt-2">
                <Link href={`/branch/${branchSlug}/recipe-instructions?day=${selectedDay}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All {selectedDay} Instructions
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No instructions available for {selectedDay}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

