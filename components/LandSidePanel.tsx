// file: components/LandSidePanel.tsx

'use client'

import { useEffect, useState } from 'react'
import AcquisitionTimeline from './AcquisitionTimeline'

interface LandDetails {
    id: string
    landId: string
    area: number
    location: string
    status: string
    txHash: string | null
    owner?: {
        id: string
        name: string
        walletAddress: string | null
    } | null
    histories?: {
        id: string
        action: string
        metadata: unknown
        createdAt: string
        user: { id: string; name: string }
    }[]
    acquisitionRequests: {
        id: string
        status: string
        amount: number | null
        authority: { id: string; name: string }
        verifier: { id: string; name: string } | null
        timeline: { id: string; action: string; txHash: string | null; createdAt: string }[]
    }[]
}

interface Props {
    landId: string | null
    onClose: () => void
}

const statusBadgeColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    UNDER_ACQUISITION: 'bg-yellow-100 text-yellow-800',
    ACQUIRED: 'bg-red-100 text-red-800',
    DISPUTED: 'bg-orange-100 text-orange-800'
}

export default function LandSidePanel({ landId, onClose }: Props) {
    const [land, setLand] = useState<LandDetails | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (landId) {
            setLand(null)
            setError(null)
            setLoading(true)
            fetch(`/api/lands/${landId}`)
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => {
                            throw new Error(err?.error ?? `HTTP ${res.status}`)
                        })
                    }
                    return res.json()
                })
                .then((data: LandDetails) => {
                    setLand(data)
                    setLoading(false)
                })
                .catch((err: Error) => {
                    setError(err.message)
                    setLoading(false)
                })
        } else {
            setLand(null)
            setError(null)
        }
    }, [landId])

    if (!landId) return null

    const latestAcquisition = land?.acquisitionRequests?.[0]

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold text-black">Land Details</h2>
                <button onClick={onClose} className="text-2xl">&times;</button>
            </div>

            {loading && <div className="p-4 text-black">Loading...</div>}

            {error && (
                <div className="p-4 text-red-600 text-sm bg-red-50 m-4 rounded-lg">
                    ⚠ Failed to load land: {error}
                </div>
            )}

            {land && !error && (
                <div className="p-4 space-y-4">
                    <div>
                        <p className="text-sm text-gray-700 font-semibold">Land ID</p>
                        <p className="font-mono text-black">{land.landId}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-700 font-semibold">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${statusBadgeColors[land.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {land.status}
                        </span>
                    </div>

                    <div>
                        <p className="text-sm text-gray-700 font-semibold">Area</p>
                        <p className="font-mono text-black">{land.area} sq.m</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-700 font-semibold">Location</p>
                        <p className="font-mono text-black">{land.location}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-700 font-semibold">Owner</p>
                        <p className="font-mono text-black">{land.owner?.name ?? 'Unknown'}</p>
                        {land.owner?.walletAddress && (
                            <p className="text-xs font-mono text-gray-600">
                                {land.owner.walletAddress.slice(0, 8)}...{land.owner.walletAddress.slice(-6)}
                            </p>
                        )}
                    </div>

                    {land.histories && land.histories.length > 0 && (
                        <>
                            <hr />
                            <div>
                                <p className="text-sm text-gray-700 font-semibold mb-2">Land and ownership history</p>
                                <ul className="text-sm space-y-2 list-disc pl-4">
                                    {land.histories.map(h => (
                                        <li key={h.id}>
                                            <span className="font-medium text-black">{h.action}</span>
                                            {' — '}
                                            <span className="text-gray-600">
                                                {new Date(h.createdAt).toLocaleString()}
                                                {h.user?.name && (
                                                    <span> ({h.user.name})</span>
                                                )}
                                            </span>
                                            {(() => {
                                                const raw =
                                                    h.metadata == null
                                                        ? ''
                                                        : typeof h.metadata === 'string'
                                                            ? h.metadata
                                                            : JSON.stringify(h.metadata)
                                                if (!raw || raw === '{}') return null
                                                return (
                                                    <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto whitespace-pre-wrap">
                                                        {typeof h.metadata === 'string'
                                                            ? h.metadata
                                                            : JSON.stringify(h.metadata, null, 2)}
                                                    </pre>
                                                )
                                            })()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {land.txHash && (
                        <div>
                            <p className="text-sm text-gray-700 font-semibold">Registration Tx</p>
                            <a
                                href={`https://mumbai.polygonscan.com/tx/${land.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-sm font-mono"
                            >
                                {land.txHash.slice(0, 10)}...{land.txHash.slice(-8)}
                            </a>
                        </div>
                    )}

                    {latestAcquisition && (
                        <>
                            <hr />
                            <div>
                                <p className="text-sm text-gray-700 font-semibold">Acquiring Authority</p>
                                <p className='text-gray-600'>{latestAcquisition.authority?.name ?? 'N/A'}</p>
                            </div>

                            {latestAcquisition.amount && (
                                <div>
                                    <p className="text-sm text-gray-700 font-semibold">Compensation</p>
                                    <p className='text-gray-600'>{latestAcquisition.amount} MATIC</p>
                                </div>
                            )}

                            {latestAcquisition.verifier && (
                                <div>
                                    <p className="text-sm text-gray-700 font-semibold">Verified By</p>
                                    <p>{latestAcquisition.verifier.name}</p>
                                </div>
                            )}

                            <hr />
                            <div>
                                <p className="text-sm text-gray-700 font-semibold mb-2">Acquisition Timeline</p>
                                <AcquisitionTimeline events={latestAcquisition.timeline} />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}