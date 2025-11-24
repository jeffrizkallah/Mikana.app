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
    return []
  }
}

async function saveBranches(branches: Branch[]) {
  await fs.writeFile(dataFilePath, JSON.stringify(branches, null, 2), 'utf-8')
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const updates = await request.json()
    const branches = await getBranches()
    
    const index = branches.findIndex(b => b.slug === slug)
    if (index === -1) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Update branch - ensure slug matches path
    const updatedBranch = { ...branches[index], ...updates, slug }
    branches[index] = updatedBranch
    
    await saveBranches(branches)

    return NextResponse.json(updatedBranch)
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const branches = await getBranches()
    
    const filteredBranches = branches.filter(b => b.slug !== slug)
    
    if (filteredBranches.length === branches.length) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    await saveBranches(filteredBranches)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

