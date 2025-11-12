import branchesData from '@/data/branches.json'
import rolesData from '@/data/roles.json'

export interface Contact {
  name: string
  role: string
  phone: string
  email: string
}

export interface DeliverySchedule {
  day: string
  time: string
  items: string
}

export interface KPIs {
  salesTarget: string
  wastePct: string
  hygieneScore: string
}

export interface Media {
  photos: string[]
  videos: string[]
}

export interface Branch {
  id: string
  slug: string
  name: string
  school: string
  location: string
  manager: string
  contacts: Contact[]
  operatingHours: string
  deliverySchedule: DeliverySchedule[]
  kpis: KPIs
  roles: string[]
  media: Media
}

export interface DailyFlowItem {
  time: string
  action: string
  owner: string
  hint: string
}

export interface DailyFlow {
  morning: DailyFlowItem[]
  preLunch: DailyFlowItem[]
  service: DailyFlowItem[]
  postLunch: DailyFlowItem[]
  closeout: DailyFlowItem[]
}

export interface ChecklistItem {
  id: string
  task: string
  critical: boolean
}

export interface Checklists {
  opening: ChecklistItem[]
  service: ChecklistItem[]
  closing: ChecklistItem[]
}

export interface Role {
  roleId: string
  name: string
  description: string
  responsibilities: string[]
  dailyFlow: DailyFlow
  checklists: Checklists
  dos: string[]
  donts: string[]
}

/**
 * Load all branches
 */
export function loadBranches(): Branch[] {
  return branchesData as Branch[]
}

/**
 * Load a single branch by slug
 */
export function loadBranch(slug: string): Branch | undefined {
  const branches = loadBranches()
  return branches.find(branch => branch.slug === slug)
}

/**
 * Load all roles
 */
export function loadRoles(): Role[] {
  return rolesData as Role[]
}

/**
 * Get a single role by roleId
 */
export function getRole(roleId: string): Role | undefined {
  const roles = loadRoles()
  return roles.find(role => role.roleId === roleId)
}

/**
 * Get unique locations from all branches
 */
export function getUniqueLocations(): string[] {
  const branches = loadBranches()
  const locations = branches.map(b => b.location)
  return Array.from(new Set(locations)).sort()
}

/**
 * Get unique managers from all branches
 */
export function getUniqueManagers(): string[] {
  const branches = loadBranches()
  const managers = branches.map(b => b.manager)
  return Array.from(new Set(managers)).sort()
}

/**
 * Filter branches by search query
 */
export function filterBranches(
  branches: Branch[],
  query: string,
  filters: {
    location?: string
    manager?: string
    minHygieneScore?: number
  }
): Branch[] {
  return branches.filter(branch => {
    // Search query filter
    if (query) {
      const searchLower = query.toLowerCase()
      const matchesSearch =
        branch.name.toLowerCase().includes(searchLower) ||
        branch.school.toLowerCase().includes(searchLower) ||
        branch.location.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      if (branch.location !== filters.location) return false
    }

    // Manager filter
    if (filters.manager && filters.manager !== 'all') {
      if (branch.manager !== filters.manager) return false
    }

    // Hygiene score filter
    if (filters.minHygieneScore) {
      const score = parseInt(branch.kpis.hygieneScore)
      if (score < filters.minHygieneScore) return false
    }

    return true
  })
}

/**
 * Merge localStorage overrides with original data (for edit mode)
 */
export function mergeLocalOverrides<T>(originalData: T, storageKey: string): T {
  if (typeof window === 'undefined') return originalData

  try {
    const overrides = localStorage.getItem(storageKey)
    if (!overrides) return originalData

    const parsedOverrides = JSON.parse(overrides)
    return { ...originalData, ...parsedOverrides }
  } catch (error) {
    console.error('Error merging localStorage overrides:', error)
    return originalData
  }
}

/**
 * Save data overrides to localStorage (for edit mode)
 */
export function saveToLocalStorage(key: string, data: any): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Get all localStorage overrides for export
 */
export function getAllOverrides(): Record<string, any> {
  if (typeof window === 'undefined') return {}

  const overrides: Record<string, any> = {}
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('branch_') || key.startsWith('role_'))) {
        const value = localStorage.getItem(key)
        if (value) {
          overrides[key] = JSON.parse(value)
        }
      }
    }
  } catch (error) {
    console.error('Error getting overrides:', error)
  }

  return overrides
}

/**
 * Export merged data as JSON (for edit mode copy function)
 */
export function exportMergedData(): string {
  const branches = loadBranches()
  const roles = loadRoles()
  
  const mergedBranches = branches.map(branch => 
    mergeLocalOverrides(branch, `branch_${branch.slug}`)
  )
  
  const mergedRoles = roles.map(role => 
    mergeLocalOverrides(role, `role_${role.roleId}`)
  )

  return JSON.stringify(
    {
      branches: mergedBranches,
      roles: mergedRoles,
      exportDate: new Date().toISOString(),
    },
    null,
    2
  )
}

