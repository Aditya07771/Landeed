// components/landing/Footer.tsx
import Link from 'next/link'
import { Shield, ExternalLink } from 'lucide-react'

const links = {
  Platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Land Map', href: '/map' },
    { label: 'Register Land', href: '/lands/new' },
  ],
  Roles: [
    { label: 'Land Owner', href: '/register' },
    { label: 'Authority', href: '/register' },
    { label: 'Verifier', href: '/register' },
  ],
  Resources: [
    { label: 'View on Polygonscan', href: 'https://mumbai.polygonscan.com' },
    { label: 'IPFS Gateway', href: 'https://gateway.pinata.cloud' },
    { label: 'GitHub', href: 'https://github.com' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">LandChain</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Transparent, tamper-proof land acquisition powered by Polygon blockchain.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-slate-400 font-semibold text-sm mb-4">{heading}</p>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-slate-600 text-sm">© 2025 LandChain. MIT License.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2 h-2 bg-violet-500 rounded-full" />
              Built on Polygon
            </span>
            <Link href="https://github.com" target="_blank"
              className="text-slate-500 hover:text-white transition-colors">
              {/* <GitHub size={18} /> */}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
