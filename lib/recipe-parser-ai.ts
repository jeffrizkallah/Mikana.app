import OpenAI from 'openai'
import { ParsedRecipeSchema, RECIPE_SCHEMA_DESCRIPTION, type ParsedRecipe } from './recipe-schema'

// Initialize OpenAI client - will be called on the server side
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables')
  }
  return new OpenAI({ apiKey })
}

// The system prompt that instructs the LLM on how to parse recipes
const SYSTEM_PROMPT = `You are a data entry automation bot for a catering kitchen's Central Kitchen.
Your job is to extract structured recipe data from raw Excel/CSV exports of recipe cards.

The recipe templates have consistent sections but may have slight layout variations:
- Section 1: Recipe Information (name, station, code, yield)
- Section 2A: Main Ingredients for the recipe (what goes into final assembly)
- Sections 2B, 2C, 2D, etc.: Sub-recipe ingredients (sauces, marinades, doughs, etc.)
- Section 3: Required Machines & Tools
- Section 4: Step-by-Step Cooking Process
  - May have sub-sections like "A. Sub-Recipe: Sauce Tomato" or "B. Sub-Preparation: Veggie Toppings"
  - The "Main Recipe" or "Final Recipe" section contains assembly steps
- Section 5: Quality Specifications
- Section 6: Packing & Labeling

CRITICAL PARSING RULES:
1. Extract the recipe name from the "Recipe Name" row
2. Identify ALL sub-recipes from sections 2B, 2C, 2D, etc. - each is a separate sub-recipe
3. For Section 4 (cooking steps):
   - Steps under "Sub-Recipe: X" or "Sub-Preparation: X" go into that sub-recipe's preparation array
   - Steps under "Main Recipe" or the final section go into the main preparation array
   - If there's no explicit main recipe section, use context to determine assembly steps
4. Convert string quantities to numbers where needed (e.g., "1,200.00" → 1200, "40" → 40)
5. Generate subRecipeId as lowercase-hyphenated version of the name (e.g., "sauce-tomato-1-kg")
6. For quality specs, group by component if the specs describe different parts (sauce, dough, vegetables, etc.)
7. Handle merged cells and multi-line content - steps may span multiple lines
8. Extract time from step descriptions if mentioned (e.g., "Cook for 5 minutes" → time: "5 minutes")
9. Mark steps as critical if they mention temperature, safety, or use words like "must", "critical", "important"

IMPORTANT: Return ONLY valid JSON matching the schema. No markdown, no explanation, no code fences.`

// Convert raw pasted data to a cleaner format for the LLM
function prepareDataForLLM(rawData: string): string {
  // Clean up the data - normalize line endings and remove excessive whitespace
  const cleaned = rawData
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
  
  return cleaned
}

// Parse recipe using OpenAI
export async function parseRecipeWithAI(rawExcelData: string): Promise<{
  success: boolean
  data?: ParsedRecipe
  error?: string
  rawResponse?: string
}> {
  try {
    const openai = getOpenAIClient()
    const preparedData = prepareDataForLLM(rawExcelData)
    
    // Construct the user prompt
    const userPrompt = `Parse the following recipe data and return structured JSON.

REQUIRED OUTPUT SCHEMA:
${RECIPE_SCHEMA_DESCRIPTION}

RAW RECIPE DATA:
${preparedData}

Return ONLY the JSON object, no additional text.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0, // Deterministic output
      max_tokens: 4096
    })

    const rawResponse = completion.choices[0]?.message?.content
    
    if (!rawResponse) {
      return {
        success: false,
        error: 'No response received from AI'
      }
    }

    // Parse the JSON response
    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawResponse)
    } catch (parseError) {
      return {
        success: false,
        error: 'AI returned invalid JSON',
        rawResponse
      }
    }

    // Validate against our Zod schema
    const validationResult = ParsedRecipeSchema.safeParse(parsedJson)
    
    if (!validationResult.success) {
      console.error('Schema validation errors:', validationResult.error.issues)
      return {
        success: false,
        error: `Schema validation failed: ${validationResult.error.issues.map((e: { message: string }) => e.message).join(', ')}`,
        rawResponse
      }
    }

    // Post-process the data
    const recipe = postProcessRecipe(validationResult.data)

    return {
      success: true,
      data: recipe
    }
    
  } catch (error) {
    console.error('AI parsing error:', error)
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local'
        }
      }
      if (error.status === 429) {
        return {
          success: false,
          error: 'OpenAI rate limit exceeded. Please try again in a moment.'
        }
      }
      return {
        success: false,
        error: `OpenAI API error: ${error.message}`
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Post-process the parsed recipe to ensure consistency
function postProcessRecipe(recipe: ParsedRecipe): ParsedRecipe {
  // Ensure step numbers are sequential for main preparation
  if (recipe.preparation) {
    recipe.preparation = recipe.preparation.map((step, index) => ({
      ...step,
      step: index + 1
    }))
  }

  // Ensure step numbers are sequential for each sub-recipe
  if (recipe.subRecipes) {
    recipe.subRecipes = recipe.subRecipes.map(subRecipe => ({
      ...subRecipe,
      // Ensure subRecipeId exists
      subRecipeId: subRecipe.subRecipeId || 
        subRecipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
      preparation: subRecipe.preparation?.map((step, index) => ({
        ...step,
        step: index + 1
      })) || []
    }))
  }

  // Ensure mainIngredients have proper quantity numbers
  if (recipe.mainIngredients) {
    recipe.mainIngredients = recipe.mainIngredients.map(ing => ({
      ...ing,
      quantity: typeof ing.quantity === 'string' 
        ? parseFloat(String(ing.quantity).replace(/,/g, '')) || 0
        : ing.quantity
    }))
  }

  return recipe
}

// Utility function to estimate token count (rough estimate)
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

// Check if the API is properly configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

