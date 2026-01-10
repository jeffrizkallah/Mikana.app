import OpenAI from 'openai'
import { z } from 'zod'

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables')
  }
  return new OpenAI({ apiKey })
}

// Schema for AI-generated notification
export const AINotificationSchema = z.object({
  type: z.enum(['feature', 'patch', 'alert', 'announcement', 'urgent']),
  priority: z.enum(['normal', 'urgent']),
  title: z.string().max(100),
  preview: z.string().max(150),
  content: z.string(),
  expires_in_days: z.number().min(1).max(30),
  target_roles: z.array(z.string()).nullable().optional()
})

export type AINotification = z.infer<typeof AINotificationSchema>

// System prompt for notification composition
const SYSTEM_PROMPT = `You are an AI assistant for a catering/kitchen management system called "Branch Guidebook". Your job is to compose clear, professional notifications based on natural language descriptions from managers.

NOTIFICATION TYPES (choose the most appropriate):
- feature: New features or updates to the system (use for new tools, capabilities, or improvements)
- patch: Bug fixes and minor improvements (use for fixes, updates, corrections)
- alert: Important notices requiring attention (use for warnings, reminders, policy changes)
- announcement: General announcements (use for general news, updates, information)
- urgent: Time-sensitive critical information (use for emergencies, immediate actions required)

PRIORITY LEVELS:
- normal: Standard notifications
- urgent: High-priority, time-sensitive (use when user mentions: urgent, ASAP, critical, immediately, emergency, important)

AVAILABLE TARGET ROLES (only use these exact values):
- admin: System administrators
- manager: Branch managers
- supervisor: Operations supervisors  
- kitchen: Kitchen staff
- counter: Counter/front-of-house staff
- cleaner: Cleaning staff
- dispatch: Dispatch/logistics staff
- operations: Operations team
- sales: Sales team

GUIDELINES FOR COMPOSING NOTIFICATIONS:

1. **Title**: 
   - Concise and action-oriented
   - Maximum 60-80 characters
   - Start with key info (what/where/when)
   - Examples: "Al Majaz Branch Closure - Sunday Maintenance", "New Inventory System Goes Live Monday"

2. **Preview**:
   - One-line summary for notification dropdown
   - Maximum 100-120 characters
   - Should convey the essential message
   - Examples: "Branch closed Sunday 6AM-12PM for deep cleaning", "Complete training by Friday before system launch"

3. **Content**:
   - Use Markdown formatting
   - Start with a ## heading summarizing the notification
   - Use ### for subsections
   - Use bullet points (-) for lists
   - Use **bold** for emphasis on key dates, times, locations
   - Use proper line breaks for readability
   - Include: What, When, Where, Who's affected, Action required (if any)
   - Keep it professional but friendly

4. **Expiration**:
   - Set expires_in_days based on event timing
   - For past events: 1-2 days
   - For upcoming events: days until event + 1-2 days after
   - For general announcements: 7-14 days
   - For urgent matters: 3-7 days

5. **Target Roles**:
   - Always set to null (target everyone) unless user specifically mentions targeting certain roles
   - If user mentions "kitchen staff" → ["kitchen"]
   - If user mentions "managers" → ["manager"]
   - If user mentions "everyone" or doesn't specify → null
   - Can combine: "kitchen and counter staff" → ["kitchen", "counter"]

IMPORTANT: Return ONLY valid JSON matching the schema. No markdown code fences, no explanation, just the JSON object.`

// User prompt template
function buildUserPrompt(userInput: string): string {
  return `Compose a notification based on the following description:

"${userInput}"

Return a JSON object with these fields:
- type: one of "feature", "patch", "alert", "announcement", "urgent"
- priority: "normal" or "urgent"
- title: concise title (max 80 chars)
- preview: short summary for dropdown (max 120 chars)
- content: full markdown content
- expires_in_days: number between 1-30
- target_roles: array of role IDs or null for all

Return ONLY the JSON object.`
}

// Main function to compose notification using AI
export async function composeNotificationWithAI(userPrompt: string): Promise<{
  success: boolean
  data?: AINotification
  error?: string
  rawResponse?: string
}> {
  try {
    const openai = getOpenAIClient()
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(userPrompt) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7, // Slightly creative but still focused
      max_tokens: 1024
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
    } catch {
      return {
        success: false,
        error: 'AI returned invalid JSON',
        rawResponse
      }
    }

    // Validate against our Zod schema
    const validationResult = AINotificationSchema.safeParse(parsedJson)
    
    if (!validationResult.success) {
      console.error('Schema validation errors:', validationResult.error.issues)
      return {
        success: false,
        error: `Validation failed: ${validationResult.error.issues.map(e => e.message).join(', ')}`,
        rawResponse
      }
    }

    // Post-process to ensure quality
    const notification = postProcessNotification(validationResult.data)

    return {
      success: true,
      data: notification
    }
    
  } catch (error) {
    console.error('AI composition error:', error)
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid OpenAI API key. Please check your configuration.'
        }
      }
      if (error.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.'
        }
      }
      return {
        success: false,
        error: `API error: ${error.message}`
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Post-process the notification to ensure quality
function postProcessNotification(notification: AINotification): AINotification {
  // Trim title if too long
  if (notification.title.length > 100) {
    notification.title = notification.title.substring(0, 97) + '...'
  }
  
  // Trim preview if too long
  if (notification.preview.length > 150) {
    notification.preview = notification.preview.substring(0, 147) + '...'
  }
  
  // Ensure expires_in_days is within bounds
  notification.expires_in_days = Math.max(1, Math.min(30, notification.expires_in_days))
  
  // Normalize target_roles
  if (notification.target_roles && notification.target_roles.length === 0) {
    notification.target_roles = null
  }
  
  // Validate role IDs if present
  const validRoles = ['admin', 'manager', 'supervisor', 'kitchen', 'counter', 'cleaner', 'dispatch', 'operations', 'sales']
  if (notification.target_roles) {
    notification.target_roles = notification.target_roles.filter(role => 
      validRoles.includes(role.toLowerCase())
    ).map(role => role.toLowerCase())
    
    if (notification.target_roles.length === 0) {
      notification.target_roles = null
    }
  }
  
  return notification
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}
