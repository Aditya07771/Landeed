// file: app/verifier/pending/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { WalletConnect } from '@/components/WalletConnect'
import DocumentList from '@/components/DocumentList'
import VerifyAction from '@/components/VerifyAction'

interface Acquisition {
    id: string
    status: string
    amount: number | null
    verifierNote: string | null
    land: {
        id: string
        landId: string
        location: string
        area: number
        owner: { name: string; walletAddress: string | null }
    }
    authority: { name: string }
}

export default function VerifierPendingPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [acquisitions, setAcquisitions] = useState<Acquisition[]>([])
    const [selected, setSelected] = useState<Acquisition | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.role !== 'VERIFIER') {
            router.push('/unauthorized')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'VERIFIER') {
            fetchPending()
        }
    }, [session])

    async function fetchPending() {
        const res = await fetch('/api/acquisition?status=PENDING')
        const data = await res.json()
        setAcquisitions(data)
        setLoading(false)
    }

    if (status === 'loading' || loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Pending Verifications</h1>
                <div className="flex gap-4 items-center">
                    <a href="/dashboard" className="text-blue-500">Dashboard</a>
                    <WalletConnect />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-2">
                    <h2 className="font-bold mb-4">Requests ({acquisitions.length})</h2>
                    {acquisitions.map(acq => (
                        <div
                            key={acq.id}
                            onClick={() => setSelected(acq)}
                            className={`p-3 border rounded cursor-pointer ${selected?.id === acq.id ? 'border-blue-500 bg-blue-50' : ''}`}
                        >
                            <p className="font-medium">{acq.land.landId}</p>
                            <p className="text-sm text-gray-500">{acq.land.location}</p>
                            <p className="text-sm">By: {acq.authority.name}</p>
                        </div>
                    ))}

                    {acquisitions.length === 0 && (
                        <p className="text-gray-500">No pending verifications</p>
                    )}
                </div>

                <div className="col-span-2">
                    {selected ? (
                        <div className="space-y-6">
                            <div className="p-4 border rounded">
                                <h2 className="text-xl font-bold mb-4">{selected.land.landId}</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p>{selected.land.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Area</p>
                                        <p>{selected.land.area} sq.m</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Owner</p>
                                        <p>{selected.land.owner.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Requesting Authority</p>
                                        <p>{selected.authority.name}</p>
                                    </div>
                                    {selected.amount && (
                                        <div>
                                            <p className="text-sm text-gray-500">Compensation</p>
                                            <p>{selected.amount} MATIC</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border rounded">
                                <h3 className="font-bold mb-4">Documents</h3>
                                <DocumentList landId={selected.land.id} />
                            </div>

                            <VerifyAction
                                acquisitionId={selected.id}
                                landId={selected.land.landId}
                                status={selected.status}
                                onComplete={() => {
                                    fetchPending()
                                    setSelected(null)
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Select a request to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}