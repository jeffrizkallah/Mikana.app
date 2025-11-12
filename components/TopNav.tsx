'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Moon, Sun } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TopNavProps {
  onSearch?: (query: string) => void
  searchQuery?: string
}

export function TopNav({ onSearch, searchQuery = '' }: TopNavProps) {
  const [isDark, setIsDark] = useState(false)
  const [query, setQuery] = useState(searchQuery)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-border no-print">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">Mikana</span>
              <span className="ml-2 text-sm text-muted-foreground hidden md:inline">
                Branch Guidebook
              </span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search branches..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

