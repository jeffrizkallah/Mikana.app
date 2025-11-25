import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Recipe } from '@/lib/data'

const dataFilePath = path.join(process.cwd(), 'data', 'recipes.json')

async function getRecipes(): Promise<Recipe[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    return []
  }
}

async function saveRecipes(recipes: Recipe[]) {
  await fs.writeFile(dataFilePath, JSON.stringify(recipes, null, 2), 'utf-8')
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    const recipes = await getRecipes()
    
    const index = recipes.findIndex(r => r.recipeId === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Update recipe - ensure ID matches path
    const updatedRecipe = { ...recipes[index], ...updates, recipeId: id }
    recipes[index] = updatedRecipe
    
    await saveRecipes(recipes)

    return NextResponse.json(updatedRecipe)
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recipes = await getRecipes()
    
    const filteredRecipes = recipes.filter(r => r.recipeId !== id)
    
    if (filteredRecipes.length === recipes.length) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    await saveRecipes(filteredRecipes)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

