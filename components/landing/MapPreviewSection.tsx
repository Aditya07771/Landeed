// components/landing/MapPreviewSection.tsx
'use client'
import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'

// 🖼️ Replace the placeholder grid below with a real Mapbox static screenshot:
// 1. Go to api.mapbox.com/styles/v1/mapbox/dark-v11/static/ with your bbox
// 2. Save as /public/map-preview.png
// 3. Use <Image src="/map-preview.png" ... /> instead of the fake grid

export default function MapPreviewSection() {
  const fakeParcels = [
    { col: 1, row: 1, status: 'available' },
    { col: 2, row: 1, status: 'pending' },
    { col: 3, row: 1, status: 'available' },
    { col: 4, row: 1, status: 'acquired' },
    { col: 1, row: 2, status: 'available' },
    { col: 2, row: 2, status: 'available' },
    { col: 3, row: 2, status: 'pending' },
    { col: 4, row: 2, status: 'available' },
    { col: 1, row: 3, status: 'acquired' },
    { col: 2, row: 3, status: 'available' },
    { col: 3, row: 3, status: 'available' },
    { col: 4, row: 3, status: 'pending' },
  ]
  const statusColor = { available: 'bg-emerald-500/70', pending: 'bg-amber-400/70', acquired: 'bg-red-500/70' }

  return (
    <section id="map-preview" className="py-20 lg:py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            <span className="inline-flex items-center px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Interactive Map
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              Visualize Every Land Parcel in Real Time
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-7">
              Every registered land plot is visible on the map — color-coded by acquisition status.
              Click any parcel to view ownership, documents, and the full on-chain timeline.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { color: 'bg-emerald-500', label: 'Available', desc: 'Ready for acquisition requests' },
                { color: 'bg-amber-400',   label: 'Under Acquisition', desc: 'Request in progress' },
                { color: 'bg-red-500',     label: 'Acquired', desc: 'Transfer completed on-chain' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="text-white font-medium text-sm">{item.label}</span>
                  <span className="text-slate-500 text-sm">— {item.desc}</span>
                </div>
              ))}
            </div>
            <Link href="/map"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/25">
              <MapPin size={16} />
              Open Interactive Map
            </Link>
          </div>

          {/* Right — map mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/5 rounded-3xl blur-3xl scale-110" />
            <div className="relative bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* Map toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-700/40">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-violet-400" />
                  <span className="text-slate-400 text-sm">Land Registry Map</span>
                </div>
                <Link href="/map" className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Open <ExternalLink size={12} />
                </Link>
              </div>

              {/* Fake satellite-style bg + grid */}
              <div className="relative bg-slate-900 p-5 min-h-[280px]">
                {/* Dark bg grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />

                <div className="relative grid grid-cols-4 gap-2">
                  {fakeParcels.map((p, i) => (
                    <div key={i}
                      className={`${statusColor[p.status as keyof typeof statusColor]} h-16 rounded-lg 
                        cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-white/30 transition-all`}
                    />
                  ))}
                </div>

                {/* Tooltip mockup */}
                <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-xl max-w-[180px]">
                  <p className="font-semibold text-slate-800 text-xs">LAND-x7Kp2mQa</p>
                  <p className="text-slate-500 text-xs mt-0.5">Mumbai, Maharashtra</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Available
                  </span>
                </div>
              </div>

              {/* Map legend strip */}
              <div className="flex items-center gap-5 px-5 py-3 bg-slate-900/60 border-t border-slate-700/30 text-xs text-slate-400">
                {[['bg-emerald-500','Available'],['bg-amber-400','Pending'],['bg-red-500','Acquired']].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded ${c}`} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
