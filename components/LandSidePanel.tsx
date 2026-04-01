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
    owner: {
        id: string
        name: string
        walletAddress: string | null
    }
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

    useEffect(() => {
        if (landId) {
            setLoading(true)
            fetch(`/api/lands/${landId}`)
                .then(res => res.json())
                .then(data => {
                    setLand(data)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        } else {
            setLand(null)
        }
    }, [landId])

    if (!landId) return null

    const latestAcquisition = land?.acquisitionRequests?.[0]

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Land Details</h2>
                <button onClick={onClose} className="text-2xl">&times;</button>
            </div>

            {loading && <div className="p-4">Loading...</div>}

            {land && (
                <div className="p-4 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Land ID</p>
                        <p className="font-mono">{land.landId}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${statusBadgeColors[land.status]}`}>
                            {land.status}
                        </span>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Area</p>
                        <p>{land.area} sq.m</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p>{land.location}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Owner</p>
                        <p>{land.owner.name}</p>
                        {land.owner.walletAddress && (
                            <p className="text-xs font-mono text-gray-400">
                                {land.owner.walletAddress.slice(0, 8)}...{land.owner.walletAddress.slice(-6)}
                            </p>
                        )}
                    </div>

                    {land.txHash && (
                        <div>
                            <p className="text-sm text-gray-500">Registration Tx</p>
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
                                <p className="text-sm text-gray-500">Acquiring Authority</p>
                                <p>{latestAcquisition.authority.name}</p>
                            </div>

                            {latestAcquisition.amount && (
                                <div>
                                    <p className="text-sm text-gray-500">Compensation</p>
                                    <p>{latestAcquisition.amount} MATIC</p>
                                </div>
                            )}

                            {latestAcquisition.verifier && (
                                <div>
                                    <p className="text-sm text-gray-500">Verified By</p>
                                    <p>{latestAcquisition.verifier.name}</p>
                                </div>
                            )}

                            <hr />
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Acquisition Timeline</p>
                                <AcquisitionTimeline events={latestAcquisition.timeline} />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}