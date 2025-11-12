'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopNav() {
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

