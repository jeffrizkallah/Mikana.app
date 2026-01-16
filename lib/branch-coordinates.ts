// UAE Emirate/City coordinates for branch mapping
// These coordinates represent approximate city centers

export interface Coordinates {
  lat: number
  lng: number
}

// Location coordinates based on the branch location field
export const LOCATION_COORDINATES: Record<string, Coordinates> = {
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Sharjah': { lat: 25.3463, lng: 55.4209 },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
  'Ajman': { lat: 25.4052, lng: 55.5136 },
  'Ras Al Khaimah': { lat: 25.7896, lng: 55.9432 },
  'Umm Al Quwain': { lat: 25.5644, lng: 55.5532 },
  'Al Ain': { lat: 24.2075, lng: 55.7447 },
  // Ruwais is in Al Dhafra region of Abu Dhabi emirate
  'Ruwais': { lat: 24.1104, lng: 52.7312 },
}

// Branch-specific coordinates for precise positioning
// This allows multiple branches in the same city to have slightly offset positions
export const BRANCH_COORDINATES: Record<string, Coordinates> = {
  // Dubai branches - offset slightly to avoid marker overlap
  'central-kitchen': { lat: 25.1850, lng: 55.2608 },
  'isc-soufouh': { lat: 25.1100, lng: 55.1800 },
  'isc-dip': { lat: 24.9900, lng: 55.1500 },
  
  // Sharjah branches
  'isc-sharja': { lat: 25.3463, lng: 55.4209 },
  'isc-aljada': { lat: 25.3200, lng: 55.4500 },
  
  // Other emirates
  'isc-ajman': { lat: 25.4052, lng: 55.5136 },
  'isc-rak': { lat: 25.7896, lng: 55.9432 },
  'isc-ueq': { lat: 25.5644, lng: 55.5532 },
  
  // Abu Dhabi branches
  'sabis-yas': { lat: 24.4700, lng: 54.6100 },
  'isc-khalifa': { lat: 24.4200, lng: 54.5000 },
  'bateen': { lat: 24.4600, lng: 54.3500 },
  'sis-ruwais': { lat: 24.1104, lng: 52.7312 },
  
  // Al Ain
  'isc-ain': { lat: 24.2075, lng: 55.7447 },
}

// Map configuration for UAE
export const UAE_MAP_CONFIG = {
  center: [24.5, 54.5] as [number, number],
  zoom: 7,
  minZoom: 6,
  maxZoom: 12,
  bounds: [
    [22.5, 51.5], // Southwest corner
    [26.5, 56.5], // Northeast corner
  ] as [[number, number], [number, number]],
}

/**
 * Get coordinates for a branch by slug or location
 * Falls back to location-based coordinates if branch-specific not found
 */
export function getBranchCoordinates(slug: string, location: string): Coordinates {
  // First try branch-specific coordinates
  if (BRANCH_COORDINATES[slug]) {
    return BRANCH_COORDINATES[slug]
  }
  
  // Fall back to location coordinates
  if (LOCATION_COORDINATES[location]) {
    return LOCATION_COORDINATES[location]
  }
  
  // Default to Dubai if nothing found
  return LOCATION_COORDINATES['Dubai']
}
