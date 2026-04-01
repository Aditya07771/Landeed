// components/landing/StatsTickerBar.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 1240,  suffix: '+', label: 'Lands Registered',    color: 'text-emerald-400' },
  { value: 3400,  suffix: '+', label: 'Documents Verified',  color: 'text-violet-400' },
  { value: 48,    suffix: 'h', label: 'Avg. Process Time',   color: 'text-amber-400' },
  { value: 99.9,  suffix: '%', label: 'Uptime',              color: 'text-cyan-400' },
  { value: 100,   suffix: '%', label: 'Tamper-Proof',        color: 'text-emerald-400' },
]

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(parseFloat((progress * target).toFixed(target % 1 !== 0 ? 1 : 0)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function StatItem({ value, suffix, label, color, started }: any) {
  const count = useCountUp(value, 1600, started)
  return (
    <div className="flex flex-col items-center px-8 py-5 border-r border-white/5 last:border-0 shrink-0">
      <span className={`text-2xl lg:text-3xl font-bold tabular-nums ${color}`}>
        {count}{suffix}
      </span>
      <span className="text-slate-500 text-xs mt-1 whitespace-nowrap">{label}</span>
    </div>
  )
}

export default function StatsTickerBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-slate-900 border-y border-white/5 overflow-x-auto">
      <div className="flex justify-center min-w-max mx-auto">
        {stats.map(s => (
          <StatItem key={s.label} {...s} started={started} />
        ))}
      </div>
    </div>
  )
}
