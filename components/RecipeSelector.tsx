'use client'

import { useState } from 'react'
import { Calendar, ChefHat } from 'lucide-react'
import { RecipeCard } from './RecipeCard'
import { Button } from './ui/button'
import { getRecipesForDay, getUniqueDays } from '@/lib/data'
import type { Recipe } from '@/lib/data'

interface RecipeSelectorProps {
  branchSlug: string
}

export function RecipeSelector({ branchSlug }: RecipeSelectorProps) {
  const days = getUniqueDays()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [selectedDay, setSelectedDay] = useState<string>(
    days.includes(today) ? today : days[0]
  )

  const recipesForDay = getRecipesForDay(selectedDay)

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Select Day:</span>
        <div className="flex gap-2 flex-wrap">
          {days.map(day => (
            <Button
              key={day}
              variant={selectedDay === day ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipes for Selected Day */}
      {recipesForDay.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            {selectedDay}&apos;s Menu ({recipesForDay.length} recipe{recipesForDay.length !== 1 ? 's' : ''})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipesForDay.map(recipe => (
              <RecipeCard key={recipe.recipeId} recipe={recipe} branchSlug={branchSlug} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No recipes available for {selectedDay}</p>
        </div>
      )}
    </div>
  )
}

