import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { sql } from '@vercel/postgres'
import { authOptions } from '@/lib/auth-options'

type RouteParams = {
  params: Promise<{ id: string; feedbackId: string }>
}

// PATCH - Mark feedback as read
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, feedbackId } = await params
    const qualityCheckId = parseInt(id)
    const feedbackIdNum = parseInt(feedbackId)

    if (isNaN(qualityCheckId) || isNaN(feedbackIdNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Verify the quality check exists and the current user is the submitter
    const qcResult = await sql`
      SELECT submitted_by FROM quality_checks WHERE id = ${qualityCheckId}
    `

    if (qcResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quality check not found' }, { status: 404 })
    }

    const submitterId = qcResult.rows[0].submitted_by
    const userId = session.user.id

    // Only the submitter can mark feedback as read
    if (submitterId !== userId) {
      return NextResponse.json(
        { error: 'Only the submitter can acknowledge feedback' },
        { status: 403 }
      )
    }

    // Mark the feedback as read
    const result = await sql`
      UPDATE quality_feedback
      SET is_read = TRUE, read_at = NOW()
      WHERE id = ${feedbackIdNum} 
        AND quality_check_id = ${qualityCheckId}
        AND is_read = FALSE
      RETURNING id, is_read as "isRead", read_at as "readAt"
    `

    if (result.rows.length === 0) {
      // Either not found or already read
      const checkExists = await sql`
        SELECT id, is_read FROM quality_feedback 
        WHERE id = ${feedbackIdNum} AND quality_check_id = ${qualityCheckId}
      `
      
      if (checkExists.rows.length === 0) {
        return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
      }
      
      // Already read
      return NextResponse.json({ 
        success: true, 
        message: 'Feedback already acknowledged',
        alreadyRead: true 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback acknowledged',
      feedback: result.rows[0]
    })

  } catch (error) {
    console.error('Error marking feedback as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark feedback as read' },
      { status: 500 }
    )
  }
}
