// file: components/VerifyAction.tsx

'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { verifyLandOnChain, approveAcquisitionOnChain, rejectAcquisitionOnChain } from '@/lib/contracts'

interface Props {
    acquisitionId: string
    landId: string
    status: string
    onComplete: () => void
}

export default function VerifyAction({ acquisitionId, landId, status, onComplete }: Props) {
    const { isConnected } = useAccount()
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleVerify() {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await verifyLandOnChain(landId, notes)

            await fetch(`/api/acquisition/${acquisitionId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes, txHash: result.txHash })
            })

            onComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleReject() {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        if (!notes.trim()) {
            setError('Please provide rejection reason')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await rejectAcquisitionOnChain(landId, notes)

            await fetch(`/api/acquisition/${acquisitionId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: notes, txHash: result.txHash })
            })

            onComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (status !== 'PENDING') {
        return null
    }

    return (
        <div className="space-y-3 p-4 border rounded">
            <h4 className="font-bold text-slate-900">Verification Action</h4>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Verification notes / Rejection reason"
                rows={3}
                className="w-full p-2 border rounded text-slate-900"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
                <button
                    onClick={handleVerify}
                    disabled={loading || !isConnected}
                    className="flex-1 p-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Approve & Verify'}
                </button>
                <button
                    onClick={handleReject}
                    disabled={loading || !isConnected}
                    className="flex-1 p-2 bg-red-500 text-white rounded disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        </div>
    )
}