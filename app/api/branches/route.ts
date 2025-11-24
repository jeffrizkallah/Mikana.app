import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Branch } from '@/lib/data'

const dataFilePath = path.join(process.cwd(), 'data', 'branches.json')

async function getBranches(): Promise<Branch[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading branches file:', error)
    return []
  }
}

async function saveBranches(branches: Branch[]) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(branches, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing branches file:', error)
    return false
  }
}

export async function GET() {
  const branches = await getBranches()
  return NextResponse.json(branches)
}

export async function POST(request: Request) {
  try {
    const newBranch = await request.json()
    
    // Basic validation
    if (!newBranch.slug || !newBranch.name) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name' },
        { status: 400 }
      )
    }

    const branches = await getBranches()
    
    // Check if slug exists
    if (branches.some(b => b.slug === newBranch.slug)) {
      return NextResponse.json(
        { error: 'Branch slug already exists' },
        { status: 409 }
      )
    }

    // Generate ID if not provided
    if (!newBranch.id) {
      const maxId = branches.reduce((max, b) => {
        const id = parseInt(b.id)
        return id > max ? id : max
      }, 0)
      newBranch.id = String(maxId + 1)
    }

    branches.push(newBranch)
    const success = await saveBranches(branches)

    if (!success) {
      throw new Error('Failed to save file')
    }

    return NextResponse.json(newBranch, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

