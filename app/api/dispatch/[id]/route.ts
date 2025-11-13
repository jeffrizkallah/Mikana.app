import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const dispatchId = params.id
    
    // Read existing dispatches
    const dispatchFilePath = join(process.cwd(), 'data', 'dispatches.json')
    const fileContent = readFileSync(dispatchFilePath, 'utf-8')
    const dispatches = JSON.parse(fileContent)
    
    // Find and update the dispatch
    const dispatchIndex = dispatches.findIndex((d: any) => d.id === dispatchId)
    
    if (dispatchIndex === -1) {
      return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 })
    }
    
    // Update branch dispatch
    const dispatch = dispatches[dispatchIndex]
    const branchIndex = dispatch.branchDispatches.findIndex(
      (bd: any) => bd.branchSlug === updates.branchSlug
    )
    
    if (branchIndex === -1) {
      return NextResponse.json({ error: 'Branch dispatch not found' }, { status: 404 })
    }
    
    // Merge updates
    dispatch.branchDispatches[branchIndex] = {
      ...dispatch.branchDispatches[branchIndex],
      ...updates
    }
    
    dispatches[dispatchIndex] = dispatch
    
    // Save back to file
    writeFileSync(dispatchFilePath, JSON.stringify(dispatches, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating dispatch:', error)
    return NextResponse.json({ error: 'Failed to update dispatch' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dispatchId = params.id
    
    // Read existing dispatches
    const dispatchFilePath = join(process.cwd(), 'data', 'dispatches.json')
    const fileContent = readFileSync(dispatchFilePath, 'utf-8')
    const dispatches = JSON.parse(fileContent)
    
    // Find the dispatch to delete
    const dispatchIndex = dispatches.findIndex((d: any) => d.id === dispatchId)
    
    if (dispatchIndex === -1) {
      return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 })
    }
    
    // Get the dispatch to archive
    const dispatchToArchive = dispatches[dispatchIndex]
    
    // Add deletion metadata
    dispatchToArchive.deletedAt = new Date().toISOString()
    dispatchToArchive.deletedBy = 'Admin'
    
    // Remove from active dispatches
    dispatches.splice(dispatchIndex, 1)
    
    // Save updated dispatches
    writeFileSync(dispatchFilePath, JSON.stringify(dispatches, null, 2))
    
    // Move to archive
    const archiveFilePath = join(process.cwd(), 'data', 'dispatches-archive.json')
    let archivedDispatches = []
    
    // Read existing archive if it exists
    if (existsSync(archiveFilePath)) {
      try {
        const archiveContent = readFileSync(archiveFilePath, 'utf-8')
        archivedDispatches = JSON.parse(archiveContent)
      } catch {
        archivedDispatches = []
      }
    }
    
    // Add to archive
    archivedDispatches.push(dispatchToArchive)
    
    // Save archive
    writeFileSync(archiveFilePath, JSON.stringify(archivedDispatches, null, 2))
    
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

