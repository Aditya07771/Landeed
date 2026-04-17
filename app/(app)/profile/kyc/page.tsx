'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, CheckCircle } from 'lucide-react'

export default function KYCVerificationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [panInput, setPanInput] = useState('')
    const [aadharInput, setAadharInput] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [aadharError, setAadharError] = useState('')
    const [panError, setPanError] = useState('')

    useEffect(() => {
        fetch('/api/user/me').then(res => res.json()).then(data => {
            if (data.role !== 'OWNER' || data.isKycVerified) {
                router.push('/dashboard')
            } else {
                setLoading(false)
            }
        }).catch(() => {
            router.push('/dashboard')
        })
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        setAadharError('')
        setPanError('')

        let hasError = false
        if (!/^\d{12}$/.test(aadharInput)) {
            setAadharError('Aadhar must be exactly 12 digits')
            hasError = true
        }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panInput)) {
            setPanError('PAN must match format ABCDE1234F')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        const res = await fetch('/api/user/kyc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadharNumber: aadharInput, panNumber: panInput })
        })

        if (res.ok) {
            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 3000)
        } else {
            const data = await res.json()
            setError(data.error || 'Verification failed')
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 max-w-2xl mx-auto w-full">
                <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-64 bg-slate-200 rounded-xl mt-4"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Identity Verification (KYC)</h1>
                <p className="text-slate-500">
                    Complete your identity verification to officially link your real-world identity to your blockchain land records.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">KYC verified successfully.</h2>
                        <p className="text-slate-500 mb-6">Your future land registrations will now be identity-linked.</p>
                        <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 mb-6">
                            <ShieldAlert className="shrink-0 mt-0.5" size={20} />
                            <p className="text-sm">
                                <strong>Important:</strong> Your Aadhar and PAN numbers are hashed immediately on the server. We never store these numbers in plain text.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="shrink-0">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Aadhar Number</label>
                            <input
                                type="text"
                                placeholder="12-digit number"
                                maxLength={12}
                                required
                                value={aadharInput}
                                onChange={(e) => setAadharInput(e.target.value)}
                                className={`w-full p-3 bg-slate-50 border ${aadharError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-500'} rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400`}
                            />
                            {aadharError && <p className="text-red-500 text-xs mt-1">{aadharError}</p>}
                            <p className="text-slate-400 text-xs mt-1.5">Your document numbers are hashed before storage and never stored in plain text.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">PAN Number</label>
                            <input
                                type="text"
                                placeholder="e.g. ABCDE1234F"
                                maxLength={10}
                                required
                                value={panInput}
                                onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                                className={`w-full p-3 bg-slate-50 border ${panError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-500'} rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400`}
                            />
                            {panError && <p className="text-red-500 text-xs mt-1">{panError}</p>}
                            <p className="text-slate-400 text-xs mt-1.5">Your document numbers are hashed before storage and never stored in plain text.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Saving to database...
                                </>
                            ) : 'Verify Identity'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
