// file: app/(app)/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Shield, Activity, Map, FileCheck, Search, Filter } from 'lucide-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RegisterLandOnChain } from '@/components/RegisterLandOnChain'
import Link from 'next/link'

interface Land {
    id: string
    landId: string
    area: number
    location: string
    status: string
    txHash: string | null
    owner: { name: string }
    createdAt: string
}

// Mock chart data
const chartData = [
  { name: 'Jan', lands: 12, acquisitions: 2 },
  { name: 'Feb', lands: 19, acquisitions: 5 },
  { name: 'Mar', lands: 27, acquisitions: 8 },
  { name: 'Apr', lands: 35, acquisitions: 12 },
  { name: 'May', lands: 42, acquisitions: 15 },
  { name: 'Jun', lands: 50, acquisitions: 22 },
]

export default function DashboardPage() {
    const { data: session } = useSession()
    const [lands, setLands] = useState<Land[]>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        fetchLands()
    }, [])

    async function fetchLands() {
        const res = await fetch('/api/lands')
        const data = await res.json()
        setLands(data)
    }

    const columnHelper = createColumnHelper<Land>()

    const columns = [
        columnHelper.accessor('landId', {
            header: 'Land ID',
            cell: info => <span className="font-mono font-medium text-slate-700">{info.getValue()}</span>,
        }),
        columnHelper.accessor('location', {
            header: 'Location',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('area', {
            header: 'Area (sq.m)',
            cell: info => info.getValue().toLocaleString(),
        }),
        columnHelper.accessor('owner.name', {
            header: 'Owner',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const status = info.getValue()
                const colors: Record<string, string> = {
                    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    UNDER_ACQUISITION: 'bg-amber-100 text-amber-700 border-amber-200',
                    ACQUIRED: 'bg-red-100 text-red-700 border-red-200',
                    DISPUTED: 'bg-orange-100 text-orange-700 border-orange-200'
                }
                return (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {status.replace('_', ' ')}
                    </span>
                )
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const land = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Link href={`/lands/${land.id}`} className="text-sm font-medium text-violet-600 hover:text-violet-700">
                            Details
                        </Link>
                        {land.txHash ? (
                            <a href={`https://mumbai.polygonscan.com/tx/${land.txHash}`} target="_blank" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                                Verify
                            </a>
                        ) : session?.user?.role === 'OWNER' ? (
                            <RegisterLandOnChain landId={land.landId} landDbId={land.id} onSuccess={fetchLands} />
                        ) : null}
                    </div>
                )
            }
        })
    ]

    const filteredLands = lands.filter(l => 
        l.landId.toLowerCase().includes(globalFilter.toLowerCase()) || 
        l.location.toLowerCase().includes(globalFilter.toLowerCase()) ||
        l.owner.name.toLowerCase().includes(globalFilter.toLowerCase())
    )

    const table = useReactTable({
        data: filteredLands,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const counts = {
        total: lands.length,
        available: lands.filter(l => l.status === 'AVAILABLE').length,
        underAcq: lands.filter(l => l.status === 'UNDER_ACQUISITION').length,
        acquired: lands.filter(l => l.status === 'ACQUIRED').length,
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor land registry activities.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Lands', value: counts.total, color: 'text-slate-700', icon: Map, bg: 'bg-slate-100' },
                    { label: 'Available', value: counts.available, color: 'text-emerald-600', icon: Shield, bg: 'bg-emerald-50' },
                    { label: 'Under Acquisition', value: counts.underAcq, color: 'text-amber-600', icon: Activity, bg: 'bg-amber-50' },
                    { label: 'Acquired', value: counts.acquired, color: 'text-red-600', icon: FileCheck, bg: 'bg-red-50' },
                ].map(stat => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} bg-opacity-50`}>
                                    <Icon size={16} />
                                </div>
                            </div>
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    )
                })}
            </div>

            {/* Chart Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Registration & Acquisition Trends</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorLands" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAcq" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="lands" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLands)" name="Lands Registered" />
                            <Area type="monotone" dataKey="acquisitions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAcq)" name="Acquisitions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 sm:items-center bg-slate-50/50">
                    <h3 className="text-lg font-semibold text-slate-900">Land Registry Records</h3>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by ID, location, or owner..." 
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 font-medium" onClick={header.column.getToggleSortingHandler()}>
                                            <div className="flex items-center gap-1 cursor-pointer select-none">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 text-slate-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}