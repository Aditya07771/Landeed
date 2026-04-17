import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShieldCheck, MapPin, Hash, CheckCircle, Clock } from 'lucide-react';

export const revalidate = 0; // Dynamic component

export default async function VerifyLandPage({ params }: { params: { landId: string } }) {
  const land = await prisma.land.findUnique({
    where: { landId: params.landId },
    include: {
      owner: { select: { name: true } },
      documents: { where: { isOnChainVerified: true } },
      histories: { where: { action: 'ACQUISITION_COMPLETED' } }
    }
  });

  if (!land) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hash size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Record Missing</h1>
            <p className="text-slate-500">The specified public asset descriptor does not resolve to an active node in our registry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
          
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-6 relative">
                <ShieldCheck size={32} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                    <CheckCircle size={12} />
                </div>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Public Title Verification</h1>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-lg">Blockchain-secured certificate of correctness. This digital record represents a cryptographic snapshot of the asset.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Hash size={240} className="text-slate-900" />
            </div>
            
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin size={16} /> Asset Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Global Address ID</p>
                    <p className="text-xl font-mono font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-md">{land.landId}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Current Beneficiary</p>
                    <p className="text-lg font-medium text-slate-900">{land.owner.name}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Dimension Measure</p>
                    <p className="text-lg font-medium text-slate-900">{land.area?.toLocaleString()} sq m</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Operational Status</p>
                    <p className="text-lg font-medium text-slate-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-semibold capitalize ${land.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                            {land.status.replace('_', ' ').toLowerCase()}
                        </span>
                    </p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Geographic Registration</p>
                    <p className="text-base text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{land.location}</p>
                </div>
                
                {land.txHash && (
                <div className="md:col-span-2 mt-4 p-4 bg-slate-900 rounded-xl text-white">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-400" /> State Genesis Hash
                    </p>
                    <a href={`https://sepolia.etherscan.io/tx/${land.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm break-all text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400/30">
                        {land.txHash}
                    </a>
                </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckCircle size={16} /> Immutable Documents
                </h2>
                {land.documents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-slate-400 text-sm">No on-chain proofs submitted.</p>
                </div>
                ) : (
                <ul className="space-y-4">
                    {land.documents.map(doc => (
                    <li key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="font-medium text-slate-800 mb-1">{doc.fileName}</div>
                        <div className="flex flex-col gap-2 mt-3">
                            <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono bg-blue-50 text-blue-600 px-3 py-1.5 rounded w-fit hover:bg-blue-100">
                                IPFS Protocol
                            </a>
                            {doc.onChainTxHash && (
                                <a href={`https://sepolia.etherscan.io/tx/${doc.onChainTxHash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded w-fit hover:bg-emerald-100 truncate max-w-[250px]">
                                    Tx: {doc.onChainTxHash}
                                </a>
                            )}
                        </div>
                    </li>
                    ))}
                </ul>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock size={16} /> State Changes
                </h2>
                {land.histories.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-slate-400 text-sm">No secondary genesis boundaries identified.</p>
                </div>
                ) : (
                <ul className="relative border-l border-slate-200 ml-3 space-y-6">
                    {land.histories.map(h => (
                    <li key={h.id} className="pl-6 relative">
                        <div className="absolute w-3 h-3 bg-white border-2 border-emerald-500 rounded-full -left-[6.5px] top-1"></div>
                        <div className="font-semibold text-slate-800">{h.action.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-slate-400 mt-1 font-mono">{new Date(h.createdAt).toLocaleDateString()}</div>
                    </li>
                    ))}
                </ul>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
