import { NextRequest, NextResponse } from 'next/server'
import { parseRecipeWithAI, isAIConfigured } from '@/lib/recipe-parser-ai'

export async function POST(request: NextRequest) {
  try {
    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'AI parsing is not configured. Please add OPENAI_API_KEY to your .env.local file.',
          fallbackToManual: true
        },
        { status: 503 }
      )
    }

    // Get the raw Excel data from the request body
    const body = await request.json()
    const { rawData } = body

    if (!rawData || typeof rawData !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'No recipe data provided. Please paste your Excel data.' 
        },
        { status: 400 }
      )
    }

    // Check if data is too short to be a valid recipe
    if (rawData.trim().length < 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'The pasted data appears too short. Please paste the complete recipe from Excel.' 
        },
        { status: 400 }
      )
    }

    // Parse the recipe using AI
    console.log('🤖 Starting AI recipe parsing...')
    const startTime = Date.now()
    
    const result = await parseRecipeWithAI(rawData)
    
    const duration = Date.now() - startTime
    console.log(`✅ AI parsing completed in ${duration}ms`)

    if (!result.success) {
      console.error('❌ AI parsing failed:', result.error)
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          fallbackToManual: true // Signal frontend to use regex parser
        },
        { status: 422 }
      )
    }

    // Return the parsed recipe
    return NextResponse.json({
      success: true,
      data: result.data,
      parsingTime: duration,
      method: 'ai'
    })

  } catch (error) {
    console.error('API route error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        fallbackToManual: true
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    aiConfigured: isAIConfigured(),
    message: isAIConfigured() 
      ? 'AI recipe parsing is ready' 
      : 'AI not configured - add OPENAI_API_KEY to .env.local'
  })
}

