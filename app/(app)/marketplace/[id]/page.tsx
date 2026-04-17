"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Coins, Inbox, ArrowRightLeft, PenSquare, Eye } from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [listing, setListing] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [offerForm, setOfferForm] = useState({ offerAmount: '', message: '' });
  const [completeForm, setCompleteForm] = useState({ txHash: '', newOwnerId: '' });

  useEffect(() => {
    fetch(`/api/marketplace/${id}`).then(res => res.json()).then(setListing);
    fetch(`/api/marketplace/${id}/offer`).then(res => res.json()).then(data => setOffers(Array.isArray(data) ? data : []));
  }, [id]);

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/marketplace/${id}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerForm)
    });
    if (res.ok) window.location.reload();
  };

  const handleOfferAction = async (offerId: string, action: 'ACCEPT' | 'REJECT') => {
    const res = await fetch(`/api/marketplace/${id}/offer/${offerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (res.ok) window.location.reload();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/marketplace/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeForm)
    });
    if (res.ok) window.location.reload();
  };

  if (!listing) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
        </div>
  );

  const isMyListing = session?.user?.id === listing.sellerId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Back to Marketplace
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex items-start justify-between flex-wrap gap-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <Coins className="text-emerald-500" />
                {listing.askingPrice?.toLocaleString()} MATIC
            </h1>
            <p className="text-slate-500 font-mono text-sm mt-2 flex items-center gap-2">
                Land Reference: <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{listing.land?.landId}</span>
            </p>
        </div>
        <div className="flex flex-col items-end">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border tracking-wider ${listing.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {listing.status}
            </span>
            <p className="text-xs text-slate-400 mt-2">Listed by: {isMyListing ? 'You' : listing.seller?.name}</p>
        </div>
        <div className="w-full pt-6 mt-2 border-t border-slate-100">
            <p className="text-slate-600 text-sm leading-relaxed">{listing.description}</p>
        </div>
      </div>

      {!isMyListing && session?.user?.role === 'OWNER' && listing.status === 'ACTIVE' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-emerald-900 flex items-center gap-2 mb-4">
            <PenSquare size={18} /> Make a Private Offer
          </h2>
          <form onSubmit={handleMakeOffer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                <input type="number" placeholder="Offer Amount (MATIC)" className="w-full text-sm rounded-xl border border-emerald-200 px-4 py-2.5 bg-white focus:ring-emerald-500 focus:border-emerald-500 outline-none" value={offerForm.offerAmount} onChange={e => setOfferForm({...offerForm, offerAmount: e.target.value})} required />
            </div>
            <div className="md:col-span-2 flex gap-3">
                <input type="text" placeholder="Attach a message for the seller..." className="flex-1 text-sm rounded-xl border border-emerald-200 px-4 py-2.5 bg-white focus:ring-emerald-500 focus:border-emerald-500 outline-none" value={offerForm.message} onChange={e => setOfferForm({...offerForm, message: e.target.value})} />
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 transition">Send</button>
            </div>
          </form>
        </div>
      )}

      {session?.user?.role === 'AUTHORITY' && listing.status === 'ACTIVE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-900/10">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <ArrowRightLeft size={18} className="text-emerald-400" /> Administrative Transfer Resolution
          </h2>
          <form onSubmit={handleComplete} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="On-Chain Settlement Hash" className="w-full text-sm rounded-xl border border-slate-700 px-4 py-2.5 bg-slate-800 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 outline-none" value={completeForm.txHash} onChange={e => setCompleteForm({...completeForm, txHash: e.target.value})} required />
              <div className="flex gap-3">
                  <input type="text" placeholder="Target Buyer UUID" className="flex-1 text-sm rounded-xl border border-slate-700 px-4 py-2.5 bg-slate-800 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 outline-none" value={completeForm.newOwnerId} onChange={e => setCompleteForm({...completeForm, newOwnerId: e.target.value})} required />
                  <button type="submit" className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-600 transition tracking-wide text-nowrap">Commit Deed</button>
              </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Inbox className="text-slate-400" size={20} />
            <h2 className="font-semibold text-slate-800">Proposal Feed</h2>
        </div>
        
        {offers.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {offers.map(o => (
              <li key={o.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex gap-3 items-center">
                            <span className="text-lg font-bold text-slate-900">{o.offerAmount} MATIC</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${o.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : o.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{o.status}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{o.message || 'No direct message attached.'}</p>
                        <p className="text-xs text-slate-400 mt-1">From user account: {o.buyerId.substring(0, 8)}...</p>
                    </div>
                    {isMyListing && o.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOfferAction(o.id, 'ACCEPT')} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition">Accept</button>
                        <button onClick={() => handleOfferAction(o.id, 'REJECT')} className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-medium px-4 py-2 rounded-lg transition">Decline</button>
                    </div>
                    )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center flex flex-col justify-center items-center">
              <Eye className="text-slate-200 mb-3" size={32} />
              <p className="text-slate-500 font-medium">No offers received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
