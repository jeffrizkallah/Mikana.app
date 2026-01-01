import OpenAI from 'openai'
import { 
  ParsedInstructionsResponseSchema, 
  REHEATING_INSTRUCTIONS_SCHEMA_DESCRIPTION, 
  type ParsedInstructionsResponse 
} from './reheating-instructions-schema'

// Initialize OpenAI client - will be called on the server side
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables')
  }
  return new OpenAI({ apiKey })
}

// The system prompt that instructs the LLM on how to parse reheating instructions
const SYSTEM_PROMPT = `You are a data entry automation bot for a catering company's branch operations.
Your job is to extract structured reheating and quality control guidelines from Excel exports.

The Excel data typically has this structure:
- Column A: Dish Name / Counter Price (may span multiple rows via merged cells - all rows with the same dish name belong together)
- Column B: Sub-recipes (component name)
- Column C: Serving QTY per portion (number)
- Column D: Unit (Gr, Unit, Ml, etc.)
- Column E: Reheating / Cooking Procedures Step 1
- Column F: Reheating / Cooking Procedures Step 2
- Column G (or later): Quantity Control Notes
- Column H (or later): Presentation Guidelines
- Final column may contain images (ignore these)

CRITICAL PARSING RULES:
1. GROUP BY DISH NAME: All rows with the same dish name (including merged cells) form ONE instruction with multiple components
2. Handle merged cells: If the dish name column is empty for a row, it belongs to the previous dish
3. Extract ALL reheating steps from multiple columns into a single array (filter out empty strings)
4. Convert serving quantities to numbers (e.g., "120" → 120, "1,200" → 1200)
5. Infer category from dish name:
   - "Hm" prefix usually means "Home Made" main course
   - "Side" prefix means side dish
   - Look for keywords: burger, pasta, chicken, rice, potato, etc.
6. Preserve exact text for notes and guidelines - don't summarize
7. For empty cells, use empty string "" (not null)
8. Handle varying column layouts flexibly - columns might be in different order

RECIPE MATCHING:
You will receive a list of available Central Kitchen recipes. Try to match dish names to recipe IDs:
- "Hm Oriental Chicken with Rice" might match "oriental-chicken-rice"
- "Hm Mexican Burger" might match "mexican-burger"
- If no close match exists, leave suggestedRecipeId as empty string

Return ONLY valid JSON matching the schema. No markdown, no explanation, no code fences.`

// Available recipes for matching - this will be populated dynamically
interface AvailableRecipe {
  recipeId: string
  name: string
}

// Parse reheating instructions using OpenAI
export async function parseReheatingInstructionsWithAI(
  rawExcelData: string,
  availableRecipes: AvailableRecipe[] = []
): Promise<{
  success: boolean
  data?: ParsedInstructionsResponse
  error?: string
  rawResponse?: string
}> {
  try {
    const openai = getOpenAIClient()
    const preparedData = prepareDataForLLM(rawExcelData)
    
    // Build recipe list for matching
    const recipeList = availableRecipes.length > 0
      ? `\n\nAVAILABLE RECIPES FOR MATCHING:\n${availableRecipes.map(r => `- ${r.recipeId}: "${r.name}"`).join('\n')}`
      : '\n\nNo recipes available for matching - leave suggestedRecipeId as empty string.'

    // Construct the user prompt
    const userPrompt = `Parse the following reheating instructions data and return structured JSON.

REQUIRED OUTPUT SCHEMA:
${REHEATING_INSTRUCTIONS_SCHEMA_DESCRIPTION}
${recipeList}

RAW EXCEL DATA (tab-separated):
${preparedData}

Return ONLY the JSON object, no additional text.`

    // Call OpenAI API with the latest model
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Latest GPT-4o model for best parsing accuracy
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0, // Deterministic output for consistent parsing
      max_tokens: 8192 // Higher limit for batch parsing
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
    const validationResult = ParsedInstructionsResponseSchema.safeParse(parsedJson)
    
    if (!validationResult.success) {
      console.error('Schema validation errors:', validationResult.error.issues)
      return {
        success: false,
        error: `Schema validation failed: ${validationResult.error.issues.map((e: { message: string }) => e.message).join(', ')}`,
        rawResponse
      }
    }

    // Post-process the data
    const instructions = postProcessInstructions(validationResult.data)

    return {
      success: true,
      data: instructions
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

// Convert raw pasted data to a cleaner format for the LLM
function prepareDataForLLM(rawData: string): string {
  // Clean up the data - normalize line endings and remove excessive whitespace
  const cleaned = rawData
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
  
  return cleaned
}

// Post-process the parsed instructions to ensure consistency
function postProcessInstructions(response: ParsedInstructionsResponse): ParsedInstructionsResponse {
  return {
    ...response,
    instructions: response.instructions.map(instruction => ({
      ...instruction,
      // Ensure category has a default
      category: instruction.category || 'Main Course',
      // Process components
      components: instruction.components.map(component => ({
        ...component,
        // Ensure servingPerPortion is a number
        servingPerPortion: typeof component.servingPerPortion === 'string'
          ? parseFloat(String(component.servingPerPortion).replace(/,/g, '')) || 0
          : component.servingPerPortion,
        // Filter out empty reheating steps
        reheatingSteps: component.reheatingSteps.filter(step => step && step.trim() !== ''),
        // Ensure defaults for optional fields
        quantityControlNotes: component.quantityControlNotes || '',
        presentationGuidelines: component.presentationGuidelines || ''
      }))
    }))
  }
}

// Utility function to estimate token count (rough estimate)
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

// Estimate API cost (rough estimate based on GPT-4 pricing)
export function estimateAPICost(inputTokens: number, outputTokens: number = 2000): string {
  // GPT-4 Turbo pricing (approximate): $0.01/1K input, $0.03/1K output
  const inputCost = (inputTokens / 1000) * 0.01
  const outputCost = (outputTokens / 1000) * 0.03
  const totalCost = inputCost + outputCost
  return `~$${totalCost.toFixed(3)}`
}

// Check if the API is properly configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

