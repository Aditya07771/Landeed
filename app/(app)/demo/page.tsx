'use client'

import { Shield, Share2, CheckCircle2, Lock, ArrowRight, Activity, Wallet, FileText, UploadCloud, Eye } from 'lucide-react'
import Link from 'next/link'

export default function DemoWalkthroughPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
            
            {/* Header */}
            <div className="text-center pt-12 pb-6">
                <div className="inline-flex items-center justify-center p-3 w-16 h-16 bg-violet-100 rounded-2xl text-violet-600 mb-6 relative">
                    <Shield size={32} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">How LandChain Works</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Experience the future of transparent, secure, and decentralized land acquisition. 
                    This interactive walkthrough explains the core concepts behind our platform.
                </p>
            </div>

            {/* Step 1: KYC and Registration */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group">
                <div className="md:w-5/12 bg-slate-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                        <span className="font-bold text-xl">1</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Identity & Registration</h3>
                    <p className="text-slate-600 mb-6">
                        Owners start by verifying their identity through national ID systems (Aadhar/PAN). 
                        Once verified, a zero-knowledge proof format hashes their data—securing their privacy while ensuring authenticity.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-blue-500" /> KYC Cryptographic Linking
                        </li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-blue-500" /> GIS Coordinates Integration
                        </li>
                    </ul>
                </div>
                <div className="md:w-7/12 p-8 bg-slate-900 text-white relative overflow-hidden flex items-center justify-center min-h-[300px]">
                    {/* Simulated UI */}
                    <div className="w-full max-w-sm bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-2xl relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="flex items-center gap-3 border-b border-slate-700 pb-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircle2 size={20} /></div>
                            <div>
                                <p className="font-semibold text-sm">Identity Verified</p>
                                <p className="text-xs text-slate-400">Hash: 0x9f86...8722</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4"></div>
                            </div>
                            <p className="text-xs text-slate-400 text-center uppercase tracking-widest mt-2 font-semibold">Generating Land ID</p>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Step 2: Document IPFS */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row-reverse group">
                <div className="md:w-5/12 bg-slate-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-l border-slate-200">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                        <span className="font-bold text-xl">2</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Immutable Documents</h3>
                    <p className="text-slate-600 mb-6">
                        Legal documents are uploaded and hashed using SHA-256. The files are securely pinned to IPFS (InterPlanetary File System), ensuring they cannot be manipulated or deleted.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Decentralized Storage
                        </li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Tamper-Proof Hashes
                        </li>
                    </ul>
                </div>
                <div className="md:w-7/12 p-8 bg-emerald-50 relative overflow-hidden flex items-center justify-center min-h-[300px]">
                    <div className="w-full max-w-sm bg-white rounded-xl border border-emerald-100 p-5 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-500 flex flex-col items-center text-center">
                        <UploadCloud size={48} className="text-emerald-500 mb-4" />
                        <h4 className="font-bold border-b pb-2 w-full border-slate-100">Deed_Abstract.pdf</h4>
                        <div className="mt-4 bg-slate-50 p-3 rounded-lg w-full">
                            <p className="text-xs text-slate-500 text-left mb-1">IPFS CID</p>
                            <p className="font-mono text-emerald-600 text-xs break-all text-left bg-emerald-100/50 p-2 rounded">
                                QmZb8a2e5s4...kE95vG2b
                            </p>
                        </div>
                    </div>
                    <div className="absolute grid grid-cols-4 gap-4 opacity-5 pointer-events-none">
                        {Array.from({length: 16}).map((_, i) => <FileText key={i} size={64} />)}
                    </div>
                </div>
            </div>

            {/* Step 3: Blockchain Anchoring */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group">
                <div className="md:w-5/12 bg-slate-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-6">
                        <span className="font-bold text-xl">3</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">On-Chain Anchoring</h3>
                    <p className="text-slate-600 mb-6">
                        The SHA-256 hash of the documents is inscribed as a permanent Smart Contract state on the Polygon network. Any alteration of the physical paper voids the mathematical proof on-chain.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-violet-500" /> Polygon Network
                        </li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-violet-500" /> Cryptographic State
                        </li>
                    </ul>
                </div>
                <div className="md:w-7/12 p-8 bg-slate-900 border-l border-slate-800 text-white relative overflow-hidden flex items-center justify-center min-h-[300px]">
                    <div className="w-full max-w-md bg-slate-800 rounded-xl border border-violet-500/30 p-5 shadow-2xl relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Wallet size={20} className="text-violet-400" />
                                <span className="font-medium text-sm text-slate-300">MetaMask Signature</span>
                            </div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="h-6" />
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-xs text-slate-400 space-y-2 mb-6">
                            <p className="flex justify-between"><span>Function:</span> <span className="text-emerald-400">updateDocumentHash()</span></p>
                            <p className="flex justify-between"><span>Data:</span> <span className="text-violet-400 truncate ml-4">0x4a9b...2f1a</span></p>
                        </div>
                        <button className="w-full py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/50 transition-all flex items-center justify-center gap-2">
                            Confirm Transaction <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Step 4: Acquisition & Smart Escrow */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row-reverse group">
                <div className="md:w-5/12 bg-slate-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-l border-slate-200">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                        <span className="font-bold text-xl">4</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Smart Contract Escrow</h3>
                    <p className="text-slate-600 mb-6">
                        Authorities can initiate acquisitions. Compensation flows directly into a verifiable escrow contract. Funds are <b>only</b> released algorithmically when the transfer of land completes verified conditions.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-amber-500" /> Trustless Operations
                        </li>
                        <li className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={16} className="text-amber-500" /> Zero Counter-party Risk
                        </li>
                    </ul>
                </div>
                <div className="md:w-7/12 p-8 bg-amber-50 relative overflow-hidden flex items-center justify-center min-h-[300px]">
                    <div className="w-full max-w-sm relative z-10 flex flex-col gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center justify-between group-hover:-translate-x-2 transition-transform">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Authority Lock</p>
                                <p className="font-mono text-slate-800">1,500 MATIC</p>
                            </div>
                            <Lock size={20} className="text-amber-500" />
                        </div>
                        
                        <div className="flex justify-center -my-2 z-20 relative">
                            <div className="bg-amber-100 rounded-full p-2 border-4 border-amber-50 text-amber-600">
                                <Activity size={24} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center justify-between opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Owner Release</p>
                                <p className="font-mono text-slate-800">Pending Transfer...</p>
                            </div>
                            <Share2 size={20} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-12">
                <Link href="/dashboard" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xl flex items-center gap-2 transition-transform hover:scale-105">
                    Start Using LandChain <ArrowRight size={20} />
                </Link>
            </div>

        </div>
    )
}
