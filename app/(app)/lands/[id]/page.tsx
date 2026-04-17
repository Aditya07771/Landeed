// file: app/(app)/lands/[id]/page.tsx
// Same as original but replaces react-map-gl/mapbox mini-map
// with a dynamic Leaflet LandMiniMap component.

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import AcquisitionTimeline from '@/components/AcquisitionTimeline'
import { RegisterLandOnChain } from '@/components/RegisterLandOnChain'
import { RequestAcquisition } from '@/components/RequestAcquisition'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'
import { GenerateCertificateButton } from '@/components/GenerateCertificateButton'
import { updateDocHashOnChain } from '@/lib/contracts'
import { useAccount } from 'wagmi'
import {
    ExternalLink, Hash, CheckCircle, ChevronLeft,
    Building2, User, Ruler, Activity, History
} from 'lucide-react'

// ── SSR-safe Leaflet mini-map ─────────────────────────────────────────────────
const LandMiniMap = dynamic(() => import('@/components/LandMiniMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
            Loading map…
        </div>
    ),
})

// ── Status colours (no Mapbox dependency) ────────────────────────────────────
const STATUS_PAINT: Record<string, { fill: string; border: string }> = {
    AVAILABLE: { fill: '#10b981', border: '#059669' },
    UNDER_ACQUISITION: { fill: '#f59e0b', border: '#d97706' },
    ACQUIRED: { fill: '#ef4444', border: '#dc2626' },
    DISPUTED: { fill: '#f97316', border: '#ea580c' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandDetailPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const { isConnected } = useAccount()
    const [land, setLand] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [hashingDoc, setHashingDoc] = useState(false)

    useEffect(() => { 
        fetchLand()
        fetchHistory()
    }, [id])

    async function fetchLand() {
        const res = await fetch(`/api/lands/${id}`)
        if (res.ok) setLand(await res.json())
        setLoading(false)
    }

    async function fetchHistory() {
        const res = await fetch(`/api/lands/${id}/history`)
        if (res.ok) {
            setHistory(await res.json())
        }
    }

    async function handleStoreHashOnChain() {
        // Kept for backward compatibility if needed, though replaced by new flows
        if (!land?.docHash || !isConnected) return
        setHashingDoc(true)
        try {
            const result = await updateDocHashOnChain(land.landId, land.docHash)
            alert(`Document hash stored on-chain! Tx: ${result.txHash}`)
        } catch (err: any) {
             if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
                alert('Transaction cancelled.')
            } else {
                alert(err.reason || err.message || 'Blockchain transaction failed')
            }
        } finally {
            setHashingDoc(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin" />
        </div>
    )
    if (!land) return <div className="p-8 text-center text-slate-500">Land not found</div>

    const latestAcquisition = land.acquisitionRequests?.[0]
    const isOwner = session?.user?.id === land.ownerId || (session?.user?.email && session?.user?.email === land.owner?.email)
    const colors = STATUS_PAINT[land.status] || { fill: '#cbd5e1', border: '#94a3b8' }

    // Sort documents by createdAt desc to get the latest one
    const sortedDocs = [...(land.documents || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const latestDoc = sortedDocs[0]
    const latestDocHash = latestDoc?.hash || ''
    
    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                <ChevronLeft size={16} /> Back to Dashboard
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{land.landId}</h1>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                            style={{ backgroundColor: colors.fill + '22', borderColor: colors.border, color: colors.border }}
                        >
                            {land.status.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        Registered {new Date(land.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {land.status === 'AVAILABLE' && session?.user?.role === 'AUTHORITY' && land.txHash && (
                    <RequestAcquisition landId={land.landId} landDbId={land.id} onSuccess={fetchLand} />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left column */}
                <div className="space-y-6 lg:col-span-1">

                    {/* ── Leaflet Mini-Map (replaces Mapbox) ── */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm h-[300px] relative overflow-hidden">
                        <div className="rounded-xl overflow-hidden h-full">
                            <LandMiniMap
                                coordinates={land.coordinates ?? null}
                                status={land.status}
                            />
                        </div>
                    </div>

                    {/* Meta card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Properties</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Ruler size={14} /> Area</p>
                                <p className="text-sm font-semibold text-slate-900">{land.area.toLocaleString()} sq.m</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Building2 size={14} /> Location</p>
                                <p className="text-sm font-semibold text-slate-900">{land.location}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><User size={14} /> Owner</p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-sm font-medium text-slate-900">{land.owner.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-1 break-all">
                                    {land.owner.walletAddress || 'Unconnected Wallet'}
                                </p>
                            </div>
                        </div>

                        {land.txHash ? (
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Activity size={14} /> Blockchain Registration</p>
                                <a
                                    href={`https://polygonscan.com/tx/${land.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-violet-50 hover:bg-violet-100 transition-colors p-3 rounded-lg border border-violet-100 flex items-center justify-between group"
                                >
                                    <span className="text-xs font-mono text-violet-700 truncate mr-2">{land.txHash}</span>
                                    <ExternalLink size={14} className="text-violet-500 shrink-0 group-hover:scale-110 transition-transform" />
                                </a>
                            </div>
                        ) : (
                            isOwner && land.status === 'AVAILABLE' && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">On-Chain Registration</h4>
                                    <RegisterLandOnChain landId={land.landId} landDbId={land.id} documentHash={latestDocHash} onSuccess={fetchLand} />
                                </div>
                            )
                        )}
                        
                        {/* Fallback for legacy hashing UI if docHash exists on land directly */}
                        {land.docHash && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Hash size={14} /> Legacy IPFS Hash</p>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 break-all text-xs font-mono text-slate-600">
                                    {land.docHash}
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={handleStoreHashOnChain}
                                        disabled={hashingDoc || !isConnected}
                                        className="mt-3 w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {hashingDoc
                                            ? <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin" />
                                            : <CheckCircle size={16} />}
                                        {hashingDoc ? 'Storing on-chain…' : 'Store IPFS Hash on Polygon'}
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Generate Certificate Button */}
                        <GenerateCertificateButton 
                            landId={land.landId} 
                            userName={land.owner.name} 
                            userRole="OWNER" 
                            txHash={land.txHash} 
                        />
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6 lg:col-span-2">

                    {latestAcquisition && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Activity className="text-violet-500" size={20} />
                                    Active Acquisition
                                </h2>
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-white border shadow-sm">
                                    Status: {latestAcquisition.status}
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1 leading-none">Requesting Authority</p>
                                        <p className="text-sm font-semibold text-slate-900">{latestAcquisition.authority.name}</p>
                                    </div>
                                    {latestAcquisition.amount && (
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-1 leading-none">Compensation Amount</p>
                                            <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                                                {latestAcquisition.amount} MATIC
                                            </p>
                                        </div>
                                    )}
                                    {latestAcquisition.verifier && (
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-1 leading-none">Assigned Verifier</p>
                                            <p className="text-sm font-semibold text-slate-900">{latestAcquisition.verifier.name}</p>
                                        </div>
                                    )}
                                </div>

                                {latestAcquisition.verifierNote && (
                                    <div className="mb-8 bg-amber-50 text-amber-900 p-4 rounded-xl border border-amber-100 text-sm">
                                        <p className="font-semibold mb-1 text-amber-800">Verifier Note:</p>
                                        <p>{latestAcquisition.verifierNote}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Process Timeline</h3>
                                    <AcquisitionTimeline events={latestAcquisition.timeline} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Legal Documents</h3>
                        </div>
                        {isOwner && (
                            <div className="mb-6">
                                <DocumentUpload landId={land.id} onUploadComplete={() => {
                                    fetchLand()
                                    fetchHistory()
                                }} />
                            </div>
                        )}
                        <DocumentList landId={land.id} />
                    </div>

                    {/* General Land History */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                            <History size={20} className="text-slate-500" />
                            <h3 className="text-lg font-bold text-slate-900">Land History Registry</h3>
                        </div>
                        <AcquisitionTimeline events={history} />
                    </div>
                </div>
            </div>
        </div>
    )
}