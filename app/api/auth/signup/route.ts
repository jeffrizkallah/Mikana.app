import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { createUser, getUserByEmail } from '@/lib/auth'
import { buildSignupNotificationContent } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword, firstName, lastName, nationality, phone } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const result = await createUser({
      email,
      password,
      firstName,
      lastName,
      nationality,
      phone
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create account' },
        { status: 400 }
      )
    }

    // Create admin notification for new signup
    try {
      const notificationContent = buildSignupNotificationContent({
        userId: result.userId!,
        firstName,
        lastName,
        email,
      })

      // Convert JavaScript array to PostgreSQL array format
      const targetRolesArray = notificationContent.target_roles 
        ? `{${notificationContent.target_roles.join(',')}}` 
        : null

      await sql`
        INSERT INTO notifications (
          type,
          priority,
          title,
          preview,
          content,
          created_by,
          target_roles,
          related_user_id,
          metadata,
          expires_at
        ) VALUES (
          ${notificationContent.type},
          ${notificationContent.priority},
          ${notificationContent.title},
          ${notificationContent.preview},
          ${notificationContent.content},
          'system',
          ${targetRolesArray}::TEXT[],
          ${notificationContent.related_user_id},
          ${JSON.stringify(notificationContent.metadata)},
          NOW() + INTERVAL '1 day' * ${notificationContent.expires_in_days}
        )
      `
    } catch (notificationError) {
      // Log but don't fail signup if notification creation fails
      console.error('Failed to create signup notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please wait for admin approval.'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

