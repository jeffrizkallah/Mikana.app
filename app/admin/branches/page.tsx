'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Loader2, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Branch } from '@/lib/data'

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [managerFilter, setManagerFilter] = useState<string>('all')

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches')
      const data = await res.json()
      setBranches(data)
    } catch (error) {
      console.error('Failed to fetch branches', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBranch = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/branches/${slug}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setBranches(branches.filter(b => b.slug !== slug))
      } else {
        alert('Failed to delete branch')
      }
    } catch (error) {
      console.error('Error deleting branch', error)
    }
  }

  // Get unique locations and managers
  const locations = useMemo(() => {
    const locs = new Set(branches.map(b => b.location))
    return Array.from(locs).sort()
  }, [branches])

  const managers = useMemo(() => {
    const mgrs = new Set(branches.map(b => b.manager))
    return Array.from(mgrs).sort()
  }, [branches])

  // Filter branches
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          branch.name.toLowerCase().includes(query) ||
          branch.school.toLowerCase().includes(query) ||
          branch.location.toLowerCase().includes(query) ||
          branch.manager.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Location filter
      if (locationFilter !== 'all' && branch.location !== locationFilter) {
        return false
      }

      // Manager filter
      if (managerFilter !== 'all' && branch.manager !== managerFilter) {
        return false
      }

      return true
    })
  }, [branches, searchQuery, locationFilter, managerFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setLocationFilter('all')
    setManagerFilter('all')
  }

  const hasActiveFilters = searchQuery || locationFilter !== 'all' || managerFilter !== 'all'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Branch Management</h1>
          <p className="text-muted-foreground">Manage branch locations and information</p>
        </div>
        <Link href="/admin/branches/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Branch
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search branches..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Manager Filter */}
              <div className="space-y-2">
                <Label>Manager</Label>
                <select
                  value={managerFilter}
                  onChange={(e) => setManagerFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Managers</option>
                  {managers.map(mgr => (
                    <option key={mgr} value={mgr}>{mgr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">School</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Manager</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hygiene Score</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch) => (
                    <tr key={branch.slug} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{branch.name}</td>
                      <td className="p-4 align-middle text-muted-foreground">{branch.school}</td>
                      <td className="p-4 align-middle">{branch.location}</td>
                      <td className="p-4 align-middle">{branch.manager}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          parseInt(branch.kpis.hygieneScore) >= 95 ? 'bg-green-100 text-green-800' :
                          parseInt(branch.kpis.hygieneScore) >= 90 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {branch.kpis.hygieneScore}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/branches/${branch.slug}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteBranch(branch.slug, branch.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBranches.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No branches found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

