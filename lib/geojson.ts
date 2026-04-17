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

function parseJsonIfString(value: unknown): unknown {
    if (typeof value !== 'string') return value
    const t = value.trim()
    if (!t.startsWith('[') && !t.startsWith('{')) return value
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export function validateGeoJSON(coords: any): boolean {
    if (!coords) return false

    coords = parseJsonIfString(coords)

    if (coords && typeof coords === 'object' && coords.type === 'Polygon' && Array.isArray(coords.coordinates)) {
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
    if (coords == null) return null

    coords = parseJsonIfString(coords)

    // Already proper GeoJSON Polygon
    if (coords && typeof coords === 'object' && coords.type === 'Polygon' && Array.isArray(coords.coordinates)) {
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

/** Stable 0..1 from string — used for deterministic placeholder positions on the map */
export function stableHash01(input: string): number {
    let h = 2166136261
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return (h >>> 0) / 4294967296
}

/**
 * When a land has no usable boundary geometry, place a small square so it still appears on the map.
 * Position is stable from landId + index; size scales slightly with area (m²).
 */
export function buildPlaceholderPolygon(landId: string, index: number, areaM2: number): GeoJSONPolygon {
    const seed = `${landId}#${index}`
    const u1 = stableHash01(seed + ':lat')
    const u2 = stableHash01(seed + ':lng')
    const lat = 20.5 + u1 * 0.22
    const lng = 72.5 + u2 * 0.35
    const sideM = Math.max(40, Math.min(500, Math.sqrt(Math.max(areaM2, 1))))
    const halfDeg = sideM / 2 / 111320
    const ring: number[][] = [
        [lng - halfDeg, lat - halfDeg],
        [lng + halfDeg, lat - halfDeg],
        [lng + halfDeg, lat + halfDeg],
        [lng - halfDeg, lat + halfDeg],
        [lng - halfDeg, lat - halfDeg],
    ]
    return { type: 'Polygon', coordinates: [ring] }
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