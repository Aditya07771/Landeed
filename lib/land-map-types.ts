/** Shared land / GeoJSON types and legend colors — no Leaflet (safe for SSR imports). */

export interface LandFeature {
    type: 'Feature'
    geometry: { type: 'Polygon'; coordinates: number[][][] }
    properties: {
        id: string
        landId: string
        ownerId: string
        ownerName: string
        area: number
        location: string
        status: 'AVAILABLE' | 'UNDER_ACQUISITION' | 'ACQUIRED' | string
        txHash: string | null
    }
}

export interface LandFeatureCollection {
    type: 'FeatureCollection'
    features: LandFeature[]
}

export const STATUS_COLORS: Record<string, { fill: string; border: string; label: string }> = {
    AVAILABLE: { fill: '#10b981', border: '#059669', label: 'Available' },
    UNDER_ACQUISITION: { fill: '#f59e0b', border: '#d97706', label: 'Under Acquisition' },
    ACQUIRED: { fill: '#ef4444', border: '#dc2626', label: 'Acquired' },
    DISPUTED: { fill: '#f97316', border: '#ea580c', label: 'Disputed' },
}
