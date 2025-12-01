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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schedules = readSchedules()
    const schedule = schedules.find((s: any) => s.scheduleId === params.id)
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error reading production schedule:', error)
    return NextResponse.json({ error: 'Failed to read production schedule' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedSchedule = await request.json()
    const schedules = readSchedules()
    
    const index = schedules.findIndex((s: any) => s.scheduleId === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    
    schedules[index] = { ...schedules[index], ...updatedSchedule }
    writeSchedules(schedules)
    
    return NextResponse.json(schedules[index])
  } catch (error) {
    console.error('Error updating production schedule:', error)
    return NextResponse.json({ error: 'Failed to update production schedule' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const schedules = readSchedules()
    
    const index = schedules.findIndex((s: any) => s.scheduleId === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    
    // Handle item completion updates
    if (updates.itemId && typeof updates.completed === 'boolean') {
      const { date, itemId, completed } = updates
      const dayIndex = schedules[index].days.findIndex((d: any) => d.date === date)
      
      if (dayIndex !== -1) {
        const itemIndex = schedules[index].days[dayIndex].items.findIndex(
          (i: any) => i.itemId === itemId
        )
        
        if (itemIndex !== -1) {
          schedules[index].days[dayIndex].items[itemIndex].completed = completed
        }
      }
    } else {
      // Regular partial update
      schedules[index] = { ...schedules[index], ...updates }
    }
    
    writeSchedules(schedules)
    
    return NextResponse.json(schedules[index])
  } catch (error) {
    console.error('Error patching production schedule:', error)
    return NextResponse.json({ error: 'Failed to update production schedule' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schedules = readSchedules()
    const index = schedules.findIndex((s: any) => s.scheduleId === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    
    const deleted = schedules.splice(index, 1)[0]
    writeSchedules(schedules)
    
    return NextResponse.json(deleted)
  } catch (error) {
    console.error('Error deleting production schedule:', error)
    return NextResponse.json({ error: 'Failed to delete production schedule' }, { status: 500 })
  }
}

