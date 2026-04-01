// components/landing/RolesSection.tsx
'use client'
import { useState } from 'react'
import { Home, Briefcase, ClipboardCheck } from 'lucide-react'

const roles = [
  {
    key: 'OWNER',
    label: 'Land Owner',
    icon: Home,
    color: 'emerald',
    headline: 'Secure and prove your land ownership on-chain.',
    capabilities: [
      'Register land parcels with GeoJSON boundaries',
      'Upload ownership documents to IPFS',
      'Store document SHA-256 hash on blockchain',
      'View all your lands on interactive map',
      'Track acquisition status in real time',
      'Receive escrow payment to your wallet',
    ]
  },
  {
    key: 'AUTHORITY',
    label: 'Gov. Authority',
    icon: Briefcase,
    color: 'violet',
    headline: 'Manage land acquisitions with full transparency.',
    capabilities: [
      'Request acquisition of available land',
      'Propose compensation amount in MATIC',
      'Approve acquisition after verification',
      'Lock funds in escrow smart contract',
      'Trigger on-chain ownership transfer',
      'Full acquisition timeline audit trail',
    ]
  },
  {
    key: 'VERIFIER',
    label: 'Independent Verifier',
    icon: ClipboardCheck,
    color: 'amber',
    headline: 'Authenticate records with cryptographic proof.',
    capabilities: [
      'Review pending acquisition requests',
      'Inspect land documents from IPFS',
      'Verify SHA-256 document hashes',
      'Approve or reject with detailed notes',
      'Sign verification transaction on-chain',
      'Complete audit trail of all decisions',
    ]
  }
]

const colorMap = {
  emerald: {
    tab: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
    tabInactive: 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    bullet: 'bg-emerald-500',
    card: 'border-emerald-200',
    glow: 'bg-emerald-400/5',
  },
  violet: {
    tab: 'bg-violet-600 text-white shadow-sm shadow-violet-600/30',
    tabInactive: 'text-slate-600 hover:text-violet-700 hover:bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    bullet: 'bg-violet-500',
    card: 'border-violet-200',
    glow: 'bg-violet-400/5',
  },
  amber: {
    tab: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
    tabInactive: 'text-slate-600 hover:text-amber-700 hover:bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    bullet: 'bg-amber-500',
    card: 'border-amber-200',
    glow: 'bg-amber-400/5',
  },
}

export default function RolesSection() {
  const [active, setActive] = useState('OWNER')
  const role = roles.find(r => r.key === active)!
  const c = colorMap[role.color as keyof typeof colorMap]
  const Icon = role.icon

  return (
    <section id="roles" className="py-20 lg:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1.5 bg-violet-100 border border-violet-200 rounded-full text-violet-600 text-xs font-semibold uppercase tracking-widest mb-4">
            User Roles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Built for Every Stakeholder
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            One platform, three distinct roles — each designed for its specific workflow.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
            {roles.map(r => {
              const isActive = r.key === active
              const cm = colorMap[r.color as keyof typeof colorMap]
              return (
                <button key={r.key} onClick={() => setActive(r.key)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive ? cm.tab : cm.tabInactive
                  }`}>
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Role card */}
        <div className={`relative rounded-2xl border-2 ${c.card} p-8 lg:p-10 overflow-hidden`}>
          <div className={`absolute inset-0 ${c.glow}`} />
          <div className="relative grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className={`inline-flex p-4 rounded-2xl ${c.icon} mb-5`}>
                <Icon size={28} />
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${c.badge}`}>
                {role.label}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{role.headline}</h3>
              <a href="/register"
                className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all
                  ${role.color==='emerald' ? 'bg-emerald-600 hover:bg-emerald-500' :
                    role.color==='violet' ? 'bg-violet-600 hover:bg-violet-500' :
                    'bg-amber-500 hover:bg-amber-400'}`}>
                Register as {role.label} →
              </a>
            </div>
            <ul className="space-y-3">
              {role.capabilities.map(cap => (
                <li key={cap} className="flex items-start gap-3 text-slate-700 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.bullet} mt-2 shrink-0`} />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
