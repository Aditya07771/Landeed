'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Props {
    landId: string
    userName: string
    userRole: string
    txHash?: string | null
}

export function GenerateCertificateButton({ landId, userName, userRole, txHash }: Props) {
    const [generating, setGenerating] = useState(false)

    async function generateCertificate() {
        setGenerating(true)
        try {
            const canvas = document.createElement('canvas')
            canvas.width = 800
            canvas.height = 600
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Background
            ctx.fillStyle = '#f8fafc' // slate-50
            ctx.fillRect(0, 0, 800, 600)
            
            // Border
            ctx.strokeStyle = '#8b5cf6' // violet-500
            ctx.lineWidth = 10
            ctx.strokeRect(20, 20, 760, 560)

            // Inner border
            ctx.strokeStyle = '#cbd5e1' // slate-300
            ctx.lineWidth = 2
            ctx.strokeRect(35, 35, 730, 530)

            // Title
            ctx.fillStyle = '#0f172a' // slate-900
            ctx.font = 'bold 40px Arial, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('LANDCHAIN', 400, 100)
            
            ctx.font = '24px Arial, sans-serif'
            ctx.fillStyle = '#475569' // slate-600
            ctx.fillText('CERTIFICATE OF REGISTRY', 400, 140)

            // Content
            ctx.font = '18px Arial, sans-serif'
            ctx.fillStyle = '#64748b' // slate-500
            ctx.fillText('This is to certify that the land parcel identified as', 400, 220)

            ctx.font = 'bold 28px monospace'
            ctx.fillStyle = '#0f172a'
            ctx.fillText(landId, 400, 270)

            ctx.font = '18px Arial, sans-serif'
            ctx.fillStyle = '#64748b'
            ctx.fillText('is officially recorded and tied to the identity of', 400, 320)

            ctx.font = 'bold 24px Arial, sans-serif'
            ctx.fillStyle = '#8b5cf6' // violet-500
            ctx.fillText(userName.toUpperCase(), 400, 370)
            
            ctx.font = '16px tracking-widest Arial, sans-serif'
            ctx.fillStyle = '#94a3b8' // slate-400
            ctx.fillText(`ROLE: ${userRole}`, 400, 400)

            // Tx Hash if available
            if (txHash) {
                ctx.font = '12px monospace'
                ctx.fillStyle = '#10b981' // emerald-500
                ctx.fillText(`Secured on Polygon: ${txHash}`, 400, 480)
            } else {
                ctx.font = '12px monospace'
                ctx.fillStyle = '#f59e0b' // amber-500
                ctx.fillText('Pending On-Chain Registration', 400, 480)
            }

            // Date
            ctx.font = '14px Arial, sans-serif'
            ctx.fillStyle = '#64748b'
            ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 150, 520)

            // Download
            const link = document.createElement('a')
            link.download = `LandChain_Certificate_${landId}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

        } catch (err) {
            console.error('Failed to generate certificate', err)
            alert('Failed to generate certificate')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <button
            onClick={generateCertificate}
            disabled={generating}
            className="w-full mt-4 p-3 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 hover:text-violet-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
        >
            <Download size={18} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
            {generating ? 'Generating...' : 'Download Official Certificate'}
        </button>
    )
}
