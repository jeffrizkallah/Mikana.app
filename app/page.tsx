'use client'

import { useState, useMemo } from 'react'
import { TopNav } from '@/components/TopNav'
import { BranchCard } from '@/components/BranchCard'
import { Footer } from '@/components/Footer'
import { loadBranches, filterBranches, getUniqueLocations, getUniqueManagers } from '@/lib/data'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function HomePage() {
  const allBranches = loadBranches()
  const locations = getUniqueLocations()
  const managers = getUniqueManagers()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedManager, setSelectedManager] = useState('all')
  const [minHygieneScore, setMinHygieneScore] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const filteredBranches = useMemo(() => {
    return filterBranches(allBranches, searchQuery, {
      location: selectedLocation,
      manager: selectedManager,
      minHygieneScore,
    })
  }, [allBranches, searchQuery, selectedLocation, selectedManager, minHygieneScore])

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav onSearch={setSearchQuery} searchQuery={searchQuery} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Branch Guidebook</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive operational guides for all Mikana branches
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Narrow down your branch search</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent
            className={`${showFilters ? 'block' : 'hidden'} md:block space-y-4`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manager filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Manager</label>
                <select
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Managers</option>
                  {managers.map(manager => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hygiene score filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Hygiene Score: {minHygieneScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minHygieneScore}
                  onChange={e => setMinHygieneScore(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Active filters summary */}
            {(selectedLocation !== 'all' ||
              selectedManager !== 'all' ||
              minHygieneScore > 0 ||
              searchQuery) && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedLocation('all')
                    setSelectedManager('all')
                    setMinHygieneScore(0)
                    setSearchQuery('')
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredBranches.length} of {allBranches.length} branches
          </p>
        </div>

        {/* Branch grid */}
        {filteredBranches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map(branch => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No branches match your search criteria. Try adjusting your filters.
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}

