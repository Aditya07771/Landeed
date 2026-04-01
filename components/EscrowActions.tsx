// file: components/EscrowActions.tsx

'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { lockFundsOnChain, releaseFundsOnChain } from '@/lib/contracts'

interface Props {
    acquisitionId: string
    landId: string
    landOwnerAddress: string
    amount: number
    paymentStatus: string
    acquisitionStatus: string
    onComplete: () => void
}

export default function EscrowActions({
    acquisitionId,
    landId,
    landOwnerAddress,
    amount,
    paymentStatus,
    acquisitionStatus,
    onComplete
}: Props) {
    const { isConnected } = useAccount()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLockFunds() {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await lockFundsOnChain(landId, landOwnerAddress, amount)

            await fetch(`/api/acquisition/${acquisitionId}/lock-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: result.txHash })
            })

            onComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleReleaseFunds() {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await releaseFundsOnChain(landId)

            await fetch(`/api/acquisition/${acquisitionId}/release-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: result.txHash })
            })

            onComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const showLock = acquisitionStatus === 'APPROVED' && paymentStatus === 'PENDING'
    const showRelease = paymentStatus === 'LOCKED' && acquisitionStatus === 'COMPLETED'

    if (!showLock && !showRelease) {
        return (
            <div className="p-2 bg-gray-100 rounded text-sm">
                Payment Status: <span className="font-bold">{paymentStatus}</span>
            </div>
        )
    }

    return (
        <div className="space-y-2 p-4 border rounded">
            <h4 className="font-bold">Escrow Payment</h4>
            <p className="text-sm">Amount: {amount} MATIC</p>
            <p className="text-sm">Status: {paymentStatus}</p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {showLock && (
                <button
                    onClick={handleLockFunds}
                    disabled={loading || !isConnected}
                    className="w-full p-2 bg-purple-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Processing...' : `Lock ${amount} MATIC in Escrow`}
                </button>
            )}

            {showRelease && (
                <button
                    onClick={handleReleaseFunds}
                    disabled={loading || !isConnected}
                    className="w-full p-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Release Funds to Owner'}
                </button>
            )}
        </div>
    )
}