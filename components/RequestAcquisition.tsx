// file: components/RequestAcquisition.tsx

'use client'

import { useState } from 'react'
import { requestAcquisitionOnChain } from '@/lib/contracts'
import { useAccount } from 'wagmi'

interface Props {
    landId: string
    landDbId: string
    onSuccess: () => void
}

export function RequestAcquisition({ landId, landDbId, onSuccess }: Props) {
    const { isConnected } = useAccount()
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleRequest() {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('Enter valid amount')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await requestAcquisitionOnChain(landId, parseFloat(amount))

            await fetch('/api/acquisition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    landId: landDbId,
                    amount,
                    txHash: result.txHash
                })
            })

            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Transaction failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Compensation amount (MATIC)"
                className="w-full p-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                onClick={handleRequest}
                disabled={loading || !isConnected}
                className="p-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Request Acquisition'}
            </button>
        </div>
    )
}