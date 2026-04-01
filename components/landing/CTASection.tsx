// file: components/landing/CTASection.tsx

'use client'

import { useSession, signIn } from 'next-auth/react'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function CTASection() {
    const { data: session } = useSession()
    const { address, isConnected } = useAccount()
    const { connect } = useConnect()

    return (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Live on Polygon Mumbai
                </div>

                {/* Headline */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4 leading-tight">
                    Ready to Make Land Records
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Transparent & Tamper-Proof?
                    </span>
                </h2>

                {/* Description */}
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
                    Join the future of land registry. Secure access, verified roles, and blockchain-backed records for complete trust and transparency.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    {session ? (
                        <a
                            href="/dashboard"
                            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-lg"
                        >
                            Go to Dashboard
                        </a>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-lg"
                        >
                            Start Demo
                        </button>
                    )}

                    {isConnected ? (
                        <div className="inline-flex items-center gap-2 px-5 py-3 
                            bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            Wallet connected: {address?.slice(0,6)}…{address?.slice(-4)}
                        </div>
                    ) : null}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Role-Based Access
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Polygon Blockchain
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        IPFS Storage
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Open Source
                    </span>
                </div>

                {/* Bottom Cards */}
                <div className="mt-16 grid sm:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl mb-3">🏛️</div>
                        <h4 className="text-white font-semibold mb-2">For Government</h4>
                        <p className="text-slate-400 text-sm">Streamline land acquisition with verifiable proof and audit trails.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl mb-3">👤</div>
                        <h4 className="text-white font-semibold mb-2">For Citizens</h4>
                        <p className="text-slate-400 text-sm">Secure your land ownership with blockchain-backed documentation.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl mb-3">✅</div>
                        <h4 className="text-white font-semibold mb-2">For Verifiers</h4>
                        <p className="text-slate-400 text-sm">Authenticate documents and approve transfers with full transparency.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}