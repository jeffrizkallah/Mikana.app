'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Moon, Sun, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TopNavProps {
  onSearch?: (query: string) => void
  searchQuery?: string
}

export function TopNav({ onSearch, searchQuery }: TopNavProps) {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Branches
            </Link>
            <Link href="/dispatch" className="text-sm font-medium hover:text-primary transition-colors">
              Dispatch
            </Link>
          </div>

          {/* Search Bar (only on home page) */}
          {onSearch && (
            <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search branches..."
                value={searchQuery || ''}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

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

