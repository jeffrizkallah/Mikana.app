'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Wrench, CheckCircle2, Link as LinkIcon } from 'lucide-react'
import type { Recipe, SubRecipe } from '@/lib/data'
import { SubRecipeAccordion } from './SubRecipeAccordion'

interface RecipeEnhancedViewProps {
  recipe: Recipe
}

export function RecipeEnhancedView({ recipe }: RecipeEnhancedViewProps) {
  const hasEnhancedData = 
    (recipe.mainIngredients && recipe.mainIngredients.length > 0) ||
    (recipe.subRecipes && recipe.subRecipes.length > 0) ||
    (recipe.requiredMachinesTools && recipe.requiredMachinesTools.length > 0) ||
    (recipe.qualitySpecifications && recipe.qualitySpecifications.length > 0) ||
    recipe.packingLabeling

  if (!hasEnhancedData) {
    return null
  }

  const getSubRecipe = (subRecipeId: string): SubRecipe | undefined => {
    return recipe.subRecipes?.find(sr => sr.subRecipeId === subRecipeId)
  }

  return (
    <div className="space-y-6">
      {/* Station & Yield Info */}
      {(recipe.station || recipe.yield || recipe.recipeCode) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recipe Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recipe.station && (
              <div>
                <p className="text-sm text-muted-foreground">Station</p>
                <p className="font-semibold">{recipe.station}</p>
              </div>
            )}
            {recipe.yield && (
              <div>
                <p className="text-sm text-muted-foreground">Yield</p>
                <p className="font-semibold">{recipe.yield}</p>
              </div>
            )}
            {recipe.recipeCode && (
              <div>
                <p className="text-sm text-muted-foreground">Recipe Code</p>
                <p className="font-semibold font-mono">{recipe.recipeCode}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Ingredients */}
      {recipe.mainIngredients && recipe.mainIngredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Main Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recipe.mainIngredients.map((ing, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  ing.subRecipeId ? 'bg-purple-50 border-purple-200' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{ing.name}</h4>
                      {ing.subRecipeId && (
                        <Badge variant="secondary" className="text-xs">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          Sub-recipe
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ing.quantity} {ing.unit}
                      {ing.specifications && ` • ${ing.specifications}`}
                    </p>
                  </div>
                </div>
                
                {/* Show sub-recipe details if linked */}
                {ing.subRecipeId && getSubRecipe(ing.subRecipeId) && (
                  <div className="mt-3">
                    <SubRecipeAccordion subRecipe={getSubRecipe(ing.subRecipeId)!} />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Required Machines & Tools */}
      {recipe.requiredMachinesTools && recipe.requiredMachinesTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Required Machines & Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recipe.requiredMachinesTools.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-semibold">{item.name}</h4>
                      <Badge variant="outline">{item.setting}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Purpose: {item.purpose}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Specifications */}
      {recipe.qualitySpecifications && recipe.qualitySpecifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Quality Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipe.qualitySpecifications.map((spec, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">
                        Appearance
                      </p>
                      <p className="text-sm">{spec.parameter}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">
                        Texture
                      </p>
                      <p className="text-sm">{spec.texture}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">
                        Taste / Flavor
                      </p>
                      <p className="text-sm">{spec.tasteFlavorProfile}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">
                        Aroma
                      </p>
                      <p className="text-sm">{spec.aroma}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packing & Labeling */}
      {recipe.packingLabeling && recipe.packingLabeling.packingType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Packing & Labeling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Packing Type</p>
                  <p className="font-semibold">{recipe.packingLabeling.packingType}</p>
                </div>
                {recipe.packingLabeling.serviceItems.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Service Items</p>
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.packingLabeling.serviceItems.map((item, idx) => (
                        <li key={idx} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {recipe.packingLabeling.labelRequirements && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Label Requirements</p>
                  <p className="text-sm">{recipe.packingLabeling.labelRequirements}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.packingLabeling.storageCondition && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Storage Condition</p>
                    <p className="text-sm">{recipe.packingLabeling.storageCondition}</p>
                  </div>
                )}
                {recipe.packingLabeling.shelfLife && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Shelf Life</p>
                    <p className="text-sm">{recipe.packingLabeling.shelfLife}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

