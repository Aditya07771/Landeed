// file: components/EscrowActions.tsx

'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { lockFundsOnChain, releaseFundsOnChain } from '@/lib/contracts'
import { CheckCircle2, AlertCircle } from 'lucide-react'

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

            const res = await fetch(`/api/acquisition/${acquisitionId}/lock-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: result.txHash })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update backend')
            }

            onComplete()
        } catch (err: any) {
             if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
                setError('Transaction cancelled.')
            } else {
                setError(err.reason || err.message || 'Failed to lock funds')
            }
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

            const res = await fetch(`/api/acquisition/${acquisitionId}/release-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: result.txHash })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update backend')
            }

            onComplete()
        } catch (err: any) {
             if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
                setError('Transaction cancelled.')
            } else {
                setError(err.reason || err.message || 'Failed to release funds')
            }
        } finally {
            setLoading(false)
        }
    }

    const showLock = acquisitionStatus === 'APPROVED' && paymentStatus === 'PENDING'
    const showLockedAwaitingTransfer = paymentStatus === 'LOCKED' && acquisitionStatus === 'APPROVED'
    const showRelease = paymentStatus === 'LOCKED' && acquisitionStatus === 'COMPLETED'
    const isReleased = paymentStatus === 'RELEASED'
    const isRefunded = paymentStatus === 'REFUNDED'

    if (isReleased) {
        return (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <span className="font-medium text-sm">Payment Released Successfully</span>
            </div>
        )
    }

    if (isRefunded) {
        return (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="font-medium text-sm">Payment Refunded</span>
            </div>
        )
    }

    return (
        <div className="space-y-4 p-5 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div>
                <h4 className="font-bold text-slate-800">Escrow Payment</h4>
                <div className="text-sm mt-1 text-slate-600 flex items-center gap-4">
                    <span>Amount: <strong className="text-slate-900">{amount} MATIC</strong></span>
                    <span>Status: <strong className="text-violet-600">{paymentStatus}</strong></span>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span className="break-words">{error}</span>
                </div>
            )}

            {showLock && (
                <button
                    onClick={handleLockFunds}
                    disabled={loading || !isConnected}
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Confirming transaction...
                        </>
                    ) : `Lock ${amount} MATIC in Escrow`}
                </button>
            )}

            {showLockedAwaitingTransfer && (
                <div className="p-3 bg-amber-50 text-amber-700 text-sm border border-amber-200 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Funds locked in escrow — awaiting ownership transfer
                </div>
            )}

            {showRelease && (
                <button
                    onClick={handleReleaseFunds}
                    disabled={loading || !isConnected}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Confirming transaction...
                        </>
                    ) : 'Release Funds to Owner'}
                </button>
            )}
        </div>
    )
}