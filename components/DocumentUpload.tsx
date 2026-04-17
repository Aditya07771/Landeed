// file: components/DocumentUpload.tsx

'use client'

import { useState, useEffect } from 'react'
import { computeSHA256 } from '@/lib/hash'
import { getLandRegistryContract, getCurrentWallet } from '@/lib/contracts'

interface Props {
    landId: string
    onUploadComplete: () => void
}

const DOC_TYPES = [
    { value: 'OWNERSHIP_PROOF', label: 'Ownership Proof' },
    { value: 'REGISTRY_PAPER', label: 'Registry Paper' },
    { value: 'TAX_RECEIPT', label: 'Tax Receipt' },
    { value: 'MAP_DOCUMENT', label: 'Map Document' }
]

export default function DocumentUpload({ landId, onUploadComplete }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [docType, setDocType] = useState('')
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState('')
    const [result, setResult] = useState<{ cid: string; gatewayUrl: string; id: string; hash: string } | null>(null)
    const [phase, setPhase] = useState<'IDLE' | 'PHASE_1' | 'PHASE_2' | 'SKIPPED' | 'COMPLETE'>('IDLE')
    const [walletConnected, setWalletConnected] = useState(false)

    useEffect(() => {
        getCurrentWallet().then(wallet => {
            setWalletConnected(!!wallet)
        })
    }, [])

    async function handleUpload() {
        if (!file || !docType) {
            setError('Select file and document type')
            return
        }

        setUploading(true)
        setError('')
        setPhase('PHASE_1')
        setProgress('Computing hash...')

        try {
            const hash = await computeSHA256(file)
            setProgress('Uploading to IPFS...')

            const formData = new FormData()
            formData.append('file', file)
            formData.append('landId', landId)
            formData.append('type', docType)
            formData.append('hash', hash)

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Upload failed')
            }

            const data = await res.json()
            setResult({ cid: data.cid, gatewayUrl: data.gatewayUrl, id: data.id, hash })
            
            const wallet = await getCurrentWallet()
            
            if (wallet) {
                setPhase('PHASE_2')
                setProgress('Anchoring hash on Polygon blockchain...')
                
                try {
                    const contract = await getLandRegistryContract(true)
                    const bytes32Hash = '0x' + hash
                    const tx = await contract.updateDocumentHash(landId, bytes32Hash)
                    await tx.wait()
                    
                    await fetch(`/api/documents/${data.id}/anchor-onchain`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ txHash: tx.hash })
                    })
                    
                    setPhase('COMPLETE')
                    setProgress('Document anchored successfully!')
                } catch (txErr: any) {
                    if (txErr?.code === 'ACTION_REJECTED' || txErr?.message?.includes('user rejected')) {
                        throw new Error('Transaction cancelled.')
                    }
                    throw new Error(txErr?.reason || txErr?.message || 'Blockchain anchoring failed')
                }
            } else {
                setPhase('SKIPPED')
                setProgress('Phase 1 complete.')
            }

            setFile(null)
            setDocType('')
            onUploadComplete()
        } catch (err: any) {
            setError(err.message)
            if (phase === 'PHASE_2') {
                setPhase('SKIPPED')
            } else {
                setPhase('IDLE')
            }
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4 p-4 border rounded">
            <h3 className="font-bold">Upload Document</h3>

            {(phase === 'IDLE' || phase === 'SKIPPED' || phase === 'COMPLETE') && (
                <>
                    <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={uploading}
                    >
                        <option value="">Select document type</option>
                        {DOC_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>

                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={uploading}
                    />

                    {file && (
                        <p className="text-sm text-gray-600">
                            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </p>
                    )}
                </>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            {/* Progress UI */}
            {(phase === 'PHASE_1' || phase === 'PHASE_2' || phase === 'COMPLETE' || phase === 'SKIPPED') && (
                <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                        {phase === 'PHASE_1' ? (
                            <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0" />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                            </div>
                        )}
                        <span className="text-sm text-slate-700">
                            Step 1: Uploading to IPFS
                        </span>
                    </div>

                    {phase !== 'PHASE_1' && (
                        <div className="flex items-start gap-2">
                            {phase === 'PHASE_2' ? (
                                <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0 mt-0.5" />
                            ) : phase === 'SKIPPED' ? (
                                <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5 text-white font-bold text-[10px]">!</div>
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                                </div>
                            )}
                            <div className="text-sm text-slate-700 flex flex-col">
                                <span>Step 2: Anchoring hash on Polygon blockchain</span>
                                {phase === 'SKIPPED' && (
                                    <span className="text-amber-600 text-xs mt-1 bg-amber-50 p-2 rounded border border-amber-200">
                                        Connect your wallet to anchor this document hash on the blockchain for permanent verification. You can do this later from the land detail page.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(phase === 'IDLE' || phase === 'SKIPPED' || phase === 'COMPLETE') && (
                <button
                    onClick={handleUpload}
                    disabled={uploading || !file || !docType}
                    className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Upload to IPFS
                </button>
            )}

            {result && (
                <div className="p-2 bg-green-50 rounded text-sm mt-4">
                    <p>CID: <span className="font-mono break-all">{result.cid}</span></p>
                    <a href={result.gatewayUrl} target="_blank" className="text-blue-500 hover:underline mt-1 inline-block">
                        View on IPFS Gateway
                    </a>
                </div>
            )}
        </div>
    )
}