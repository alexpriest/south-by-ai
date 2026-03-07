'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
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

interface VenueStop {
  stopNumber: number
  venueName: string
  venueKey: string
  lat: number
  lng: number
  color: string
  sessions: ScheduleSession[]
}

const STOP_COLORS = ['#FF6B35', '#00D4AA', '#3B82F6', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#EF4444']

export function MapView({ day }: MapViewProps) {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any>(null)
  const markerObjsRef = useRef<Map<string, any>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [activeStop, setActiveStop] = useState<number | null>(null)
  const [mapInteractive, setMapInteractive] = useState(false)

  // Compute stops eagerly from day data + filter (no dependency on map)
  const stops = useMemo((): VenueStop[] => {
    const filtered = day.sessions.filter((s) => {
      if (timeFilter !== 'all' && getTimeFilter(s) !== timeFilter) return false
      return getVenueCoords(s.venue) !== null
    })

    const sorted = [...filtered].sort((a, b) => a.startTime.localeCompare(b.startTime))

    const venueGroups = new Map<string, ScheduleSession[]>()
    sorted.forEach((session) => {
      const coords = getVenueCoords(session.venue)
      if (!coords) return
      const key = `${coords.lat},${coords.lng}`
      if (!venueGroups.has(key)) venueGroups.set(key, [])
      venueGroups.get(key)!.push(session)
    })

    const result: VenueStop[] = []
    let num = 0
    venueGroups.forEach((sessions, key) => {
      num++
      const [lat, lng] = key.split(',').map(Number)
      const venueName = sessions[0].venue.split(',').pop()?.trim() || sessions[0].venue
      result.push({
        stopNumber: num,
        venueName,
        venueKey: key,
        lat,
        lng,
        color: STOP_COLORS[(num - 1) % STOP_COLORS.length],
        sessions,
      })
    })

    return result
  }, [day, timeFilter])

  // Reset active stop when filter changes
  useEffect(() => {
    setActiveStop(null)
  }, [timeFilter])

  // Load Leaflet script once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).L) { setLoaded(true); return }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Initialize map once
  useEffect(() => {
    if (!loaded || !containerRef.current || typeof L === 'undefined') return
    if (mapRef.current) return

    const isDark = document.documentElement.classList.contains('dark')
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

    const isMobile = window.innerWidth < 1024
    const map = L.map(containerRef.current, {
      zoomControl: false,
      dragging: !isMobile,
      scrollWheelZoom: !isMobile,
      tap: !isMobile,
      touchZoom: !isMobile,
    }).setView([30.265, -97.742], 14)
    mapRef.current = map

    L.control.zoom({ position: 'topright' }).addTo(map)

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  // Enable map interaction on mobile when user taps
  useEffect(() => {
    if (!mapInteractive || !mapRef.current) return
    const map = mapRef.current
    map.dragging.enable()
    map.touchZoom.enable()
    map.tap?.enable()
  }, [mapInteractive])

  // Update markers when stops change
  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return

    if (markersRef.current) markersRef.current.clearLayers()
    markersRef.current = L.layerGroup().addTo(mapRef.current)
    markerObjsRef.current = new Map()

    const routePoints: [number, number][] = []

    stops.forEach((stop) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-stop-marker" data-stop="${stop.stopNumber}" style="width:28px;height:28px;border-radius:50%;background:${stop.color};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease;">${stop.stopNumber}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(markersRef.current)
      markerObjsRef.current.set(stop.venueKey, marker)

      marker.on('click', () => {
        setActiveStop(stop.stopNumber)
      })

      routePoints.push([stop.lat, stop.lng])
    })

    // Draw walking route
    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#FF6B35',
        weight: 2,
        opacity: 0.3,
        dashArray: '6, 8',
      }).addTo(markersRef.current)
    }

    // Fit bounds
    if (routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints)
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [stops, loaded])

  // Highlight active marker on map
  useEffect(() => {
    if (!mapRef.current) return

    // Reset all markers
    document.querySelectorAll('.map-stop-marker').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.transform = 'scale(1)'
      htmlEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      htmlEl.style.zIndex = '1'
    })

    if (activeStop !== null) {
      const stop = stops.find(s => s.stopNumber === activeStop)
      if (stop) {
        const activeEl = document.querySelector(`.map-stop-marker[data-stop="${activeStop}"]`) as HTMLElement
        if (activeEl) {
          activeEl.style.transform = 'scale(1.35)'
          activeEl.style.boxShadow = `0 0 0 4px ${stop.color}40, 0 4px 12px rgba(0,0,0,0.4)`
          activeEl.style.zIndex = '100'
        }

        mapRef.current.panTo([stop.lat, stop.lng], { animate: true, duration: 0.3 })

        const listItem = document.getElementById(`stop-${activeStop}`)
        listItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [activeStop, stops])

  const handleStopClick = (stopNumber: number) => {
    setActiveStop(activeStop === stopNumber ? null : stopNumber)
  }

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

      {stops.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm">
            No mapped sessions for this {timeFilter === 'all' ? 'day' : 'time period'}. Try the list or timeline view instead.
          </p>
        </div>
      ) : (
        /* Map + Sidebar layout */
        <div className="flex flex-col lg:flex-row rounded-xl overflow-hidden border border-white/10">
          {/* Map */}
          <div
            className="relative lg:flex-1 min-h-[300px] h-[50vh] lg:min-h-[500px] lg:h-auto"
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            <div
              ref={containerRef}
              className="lg:rounded-none"
              style={{ width: '100%', height: '100%' }}
            />
            {/* Stop count badge */}
            <div className="absolute top-3 left-3 z-[1000] bg-background/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-xs text-muted">
              {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </div>
            {/* Mobile: tap to interact overlay */}
            {!mapInteractive && (
              <div
                className="absolute inset-0 z-[1001] flex items-center justify-center lg:hidden"
                onClick={() => setMapInteractive(true)}
              >
                <span className="bg-background/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm text-muted">
                  Tap to interact with map
                </span>
              </div>
            )}
          </div>

          {/* Session sidebar */}
          <div
            ref={listRef}
            className="lg:w-[340px] shrink-0 overflow-y-auto bg-white/[0.02] lg:border-l border-white/10 max-h-[50vh] lg:max-h-[calc(100vh-280px)]"
          >
            <div className="p-3 space-y-1">
              {stops.map((stop) => (
                <div
                  key={stop.stopNumber}
                  id={`stop-${stop.stopNumber}`}
                  onClick={() => handleStopClick(stop.stopNumber)}
                  className={`group rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    activeStop === stop.stopNumber
                      ? 'bg-white/[0.08] ring-1 ring-white/15'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Stop header */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: stop.color,
                        boxShadow: activeStop === stop.stopNumber
                          ? `0 0 0 3px ${stop.color}30`
                          : 'none',
                      }}
                    >
                      {stop.stopNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted/70 uppercase tracking-wider truncate">
                        {stop.venueName}
                      </p>
                    </div>
                  </div>

                  {/* Sessions at this stop */}
                  <div className="space-y-1.5 ml-[34px]">
                    {stop.sessions.map((session) => {
                      const trackColor = getTrackColor(session.track)
                      return (
                        <div key={session.id} className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-snug ${
                              activeStop === stop.stopNumber ? 'text-text' : 'text-text/80'
                            }`}>
                              {session.priority === 1 && (
                                <span className="text-primary mr-1">&#9733;</span>
                              )}
                              {session.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-muted">
                                {session.startTime} – {session.endTime}
                              </span>
                              <span
                                className="text-[10px] font-medium px-1.5 py-0 rounded-full"
                                style={{
                                  color: trackColor,
                                  background: `${trackColor}15`,
                                }}
                              >
                                {session.track}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
