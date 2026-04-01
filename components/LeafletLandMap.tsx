// file: components/LeafletLandMap.tsx
// Drop-in replacement for the Mapbox map — uses react-leaflet + OpenStreetMap
// Features:
//   • GeoJSON parcel rendering with status colours
//   • Custom grid overlay (toggleable) — each cell = 1 land unit
//   • Blockchain ownership badges in popups
//   • Search, filter, side-panel click

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    useMap,
    useMapEvents,
    Rectangle,
    Tooltip,
    Popup,
} from 'react-leaflet'
import L, { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
    type LandFeature,
    type LandFeatureCollection,
    STATUS_COLORS,
} from '@/lib/land-map-types'

export type { LandFeature, LandFeatureCollection }
export { STATUS_COLORS }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function styleFeature(feature: any) {
    const s = STATUS_COLORS[feature?.properties?.status] ?? STATUS_COLORS['AVAILABLE']
    return {
        fillColor: s.fill,
        color: s.border,
        weight: 2,
        fillOpacity: 0.55,
        opacity: 1,
    }
}

function styleFeatureHover(feature: any) {
    const s = STATUS_COLORS[feature?.properties?.status] ?? STATUS_COLORS['AVAILABLE']
    return {
        fillColor: s.fill,
        color: s.border,
        weight: 3.5,
        fillOpacity: 0.8,
        opacity: 1,
    }
}

// ─── Grid overlay ─────────────────────────────────────────────────────────────

interface GridCellProps {
    bounds: LatLngBoundsExpression
    status: string | null
    landId?: string
    ownerName?: string
    txHash?: string | null
    onClick: () => void
}

function GridCell({ bounds, status, landId, ownerName, txHash, onClick }: GridCellProps) {
    const s = status ? STATUS_COLORS[status] : null
    const pathOptions = s
        ? { color: s.border, fillColor: s.fill, fillOpacity: 0.35, weight: 1 }
        : { color: '#64748b', fillColor: 'transparent', fillOpacity: 0, weight: 0.5, dashArray: '4' }

    return (
        <Rectangle
            bounds={bounds}
            pathOptions={pathOptions}
            eventHandlers={{ click: onClick }}
        >
            {s && landId && (
                <Tooltip sticky direction="top" offset={[0, -4]} opacity={0.97}>
                    <div className="text-xs leading-relaxed">
                        <p className="font-bold font-mono">{landId}</p>
                        <p className="text-slate-500">{ownerName}</p>
                        {txHash && (
                            <p className="text-violet-600 font-mono">
                                ⛓ {txHash.slice(0, 8)}…{txHash.slice(-4)}
                            </p>
                        )}
                    </div>
                </Tooltip>
            )}
        </Rectangle>
    )
}

// ─── Grid builder ─────────────────────────────────────────────────────────────

interface GridOverlayProps {
    features: LandFeature[]
    onCellClick: (id: string) => void
    cellSize?: number // degrees
}

function GridOverlay({ features, onCellClick, cellSize = 0.002 }: GridOverlayProps) {
    const map = useMap()
    const [bounds, setBounds] = useState(map.getBounds())

    useMapEvents({
        moveend: () => setBounds(map.getBounds()),
        zoomend: () => setBounds(map.getBounds()),
    })

    // Build a lookup: grid key → first matching feature
    const featureLookup: Record<string, LandFeature> = {}
    features.forEach(f => {
        const [lng, lat] = f.geometry.coordinates[0][0]
        const col = Math.floor(lng / cellSize)
        const row = Math.floor(lat / cellSize)
        const key = `${row}_${col}`
        if (!featureLookup[key]) featureLookup[key] = f
    })

    // Generate grid cells within current viewport
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const minRow = Math.floor(sw.lat / cellSize)
    const maxRow = Math.ceil(ne.lat / cellSize)
    const minCol = Math.floor(sw.lng / cellSize)
    const maxCol = Math.ceil(ne.lng / cellSize)

    const cells: JSX.Element[] = []
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            const key = `${row}_${col}`
            const feat = featureLookup[key]
            const cellBounds: LatLngBoundsExpression = [
                [row * cellSize, col * cellSize],
                [(row + 1) * cellSize, (col + 1) * cellSize],
            ]
            cells.push(
                <GridCell
                    key={key}
                    bounds={cellBounds}
                    status={feat?.properties?.status ?? null}
                    landId={feat?.properties?.landId}
                    ownerName={feat?.properties?.ownerName}
                    txHash={feat?.properties?.txHash}
                    onClick={() => feat && onCellClick(feat.properties.id)}
                />
            )
        }
    }

    return <>{cells}</>
}

// ─── Auto-fit bounds ───────────────────────────────────────────────────────────

function FitBounds({ features }: { features: LandFeature[] }) {
    const map = useMap()
    useEffect(() => {
        if (!features.length) return
        const all: [number, number][] = []
        features.forEach(f =>
            f.geometry.coordinates[0].forEach(([lng, lat]) => all.push([lat, lng]))
        )
        if (all.length) {
            map.fitBounds(L.latLngBounds(all), { padding: [32, 32], maxZoom: 16 })
        }
    }, [features, map])
    return null
}

// ─── GeoJSON layer (parcel view) ──────────────────────────────────────────────

interface GeoJSONLayerProps {
    data: LandFeatureCollection
    onFeatureClick: (id: string) => void
}

function GeoJSONLayer({ data, onFeatureClick }: GeoJSONLayerProps) {
    const layerRef = useRef<L.GeoJSON | null>(null)
    const dataRef = useRef(data)
    dataRef.current = data

    const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
        const p = feature.properties
        const s = STATUS_COLORS[p.status] ?? STATUS_COLORS['AVAILABLE']

            ; (layer as L.Path).on({
                mouseover(e) {
                    ; (e.target as L.Path).setStyle(styleFeatureHover(feature))
                },
                mouseout(e) {
                    ; (e.target as L.Path).setStyle(styleFeature(feature))
                },
                click() {
                    onFeatureClick(p.id)
                },
            })

        layer.bindTooltip(
            `<div style="font-size:12px;line-height:1.6">
        <strong style="font-family:monospace">${p.landId}</strong><br/>
        <span style="color:#64748b">${p.location}</span><br/>
        <span style="color:${s.border};font-weight:600">${s.label}</span>
        ${p.txHash ? `<br/><span style="color:#7c3aed;font-family:monospace;font-size:10px">⛓ ${p.txHash.slice(0, 10)}…</span>` : ''}
      </div>`,
            { sticky: true, opacity: 0.97 }
        )
    }, [onFeatureClick])

    return (
        <GeoJSON
            key={JSON.stringify(data.features.map(f => f.properties.id))}
            data={data as any}
            style={styleFeature}
            onEachFeature={onEachFeature}
            ref={layerRef}
        />
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LeafletLandMapProps {
    geojson: LandFeatureCollection
    showGrid?: boolean
    onLandSelect?: (id: string) => void
    defaultCenter?: [number, number]
    defaultZoom?: number
}

export default function LeafletLandMap({
    geojson,
    showGrid = false,
    onLandSelect,
    defaultCenter = [28.6139, 77.209],
    defaultZoom = 12,
}: LeafletLandMapProps) {
    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            {/* Base tile layer — OpenStreetMap */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />

            {/* GeoJSON parcels */}
            {geojson.features.length > 0 && (
                <>
                    <GeoJSONLayer
                        data={geojson}
                        onFeatureClick={id => onLandSelect?.(id)}
                    />
                    <FitBounds features={geojson.features} />
                </>
            )}

            {/* Grid overlay */}
            {showGrid && (
                <GridOverlay
                    features={geojson.features}
                    onCellClick={id => onLandSelect?.(id)}
                />
            )}
        </MapContainer>
    )
}