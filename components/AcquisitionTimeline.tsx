// file: components/AcquisitionTimeline.tsx
'use client'

import { ExternalLink, CheckCircle2, XCircle, Send, FileText, Activity } from 'lucide-react'
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

function getEventConfig(action: string): { color: string, border: string, icon: ReactNode, bg: string } {
    const act = action.toUpperCase()
    if (act === 'ACQUISITION_REQUESTED' || act === 'REQUESTED') {
        return { color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', icon: <Send size={16} className="text-blue-600 relative -ml-0.5 mt-0.5" /> }
    }
    if (act.includes('APPROVE') || act.includes('VERIF') || act.includes('TRANSFERRED') || act.includes('RELEASED')) {
        return { color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', icon: <CheckCircle2 size={18} className="text-emerald-600" /> }
    }
    if (act.includes('REJECT') || act.includes('FAILED')) {
        return { color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50', icon: <XCircle size={18} className="text-red-600" /> }
    }
    return { color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-50', icon: <Activity size={16} className="text-slate-500" /> }
}

function formatActionText(action: string) {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
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
        <div className="flow-root pl-2 mt-4 max-w-lg mb-8">
            <ul role="list" className="-mb-8">
                {events.map((event, index) => {
                    const isLast = index === events.length - 1
                    const config = getEventConfig(event.action)
                    const title = formatActionText(event.action)

                    return (
                        <li key={event.id}>
                            <div className="relative pb-8">
                                {!isLast ? (
                                    <span className="absolute left-4 top-4 -ml-px h-full w-[2px] bg-slate-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-4">
                                    <div>
                                        <span className={`h-8 w-8 flex items-center justify-center rounded-full ring-4 ring-white border ${config.border} ${config.bg} z-10 relative`}>
                                            {config.icon}
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{title}</p>
                                            <div className="mt-0.5 flex flex-col gap-1.5">
                                                <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                                                    {formatDate(event.createdAt)}
                                                </p>
                                                {event.txHash && (
                                                    <a
                                                        href={`https://polygonscan.com/tx/${event.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-600 hover:text-violet-700 w-fit bg-violet-50 px-2.5 py-1 rounded-md border border-violet-100 transition-colors"
                                                    >
                                                        <ExternalLink size={12} />
                                                        View Transaction
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