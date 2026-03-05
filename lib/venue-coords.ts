const VENUE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Austin Convention Center': { lat: 30.2634, lng: -97.7401 },
  'Fairmont Austin': { lat: 30.2621, lng: -97.7393 },
  'Hilton Austin Downtown': { lat: 30.2645, lng: -97.7427 },
  'JW Marriott Austin': { lat: 30.2657, lng: -97.7443 },
  'Austin City Limits Live at The Moody Theater': { lat: 30.2655, lng: -97.7474 },
  'Paramount Theatre': { lat: 30.2706, lng: -97.7408 },
  'Stateside at the Paramount': { lat: 30.2703, lng: -97.7408 },
  'Palmer Events Center': { lat: 30.2577, lng: -97.7515 },
  'Long Center for the Performing Arts': { lat: 30.2591, lng: -97.7504 },
  'ZACH Theatre': { lat: 30.2576, lng: -97.7536 },
  'Brazos Hall': { lat: 30.2620, lng: -97.7386 },
  'Violet Crown Cinema': { lat: 30.2590, lng: -97.7409 },
  'AFS Cinema': { lat: 30.3023, lng: -97.7278 },
  'The Driskill': { lat: 30.2678, lng: -97.7408 },
  'Speakeasy': { lat: 30.2709, lng: -97.7441 },
  'Cedar Street Courtyard': { lat: 30.2686, lng: -97.7437 },
  "Esther's Follies": { lat: 30.2675, lng: -97.7413 },
  'The Mohawk': { lat: 30.2684, lng: -97.7376 },
  'Stubbs BBQ': { lat: 30.2684, lng: -97.7356 },
  'Empire Control Room': { lat: 30.2685, lng: -97.7357 },
  "Antone's": { lat: 30.2681, lng: -97.7397 },
  'The Continental Club': { lat: 30.2489, lng: -97.7486 },
  'Hotel Van Zandt': { lat: 30.2597, lng: -97.7367 },
  'LINE Austin': { lat: 30.2635, lng: -97.7384 },
  'Hyatt Regency Austin': { lat: 30.2609, lng: -97.7451 },
}

export function getVenueCoords(venue: string): { lat: number; lng: number } | null {
  const lower = venue.toLowerCase()
  for (const [name, coords] of Object.entries(VENUE_COORDS)) {
    if (lower.includes(name.toLowerCase())) {
      return coords
    }
  }
  return null
}
