'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { Phone, User, MapPin, ExternalLink, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Branch } from '@/lib/data'
import { getBranchCoordinates, UAE_MAP_CONFIG } from '@/lib/branch-coordinates'

// Fix for default marker icons in React-Leaflet
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const createMarkerIcon = (isProduction: boolean) => {
  const color = isProduction ? '#8b5cf6' : '#3b82f6' // Purple for CK, Blue for branches
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">
          ${isProduction ? '⚙' : '●'}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Map bounds controller
function MapBoundsController({ branches }: { branches: Branch[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (branches.length === 0) return
    
    const bounds = L.latLngBounds(
      branches.map(branch => {
        const coords = getBranchCoordinates(branch.slug, branch.location)
        return [coords.lat, coords.lng] as [number, number]
      })
    )
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9 })
  }, [branches, map])
  
  return null
}

interface BranchMapProps {
  branches: Branch[]
  onBranchClick?: (slug: string) => void
}

export function BranchMap({ branches, onBranchClick }: BranchMapProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Group branches by location for stats
  const locationStats = useMemo(() => {
    const stats: Record<string, number> = {}
    branches.forEach(branch => {
      stats[branch.location] = (stats[branch.location] || 0) + 1
    })
    return stats
  }, [branches])
  
  const uniqueLocations = Object.keys(locationStats).length
  const totalManagers = useMemo(() => {
    const managers = new Set(branches.map(b => b.manager))
    return managers.size
  }, [branches])
  
  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={UAE_MAP_CONFIG.center}
          zoom={UAE_MAP_CONFIG.zoom}
          minZoom={UAE_MAP_CONFIG.minZoom}
          maxZoom={UAE_MAP_CONFIG.maxZoom}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBoundsController branches={branches} />
          
          {branches.map(branch => {
            const coords = getBranchCoordinates(branch.slug, branch.location)
            const isProduction = branch.branchType === 'production' || branch.slug === 'central-kitchen'
            const primaryContact = branch.contacts?.[0]
            
            return (
              <Marker
                key={branch.slug}
                position={[coords.lat, coords.lng]}
                icon={createMarkerIcon(isProduction)}
              >
                <Popup className="branch-popup" minWidth={250} maxWidth={300}>
                  <div className="p-1">
                    {/* Branch Header */}
                    <div className="flex items-start gap-2 mb-3">
                      {isProduction ? (
                        <ChefHat className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      ) : (
                        <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{branch.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{branch.school}</p>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{branch.location}</span>
                    </div>
                    
                    {/* Manager/Contact Info */}
                    <div className="bg-muted/50 rounded-md p-2.5 mb-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{branch.manager}</span>
                      </div>
                      {primaryContact?.phone && (
                        <a 
                          href={`tel:${primaryContact.phone}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{primaryContact.phone}</span>
                        </a>
                      )}
                      {primaryContact?.role && (
                        <p className="text-xs text-muted-foreground pl-5">{primaryContact.role}</p>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <Link href={`/branch/${branch.slug}`} className="block">
                      <Button 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => onBranchClick?.(branch.slug)}
                      >
                        View Branch
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm rounded-md px-3 py-2 shadow-lg border border-border text-xs z-[1000]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span>Central Kitchen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>Branches</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{branches.length}</strong> Branches</span>
        <span>•</span>
        <span><strong className="text-foreground">{uniqueLocations}</strong> Emirates</span>
        <span>•</span>
        <span><strong className="text-foreground">{totalManagers}</strong> Managers</span>
      </div>
    </div>
  )
}
