// file: components/RegisterLandOnChain.tsx

'use client'

import { useState } from 'react'
import { registerLandOnChain } from '@/lib/contracts'
import { useAccount } from 'wagmi'

interface Props {
    landId: string
    landDbId: string
    documentHash: string
    onSuccess: (txHash: string) => void
}

export function RegisterLandOnChain({ landId, landDbId, documentHash, onSuccess }: Props) {
    const { isConnected } = useAccount()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleRegister() {
        if (!isConnected) {
            setError('Connect your wallet first to interact with the blockchain')
            return
        }

        if (!documentHash) {
            setError('Missing document hash. Please upload a verified document first.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await registerLandOnChain(landId, documentHash)

            const res = await fetch(`/api/lands/${landDbId}/register-onchain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash: result.txHash
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to sync on-chain registration with backend')
            }

            onSuccess(result.txHash)
        } catch (err: any) {
             if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
                setError('Transaction cancelled.')
            } else {
                setError(err.reason || err.message || 'Blockchain registration failed')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100 mb-4">{error}</p>}
            <button
                onClick={handleRegister}
                disabled={loading || !isConnected}
                className="w-full p-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                        Confirming Transaction...
                    </>
                ) : 'Register permanently on Polygon Blockchain'}
            </button>
        </div>
    )
}