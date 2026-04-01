// file: components/landing/WorkflowSection.tsx
'use client'

export default function WorkflowSection() {
    const steps = [
        { number:'01', title:'Authenticate',    role:'ALL',        color:'bg-slate-600', description: 'Login with NextAuth using your credentials. Role-based access grants specific permissions.', icon: '🔐' },
        { number:'02', title:'Connect Wallet',  role:'ALL',        color:'bg-slate-600', description: 'Link your MetaMask or compatible Web3 wallet to sign on-chain operations.', icon: '💳' },
        { number:'03', title:'Register Land',   role:'OWNER',      color:'bg-emerald-600', description: 'Register land parcels, upload ownership documents to IPFS, and log coordinates.', icon: '📤' },
        { number:'04', title:'Request Acq.',    role:'AUTHORITY',  color:'bg-violet-600', description: 'Create acquisition requests through the platform for specific parcels.', icon: '⚡' },
        { number:'05', title:'Verify Docs',     role:'VERIFIER',   color:'bg-amber-600', description: 'Authenticate documents and approve transfers with full transparency.', icon: '✅' },
        { number:'06', title:'Escrow & Transfer', role:'AUTHORITY', color:'bg-violet-600', description: 'Funds locked in smart contract escrow. Released only after on-chain ownership transfer completes.', icon: '💼' }
    ]

    return (
        <section id="workflow" className="py-20 lg:py-32 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">
                        Acquisition Pipeline
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4 leading-tight">
                        Simple 6-Step Process
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        From authentication to blockchain verification in minutes, not months.
                    </p>
                </div>

                {/* Grid layout for Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-slate-800/40 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-slate-700/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                                    <span className="text-2xl">{step.icon}</span>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block
                                    ${step.role==='OWNER' ? 'bg-emerald-500/15 text-emerald-400' :
                                        step.role==='AUTHORITY' ? 'bg-violet-500/15 text-violet-400' :
                                        step.role==='VERIFIER' ? 'bg-amber-500/15 text-amber-400' :
                                        'bg-slate-700 text-slate-400'}`}>
                                    {step.role}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                <span className="text-slate-500 mr-2">{step.number}</span>
                                {step.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 lg:p-10">
                    <div className="grid lg:grid-cols-3 gap-8 text-center lg:text-left">
                        <div>
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Secure by Design</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">Every transaction is cryptographically signed and verified on the blockchain.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
                                <span className="text-2xl">🌐</span>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Decentralized Storage</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">Documents stored on IPFS ensure availability and resistance to censorship.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Full Audit Trail</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">Complete history of all actions with timestamps and transaction proofs.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}