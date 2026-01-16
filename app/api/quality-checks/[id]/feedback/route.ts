import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { sql } from '@vercel/postgres'
import { authOptions } from '@/lib/auth-options'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET - Get all feedback for a quality check
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const qualityCheckId = parseInt(id)

    if (isNaN(qualityCheckId)) {
      return NextResponse.json({ error: 'Invalid quality check ID' }, { status: 400 })
    }

    // First, get the quality check to verify access
    const qcResult = await sql`
      SELECT submitted_by FROM quality_checks WHERE id = ${qualityCheckId}
    `

    if (qcResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quality check not found' }, { status: 404 })
    }

    const submitterId = qcResult.rows[0].submitted_by
    const userId = session.user.id
    const userRole = session.user.role

    // Check access: user can see feedback if they are:
    // 1. The submitter of the quality check
    // 2. A manager role (admin, regional_manager, operations_lead)
    const isSubmitter = submitterId === userId
    const isManager = ['admin', 'regional_manager', 'operations_lead'].includes(userRole || '')

    if (!isSubmitter && !isManager) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For submitters, only show feedback given to them
    // For managers who gave feedback, show their own feedback
    const feedbackResult = await sql`
      SELECT 
        qf.id,
        qf.quality_check_id as "qualityCheckId",
        qf.feedback_text as "feedbackText",
        qf.feedback_by as "feedbackBy",
        qf.is_read as "isRead",
        qf.read_at as "readAt",
        qf.created_at as "createdAt",
        u.first_name || ' ' || u.last_name as "feedbackByName",
        u.role as "feedbackByRole"
      FROM quality_feedback qf
      JOIN users u ON qf.feedback_by = u.id
      WHERE qf.quality_check_id = ${qualityCheckId}
      ORDER BY qf.created_at DESC
    `

    return NextResponse.json({ feedback: feedbackResult.rows })

  } catch (error) {
    console.error('Error fetching quality feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// POST - Create new feedback for a quality check
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    const userId = session.user.id

    // Only managers can give feedback
    if (!['admin', 'regional_manager', 'operations_lead'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Only managers can provide feedback' },
        { status: 403 }
      )
    }

    const { id } = await params
    const qualityCheckId = parseInt(id)

    if (isNaN(qualityCheckId)) {
      return NextResponse.json({ error: 'Invalid quality check ID' }, { status: 400 })
    }

    const body = await request.json()
    const { feedbackText } = body

    if (!feedbackText || typeof feedbackText !== 'string' || feedbackText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback text is required' },
        { status: 400 }
      )
    }

    if (feedbackText.length > 2000) {
      return NextResponse.json(
        { error: 'Feedback text must be less than 2000 characters' },
        { status: 400 }
      )
    }

    // Verify the quality check exists and get submitter info
    const qcResult = await sql`
      SELECT 
        qc.id,
        qc.submitted_by,
        qc.product_name,
        qc.branch_slug,
        u.first_name || ' ' || u.last_name as submitter_name
      FROM quality_checks qc
      JOIN users u ON qc.submitted_by = u.id
      WHERE qc.id = ${qualityCheckId}
    `

    if (qcResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quality check not found' }, { status: 404 })
    }

    const qualityCheck = qcResult.rows[0]

    // Insert the feedback
    const feedbackResult = await sql`
      INSERT INTO quality_feedback (
        quality_check_id,
        feedback_text,
        feedback_by
      ) VALUES (
        ${qualityCheckId},
        ${feedbackText.trim()},
        ${userId}
      )
      RETURNING 
        id,
        quality_check_id as "qualityCheckId",
        feedback_text as "feedbackText",
        feedback_by as "feedbackBy",
        is_read as "isRead",
        created_at as "createdAt"
    `

    // Create a notification for the submitter
    const feedbackGiverName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'A manager'
    const notificationTitle = `Feedback on your ${qualityCheck.product_name} quality check`
    const notificationPreview = feedbackText.trim().substring(0, 100) + (feedbackText.length > 100 ? '...' : '')
    const notificationContent = `## Quality Check Feedback\n\n**Product:** ${qualityCheck.product_name}\n\n**Feedback from ${feedbackGiverName}:**\n\n${feedbackText.trim()}\n\n---\n*View the full quality check to see details and mark as acknowledged.*`

    try {
      await sql`
        INSERT INTO notifications (
          type,
          priority,
          title,
          preview,
          content,
          created_by,
          expires_at,
          related_user_id,
          metadata
        ) VALUES (
          'alert',
          'normal',
          ${notificationTitle},
          ${notificationPreview},
          ${notificationContent},
          ${feedbackGiverName},
          NOW() + INTERVAL '14 days',
          ${qualityCheck.submitted_by},
          ${JSON.stringify({
            qualityCheckId: qualityCheckId,
            feedbackId: feedbackResult.rows[0].id,
            productName: qualityCheck.product_name,
            branchSlug: qualityCheck.branch_slug
          })}
        )
      `
    } catch (notifError) {
      // Log but don't fail if notification creation fails
      console.error('Failed to create feedback notification:', notifError)
    }

    return NextResponse.json(
      { 
        success: true, 
        feedback: feedbackResult.rows[0],
        message: 'Feedback sent successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating quality feedback:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
