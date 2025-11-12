'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { saveToLocalStorage } from '@/lib/data'

interface EditableFieldProps {
  value: string
  storageKey: string
  field: string
  isEditMode: boolean
  className?: string
  multiline?: boolean
}

export function EditableField({
  value,
  storageKey,
  field,
  isEditMode,
  className = '',
  multiline = false,
}: EditableFieldProps) {
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load saved value from localStorage
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed[field]) {
          setEditValue(parsed[field])
        }
      }
    } catch (error) {
      console.error('Error loading field value:', error)
    }
  }, [storageKey, field])

  const handleChange = (newValue: string) => {
    setEditValue(newValue)
    
    // Save to localStorage
    try {
      const existing = localStorage.getItem(storageKey)
      const data = existing ? JSON.parse(existing) : {}
      data[field] = newValue
      saveToLocalStorage(storageKey, data)
    } catch (error) {
      console.error('Error saving field value:', error)
    }
  }

  if (!isEditMode) {
    return <span className={className}>{editValue}</span>
  }

  if (multiline) {
    return (
      <textarea
        value={editValue}
        onChange={e => handleChange(e.target.value)}
        className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
        rows={3}
      />
    )
  }

  return (
    <Input
      value={editValue}
      onChange={e => handleChange(e.target.value)}
      className={className}
    />
  )
}

