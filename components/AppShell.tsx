// components/AppShell.tsx
'use client'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { WalletConnect } from './WalletConnect'
import Link from 'next/link'
import { 
  LayoutDashboard, Map, Plus, Briefcase, 
  ClipboardCheck, LogOut, ChevronRight, Shield
} from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'AUTHORITY', 'VERIFIER'] },
    { href: '/map', label: 'Land Map', icon: Map, roles: ['OWNER', 'AUTHORITY', 'VERIFIER'] },
    { href: '/lands/new', label: 'Register Land', icon: Plus, roles: ['OWNER'] },
    { href: '/authority/acquisitions', label: 'My Acquisitions', icon: Briefcase, roles: ['AUTHORITY'] },
    { href: '/verifier/pending', label: 'Verify Requests', icon: ClipboardCheck, roles: ['VERIFIER'] },
  ].filter(item => item.roles.includes(session?.user?.role || ''))

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-emerald-500 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">LandChain</span>
          </Link>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="font-medium text-slate-800 text-sm truncate">{session?.user?.name}</p>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium
            ${session?.user?.role === 'OWNER' ? 'bg-emerald-100 text-emerald-700' :
              session?.user?.role === 'AUTHORITY' ? 'bg-violet-100 text-violet-700' :
              'bg-amber-100 text-amber-700'}`}>
            {session?.user?.role}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                <Icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <WalletConnect />
          <button onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
