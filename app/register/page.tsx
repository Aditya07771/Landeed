// file: app/register/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, LayoutDashboard, Search, KeyRound } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role')
            })
        })

        if (res.ok) {
            router.push('/login')
        } else {
            const data = await res.json()
            setError(data.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center p-16 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f4ec651?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-900/80" />
                
                <div className="relative z-10 max-w-lg">
                    <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                            <Shield size={24} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-3xl tracking-tight">LandChain</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                        Join the Decentralized Land Registry
                    </h1>
                    <p className="text-lg text-slate-400 mb-10">
                        Create an account to securely register land parcels, initiate acquisitions, or act as an independent verifier.
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 mt-0.5">
                                <LayoutDashboard size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">For Land Owners</h3>
                                <p className="text-sm text-slate-400">Tokenize land boundaries and receive smart contract escrow payments directly.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                            <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400 mt-0.5">
                                <KeyRound size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">For Authorities</h3>
                                <p className="text-sm text-slate-400">Manage infrastructure acquisitions with fully transparent on-chain audit trails.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 mt-0.5">
                                <Search size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">For Verifiers</h3>
                                <p className="text-sm text-slate-400">Authenticate source documents and IPFS metadata securely.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center">
                            <Shield size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-900 text-xl">LandChain</span>
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-500 text-sm">Fill in your information to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="shrink-0">⚠️</span>
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="name@organization.com"
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Role</label>
                            <div className="relative">
                                <select 
                                    name="role" 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none text-slate-700"
                                >
                                    <option value="OWNER">Land Owner</option>
                                    <option value="AUTHORITY">Government Authority</option>
                                    <option value="VERIFIER">Independent Verifier</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : 'Register Account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-500 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
