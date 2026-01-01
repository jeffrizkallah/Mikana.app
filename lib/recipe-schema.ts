import { z } from 'zod'

// Zod schemas for validating LLM-parsed recipe data
// These match the existing TypeScript types in lib/data.ts

export const IngredientSchema = z.object({
  item: z.string(),
  quantity: z.string(),
  unit: z.string().optional().default('GM'),
  notes: z.string().optional().default('')
})

export const MainIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  specifications: z.string().optional().default(''),
  subRecipeId: z.string().optional()
})

export const PreparationStepSchema = z.object({
  step: z.number(),
  instruction: z.string(),
  time: z.string().optional().default(''),
  critical: z.boolean().optional().default(false),
  hint: z.string().optional().default('')
})

export const MachineToolSchema = z.object({
  name: z.string(),
  setting: z.string().optional().default(''),
  purpose: z.string().optional().default(''),
  notes: z.string().optional().default('')
})

export const QualitySpecificationSchema = z.object({
  parameter: z.string().optional().default(''),
  appearance: z.string().optional().default(''),
  texture: z.string().optional().default(''),
  tasteFlavorProfile: z.string().optional().default(''),
  aroma: z.string().optional().default('')
})

export const PackingLabelingSchema = z.object({
  packingType: z.string().optional().default(''),
  serviceItems: z.array(z.string()).optional().default([]),
  labelRequirements: z.string().optional().default(''),
  storageCondition: z.string().optional().default(''),
  shelfLife: z.string().optional().default('')
})

export const SubRecipeSchema = z.object({
  subRecipeId: z.string(),
  name: z.string(),
  yield: z.string().optional().default('1 KG'),
  ingredients: z.array(IngredientSchema).default([]),
  preparation: z.array(PreparationStepSchema).optional().default([]),
  requiredMachinesTools: z.array(MachineToolSchema).optional().default([]),
  qualitySpecifications: z.array(QualitySpecificationSchema).optional().default([]),
  packingLabeling: PackingLabelingSchema.optional()
})

export const ParsedRecipeSchema = z.object({
  name: z.string(),
  station: z.string().optional().default(''),
  recipeCode: z.string().optional().default(''),
  yield: z.string().optional().default(''),
  
  // Main ingredients (section 2A typically)
  mainIngredients: z.array(MainIngredientSchema).optional().default([]),
  
  // Sub-recipes (sections 2B, 2C, 2D, etc.)
  subRecipes: z.array(SubRecipeSchema).optional().default([]),
  
  // Main recipe preparation steps (final assembly)
  preparation: z.array(PreparationStepSchema).optional().default([]),
  
  // Machines & tools
  requiredMachinesTools: z.array(MachineToolSchema).optional().default([]),
  
  // Quality specifications
  qualitySpecifications: z.array(QualitySpecificationSchema).optional().default([]),
  
  // Packing & labeling
  packingLabeling: PackingLabelingSchema.optional()
})

export type ParsedRecipe = z.infer<typeof ParsedRecipeSchema>

// The complete schema description for the LLM prompt
export const RECIPE_SCHEMA_DESCRIPTION = `
{
  "name": "string - The full recipe name from 'Recipe Name' row",
  "station": "string - e.g., 'Hot Section', 'Cold Section', 'Butchery'",
  "recipeCode": "string - Recipe code if present, otherwise empty string",
  "yield": "string - e.g., '1 KG', '1 Pizza (23cm)', '1 portion'",
  
  "mainIngredients": [
    {
      "name": "string - Ingredient or sub-recipe reference name",
      "quantity": "number - Numeric quantity (convert strings like '1,200.00' to 1200)",
      "unit": "string - GM, ML, unit, etc.",
      "specifications": "string - Any notes like 'Shredded', 'Sliced thinly'"
    }
  ],
  
  "subRecipes": [
    {
      "subRecipeId": "string - lowercase-hyphenated-name",
      "name": "string - Full sub-recipe name (e.g., 'Sauce Tomato 1 KG')",
      "yield": "string - Usually '1 KG'",
      "ingredients": [
        { "item": "string", "quantity": "string", "unit": "string", "notes": "string" }
      ],
      "preparation": [
        { 
          "step": "number - Step number starting from 1", 
          "instruction": "string - The full step description", 
          "time": "string - e.g., '5 minutes' if mentioned",
          "critical": "boolean - true if this is a critical/important step",
          "hint": "string - Any tips, notes, or hints for this step"
        }
      ]
    }
  ],
  
  "preparation": [
    {
      "step": "number",
      "instruction": "string - Main recipe assembly/finishing steps only",
      "time": "string",
      "critical": "boolean",
      "hint": "string"
    }
  ],
  
  "requiredMachinesTools": [
    { "name": "string", "setting": "string", "purpose": "string", "notes": "string" }
  ],
  
  "qualitySpecifications": [
    {
      "parameter": "string - What's being checked (overall or component name)",
      "appearance": "string - Visual requirements",
      "texture": "string - Texture requirements",
      "tasteFlavorProfile": "string - Taste/flavor requirements",
      "aroma": "string - Smell/aroma requirements"
    }
  ],
  
  "packingLabeling": {
    "packingType": "string - Container/packaging type",
    "labelRequirements": "string - What needs to be on labels",
    "storageCondition": "string - Temperature requirements",
    "shelfLife": "string - How long it lasts"
  }
}
`

