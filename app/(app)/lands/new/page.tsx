// file: app/lands/new/page.tsx (UPDATED with coordinate drawing)

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewLandPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [coordInput, setCoordInput] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        let coordinates = null
        if (coordInput.trim()) {
            try {
                coordinates = JSON.parse(coordInput)
            } catch {
                setError('Invalid JSON format for coordinates')
                return
            }
        }

        const res = await fetch('/api/lands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                area: formData.get('area'),
                location: formData.get('location'),
                coordinates
            })
        })

        if (res.ok) {
            router.push('/dashboard')
        } else {
            const data = await res.json()
            setError(data.error)
        }
    }

    const sampleGeoJSON = `{
  "type": "Polygon",
  "coordinates": [[
    [77.5946, 12.9716],
    [77.5956, 12.9716],
    [77.5956, 12.9726],
    [77.5946, 12.9726],
    [77.5946, 12.9716]
  ]]
}`

    const fieldClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-600 ' +
        'shadow-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20'

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-slate-900">Register Land</h1>
            <a href="/dashboard" className="text-violet-600 hover:text-violet-500 mb-4 block font-medium">
                Back to Dashboard
            </a>

            {error && <p className="text-red-600 mb-4 text-sm font-medium">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Area (sq.m) *</label>
                    <input
                        name="area"
                        type="number"
                        step="0.01"
                        required
                        placeholder="e.g. 1250.5"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Location Description *</label>
                    <input
                        name="location"
                        type="text"
                        required
                        placeholder="e.g. Sector 12, Indiranagar, Bengaluru"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        GeoJSON Coordinates (optional)
                    </label>
                    <textarea
                        value={coordInput}
                        onChange={(e) => setCoordInput(e.target.value)}
                        rows={8}
                        className={`${fieldClass} font-mono text-sm`}
                        placeholder='Paste a GeoJSON Polygon here, e.g. {"type":"Polygon","coordinates":[[[lng,lat],...]]}'
                    />
                    <p className="text-xs text-slate-600 mt-1.5">
                        Format: GeoJSON Polygon with [longitude, latitude] pairs. Full example below.
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white shadow-md transition hover:bg-slate-800"
                >
                    Register Land
                </button>
            </form>

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-800">Sample GeoJSON</p>
                <pre className="overflow-x-auto text-xs text-slate-800">{sampleGeoJSON}</pre>
            </div>
        </div>
    )
}