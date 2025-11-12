import { format } from 'date-fns'

/**
 * Generate a daily key for localStorage in format YYYY-MM-DD
 */
export function getDailyKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Generate a storage key for checklist state
 * Format: checklist_{branchSlug}_{roleId}_{date}
 */
export function getChecklistStorageKey(branchSlug: string, roleId: string, date?: string): string {
  const dateKey = date || getDailyKey()
  return `checklist_${branchSlug}_${roleId}_${dateKey}`
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Get current date-time string for print footer
 */
export function getPrintDateTime(): string {
  return format(new Date(), 'PPP p')
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getDailyKey()
}

/**
 * Get formatted time from date
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm')
}

