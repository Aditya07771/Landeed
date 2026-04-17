'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Search, Layers, Grid, MapPin, X, ExternalLink, Activity, User, Ruler } from 'lucide-react'
import LandSidePanel from '@/components/LandSidePanel'
import { STATUS_COLORS, type LandFeatureCollection, type LandFeature } from '@/lib/land-map-types'

// ── SSR-safe dynamic import ────────────────────────────────────────────────────
const LeafletLandMap = dynamic(() => import('@/components/LeafletLandMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-300 border-t-violet-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading map…</p>
        </div>
    ),
})

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MapPage() {
    const [features, setFeatures] = useState<LandFeature[]>([])
    const [selectedLandId, setSelectedLandId] = useState<string | null>(null)
    const [filter, setFilter] = useState('')
    const [search, setSearch] = useState('')
    const [showGrid, setShowGrid] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLands()
    }, [filter])

    async function fetchLands() {
        setLoading(true)
        const url = filter ? `/api/lands/geojson?status=${filter}` : '/api/lands/geojson'
        const res = await fetch(url)
        const data: LandFeatureCollection = await res.json()
        setFeatures(data.features || [])
        setLoading(false)
    }

    const geojson = useMemo<LandFeatureCollection>(() => {
        const q = search.toLowerCase()
        return {
            type: 'FeatureCollection',
            features: features.filter(
                f =>
                    f.properties.landId.toLowerCase().includes(q) ||
                    f.properties.location.toLowerCase().includes(q)
            ),
        }
    }, [features, search])

    return (
        <div className="h-[calc(100vh-4rem)] -m-8 relative flex">

            {/* ── Top overlay controls ─────────────────────────────────────── */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row gap-3 pointer-events-none">

                {/* Search */}
                <div className="pointer-events-auto flex-1 max-w-sm bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg flex items-center gap-2 px-3 py-2.5">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search Land ID or location…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter + Grid toggle */}
                <div className="pointer-events-auto flex gap-2">
                    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg flex items-center gap-2 px-3 py-2">
                        <Layers size={14} className="text-slate-500" />
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="">All Parcels</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="UNDER_ACQUISITION">Under Acquisition</option>
                            <option value="ACQUIRED">Acquired</option>
                            <option value="DISPUTED">Disputed</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setShowGrid(g => !g)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg text-sm font-semibold transition-all ${showGrid
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-violet-50'
                            }`}
                    >
                        <Grid size={14} />
                        Grid
                    </button>
                </div>
            </div>

            {/* ── Map ─────────────────────────────────────────────────────── */}
            <div className="flex-1 m-2 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <LeafletLandMap
                    geojson={geojson}
                    showGrid={showGrid}
                    onLandSelect={id => setSelectedLandId(id)}
                />
            </div>

            {/* ── Legend ──────────────────────────────────────────────────── */}
            <div className="absolute bottom-8 left-6 z-[1000] bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg p-4 pointer-events-none">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Status Legend
                </p>
                <div className="space-y-2">
                    {Object.entries(STATUS_COLORS).map(([key, { fill, border, label }]) => (
                        <div key={key} className="flex items-center gap-2 text-sm text-slate-700">
                            <span
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: fill + '55', border: `2px solid ${border}` }}
                            />
                            {label}
                        </div>
                    ))}
                </div>

                {showGrid && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                        <Grid size={12} className="text-violet-500" />
                        Grid mode active
                    </div>
                )}
            </div>

            {/* ── Stats badge ─────────────────────────────────────────────── */}
            <div className="absolute bottom-8 right-6 z-[1000] pointer-events-none">
                {!selectedLandId && (
                    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-4 py-3">
                        <p className="text-xs text-slate-500 mb-1">Showing</p>
                        <p className="text-xl font-bold text-slate-900">{geojson.features.length}</p>
                        <p className="text-xs text-slate-500">parcels</p>
                    </div>
                )}
            </div>

            {/* ── Side panel ──────────────────────────────────────────────── */}
            <div
                className={`transition-all duration-300 ease-in-out absolute top-0 bottom-0 right-0 z-[2000] ${selectedLandId ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {selectedLandId && (
                    <div className="h-full bg-white shadow-2xl border-l border-slate-200 w-96 flex flex-col">
                        <LandSidePanel
                            landId={selectedLandId}
                            onClose={() => setSelectedLandId(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}