// components/WalletConnect.tsx — FULL REPLACEMENT
'use client'
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Wallet, ChevronDown, ExternalLink, Copy, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function WalletConnect() {
    const { open } = useWeb3Modal()
    const { address, isConnected, chain } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: balance } = useBalance({ address })
    const { data: session } = useSession()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [syncing, setSyncing] = useState(false)

    // Auto-sync wallet address to DB on connect
    useEffect(() => {
        if (isConnected && address && session) {
            syncWalletToDB(address)
        }
    }, [isConnected, address])

    async function syncWalletToDB(walletAddress: string) {
        setSyncing(true)
        try {
            await fetch('/api/user/wallet', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress })
            })
        } finally {
            setSyncing(false)
        }
    }

    function copyAddress() {
        navigator.clipboard.writeText(address!)
        toast.success('Address copied!')
    }

    if (!isConnected) {
        return (
            <button
                onClick={() => open()}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <Wallet size={16} />
                Connect Wallet
            </button>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm transition-all"
            >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-slate-700 dark:text-slate-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {balance && (
                    <span className="text-xs text-slate-500">
                        {parseFloat(balance.formatted).toFixed(3)} {balance.symbol}
                    </span>
                )}
                <ChevronDown size={14} className="text-slate-400" />
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500">Connected to {chain?.name}</p>
                        <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 break-all">{address}</p>
                    </div>
                    <button onClick={copyAddress} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <Copy size={14} /> Copy Address
                    </button>
                    <a href={`https://mumbai.polygonscan.com/address/${address}`} target="_blank" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <ExternalLink size={14} /> View on Explorer
                    </a>
                    <button onClick={() => disconnect()} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
                        <LogOut size={14} /> Disconnect
                    </button>
                </div>
            )}
        </div>
    )
}