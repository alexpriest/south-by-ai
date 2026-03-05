'use client'

import { useEffect, useRef, useState } from 'react'
import { getVenueCoords } from '@/lib/venue-coords'
import { getTrackColor } from '@/lib/track-colors'
import type { DaySchedule, ScheduleSession } from '@/lib/types'

declare const L: any

interface MapViewProps {
  day: DaySchedule
}

type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening'

function getTimeFilter(session: ScheduleSession): TimeFilter {
  const hour = parseInt(session.startTime.split(':')[0], 10)
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function MapView({ day }: MapViewProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [hasMarkers, setHasMarkers] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setLoaded(true)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Don't remove script/link — they can stay for future use
    }
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current) return

    const isDark = document.documentElement.classList.contains('dark')
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

    // Clean up previous map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current).setView([30.265, -97.742], 14)
    mapRef.current = map

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    // Filter sessions by time
    const filtered = day.sessions.filter((s) => {
      if (timeFilter !== 'all' && getTimeFilter(s) !== timeFilter) return false
      return getVenueCoords(s.venue) !== null
    })

    // Sort by start time
    const sorted = [...filtered].sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Group sessions by venue coordinates
    const venueGroups = new Map<string, ScheduleSession[]>()
    sorted.forEach((session) => {
      const coords = getVenueCoords(session.venue)
      if (!coords) return
      const key = `${coords.lat},${coords.lng}`
      if (!venueGroups.has(key)) venueGroups.set(key, [])
      venueGroups.get(key)!.push(session)
    })

    // Add one marker per venue with multi-session popup
    const routePoints: [number, number][] = []

    venueGroups.forEach((sessions, key) => {
      const [lat, lng] = key.split(',').map(Number)
      const bestPriority = Math.min(...sessions.map(s => s.priority || 2))
      const isTopPick = bestPriority === 1
      const firstColor = getTrackColor(sessions[0].track)
      const radius = isTopPick ? 10 : 7
      const opacity = isTopPick ? 0.9 : 0.6
      const fillOpacity = isTopPick ? 0.8 : 0.5

      const marker = L.circleMarker([lat, lng], {
        radius,
        color: firstColor,
        fillColor: firstColor,
        fillOpacity,
        opacity,
        weight: 2,
        className: isTopPick ? 'pulse-marker' : '',
      }).addTo(map)

      const venueName = sessions[0].venue.split(',').pop()?.trim() || sessions[0].venue
      const popupHtml = sessions.map((s, i) => {
        const color = getTrackColor(s.track)
        return `
          <div style="padding: 8px 0;${i > 0 ? ' border-top: 1px solid #333;' : ''}">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${s.priority === 1 ? '<span style="color: #FF6B35;">&#9733;</span>' : ''}
              <strong style="font-size: 13px;">${s.title}</strong>
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 4px;">
              ${s.startTime} &ndash; ${s.endTime}
            </div>
            <span style="display: inline-block; background: ${color}22; color: ${color}; padding: 1px 6px; border-radius: 8px; font-size: 10px; margin-top: 4px;">
              ${s.track}
            </span>
          </div>
        `
      }).join('')

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 220px; max-height: 300px; overflow-y: auto;">
          <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">${venueName}${sessions.length > 1 ? ` &middot; ${sessions.length} sessions` : ''}</div>
          ${popupHtml}
        </div>
      `

      marker.bindPopup(popupContent, { maxWidth: 320 })

      routePoints.push([lat, lng])
    })

    setHasMarkers(routePoints.length > 0)

    // Draw walking route
    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#FF6B35',
        weight: 2,
        opacity: 0.4,
        dashArray: '8, 8',
      }).addTo(map)
    }

    // Fit bounds if we have points
    if (routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [loaded, day, timeFilter])

  const filters: { value: TimeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
  ]

  return (
    <div>
      {/* Time filter pills */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setTimeFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
              timeFilter === f.value
                ? 'bg-primary/20 text-primary'
                : 'bg-white/5 text-muted hover:bg-white/10 hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div
        className="rounded-xl overflow-hidden border border-white/10 relative"
        style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {!hasMarkers && loaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted text-center py-8 text-sm">
              No mapped venues for this day&apos;s sessions.
            </p>
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style jsx global>{`
        .pulse-marker {
          animation: pulse-ring 2s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { opacity: 0.9; }
          50% { opacity: 0.5; }
          100% { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
