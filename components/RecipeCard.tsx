import Link from 'next/link'
import { Clock, Users, ChefHat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Recipe } from '@/lib/data'

interface RecipeCardProps {
  recipe: Recipe
  branchSlug: string
}

export function RecipeCard({ recipe, branchSlug }: RecipeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{recipe.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {recipe.category}
            </Badge>
          </div>
          <ChefHat className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Prep:</span>
              <span className="font-medium">{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cook:</span>
              <span className="font-medium">{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Servings:</span>
              <span className="font-medium">{recipe.servings}</span>
            </div>
          </div>

          {/* Allergens if any */}
          {recipe.allergens.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Allergens:</p>
              <div className="flex flex-wrap gap-1">
                {recipe.allergens.map((allergen, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* View Recipe Button */}
          <Link href={`/branch/${branchSlug}/recipes/${recipe.recipeId}`} className="block">
            <Button className="w-full mt-2" variant="default">
              View Recipe & Instructions
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

