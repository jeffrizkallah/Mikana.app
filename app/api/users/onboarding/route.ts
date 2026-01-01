import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sql } from '@vercel/postgres'

// GET - Fetch user's onboarding state
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const result = await sql`
      SELECT 
        onboarding_completed as "onboardingCompleted",
        tours_completed as "toursCompleted",
        onboarding_skipped as "onboardingSkipped",
        onboarding_started_at as "onboardingStartedAt"
      FROM users 
      WHERE id = ${session.user.id}
    `
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const row = result.rows[0]
    
    return NextResponse.json({
      onboardingCompleted: row.onboardingCompleted || false,
      toursCompleted: row.toursCompleted || [],
      onboardingSkipped: row.onboardingSkipped || false,
      onboardingStartedAt: row.onboardingStartedAt || null
    })
  } catch (error) {
    console.error('Error fetching onboarding state:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update specific onboarding fields
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { onboardingCompleted, toursCompleted, onboardingSkipped, onboardingStartedAt } = body
    
    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (onboardingCompleted !== undefined) {
      updates.push(`onboarding_completed = $${paramIndex}`)
      values.push(onboardingCompleted)
      paramIndex++
    }
    
    if (toursCompleted !== undefined) {
      updates.push(`tours_completed = $${paramIndex}`)
      values.push(toursCompleted)
      paramIndex++
    }
    
    if (onboardingSkipped !== undefined) {
      updates.push(`onboarding_skipped = $${paramIndex}`)
      values.push(onboardingSkipped)
      paramIndex++
    }
    
    if (onboardingStartedAt !== undefined) {
      updates.push(`onboarding_started_at = $${paramIndex}`)
      values.push(onboardingStartedAt)
      paramIndex++
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    // Use raw query for dynamic updates
    values.push(session.user.id)
    
    await sql.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
      values
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating onboarding state:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Reset/replace entire onboarding state
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { 
      onboardingCompleted = false, 
      toursCompleted = [], 
      onboardingSkipped = false,
      onboardingStartedAt = null
    } = body
    
    await sql`
      UPDATE users SET 
        onboarding_completed = ${onboardingCompleted},
        tours_completed = ${toursCompleted},
        onboarding_skipped = ${onboardingSkipped},
        onboarding_started_at = ${onboardingStartedAt},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.user.id}
    `
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting onboarding state:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

