// file: components/LandMiniMap.tsx
// Lightweight Leaflet mini-map for the land detail page.
// Shows the land polygon on an OSM tile layer.
// Must be loaded dynamically (SSR disabled) in Next.js.

'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

const STATUS_COLORS: Record<string, { fill: string; border: string }> = {
    AVAILABLE: { fill: '#10b981', border: '#059669' },
    UNDER_ACQUISITION: { fill: '#f59e0b', border: '#d97706' },
    ACQUIRED: { fill: '#ef4444', border: '#dc2626' },
    DISPUTED: { fill: '#f97316', border: '#ea580c' },
}

interface Props {
    coordinates: { type: 'Polygon'; coordinates: number[][][] } | null
    status: string
}

function AutoFit({ coordinates }: { coordinates: number[][][] }) {
    const map = useMap()
    useEffect(() => {
        if (!coordinates?.[0]) return
        const latlngs = coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])
        if (latlngs.length) {
            map.fitBounds(L.latLngBounds(latlngs), { padding: [20, 20], maxZoom: 17 })
        }
    }, [coordinates, map])
    return null
}

export default function LandMiniMap({ coordinates, status }: Props) {
    const s = STATUS_COLORS[status] ?? STATUS_COLORS['AVAILABLE']

    const geojson = useMemo(() => {
        if (!coordinates) return null
        return {
            type: 'FeatureCollection' as const,
            features: [
                {
                    type: 'Feature' as const,
                    geometry: coordinates,
                    properties: { status },
                },
            ],
        }
    }, [coordinates, status])

    const defaultCenter: [number, number] =
        coordinates?.coordinates?.[0]?.[0]
            ? [coordinates.coordinates[0][0][1], coordinates.coordinates[0][0][0]]
            : [28.6139, 77.209]

    if (!geojson) {
        return (
            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                No geometry data
            </div>
        )
    }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={14}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
            <GeoJSON
                data={geojson as any}
                style={() => ({
                    fillColor: s.fill,
                    color: s.border,
                    weight: 3,
                    fillOpacity: 0.65,
                })}
            />
            <AutoFit coordinates={coordinates!.coordinates} />
        </MapContainer>
    )
}