// file: components/AcquisitionTimeline.tsx
'use client'

import { FilePen, ShieldCheck, CheckCircle2, XCircle, Lock, Unlock, Handshake } from 'lucide-react'
import { ReactNode } from 'react'

interface TimelineEvent {
    id: string
    action: string
    txHash: string | null
    createdAt: string
}

interface Props {
    events: TimelineEvent[]
}

const actionConfig: Record<string, { label: string, color: string, border: string, icon: ReactNode }> = {
    REQUESTED: { label: 'Acquisition Requested', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', icon: <FilePen size={18} /> },
    VERIFIED: { label: 'Land Verified', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200', icon: <ShieldCheck size={18} /> },
    APPROVED: { label: 'Acquisition Approved', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 size={18} /> },
    REJECTED: { label: 'Acquisition Rejected', color: 'bg-red-100 text-red-700', border: 'border-red-200', icon: <XCircle size={18} /> },
    PAYMENT_LOCKED: { label: 'Payment Locked (Escrow)', color: 'bg-violet-100 text-violet-700', border: 'border-violet-200', icon: <Lock size={18} /> },
    PAYMENT_RELEASED: { label: 'Payment Released', color: 'bg-violet-100 text-violet-700', border: 'border-violet-200', icon: <Unlock size={18} /> },
    TRANSFERRED: { label: 'Ownership Transferred', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', icon: <Handshake size={18} /> }
}

export default function AcquisitionTimeline({ events }: Props) {
    if (!events || events.length === 0) {
        return (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                No timeline events recorded yet.
            </div>
        )
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {events.map((event, index) => {
                    const isLast = index === events.length - 1
                    const config = actionConfig[event.action] || { 
                        label: event.action, 
                        color: 'bg-slate-100 text-slate-700', 
                        border: 'border-slate-200',
                        icon: <CheckCircle2 size={18} /> 
                    }

                    return (
                        <li key={event.id}>
                            <div className="relative pb-8">
                                {!isLast ? (
                                    <span className="absolute left-6 top-6 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-4 px-2">
                                    <div>
                                        <span className={`h-10 w-10 flex items-center justify-center rounded-full ring-8 ring-white border ${config.border} ${config.color}`}>
                                            {config.icon}
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{config.label}</p>
                                            <div className="mt-1 flex flex-col gap-1">
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {new Date(event.createdAt).toLocaleString(undefined, {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </p>
                                                {event.txHash && (
                                                    <a
                                                        href={`https://mumbai.polygonscan.com/tx/${event.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-mono font-medium text-violet-600 hover:text-violet-700 w-fit"
                                                    >
                                                        Tx: {event.txHash.slice(0, 8)}...{event.txHash.slice(-6)}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}