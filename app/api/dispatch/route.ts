import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const dispatch = await request.json()
    
    // Read existing dispatches
    const dispatchFilePath = join(process.cwd(), 'data', 'dispatches.json')
    let dispatches = []
    
    try {
      const fileContent = readFileSync(dispatchFilePath, 'utf-8')
      dispatches = JSON.parse(fileContent)
    } catch (err) {
      // File doesn't exist or is empty, start with empty array
      dispatches = []
    }
    
    // Add new dispatch
    dispatches.push(dispatch)
    
    // Save back to file
    writeFileSync(dispatchFilePath, JSON.stringify(dispatches, null, 2))
    
    return NextResponse.json({ success: true, id: dispatch.id })
  } catch (error) {
    console.error('Error saving dispatch:', error)
    return NextResponse.json({ error: 'Failed to save dispatch' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const dispatchFilePath = join(process.cwd(), 'data', 'dispatches.json')
    const fileContent = readFileSync(dispatchFilePath, 'utf-8')
    const dispatches = JSON.parse(fileContent)
    
    return NextResponse.json(dispatches)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

