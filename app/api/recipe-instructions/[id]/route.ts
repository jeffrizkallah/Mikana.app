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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const instructions = readInstructions()
    const instruction = instructions.find((i: any) => i.instructionId === params.id)
    
    if (!instruction) {
      return NextResponse.json({ error: 'Instruction not found' }, { status: 404 })
    }
    
    return NextResponse.json(instruction)
  } catch (error) {
    console.error('Error reading recipe instruction:', error)
    return NextResponse.json({ error: 'Failed to read recipe instruction' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedInstruction = await request.json()
    const instructions = readInstructions()
    
    const index = instructions.findIndex((i: any) => i.instructionId === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Instruction not found' }, { status: 404 })
    }
    
    instructions[index] = { ...instructions[index], ...updatedInstruction }
    writeInstructions(instructions)
    
    return NextResponse.json(instructions[index])
  } catch (error) {
    console.error('Error updating recipe instruction:', error)
    return NextResponse.json({ error: 'Failed to update recipe instruction' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const instructions = readInstructions()
    const index = instructions.findIndex((i: any) => i.instructionId === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Instruction not found' }, { status: 404 })
    }
    
    const deleted = instructions.splice(index, 1)[0]
    writeInstructions(instructions)
    
    return NextResponse.json(deleted)
  } catch (error) {
    console.error('Error deleting recipe instruction:', error)
    return NextResponse.json({ error: 'Failed to delete recipe instruction' }, { status: 500 })
  }
}

