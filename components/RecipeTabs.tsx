'use client'

import { useState } from 'react'
import {
  Clock,
  ChefHat,
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Recipe } from '@/lib/data'

interface RecipeTabsProps {
  recipe: Recipe
}

export function RecipeTabs({ recipe }: RecipeTabsProps) {
  const [activeTab, setActiveTab] = useState('ingredients')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="w-full inline-flex md:grid md:grid-cols-5 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start">
        <TabsTrigger value="ingredients" className="flex-shrink-0 whitespace-nowrap ml-1 md:ml-0">Ingredients</TabsTrigger>
        <TabsTrigger value="preparation" className="flex-shrink-0 whitespace-nowrap">Preparation</TabsTrigger>
        <TabsTrigger value="presentation" className="flex-shrink-0 whitespace-nowrap">Presentation</TabsTrigger>
        <TabsTrigger value="sops" className="flex-shrink-0 whitespace-nowrap">SOPs</TabsTrigger>
        <TabsTrigger value="troubleshooting" className="flex-shrink-0 whitespace-nowrap">Troubleshooting</TabsTrigger>
      </TabsList>

      {/* Ingredients Tab */}
      <TabsContent value="ingredients">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Ingredients List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-semibold">{ingredient.item}</p>
                    <p className="text-lg text-primary font-bold">{ingredient.quantity}</p>
                    {ingredient.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{ingredient.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Preparation Tab */}
      <TabsContent value="preparation">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Preparation Steps
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Follow these steps in order. Critical steps are marked with a warning icon.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipe.preparation.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex gap-4 p-4 rounded-lg ${
                    step.critical 
                      ? 'bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800' 
                      : 'bg-secondary'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step.critical 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-lg">{step.instruction}</p>
                      {step.critical && (
                        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{step.time}</span>
                      </div>
                      {step.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical Step
                        </Badge>
                      )}
                    </div>
                    {step.hint && (
                      <div className="mt-2 flex items-start gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground italic">{step.hint}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Presentation Tab */}
      <TabsContent value="presentation">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Presentation & Display
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {recipe.presentation.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Instructions */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Display Instructions</h3>
              <div className="space-y-3">
                {recipe.presentation.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-secondary rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{instruction.step}</p>
                      {instruction.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{instruction.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Photos */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Reference Photos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use these photos as a guide for proper presentation and display
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipe.presentation.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={photo}
                      alt={`${recipe.name} presentation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SOPs Tab */}
      <TabsContent value="sops">
        <div className="space-y-4">
          {/* Food Safety and Hygiene */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Food Safety & Hygiene
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.sops.foodSafetyAndHygiene.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cooking Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-blue-600" />
                Cooking Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.sops.cookingStandards.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Storage and Holding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                Storage & Holding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.sops.storageAndHolding.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              {recipe.storageInstructions && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-md">
                  <p className="font-semibold text-sm mb-1">Storage Instructions:</p>
                  <p className="text-sm">{recipe.storageInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Quality Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.sops.qualityStandards.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Troubleshooting Tab */}
      <TabsContent value="troubleshooting">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Troubleshooting Guide
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Common problems and their solutions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recipe.troubleshooting.map((item, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-1" />
                    Problem: {item.problem}
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-muted-foreground mb-2">Solutions:</p>
                    {item.solutions.map((solution, sIndex) => (
                      <div key={sIndex} className="flex items-start gap-2 ml-7">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-bold">
                          {sIndex + 1}
                        </div>
                        <p className="text-sm pt-0.5">{solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

