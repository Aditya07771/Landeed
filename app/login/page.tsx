// file: app/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, Fingerprint, LockKeyhole, FileCheck } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)

        const res = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false
        })

        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 flex-col justify-center p-16 relative overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888001719-75b28d7ab266?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

                <div className="relative z-10 max-w-lg">
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                            <Shield size={24} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-3xl tracking-tight">LandChain</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                        Secure Access to the Blockchain Registry
                    </h1>
                    <p className="text-lg text-slate-400 mb-10">
                        Authenticate with your authorized credentials to manage land parcels, approve acquisitions, and verify immutable records.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0 border border-violet-500/20">
                                <Fingerprint size={20} />
                            </div>
                            <p className="font-medium">Cryptographic Identity Verification</p>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                                <FileCheck size={20} />
                            </div>
                            <p className="font-medium">Role-Based Smart Contract Execution</p>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                                <LockKeyhole size={20} />
                            </div>
                            <p className="font-medium">Military-Grade Data Encryption</p>
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
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500 text-sm">Sign in to your account to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="shrink-0">⚠️</span>
                                {error}
                            </div>
                        )}
                        
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
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                            </div>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-semibold text-violet-600 hover:text-violet-500 transition-colors">
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
