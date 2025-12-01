import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'recipe-instructions.json')

function readInstructions() {
  const fileContents = fs.readFileSync(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

function writeInstructions(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const instructions = readInstructions()
    return NextResponse.json(instructions)
  } catch (error) {
    console.error('Error reading recipe instructions:', error)
    return NextResponse.json({ error: 'Failed to read recipe instructions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newInstruction = await request.json()
    const instructions = readInstructions()
    
    // Check if instruction with same ID already exists
    const existingIndex = instructions.findIndex(
      (i: any) => i.instructionId === newInstruction.instructionId
    )
    
    if (existingIndex !== -1) {
      return NextResponse.json(
        { error: 'Instruction with this ID already exists' },
        { status: 400 }
      )
    }
    
    instructions.push(newInstruction)
    writeInstructions(instructions)
    
    return NextResponse.json(newInstruction, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe instruction:', error)
    return NextResponse.json({ error: 'Failed to create recipe instruction' }, { status: 500 })
  }
}

