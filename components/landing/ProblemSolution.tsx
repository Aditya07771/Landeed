// file: components/landing/ProblemSolution.tsx
'use client'

export default function ProblemSolution() {
    const problems = [
        {
            icon: '📋',
            title: 'Manual Paperwork',
            description: 'Endless documents, forms, and physical records that are prone to loss and damage'
        },
        {
            icon: '📑',
            title: 'Duplicate Records',
            description: 'Multiple conflicting entries leading to ownership disputes and fraud'
        },
        {
            icon: '⏳',
            title: 'Slow Verification',
            description: 'Weeks or months to verify ownership, authenticate documents, and complete transfers'
        },
        {
            icon: '🔓',
            title: 'Weak Security',
            description: 'Physical records can be forged, tampered with, or destroyed without trace'
        }
    ]

    const solutions = [
        {
            icon: '⛓️',
            title: 'Blockchain Records',
            description: 'Immutable, tamper-proof land records stored on decentralized ledger'
        },
        {
            icon: '🔐',
            title: 'Single Source of Truth',
            description: 'One verified record per land parcel, eliminating duplicates and conflicts'
        },
        {
            icon: '⚡',
            title: 'Instant Verification',
            description: 'Real-time ownership verification with cryptographic proof'
        },
        {
            icon: '🛡️',
            title: 'Document Hashing',
            description: 'IPFS storage with SHA-256 hashing ensures document integrity'
        }
    ]

    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 border border-violet-200 rounded-full text-violet-600 text-xs font-semibold uppercase tracking-widest mb-4">
                        Why LandChain?
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4 leading-tight">
                        Transforming Land Records
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Traditional land registry systems are broken. We're fixing them with blockchain technology.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Problems Column */}
                    <div className="relative">
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-60" />
                        <div className="relative bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">The Problem</h3>
                            </div>

                            <div className="space-y-6">
                                {problems.map((problem, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <span className="text-xl">{problem.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-1">{problem.title}</h4>
                                            <p className="text-slate-600 text-sm">{problem.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Solutions Column */}
                    <div className="relative">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-60" />
                        <div className="relative bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-8 border border-emerald-100">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Our Solution</h3>
                            </div>

                            <div className="space-y-6">
                                {solutions.map((solution, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <span className="text-xl">{solution.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-1">{solution.title}</h4>
                                            <p className="text-slate-600 text-sm">{solution.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { value: '100%', label: 'Tamper-Proof', color: 'text-emerald-600' },
                        { value: '< 1 min', label: 'Verification Time', color: 'text-violet-600' },
                        { value: '256-bit', label: 'Encryption', color: 'text-amber-600' },
                        { value: '24/7', label: 'Availability', color: 'text-blue-600' }
                    ].map((stat, index) => (
                        <div key={index} className="text-center p-6 bg-slate-50 rounded-2xl">
                            <p className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
                            <p className="text-slate-600 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}