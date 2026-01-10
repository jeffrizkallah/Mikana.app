import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { composeNotificationWithAI, isAIConfigured } from '@/lib/notification-composer-ai'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can use AI compose
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can compose notifications' },
        { status: 403 }
      )
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set OPENAI_API_KEY.' },
        { status: 503 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a description for your notification' },
        { status: 400 }
      )
    }

    // Limit prompt length to prevent abuse
    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Description is too long. Please keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    // Compose notification with AI
    const result = await composeNotificationWithAI(prompt.trim())

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to compose notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notification: result.data
    })

  } catch (error) {
    console.error('Error in AI compose endpoint:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
