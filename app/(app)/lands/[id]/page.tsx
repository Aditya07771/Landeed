// file: app/(app)/lands/[id]/page.tsx
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

const LandMiniMap = dynamic(() => import('@/components/LandMiniMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
            Loading map…
        </div>
    ),
})

const STATUS_PAINT: Record<string, { fill: string; border: string }> = {
    AVAILABLE: { fill: '#10b981', border: '#059669' },
    UNDER_ACQUISITION: { fill: '#f59e0b', border: '#d97706' },
    ACQUIRED: { fill: '#ef4444', border: '#dc2626' },
    DISPUTED: { fill: '#f97316', border: '#ea580c' },
}

export default function LandDetailPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const { isConnected } = useAccount()
    const [land, setLand] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [hashingDoc, setHashingDoc] = useState(false)

    // New feature states
    const [liens, setLiens] = useState<any[]>([])
    const [valuations, setValuations] = useState<any[]>([])
    const [taxRecords, setTaxRecords] = useState<any[]>([])
    const [subParcels, setSubParcels] = useState<any[]>([{ area: '', location: '', coordinates: '' }])
    
    // Forms
    const [lienForm, setLienForm] = useState({ lenderId: '', borrowerId: '', principalAmount: '', interestRate: '', startDate: '', notes: '' })
    const [valForm, setValForm] = useState({ valuationAmt: '', method: 'MARKET_COMPARABLE', notes: '' })

    useEffect(() => { 
        fetchLand()
        fetchHistory()
        fetchExtras()
    }, [id])

    async function fetchLand() {
        // Assume API returns land with disputes, or we fetch separately
        const res = await fetch(`/api/lands/${id}`)
        if (res.ok) setLand(await res.json())
        setLoading(false)
    }

    async function fetchHistory() {
        const res = await fetch(`/api/lands/${id}/history`)
        if (res.ok) setHistory(await res.json())
    }

    async function fetchExtras() {
        fetch(`/api/mortgage?landId=${id}`).then(r => r.json()).then(setLiens).catch(console.error)
        fetch(`/api/valuation?landId=${id}`).then(r => r.json()).then(setValuations).catch(console.error)
        fetch(`/api/tax?landId=${id}`).then(r => r.json()).then(setTaxRecords).catch(console.error)
    }

    async function handleStoreHashOnChain() {
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

    // New Handlers
    const handleAddLien = async (e: any) => {
        e.preventDefault()
        await fetch('/api/mortgage', { method: 'POST', body: JSON.stringify({ landId: id, ...lienForm }), headers: { 'Content-Type': 'application/json' } })
        fetchExtras()
        fetchHistory()
    }

    const handleDischargeLien = async (lienId: string) => {
        await fetch(`/api/mortgage/${lienId}`, { method: 'PATCH', body: JSON.stringify({ status: 'DISCHARGED' }), headers: { 'Content-Type': 'application/json' } })
        fetchExtras()
    }

    const handleSubdivide = async (e: any) => {
        e.preventDefault()
        await fetch(`/api/lands/${id}/subdivide`, { method: 'POST', body: JSON.stringify({ subParcels }), headers: { 'Content-Type': 'application/json' } })
        fetchLand()
    }

    const handleAddValuation = async (e: any) => {
        e.preventDefault()
        await fetch('/api/valuation', { method: 'POST', body: JSON.stringify({ landId: id, ...valForm }), headers: { 'Content-Type': 'application/json' } })
        fetchExtras()
    }

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin" />
        </div>
    )
    if (!land) return <div className="p-8 text-center text-slate-500">Land not found</div>

    const latestAcquisition = land.acquisitionRequests?.[0]
    const isOwner = session?.user?.id === land.ownerId || (session?.user?.email && session?.user?.email === land.owner?.email)
    const isAuthority = session?.user?.role === 'AUTHORITY'
    const isVerifier = session?.user?.role === 'VERIFIER'
    const colors = STATUS_PAINT[land.status] || { fill: '#cbd5e1', border: '#94a3b8' }

    const sortedDocs = [...(land.documents || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const latestDoc = sortedDocs[0]
    const latestDocHash = latestDoc?.hash || ''
    
    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {land.status === 'DISPUTED' && (
                <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontWeight: 'bold' }}>
                    This land is currently frozen due to an active dispute. Transactions may be restricted.
                </div>
            )}

            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                <ChevronLeft size={16} /> Back to Dashboard
            </Link>

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

                {land.status === 'AVAILABLE' && isAuthority && land.txHash && (
                    <RequestAcquisition landId={land.landId} landDbId={land.id} onSuccess={fetchLand} />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm h-[300px] relative overflow-hidden">
                        <div className="rounded-xl overflow-hidden h-full">
                            <LandMiniMap coordinates={land.coordinates ?? null} status={land.status} />
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-center">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Public Verification</h3>
                        <img src={`/api/lands/${land.id}/qr`} alt="QR Code" style={{ display: 'block', margin: '0 auto', maxWidth: '150px' }} />
                        <a href={`/api/lands/${land.id}/qr`} download={`LandChain_QR_${land.landId}.png`} style={{ color: 'blue', textDecoration: 'underline' }}>
                            Download QR Code
                        </a>
                    </div>

                    {/* Properties Meta */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Properties</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Ruler size={14} /> Area</p><p className="text-sm font-semibold text-slate-900">{land.area.toLocaleString()} sq.m</p></div>
                            <div><p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Building2 size={14} /> Location</p><p className="text-sm font-semibold text-slate-900">{land.location}</p></div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><User size={14} /> Owner</p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-sm font-medium text-slate-900">{land.owner.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-1 break-all">{land.owner.walletAddress || 'Unconnected Wallet'}</p>
                            </div>
                        </div>

                        {land.txHash ? (
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Activity size={14} /> Blockchain Registration</p>
                                <a href={`https://polygonscan.com/tx/${land.txHash}`} target="_blank" rel="noopener noreferrer" className="bg-violet-50 hover:bg-violet-100 p-3 rounded-lg border border-violet-100 flex items-center justify-between group">
                                    <span className="text-xs font-mono text-violet-700 truncate mr-2">{land.txHash}</span>
                                    <ExternalLink size={14} className="text-violet-500 shrink-0" />
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
                        
                        <GenerateCertificateButton landId={land.landId} userName={land.owner.name} userRole="OWNER" txHash={land.txHash} />
                    </div>

                    {/* Encumbrances */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Encumbrances</h3>
                        <ul>
                            {liens.length === 0 && <li>No active liens</li>}
                            {liens.map((l: any) => (
                                <li key={l.id} style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                                    <p>Amount: {l.principalAmount}</p>
                                    <p>Status: {l.status}</p>
                                    {isAuthority && l.status === 'ACTIVE' && (
                                        <button onClick={() => handleDischargeLien(l.id)} style={{ color: 'red' }}>Discharge Lien</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {isAuthority && (
                            <form onSubmit={handleAddLien} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input placeholder="Lender ID" value={lienForm.lenderId} onChange={(e) => setLienForm({...lienForm, lenderId: e.target.value})} required />
                                <input placeholder="Borrower ID" value={lienForm.borrowerId} onChange={(e) => setLienForm({...lienForm, borrowerId: e.target.value})} required />
                                <input placeholder="Amount" type="number" value={lienForm.principalAmount} onChange={(e) => setLienForm({...lienForm, principalAmount: e.target.value})} required />
                                <input type="date" value={lienForm.startDate} onChange={(e) => setLienForm({...lienForm, startDate: e.target.value})} required />
                                <button type="submit" style={{ background: '#f5f5f5', padding: '4px' }}>Add Lien</button>
                            </form>
                        )}
                    </div>

                    {/* Valuation History */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Valuation History</h3>
                        <ul>
                            {valuations.map((v: any) => (
                                <li key={v.id}>
                                    <p>{new Date(v.valuedAt).toLocaleDateString()}: {v.valuationAmt} ({v.method}) - {v.valuator?.name}</p>
                                </li>
                            ))}
                        </ul>
                        {(isAuthority || isVerifier || session?.user?.role === 'ADMIN') && (
                            <form onSubmit={handleAddValuation} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input placeholder="Amount" type="number" value={valForm.valuationAmt} onChange={e => setValForm({...valForm, valuationAmt: e.target.value})} required />
                                <select value={valForm.method} onChange={e => setValForm({...valForm, method: e.target.value})}>
                                    <option value="MARKET_COMPARABLE">Market Comparable</option>
                                    <option value="INCOME_APPROACH">Income Approach</option>
                                    <option value="COST_APPROACH">Cost Approach</option>
                                    <option value="GOVERNMENT_ASSESSED">Government Assessed</option>
                                </select>
                                <button type="submit" style={{ background: '#f5f5f5', padding: '4px' }}>Add Valuation</button>
                            </form>
                        )}
                    </div>

                </div>

                <div className="space-y-6 lg:col-span-2">

                    {latestAcquisition && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Activity className="text-violet-500" size={20} /> Active Acquisition
                                </h2>
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-white border shadow-sm">
                                    Status: {latestAcquisition.status}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                                    <div><p className="text-xs font-medium text-slate-500 mb-1 leading-none">Requesting Authority</p><p className="text-sm font-semibold text-slate-900">{latestAcquisition.authority.name}</p></div>
                                </div>
                                <AcquisitionTimeline events={latestAcquisition.timeline} />
                            </div>
                        </div>
                    )}

                    {/* Subdivide Parcel */}
                    {isAuthority && land.status === 'AVAILABLE' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Subdivide Parcel</h3>
                            <form onSubmit={handleSubdivide} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {subParcels.map((sp, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                        <input placeholder="Area" type="number" required value={sp.area} onChange={e => {
                                            const newSp = [...subParcels]; newSp[idx].area = e.target.value; setSubParcels(newSp);
                                        }} />
                                        <input placeholder="Location" required value={sp.location} onChange={e => {
                                            const newSp = [...subParcels]; newSp[idx].location = e.target.value; setSubParcels(newSp);
                                        }} />
                                    </div>
                                ))}
                                <div>
                                    <button type="button" onClick={() => setSubParcels([...subParcels, { area: '', location: '', coordinates: ''}])}>+ Add Sub-Parcel</button>
                                </div>
                                <button type="submit" style={{ background: '#000', color: '#fff', padding: '8px', maxWidth: '150px' }}>Submit Subdivision</button>
                            </form>
                        </div>
                    )}

                    {/* Disputes Section */}
                    {land.disputes && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Disputes</h3>
                            <ul>
                                {land.disputes.map((d: any) => (
                                    <li key={d.id}><Link href={`/dispute/${d.id}`} style={{ textDecoration: 'underline' }}>{d.category} - {d.status}</Link></li>
                                ))}
                                {land.disputes.length === 0 && <p>No disputes logged against this land.</p>}
                            </ul>
                            {isOwner && land.status === 'AVAILABLE' && land.ownerId === session?.user?.id && (
                                <div style={{ marginTop: '16px' }}>
                                    <Link href="/dispute" style={{ color: 'blue' }}>File Conflict Dispute</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tax Records Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Tax Records</h3>
                        <ul>
                            {taxRecords.map((t: any) => (
                                <li key={t.id}>{t.taxYear} - {t.taxAmount} ({t.status})</li>
                            ))}
                            {taxRecords.length === 0 && <p>No tax records found.</p>}
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Legal Documents</h3>
                        </div>
                        {isOwner && (
                            <div className="mb-6">
                                <DocumentUpload landId={land.id} onUploadComplete={() => { fetchLand(); fetchHistory() }} />
                            </div>
                        )}
                        <DocumentList landId={land.id} />
                    </div>

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