import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'production-schedules.json')

function readSchedules() {
  const fileContents = fs.readFileSync(dataFilePath, 'utf8')
  return JSON.parse(fileContents)
}

function writeSchedules(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const schedules = readSchedules()
    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error reading production schedules:', error)
    return NextResponse.json({ error: 'Failed to read production schedules' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newSchedule = await request.json()
    const schedules = readSchedules()
    
    // Check if schedule with same ID already exists
    const existingIndex = schedules.findIndex(
      (s: any) => s.scheduleId === newSchedule.scheduleId
    )
    
    if (existingIndex !== -1) {
      // Replace existing schedule
      schedules[existingIndex] = newSchedule
    } else {
      schedules.push(newSchedule)
    }
    
    writeSchedules(schedules)
    
    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    console.error('Error creating production schedule:', error)
    return NextResponse.json({ error: 'Failed to create production schedule' }, { status: 500 })
  }
}

