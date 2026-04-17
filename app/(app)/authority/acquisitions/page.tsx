// file: app/authority/acquisitions/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { WalletConnect } from '@/components/WalletConnect'
import AcquisitionTimeline from '@/components/AcquisitionTimeline'
import EscrowActions from '@/components/EscrowActions'
import { approveAcquisitionOnChain, transferOwnershipOnChain } from '@/lib/contracts'

interface Acquisition {
    id: string
    status: string
    amount: number | null
    paymentStatus: string
    land: {
        id: string
        landId: string
        location: string
        owner: { id: string; name: string; walletAddress: string | null }
    }
    verifier: { name: string } | null
    verifierNote: string | null
    appeal?: { id: string; status: string }
    timeline: { id: string; action: string; txHash: string | null; createdAt: string }[]
}

export default function AuthorityAcquisitionsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { isConnected } = useAccount()
    const [acquisitions, setAcquisitions] = useState<Acquisition[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [verifiers, setVerifiers] = useState<any[]>([])
    const [appealForms, setAppealForms] = useState<Record<string, { reason: string; note: string }>>({})

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'AUTHORITY') {
            router.push('/unauthorized')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'AUTHORITY') {
            fetchAcquisitions()
        }
    }, [session])

    async function fetchAcquisitions() {
        const res = await fetch('/api/acquisition')
        const data = await res.json()

        // Fetch appeals for these acquisitions manually if not included by default api
        const appealRes = await fetch('/api/appeal')
        const appeals = await appealRes.json()

        const mappedData = data.map((acq: any) => {
            const appeal = appeals.find((a: any) => a.acquisitionId === acq.id)
            return { ...acq, appeal }
        })

        setAcquisitions(mappedData)
        setLoading(false)

        fetch('/api/user?role=VERIFIER').then(r => r.json()).then(setVerifiers)
    }

    async function handleApprove(acq: Acquisition) {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        setActionLoading(acq.id)
        setError('')

        try {
            const result = await approveAcquisitionOnChain(acq.land.landId)

            const res = await fetch(`/api/acquisition/${acq.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: result.txHash })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Backend failed to process approval')
            }

            fetchAcquisitions()
        } catch (err: any) {
            if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
                setError('Transaction cancelled.')
            } else {
                setError(err.reason || err.message || 'Failed to approve acquisition')
            }
        } finally {
            setActionLoading(null)
        }
    }

    async function handleTransfer(acq: Acquisition) {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        const newOwnerAddress = prompt('Enter new owner wallet address:')
        if (!newOwnerAddress) return

        setActionLoading(acq.id)
        setError('')

        try {
            const result = await transferOwnershipOnChain(acq.land.landId, newOwnerAddress)

            const res = await fetch(`/api/acquisition/${acq.id}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newOwnerId: session?.user?.id, // Should transfer to Authority based on domain logic? Actually, we use newOwnerId param
                    txHash: result.txHash
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to sync transfer with backend')
            }

            fetchAcquisitions()
        } catch (err: any) {
            if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
                setError('Transaction cancelled.')
            } else {
                setError(err.reason || err.message || 'Failed to transfer ownership')
            }
        } finally {
            setActionLoading(null)
        }
    }

    async function handleAssignVerifier(acqId: string, verifierId: string) {
        if (!verifierId) return
        setActionLoading(acqId)
        try {
            await fetch(`/api/acquisition/${acqId}/assign-verifier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verifierId })
            })
            fetchAcquisitions()
        } finally {
            setActionLoading(null)
        }
    }

    async function handleFileAppeal(e: React.FormEvent, acqId: string) {
        e.preventDefault()
        setActionLoading(acqId)
        try {
            const form = appealForms[acqId] || { reason: '', note: '' }
            await fetch('/api/appeal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acquisitionId: acqId, reason: form.reason, supportingNote: form.note })
            })
            fetchAcquisitions()
        } finally {
            setActionLoading(null)
        }
    }

    if (status === 'loading' || loading) {
        return <div className="p-8 text-black">Loading...</div>
    }

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        VERIFIED: 'bg-blue-100 text-blue-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        COMPLETED: 'bg-purple-100 text-purple-800'
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-black">My Acquisition Requests</h1>
                <div className="flex gap-4 items-center">
                    <WalletConnect />
                </div>
            </div>

            {error && <p className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</p>}

            <div className="space-y-6">
                {acquisitions.map(acq => (
                    <div key={acq.id} className="border rounded-xl p-6 bg-white shadow-sm border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{acq.land.landId}</h2>
                                <p className="text-slate-700 font-semibold text-sm mt-1">{acq.land.location}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[acq.status] || 'bg-slate-100 text-slate-800'}`}>
                                {acq.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-700 font-semibold font-medium uppercase tracking-wider mb-1">Owner</p>
                                <p className="font-semibold text-slate-800">{acq.land.owner.name}</p>
                            </div>
                            {acq.amount && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-700 font-semibold font-medium uppercase tracking-wider mb-1">Compensation</p>
                                    <p className="font-semibold text-slate-800 text-violet-600">{acq.amount} MATIC</p>
                                </div>
                            )}
                            {acq.verifier && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-700 font-semibold font-medium uppercase tracking-wider mb-1">Verifier</p>
                                    <p className="font-semibold text-slate-800">{acq.verifier.name}</p>
                                </div>
                            )}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-700 font-semibold font-medium uppercase tracking-wider mb-1">Payment</p>
                                <p className="font-semibold text-slate-800">{acq.paymentStatus}</p>
                            </div>
                        </div>

                        {acq.verifierNote && (
                            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-1">Verifier Note</p>
                                <p className="text-amber-900 text-sm">{acq.verifierNote}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mb-6">
                            {acq.status === 'PENDING' && (
                                <div className="flex items-center gap-2">
                                    <select
                                        onChange={(e) => handleAssignVerifier(acq.id, e.target.value)}
                                        disabled={actionLoading === acq.id}
                                        className="border border-slate-300 rounded px-2 py-1"
                                    >
                                        <option value="">Assign Verifier</option>
                                        {verifiers.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {acq.status === 'REJECTED' && !acq.appeal && (
                                <form onSubmit={(e) => handleFileAppeal(e, acq.id)} className="flex flex-col gap-2 p-4 bg-red-50 border border-red-100 rounded-lg w-full">
                                    <p className="font-bold text-red-900">File Appeal</p>
                                    <textarea
                                        placeholder="Reason"
                                        required
                                        className="border border-slate-300 rounded p-2"
                                        value={appealForms[acq.id]?.reason || ''}
                                        onChange={(e) => setAppealForms({ ...appealForms, [acq.id]: { ...appealForms[acq.id], reason: e.target.value } })}
                                    />
                                    <textarea
                                        placeholder="Supporting Note"
                                        className="border border-slate-300 rounded p-2"
                                        value={appealForms[acq.id]?.note || ''}
                                        onChange={(e) => setAppealForms({ ...appealForms, [acq.id]: { ...appealForms[acq.id], note: e.target.value } })}
                                    />
                                    <button disabled={actionLoading === acq.id} className="bg-red-600 text-white px-4 py-2 rounded max-w-max">
                                        Submit Appeal
                                    </button>
                                </form>
                            )}

                            {acq.appeal && (
                                <div className="w-full p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <p className="font-bold text-blue-900">Appeal Status: {acq.appeal.status}</p>
                                </div>
                            )}

                            {acq.status === 'VERIFIED' && (
                                <button
                                    onClick={() => handleApprove(acq)}
                                    disabled={actionLoading === acq.id}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading === acq.id ? (
                                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing...</>
                                    ) : 'Approve Acquisition'}
                                </button>
                            )}

                            {acq.status === 'APPROVED' && acq.paymentStatus === 'LOCKED' && (
                                <button
                                    onClick={() => handleTransfer(acq)}
                                    disabled={actionLoading === acq.id}
                                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading === acq.id ? (
                                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing...</>
                                    ) : 'Transfer Ownership'}
                                </button>
                            )}
                        </div>

                        {(acq.status === 'APPROVED' || acq.status === 'COMPLETED') && acq.land.owner.walletAddress && acq.amount && (
                            <div className="mb-6">
                                <EscrowActions
                                    acquisitionId={acq.id}
                                    landId={acq.land.landId}
                                    landOwnerAddress={acq.land.owner.walletAddress}
                                    amount={acq.amount}
                                    paymentStatus={acq.paymentStatus}
                                    acquisitionStatus={acq.status}
                                    onComplete={fetchAcquisitions}
                                />
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-6">
                            <p className="font-bold text-slate-800 mb-4">Timeline</p>
                            <AcquisitionTimeline events={acq.timeline} />
                        </div>
                    </div>
                ))}

                {acquisitions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-700 font-semibold font-medium">No acquisition requests yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}