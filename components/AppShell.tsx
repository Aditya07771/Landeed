// components/AppShell.tsx
'use client'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { WalletConnect } from './WalletConnect'
import { NotificationBell } from './NotificationBell'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Map, Plus, Briefcase, 
  ClipboardCheck, LogOut, ChevronRight, Shield, CheckCircle2, AlertTriangle, MonitorPlay,
  ShoppingBag, Receipt, Settings
} from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const [isKycVerified, setIsKycVerified] = useState<boolean | null>(null)

  useEffect(() => {
    if (session?.user?.role === 'OWNER') {
        fetch('/api/user/me')
            .then(res => res.json())
            .then(data => setIsKycVerified(data.isKycVerified))
            .catch(err => console.error(err))
    }
  }, [session])
  
  const baseNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'AUTHORITY', 'VERIFIER'] },
    { href: '/map', label: 'Land Map', icon: Map, roles: ['OWNER', 'AUTHORITY', 'VERIFIER'] },
    { href: '/lands/new', label: 'Register Land', icon: Plus, roles: ['OWNER'] },
    { href: '/authority/acquisitions', label: 'My Acquisitions', icon: Briefcase, roles: ['AUTHORITY'] },
    { href: '/verifier/pending', label: 'Verify Requests', icon: ClipboardCheck, roles: ['VERIFIER'] },
    { href: '/demo', label: 'Demo Mode', icon: MonitorPlay, roles: ['OWNER', 'AUTHORITY', 'VERIFIER'] },
    { href: '/dispute', label: 'Disputes', icon: AlertTriangle, roles: ['OWNER', 'AUTHORITY', 'VERIFIER'] },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['OWNER'] },
    { href: '/tax', label: 'Tax Records', icon: Receipt, roles: ['OWNER', 'AUTHORITY'] },
    { href: '/admin', label: 'Admin Panel', icon: Settings, roles: ['ADMIN'] }
  ].filter(item => item.roles.includes(session?.user?.role || ''))

  const navItems = [...baseNavItems]
  if (session?.user?.role === 'OWNER' && isKycVerified === false) {
     navItems.splice(1, 0, { href: '/profile/kyc', label: 'Complete KYC', icon: AlertTriangle, roles: ['OWNER'] })
  }

  // Derive page title
  let pageTitle = 'Overview'
  if (pathname === '/dashboard') pageTitle = 'Dashboard'
  else if (pathname?.startsWith('/lands/new')) pageTitle = 'Register Land'
  else if (pathname?.startsWith('/lands/')) pageTitle = 'Land Details'
  else if (pathname?.startsWith('/authority/acquisitions')) pageTitle = 'My Acquisitions'
  else if (pathname?.startsWith('/verifier/pending')) pageTitle = 'Verify Requests'
  else if (pathname?.startsWith('/profile/kyc')) pageTitle = 'KYC Verification'
  else if (pathname?.startsWith('/demo')) pageTitle = 'Demo Walkthrough'
  else if (pathname?.startsWith('/map')) pageTitle = 'Land Map'

  return (
    <div className="flex bg-slate-50 overflow-hidden h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-emerald-500 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">LandChain</span>
          </Link>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0 flex flex-col items-start">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="font-medium text-slate-800 text-sm truncate w-full">{session?.user?.name}</p>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium border
                ${session?.user?.role === 'OWNER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  session?.user?.role === 'AUTHORITY' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {session?.user?.role}
              </span>
              
              {session?.user?.role === 'OWNER' && isKycVerified === true && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      <CheckCircle2 size={10} /> KYC Verified
                  </span>
              )}

              {session?.user?.role === 'OWNER' && isKycVerified === false && (
                  <Link href="/profile/kyc" className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium transition-colors">
                      <AlertTriangle size={10} /> KYC Pending
                  </Link>
              )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            const isWarning = item.href === '/profile/kyc'
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-slate-900 text-white' 
                    : isWarning
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                <Icon size={16} className={isWarning ? 'text-amber-600' : ''} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3 flex-shrink-0">
          <WalletConnect />
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 flex flex-col h-full bg-slate-50">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
           <h2 className="text-lg font-semibold text-slate-800">
               {pageTitle}
           </h2>
           <div className="flex items-center gap-4">
               <NotificationBell />
           </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-y-auto flex-1">
            {children}
        </div>
      </main>
    </div>
  )
}
