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
  const [calloutMessage, setCalloutMessage] = useState<string | null>(null)

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

    // Compute callout message based on venue distribution
    const uniqueVenues = new Map<string, string>() // key -> venue name
    venueGroups.forEach((sessions, key) => {
      uniqueVenues.set(key, sessions[0].venue)
    })

    const timeLabel = timeFilter === 'all' ? 'today' : timeFilter
    if (uniqueVenues.size === 1) {
      const firstVenue = Array.from(uniqueVenues.values())[0]
      const venueName = firstVenue.split(',').pop()?.trim() || firstVenue
      setCalloutMessage(
        timeFilter === 'all'
          ? `All your sessions today are at ${venueName} — no walking needed!`
          : `All your ${timeLabel} sessions are at ${venueName} — no walking needed!`
      )
    } else if (uniqueVenues.size >= 2) {
      const coords = Array.from(uniqueVenues.keys()).map(k => k.split(',').map(Number))
      const lats = coords.map(c => c[0])
      const lngs = coords.map(c => c[1])
      const latSpread = Math.max(...lats) - Math.min(...lats)
      const lngSpread = Math.max(...lngs) - Math.min(...lngs)
      if (latSpread < 0.002 && lngSpread < 0.002) {
        setCalloutMessage('Your sessions are clustered nearby — easy walking day!')
      } else {
        setCalloutMessage(null)
      }
    } else {
      setCalloutMessage(null)
    }

    // Add one marker per venue with multi-session popup
    const routePoints: [number, number][] = []
    let stopNumber = 0

    venueGroups.forEach((sessions, key) => {
      stopNumber++
      const [lat, lng] = key.split(',').map(Number)
      const stopColors = ['#FF6B35', '#00D4AA', '#3B82F6', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#EF4444']
      const markerColor = stopColors[(stopNumber - 1) % stopColors.length]

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${markerColor};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 6px rgba(0,0,0,0.3);">${stopNumber}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)

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

      {/* Callout banner */}
      {calloutMessage && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-sm text-accent">
          {calloutMessage}
        </div>
      )}

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
