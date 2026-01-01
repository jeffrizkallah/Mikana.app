import { z } from 'zod'

// Zod schemas for validating LLM-parsed reheating instructions
// These match the RecipeInstruction and InstructionComponent interfaces in lib/data.ts

export const ParsedComponentSchema = z.object({
  subRecipeName: z.string().describe('The name of the sub-recipe or component (e.g., "Chicken Stuffed For Oriental Chicken 1 KG")'),
  servingPerPortion: z.number().describe('Serving quantity per portion (e.g., 120)'),
  unit: z.string().describe('Unit of measurement (e.g., "Gr", "Unit", "Ml")'),
  reheatingSteps: z.array(z.string()).describe('Array of reheating/cooking procedure steps'),
  quantityControlNotes: z.string().optional().default('').describe('Quality control notes and tips'),
  presentationGuidelines: z.string().optional().default('').describe('Presentation and plating guidelines')
})

export const ParsedInstructionSchema = z.object({
  dishName: z.string().describe('The name of the dish (e.g., "Hm Oriental Chicken with Rice")'),
  category: z.string().optional().default('Main Course').describe('Category: Main Course, Side, Appetizer, Dessert, Beverage'),
  components: z.array(ParsedComponentSchema).describe('Array of components/sub-recipes for this dish'),
  suggestedRecipeId: z.string().optional().default('').describe('Suggested matching recipe ID from Central Kitchen recipes, or empty if no match')
})

export const ParsedInstructionsResponseSchema = z.object({
  instructions: z.array(ParsedInstructionSchema).describe('Array of parsed recipe instructions'),
  parsingNotes: z.string().optional().describe('Any notes about parsing issues or ambiguities')
})

export type ParsedComponent = z.infer<typeof ParsedComponentSchema>
export type ParsedInstruction = z.infer<typeof ParsedInstructionSchema>
export type ParsedInstructionsResponse = z.infer<typeof ParsedInstructionsResponseSchema>

// Schema description for the LLM prompt
export const REHEATING_INSTRUCTIONS_SCHEMA_DESCRIPTION = `
{
  "instructions": [
    {
      "dishName": "string - The full dish name from 'Dish Name / Counter Price' column. Group all rows with the same dish name (or merged cells) into one instruction.",
      "category": "string - Infer the category: 'Main Course' for main dishes, 'Side' for sides like rice or salads, 'Appetizer' for starters, 'Dessert' for sweets, 'Beverage' for drinks",
      "suggestedRecipeId": "string - If the dish name closely matches a recipe from the available recipes list, provide the recipeId. Otherwise leave as empty string.",
      "components": [
        {
          "subRecipeName": "string - The sub-recipe or component name (e.g., 'Oriental Rice 1 KG')",
          "servingPerPortion": "number - The serving quantity per portion (convert strings to numbers)",
          "unit": "string - Unit of measurement: 'Gr' for grams, 'Unit' for whole items, 'Ml' for milliliters",
          "reheatingSteps": [
            "string - First reheating/cooking step",
            "string - Second step (if any)",
            "string - Additional steps..."
          ],
          "quantityControlNotes": "string - Quality control notes, tips, or warnings",
          "presentationGuidelines": "string - How to present or plate the item"
        }
      ]
    }
  ],
  "parsingNotes": "string - Any notes about parsing issues, merged cells interpretation, or ambiguities"
}
`

