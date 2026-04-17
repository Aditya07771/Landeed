'use client'

import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications?unread=true')
                if (res.ok) {
                    const data = await res.json()
                    setNotifications(data.notifications || [])
                    setUnreadCount(data.unreadCount || 0)
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string, landId?: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [id] })
            })
            // Optimistic update
            setNotifications(prev => prev.filter(n => n.id !== id))
            setUnreadCount(prev => Math.max(0, prev - 1))
            setIsOpen(false)
            if (landId) {
                router.push(`/lands/${landId}`)
            }
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((n) => (
                                <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleMarkAsRead(n.id, n.landId)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-slate-800 text-sm">{n.title}</h4>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-xs line-clamp-2 mb-2">{n.message}</p>
                                    <div className="flex justify-start">
                                        <button className="text-[10px] font-medium text-violet-600 flex items-center gap-1 hover:text-violet-700">
                                            <Check size={12} /> Mark as read
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    )
}
