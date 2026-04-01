// file: lib/geojson.ts

export interface GeoJSONPolygon {
    type: 'Polygon'
    coordinates: number[][][]
}

export interface GeoJSONFeature {
    type: 'Feature'
    properties: {
        id: string
        landId: string
        ownerId: string
        ownerName: string
        area: number
        location: string
        status: string
        txHash: string | null
    }
    geometry: GeoJSONPolygon
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection'
    features: GeoJSONFeature[]
}

export function validateGeoJSON(coords: any): boolean {
    if (!coords) return false

    if (coords.type === 'Polygon' && Array.isArray(coords.coordinates)) {
        return coords.coordinates.every((ring: any) =>
            Array.isArray(ring) &&
            ring.every((point: any) =>
                Array.isArray(point) &&
                point.length >= 2 &&
                typeof point[0] === 'number' &&
                typeof point[1] === 'number'
            )
        )
    }

    // Simple array of coordinates [[lng, lat], ...]
    if (Array.isArray(coords)) {
        return coords.every((point: any) =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === 'number' &&
            typeof point[1] === 'number'
        )
    }

    return false
}

export function normalizeToGeoJSON(coords: any): GeoJSONPolygon | null {
    if (!coords) return null

    // Already proper GeoJSON Polygon
    if (coords.type === 'Polygon' && Array.isArray(coords.coordinates)) {
        return coords as GeoJSONPolygon
    }

    // Simple array of coordinates - wrap in Polygon structure
    if (Array.isArray(coords)) {
        // Ensure ring is closed
        const ring = [...coords]
        if (ring.length > 0) {
            const first = ring[0]
            const last = ring[ring.length - 1]
            if (first[0] !== last[0] || first[1] !== last[1]) {
                ring.push([...first])
            }
        }

        return {
            type: 'Polygon',
            coordinates: [ring]
        }
    }

    return null
}

export function getPolygonCenter(coords: number[][][]): [number, number] {
    const ring = coords[0]
    let sumLat = 0
    let sumLng = 0

    for (const point of ring) {
        sumLng += point[0]
        sumLat += point[1]
    }

    return [sumLat / ring.length, sumLng / ring.length]
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        AVAILABLE: '#22c55e',      // green
        UNDER_ACQUISITION: '#eab308', // yellow
        ACQUIRED: '#ef4444',        // red
        DISPUTED: '#f97316'         // orange
    }
    return colors[status] || '#6b7280'
}

export const STATUS_PAINT: Record<string, { fill: string; border: string }> = {
    AVAILABLE:         { fill: 'rgba(16,185,129,0.25)', border: '#10b981' },
    UNDER_ACQUISITION: { fill: 'rgba(245,158,11,0.25)', border: '#f59e0b' },
    ACQUIRED:          { fill: 'rgba(239,68,68,0.25)',  border: '#ef4444' },
    DISPUTED:          { fill: 'rgba(249,115,22,0.25)', border: '#f97316' },
}