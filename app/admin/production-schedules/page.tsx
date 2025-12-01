'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Loader2, Factory, Calendar, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ProductionSchedule } from '@/lib/data'

export default function AdminProductionSchedulesPage() {
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/production-schedules')
      const data = await res.json()
      setSchedules(data)
    } catch (error) {
      console.error('Failed to fetch schedules', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const res = await fetch(`/api/production-schedules/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSchedules(schedules.filter(s => s.scheduleId !== id))
      } else {
        alert('Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule', error)
    }
  }

  const getTotalItems = (schedule: ProductionSchedule) => {
    return schedule.days.reduce((acc, day) => acc + day.items.length, 0)
  }

  const getCompletedItems = (schedule: ProductionSchedule) => {
    return schedule.days.reduce((acc, day) => 
      acc + day.items.filter(item => item.completed).length, 0
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Factory className="h-8 w-8 text-orange-500" />
            Production Schedule Manager
          </h1>
          <p className="text-muted-foreground">Manage Central Kitchen weekly production plans</p>
        </div>
        <Link href="/admin/production-schedules/import">
          <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Create Schedule
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Production Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No production schedules found.</p>
              <p className="text-sm mt-2">Create your first schedule to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule) => {
                const totalItems = getTotalItems(schedule)
                const completedItems = getCompletedItems(schedule)
                const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

                return (
                  <Card key={schedule.scheduleId} className="overflow-hidden">
                    <div className="h-2 bg-muted">
                      <div 
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Week of {new Date(schedule.weekStart).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(schedule.weekStart).toLocaleDateString()} - {new Date(schedule.weekEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                          {progress}%
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p>{schedule.days.length} production days</p>
                        <p>{totalItems} total items</p>
                        <p>{completedItems} completed</p>
                        <p className="text-xs">Created by {schedule.createdBy}</p>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/branch/central-kitchen/production-schedule`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/production-schedules/${schedule.scheduleId}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteSchedule(schedule.scheduleId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

