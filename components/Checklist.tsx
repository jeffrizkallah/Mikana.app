'use client'

import { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { getChecklistStorageKey, getDailyKey } from '@/lib/date'
import type { ChecklistItem as ChecklistItemType } from '@/lib/data'

interface ChecklistProps {
  items: ChecklistItemType[]
  branchSlug: string
  roleId: string
  title: string
}

export function Checklist({ items, branchSlug, roleId, title }: ChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const storageKey = getChecklistStorageKey(branchSlug, roleId)

  // Load saved state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setCheckedItems(new Set(parsed.items || []))
      }
    } catch (error) {
      console.error('Error loading checklist state:', error)
    }
  }, [storageKey])

  // Save state to localStorage
  const saveState = (newCheckedItems: Set<string>) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          items: Array.from(newCheckedItems),
          date: getDailyKey(),
        })
      )
    } catch (error) {
      console.error('Error saving checklist state:', error)
    }
  }

  const handleCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems)
    if (checked) {
      newCheckedItems.add(itemId)
    } else {
      newCheckedItems.delete(itemId)
    }
    setCheckedItems(newCheckedItems)
    saveState(newCheckedItems)
  }

  const handleReset = () => {
    setCheckedItems(new Set())
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }

  const completedCount = checkedItems.size
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed ({progress}%)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="no-print"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="checklist-item flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={item.id}
              checked={checkedItems.has(item.id)}
              onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor={item.id}
              className="flex-1 text-sm cursor-pointer select-none"
            >
              <span className={checkedItems.has(item.id) ? 'line-through text-muted-foreground' : ''}>
                {item.task}
              </span>
              {item.critical && (
                <span className="ml-2 text-xs font-semibold text-red-600 dark:text-red-400">
                  CRITICAL
                </span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

