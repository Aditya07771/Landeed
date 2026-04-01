// file: components/RegisterLandOnChain.tsx

'use client'

import { useState } from 'react'
import { registerLandOnChain } from '@/lib/contracts'
import { useAccount } from 'wagmi'

interface Props {
    landId: string
    landDbId: string
    onSuccess: (txHash: string) => void
}

export function RegisterLandOnChain({ landId, landDbId, onSuccess }: Props) {
    const { isConnected } = useAccount()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleRegister() {
        if (!isConnected) {
            setError('Connect wallet first')
            return
        }

        setLoading(true)
        setError('')

        try {
            const docHash = landId + '-' + Date.now()
            const result = await registerLandOnChain(landId, docHash)

            await fetch(`/api/lands/${landDbId}/register-onchain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash: result.txHash,
                    docHash
                })
            })

            onSuccess(result.txHash)
        } catch (err: any) {
            setError(err.message || 'Transaction failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                onClick={handleRegister}
                disabled={loading || !isConnected}
                className="p-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Register on Blockchain'}
            </button>
        </div>
    )
}