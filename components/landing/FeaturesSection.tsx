// components/landing/FeaturesSection.tsx
'use client'

const features = [
  {
    icon: '🔑', title: 'Role-Based Access', sub: 'NextAuth Sessions',
    desc: 'Three distinct roles — Owner, Authority, Verifier — each with scoped permissions and dedicated dashboards.',
    span: 'md:col-span-1', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900/40',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    icon: '💳', title: 'Web3 Wallet Connect', sub: 'Web3Modal + Wagmi',
    desc: 'Connect MetaMask or any injected wallet. Auto-syncs address to your account profile.',
    span: 'md:col-span-1', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-100 dark:border-violet-900/40',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  {
    icon: '🏛️', title: 'On-Chain Registry', sub: 'Polygon · Solidity',
    desc: 'Land ownership, transfers, and acquisitions are recorded on Polygon with full transaction history and Polygonscan links.',
    span: 'md:col-span-1', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/40',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    icon: '📁', title: 'Document Verification', sub: 'IPFS + SHA-256 Hashing',
    desc: 'Upload to IPFS via Pinata. SHA-256 hash stored on-chain. Verifiers can confirm document integrity without accessing the original.',
    span: 'md:col-span-2', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-100 dark:border-orange-900/40',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-500',
  },
  {
    icon: '🗺️', title: 'GeoJSON Land Mapping', sub: 'Mapbox + PostGIS',
    desc: 'Draw land boundaries using GeoJSON polygons. Visualize all parcels color-coded by status on an interactive map.',
    span: 'md:col-span-1', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-100 dark:border-cyan-900/40',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
  },
  {
    icon: '🔒', title: 'Escrow Smart Contract', sub: 'Trustless Compensation',
    desc: 'Funds locked in smart contract escrow. Released only after on-chain ownership transfer is confirmed. Zero counterparty risk.',
    span: 'md:col-span-2', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/40',
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-flex items-center px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4 leading-tight">
            Enterprise-Grade Platform
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Every layer — auth, blockchain, storage, mapping — works together seamlessly.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title}
              className={`${f.span} relative ${f.bg} rounded-2xl p-7 border ${f.border}
                group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}>
              <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center text-2xl mb-5 shadow-lg`}>
                {f.icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">{f.sub}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech badge strip */}
        <div className="mt-14 text-center">
          <p className="text-xs text-slate-600 mb-5 uppercase tracking-widest">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 14','TypeScript','Solidity','Polygon','IPFS / Pinata','Prisma','NextAuth.js','Wagmi v2','Mapbox GL'].map(t => (
              <span key={t}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm font-medium hover:border-slate-600 transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}