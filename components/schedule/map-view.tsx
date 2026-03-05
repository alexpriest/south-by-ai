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

    // Filter sessions
    const filtered = day.sessions.filter((s) => {
      if (timeFilter !== 'all' && getTimeFilter(s) !== timeFilter) return false
      return getVenueCoords(s.venue) !== null
    })

    // Sort by start time for route
    const sorted = [...filtered].sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Add markers
    const routePoints: [number, number][] = []

    sorted.forEach((session) => {
      const coords = getVenueCoords(session.venue)
      if (!coords) return

      const color = getTrackColor(session.track)
      const isTopPick = session.priority === 1
      const radius = isTopPick ? 10 : 6
      const opacity = isTopPick ? 0.9 : 0.5
      const fillOpacity = isTopPick ? 0.8 : 0.4

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity,
        opacity,
        weight: 2,
        className: isTopPick ? 'pulse-marker' : '',
      }).addTo(map)

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <strong style="font-size: 14px;">${session.title}</strong>
          <div style="margin-top: 6px; font-size: 12px; color: #999;">
            ${session.startTime} - ${session.endTime}
          </div>
          <div style="margin-top: 4px; font-size: 12px; color: #999;">
            ${session.venue}
          </div>
          <div style="margin-top: 6px;">
            <span style="display: inline-block; background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
              ${session.track}
            </span>
          </div>
          ${session.reason ? `<div style="margin-top: 8px; font-size: 12px; font-style: italic; color: #aaa;">${session.reason}</div>` : ''}
          <div style="margin-top: 8px;">
            <a href="${session.url}" target="_blank" rel="noopener noreferrer" style="color: #FF6B35; font-size: 12px; text-decoration: none;">
              Open on SXSW &rarr;
            </a>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      routePoints.push([coords.lat, coords.lng])
    })

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
        className="rounded-xl overflow-hidden border border-white/10"
        style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
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
