// components/landing/TechStackSection.tsx
'use client'

const techStack = [
  { name: 'Next.js 14',   emoji: '▲' },
  { name: 'TypeScript',   emoji: '𝙏𝙎' },
  { name: 'Solidity',     emoji: '⬡' },
  { name: 'Polygon',      emoji: '⬟' },
  { name: 'Hardhat',      emoji: '🪖' },
  { name: 'IPFS',         emoji: '∞' },
  { name: 'Pinata',       emoji: '📌' },
  { name: 'Prisma',       emoji: '◆' },
  { name: 'PostgreSQL',   emoji: '🐘' },
  { name: 'NextAuth.js',  emoji: '🔐' },
  { name: 'Wagmi v2',     emoji: '⚡' },
  { name: 'Mapbox GL',    emoji: '🗺' },
  { name: 'Tailwind CSS', emoji: '💨' },
  { name: 'Ethers.js',    emoji: '⛓' },
]

// Duplicate for infinite scroll
const doubled = [...techStack, ...techStack]

export default function TechStackSection() {
  return (
    <section className="py-16 bg-slate-900 border-y border-white/5 overflow-hidden">
      <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-8 font-semibold">
        Technology Stack
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10" />

        {/* Marquee */}
        <div className="flex gap-4 animate-[marquee_30s_linear_infinite] w-max">
          {doubled.map((t, i) => (
            <div key={i}
              className="flex items-center gap-2.5 px-5 py-3 bg-slate-800/60 border border-slate-700/50 rounded-full whitespace-nowrap hover:border-slate-600 transition-colors shrink-0">
              <span className="text-base">{t.emoji}</span>
              <span className="text-slate-300 text-sm font-medium">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
