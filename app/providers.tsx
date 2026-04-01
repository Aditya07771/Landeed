'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { config, projectId } from '@/lib/wagmi'
import { useState } from 'react'
import { Toaster } from 'sonner'

// ✅ MOVE IT HERE (top-level, runs immediately)
createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true,
    themeMode: 'light',
})

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <SessionProvider>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    {children}
                    <Toaster position="top-right" richColors />
                </QueryClientProvider>
            </WagmiProvider>
        </SessionProvider>
    )
}