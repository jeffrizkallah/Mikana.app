import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const updates = await request.json()
    const { id: dispatchId } = await params
    
    // Get the current dispatch
    const dispatch = await sql`
      SELECT branch_dispatches as "branchDispatches"
      FROM dispatches
      WHERE id = ${dispatchId} AND is_archived = false
    `
    
    if (dispatch.rows.length === 0) {
      return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 })
    }
    
    // Update branch dispatch in the JSONB array
    const branchDispatches = dispatch.rows[0].branchDispatches
    const branchIndex = branchDispatches.findIndex(
      (bd: any) => bd.branchSlug === updates.branchSlug
    )
    
    if (branchIndex === -1) {
      return NextResponse.json({ error: 'Branch dispatch not found' }, { status: 404 })
    }
    
    // Merge updates
    branchDispatches[branchIndex] = {
      ...branchDispatches[branchIndex],
      ...updates
    }
    
    // Update the database
    await sql`
      UPDATE dispatches
      SET branch_dispatches = ${JSON.stringify(branchDispatches)}::jsonb
      WHERE id = ${dispatchId}
    `
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating dispatch:', error)
    return NextResponse.json({ error: 'Failed to update dispatch' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dispatchId } = await params
    
    // Mark dispatch as archived instead of physically deleting
    const result = await sql`
      UPDATE dispatches
      SET 
        is_archived = true,
        deleted_at = NOW(),
        deleted_by = 'Admin'
      WHERE id = ${dispatchId} AND is_archived = false
      RETURNING id
    `
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dispatch archived successfully',
      archivedId: dispatchId
    })
  } catch (error) {
    console.error('Error deleting dispatch:', error)
    return NextResponse.json({ error: 'Failed to delete dispatch' }, { status: 500 })
  }
}

