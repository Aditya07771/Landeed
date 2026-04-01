// components/landing/FAQSection.tsx
'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Do I need a crypto wallet to use LandChain?',
    a: 'A wallet is required only for blockchain operations like registering land or executing transfers. You can log in with email credentials and browse the platform without one.',
  },
  {
    q: 'Which blockchain network is used?',
    a: 'LandChain runs on the Polygon network (Mumbai testnet for development, Polygon Mainnet for production). Polygon was chosen for its low gas fees and Ethereum compatibility.',
  },
  {
    q: 'How are documents stored and verified?',
    a: 'Documents are uploaded to IPFS via Pinata (content-addressed, permanent storage). A SHA-256 hash of each document is stored on-chain. Anyone can re-hash the document and compare it to the on-chain value to verify integrity.',
  },
  {
    q: 'What happens if an acquisition is rejected?',
    a: 'If a Verifier rejects the request, the land status reverts to AVAILABLE and the acquisition timeline records the rejection reason on-chain. The Authority can submit a new request.',
  },
  {
    q: 'Is the escrow trustless?',
    a: 'Yes. The Escrow smart contract holds funds until the ownership transfer is confirmed on-chain. No single party can release funds without fulfilling the contract conditions.',
  },
  {
    q: 'Can I register land without GeoJSON coordinates?',
    a: 'Yes. GeoJSON boundary data is optional. You can register land with just the area size and location description, and add coordinates later.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 lg:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <span className="inline-flex items-center px-3 py-1.5 bg-violet-100 border border-violet-200 rounded-full text-violet-600 text-xs font-semibold uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Common Questions
          </h2>
          <p className="text-slate-500">Everything you need to know before getting started.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i}
              className={`rounded-2xl border transition-all duration-200 ${
                open === i ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-slate-900 pr-4 text-sm sm:text-base">{faq.q}</span>
                <ChevronDown size={18}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180 text-violet-500' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-40' : 'max-h-0'}`}>
                <p className="px-6 pb-5 text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
