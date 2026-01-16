import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch all active notifications with read status for user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const browserId = searchParams.get('userId') || ''

    // Get the current user's session to check their role and ID
    const session = await getServerSession(authOptions)
    const userRole = session?.user?.role || null
    const userId = session?.user?.id || null

    // Query notifications:
    // - If target_roles is NULL AND related_user_id is NULL, everyone can see it (broadcast)
    // - If target_roles is set, only users with matching roles can see it
    // - If related_user_id is set, only that specific user can see it
    const result = await sql`
      SELECT 
        n.*,
        CASE WHEN nr.id IS NOT NULL THEN true ELSE false END as is_read
      FROM notifications n
      LEFT JOIN notification_reads nr 
        ON n.id = nr.notification_id 
        AND nr.user_identifier = ${browserId}
      WHERE n.is_active = true 
        AND n.expires_at > NOW()
        AND (
          -- Broadcast notifications (no target roles and no specific user)
          (n.target_roles IS NULL AND n.related_user_id IS NULL)
          -- Role-targeted notifications (no specific user)
          OR (n.related_user_id IS NULL AND ${userRole}::TEXT = ANY(n.target_roles))
          -- User-specific notifications (like feedback)
          OR n.related_user_id = ${userId}
        )
      ORDER BY 
        CASE WHEN n.priority = 'urgent' THEN 0 ELSE 1 END,
        n.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ notifications: result.rows })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Create new notification (admin)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      type, 
      priority, 
      title, 
      preview, 
      content, 
      created_by, 
      expires_in_days,
      target_roles,
      related_user_id,
      metadata
    } = body

    // Validate required fields
    if (!type || !title || !preview || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, preview, content' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['feature', 'patch', 'alert', 'announcement', 'urgent', 'user_signup']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Calculate expiration date
    const expiresInDays = expires_in_days || 7
    
    // Convert JavaScript array to PostgreSQL array format
    const targetRolesArray = target_roles && Array.isArray(target_roles) && target_roles.length > 0
      ? `{${target_roles.join(',')}}` 
      : null
    
    const result = await sql`
      INSERT INTO notifications (
        type, 
        priority, 
        title, 
        preview, 
        content, 
        created_by,
        expires_at,
        target_roles,
        related_user_id,
        metadata
      ) VALUES (
        ${type},
        ${priority || 'normal'},
        ${title},
        ${preview},
        ${content},
        ${created_by || 'admin'},
        NOW() + INTERVAL '1 day' * ${expiresInDays},
        ${targetRolesArray}::TEXT[],
        ${related_user_id || null},
        ${metadata ? JSON.stringify(metadata) : null}
      )
      RETURNING *
    `

    return NextResponse.json({ notification: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

