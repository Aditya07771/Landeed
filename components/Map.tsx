// file: components/Map.tsx

'use client'

import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GeoJSONFeature } from '@/lib/geojson'

interface MapProps {
    features: GeoJSONFeature[]
    onFeatureClick: (feature: GeoJSONFeature) => void
    center?: [number, number]
    zoom?: number
}

const statusColors: Record<string, string> = {
    AVAILABLE: '#22c55e',
    UNDER_ACQUISITION: '#eab308',
    ACQUIRED: '#ef4444',
    DISPUTED: '#f97316'
}

function convertCoords(coords: number[][][]): LatLngExpression[][] {
    return coords.map(ring =>
        ring.map(point => [point[1], point[0]] as LatLngExpression)
    )
}

function FitBounds({ features }: { features: GeoJSONFeature[] }) {
    const map = useMap()

    if (features.length > 0) {
        const allPoints: [number, number][] = []
        features.forEach(f => {
            f.geometry.coordinates[0].forEach(point => {
                allPoints.push([point[1], point[0]])
            })
        })

        if (allPoints.length > 0) {
            const bounds = allPoints.reduce(
                (acc, point) => ({
                    minLat: Math.min(acc.minLat, point[0]),
                    maxLat: Math.max(acc.maxLat, point[0]),
                    minLng: Math.min(acc.minLng, point[1]),
                    maxLng: Math.max(acc.maxLng, point[1])
                }),
                { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
            )

            map.fitBounds([
                [bounds.minLat, bounds.minLng],
                [bounds.maxLat, bounds.maxLng]
            ], { padding: [20, 20] })
        }
    }

    return null
}

export default function Map({ features, onFeatureClick, center = [20.5937, 78.9629], zoom = 5 }: MapProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds features={features} />

            {features.map((feature) => (
                <Polygon
                    key={feature.properties.id}
                    positions={convertCoords(feature.geometry.coordinates)}
                    pathOptions={{
                        color: statusColors[feature.properties.status] || '#6b7280',
                        fillColor: statusColors[feature.properties.status] || '#6b7280',
                        fillOpacity: 0.4,
                        weight: 2
                    }}
                    eventHandlers={{
                        click: () => onFeatureClick(feature)
                    }}
                />
            ))}
        </MapContainer>
    )
}