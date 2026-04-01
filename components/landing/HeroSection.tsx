// file: components/landing/HeroSection.tsx

'use client'

import { useSession, signIn } from 'next-auth/react'
import { WalletConnect } from '@/components/WalletConnect'
import Link from 'next/link'

export default function HeroSection() {
    const { data: session } = useSession()

    return (
        <section className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-emerald-400 text-sm font-medium">Blockchain-Powered Land Registry</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Secure Land
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Acquisition System
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                            Transparent ownership verification, tamper-proof records, and secure document storage — all powered by blockchain technology.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12">
                            <Link href="/register"
                                className="flex items-center justify-center gap-2 px-7 py-3.5 
                                bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl 
                                transition-all shadow-lg shadow-violet-600/25 text-base">
                                Get Started Free →
                            </Link>

                            {session ? (
                                <Link href="/dashboard"
                                className="flex items-center justify-center gap-2 px-7 py-3.5 
                                    bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl 
                                    border border-white/15 backdrop-blur transition-all text-base">
                                Open Dashboard
                                </Link>
                            ) : (
                                <Link href="/login"
                                className="flex items-center justify-center gap-2 px-7 py-3.5 
                                    bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl 
                                    border border-white/15 backdrop-blur transition-all text-base">
                                Sign in
                                </Link>
                            )}
                            
                            {/* Wallet connect sits below CTAs, not beside them */}
                            <div className="flex justify-center lg:justify-start mt-1">
                                <WalletConnect />
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-2xl mb-1">🔐</div>
                                <p className="text-white font-semibold text-sm">Verified Ownership</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-2xl mb-1">⛓️</div>
                                <p className="text-white font-semibold text-sm">On-chain Proof</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-2xl mb-1">📄</div>
                                <p className="text-white font-semibold text-sm">IPFS Storage</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dashboard Mockup */}
                    <div className="relative hidden lg:block">
                        {/* Glow behind card */}
                        <div className="absolute inset-0 bg-violet-500/10 rounded-3xl blur-3xl scale-110" />

                        <div className="relative bg-slate-800/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-slate-700/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                                </div>
                                <div className="flex-1 ml-3 bg-slate-700/60 rounded-md px-3 py-1 text-xs text-slate-400 font-mono">
                                    landchain.app/map
                                </div>
                            </div>

                            {/* Map grid mockup */}
                            <div className="p-5">
                                <div className="grid grid-cols-5 gap-1.5 mb-4">
                                    {['emerald','emerald','amber','emerald','red',
                                    'emerald','amber','emerald','emerald','emerald',
                                    'red','emerald','emerald','amber','emerald'].map((c, i) => (
                                    <div key={i}
                                        className={`h-11 rounded-lg opacity-70
                                        ${c==='emerald' ? 'bg-emerald-500' : 
                                            c==='amber'   ? 'bg-amber-400' : 'bg-red-500'}`}
                                    />
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex gap-4 text-xs text-slate-400 mb-5">
                                    {[['bg-emerald-500','Available'],['bg-amber-400','Pending'],['bg-red-500','Acquired']].map(([c,l]) => (
                                    <span key={l} className="flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 rounded ${c}`} />
                                        {l}
                                    </span>
                                    ))}
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[['156','Lands','text-emerald-400'],['42','Acquisitions','text-violet-400'],['89','Verified','text-amber-400']].map(([v,l,c]) => (
                                    <div key={l} className="bg-slate-900/70 rounded-xl p-3.5 text-center">
                                        <p className={`text-2xl font-bold ${c}`}>{v}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{l}</p>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating confirmed tx card */}
                        <div className="absolute -bottom-5 -left-5 bg-white rounded-xl p-3.5 shadow-2xl border border-slate-100 w-56">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-emerald-600 text-sm">✓</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">Tx Confirmed</p>
                                    <p className="text-slate-400 text-xs font-mono mt-0.5">0x8f3a…2b4c</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating verification badge */}
                        <div className="absolute -top-5 -right-5 bg-violet-600 rounded-xl p-3.5 shadow-2xl text-white w-44">
                            <p className="text-xs font-medium opacity-80">Document hash</p>
                            <p className="text-xs font-mono mt-1 opacity-90">SHA256 ✓</p>
                            <p className="text-xs font-bold mt-1">Verified on-chain</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}