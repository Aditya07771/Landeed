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
    assignedVerifierId?: string | null
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
        return <div className="p-8 text-slate-900">Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Pending Verifications</h1>
                <div className="flex gap-4 items-center">
                    <a href="/dashboard" className="text-blue-500">Dashboard</a>
                    <WalletConnect />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-2">
                    <h2 className="font-bold mb-4 text-slate-900">Requests ({acquisitions.length})</h2>
                    {acquisitions.map(acq => (
                        <div
                            key={acq.id}
                            onClick={() => setSelected(acq)}
                            className={`p-3 border rounded cursor-pointer ${selected?.id === acq.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
                        >
                            <p className="font-medium text-slate-900">
                                {acq.land.landId}
                                {acq.assignedVerifierId === session?.user?.id && (
                                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Assigned to you</span>
                                )}
                            </p>
                            <p className="text-sm text-slate-500">{acq.land.location}</p>
                            <p className="text-sm text-slate-700">By: {acq.authority.name}</p>
                        </div>
                    ))}

                    {acquisitions.length === 0 && (
                        <p className="text-slate-500">No pending verifications</p>
                    )}
                </div>

                <div className="col-span-2">
                    {selected ? (
                        <div className="space-y-6">
                            <div className="p-4 border rounded bg-white">
                                <h2 className="text-xl font-bold mb-4 text-slate-900">{selected.land.landId}</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Location</p>
                                        <p className="text-slate-800">{selected.land.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Area</p>
                                        <p className="text-slate-800">{selected.land.area} sq.m</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Owner</p>
                                        <p className="text-slate-800">{selected.land.owner.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Requesting Authority</p>
                                        <p className="text-slate-800">{selected.authority.name}</p>
                                    </div>
                                    {selected.amount && (
                                        <div>
                                            <p className="text-sm text-slate-500">Compensation</p>
                                            <p className="text-slate-800">{selected.amount} MATIC</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border rounded bg-white">
                                <h3 className="font-bold mb-4 text-slate-900">Documents</h3>
                                <div className="text-slate-900">
                                    <DocumentList landId={selected.land.id} />
                                </div>
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
                        <div className="flex items-center justify-center h-64 text-slate-500">
                            Select a request to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}