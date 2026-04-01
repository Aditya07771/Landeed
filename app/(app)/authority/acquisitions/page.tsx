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
        setAcquisitions(data)
        setLoading(false)
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

            await fetch(`/api/acquisition/${acq.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: result.txHash })
            })

            fetchAcquisitions()
        } catch (err: any) {
            setError(err.message)
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

            await fetch(`/api/acquisition/${acq.id}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newOwnerId: acq.land.owner.id,
                    txHash: result.txHash
                })
            })

            fetchAcquisitions()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    if (status === 'loading' || loading) {
        return <div className="p-8">Loading...</div>
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
                <h1 className="text-2xl font-bold">My Acquisition Requests</h1>
                <div className="flex gap-4 items-center">
                    <a href="/dashboard" className="text-blue-500">Dashboard</a>
                    <a href="/map" className="text-blue-500">Map</a>
                    <WalletConnect />
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="space-y-6">
                {acquisitions.map(acq => (
                    <div key={acq.id} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold">{acq.land.landId}</h2>
                                <p className="text-gray-500">{acq.land.location}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-sm ${statusColors[acq.status]}`}>
                                {acq.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Owner</p>
                                <p>{acq.land.owner.name}</p>
                            </div>
                            {acq.amount && (
                                <div>
                                    <p className="text-sm text-gray-500">Compensation</p>
                                    <p>{acq.amount} MATIC</p>
                                </div>
                            )}
                            {acq.verifier && (
                                <div>
                                    <p className="text-sm text-gray-500">Verifier</p>
                                    <p>{acq.verifier.name}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500">Payment</p>
                                <p>{acq.paymentStatus}</p>
                            </div>
                        </div>

                        {acq.verifierNote && (
                            <div className="mb-4 p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Verifier Note</p>
                                <p>{acq.verifierNote}</p>
                            </div>
                        )}

                        <div className="flex gap-4 mb-4">
                            {acq.status === 'VERIFIED' && (
                                <button
                                    onClick={() => handleApprove(acq)}
                                    disabled={actionLoading === acq.id}
                                    className="p-2 bg-green-500 text-white rounded disabled:opacity-50"
                                >
                                    {actionLoading === acq.id ? 'Processing...' : 'Approve Acquisition'}
                                </button>
                            )}

                            {acq.status === 'APPROVED' && acq.paymentStatus === 'LOCKED' && (
                                <button
                                    onClick={() => handleTransfer(acq)}
                                    disabled={actionLoading === acq.id}
                                    className="p-2 bg-purple-500 text-white rounded disabled:opacity-50"
                                >
                                    {actionLoading === acq.id ? 'Processing...' : 'Transfer Ownership'}
                                </button>
                            )}
                        </div>

                        {acq.status === 'APPROVED' && acq.land.owner.walletAddress && acq.amount && (
                            <EscrowActions
                                acquisitionId={acq.id}
                                landId={acq.land.landId}
                                landOwnerAddress={acq.land.owner.walletAddress}
                                amount={acq.amount}
                                paymentStatus={acq.paymentStatus}
                                acquisitionStatus={acq.status}
                                onComplete={fetchAcquisitions}
                            />
                        )}

                        <div className="mt-4">
                            <p className="font-bold mb-2">Timeline</p>
                            <AcquisitionTimeline events={acq.timeline} />
                        </div>
                    </div>
                ))}

                {acquisitions.length === 0 && (
                    <p className="text-gray-500">No acquisition requests yet</p>
                )}
            </div>
        </div>
    )
}