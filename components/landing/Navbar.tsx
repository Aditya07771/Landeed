// components/landing/Navbar.tsx — FULL REWRITE
'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { WalletConnect } from '@/components/WalletConnect'
import { Menu, X, Shield } from 'lucide-react'
import Link from 'next/link'

const navLinks = [
  { label: 'Features',    href: '#features' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'Roles',       href: '#roles' },
  { label: 'Map',         href: '#map-preview' },
  { label: 'FAQ',         href: '#faq' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrolled_classes = scrolled
    ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/60'
    : 'bg-transparent border-b border-white/5'

  const linkColor = scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
  const logoColor = scrolled ? 'text-slate-900' : 'text-white'

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled_classes}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center shadow-sm">
              <Shield size={15} className="text-white" />
            </div>
            <span className={`font-bold text-lg transition-colors ${logoColor}`}>LandChain</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(l => (
              <a key={l.label} href={l.href}
                className={`text-sm font-medium transition-colors ${linkColor}`}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <WalletConnect />
            {session ? (
              <>
                <Link href="/dashboard"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                  Dashboard
                </Link>
                <button onClick={() => signOut()}
                  className={`text-sm font-medium transition-colors ${linkColor}`}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login"
                  className={`text-sm font-medium transition-colors ${linkColor}`}>
                  Sign in
                </Link>
                <Link href="/register"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-violet-600/25">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
            onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-white border-t border-slate-200 px-4 py-5 space-y-1">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
              {l.label}
            </a>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
            <WalletConnect />
            {!session && (
              <Link href="/login"
                className="block text-center py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                Sign in
              </Link>
            )}
            {!session && (
              <Link href="/register"
                className="block text-center py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-500 transition-colors">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}