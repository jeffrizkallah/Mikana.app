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
    console.error('Error reading recipes file:', error)
    return []
  }
}

async function saveRecipes(recipes: Recipe[]) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(recipes, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing recipes file:', error)
    return false
  }
}

export async function GET() {
  const recipes = await getRecipes()
  return NextResponse.json(recipes)
}

export async function POST(request: Request) {
  try {
    const newRecipe = await request.json()
    
    // Basic validation
    if (!newRecipe.recipeId || !newRecipe.name) {
      return NextResponse.json(
        { error: 'Missing required fields: recipeId, name' },
        { status: 400 }
      )
    }

    const recipes = await getRecipes()
    
    // Check if ID exists
    if (recipes.some(r => r.recipeId === newRecipe.recipeId)) {
      return NextResponse.json(
        { error: 'Recipe ID already exists' },
        { status: 409 }
      )
    }

    recipes.push(newRecipe)
    const success = await saveRecipes(recipes)

    if (!success) {
      throw new Error('Failed to save file')
    }

    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

