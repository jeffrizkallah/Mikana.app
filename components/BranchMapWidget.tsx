'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Map, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BranchMapMobile } from './BranchMapMobile'
import type { Branch } from '@/lib/data'

// Dynamically import the map component to avoid SSR issues with Leaflet
const BranchMap = dynamic(
  () => import('./BranchMap').then(mod => ({ default: mod.BranchMap })),
  {
    loading: () => (
      <div className="w-full h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
)

interface BranchMapWidgetProps {
  branches: Branch[]
}

export function BranchMapWidget({ branches }: BranchMapWidgetProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check screen size and set mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    setIsLoading(false)
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map className="h-5 w-5 text-blue-600" />
            Branch Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[200px] bg-muted/30 rounded-lg flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Map className="h-5 w-5 text-blue-600" />
          Branch Network
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isMobile ? 'Explore our locations across the UAE' : 'Click on a marker to view branch details'}
        </p>
      </CardHeader>
      <CardContent className={isMobile ? 'pt-0' : ''}>
        {isMobile ? (
          <BranchMapMobile branches={branches} />
        ) : (
          <BranchMap branches={branches} />
        )}
      </CardContent>
    </Card>
  )
}
