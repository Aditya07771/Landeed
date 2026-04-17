"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Store, Search, Coins, PlusCircle } from 'lucide-react';

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<any[]>([]);
  const [myLands, setMyLands] = useState<any[]>([]);
  const [form, setForm] = useState({ landId: '', askingPrice: '', description: '' });

  useEffect(() => {
    fetch('/api/marketplace').then(res => res.json()).then(data => setListings(Array.isArray(data) ? data : []));
    if (session?.user?.role === 'OWNER') {
      fetch('/api/lands').then(res => res.json()).then(data => setMyLands(Array.isArray(data) ? data : []));
    }
  }, [session]);

  const handleListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <Store size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Land Marketplace</h1>
          <p className="text-slate-500 mt-1">Browse, trade, and invest in secondary tokenized real estate.</p>
        </div>
      </div>

      {session?.user?.role === 'OWNER' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <PlusCircle size={18} className="text-emerald-500" /> Create a Public Listing
            </h2>
          </div>
          <form onSubmit={handleListing} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Parcel</label>
                <select className="w-full text-sm rounded-xl border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors" value={form.landId} onChange={e => setForm({...form, landId: e.target.value})} required>
                  <option value="">Choose an available land</option>
                  {myLands.filter((l: any) => l.status === 'AVAILABLE').map((l: any) => (
                    <option key={l.id} value={l.id}>{l.landId} ({l.area} sqm)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Strategic Asking Price (MATIC)</label>
                <input type="number" placeholder="Enter amount" className="w-full text-sm rounded-xl border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors" value={form.askingPrice} onChange={e => setForm({...form, askingPrice: e.target.value})} required />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Listing Description Notes</label>
                <textarea rows={2} className="w-full text-sm rounded-xl border-slate-200 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="Highlight location, benefits, or timeline constraints..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 shadow-lg shadow-emerald-500/10 transition-colors">
                Publish on Exchange
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Live Trading Feed</h2>
          {listings.length > 0 && <span className="text-sm font-medium text-slate-500">{listings.length} valid listings</span>}
        </div>
        
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l: any) => {
                const isMyListing = session?.user?.id === l.sellerId;
                return (
                    <div key={l.id} className={`bg-white rounded-2xl border ${isMyListing ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all`}>
                        <div className="p-6 flex-grow space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                        <Coins size={18} className="text-emerald-500" />
                                        {l.askingPrice?.toLocaleString()} MATIC
                                    </h3>
                                    <p className="text-xs font-mono text-slate-500 mt-1">{l.land?.landId}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded inline-flex ${l.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {l.status}
                                </span>
                            </div>
                            
                            <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                                {l.description || "No specific details provided for this asset distribution."}
                            </p>
                            
                            <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Listed By</p>
                                    <p className="font-medium text-slate-800 truncate">{isMyListing ? 'You' : l.seller?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Active Offers</p>
                                    <p className="font-medium text-emerald-600">{l._count?.offers || 0} Open</p>
                                </div>
                            </div>
                        </div>
                        
                        <Link href={`/marketplace/${l.id}`} className="bg-slate-50/50 border-t border-slate-100 p-4 text-center font-medium text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex justify-center items-center gap-1">
                            {isMyListing ? 'Manage Listing' : 'Make an Offer'} <ChevronRight size={16} className="opacity-50" />
                        </Link>
                    </div>
                );
            })}
          </div>
        ) : (
          <div className="bg-white border text-center border-slate-200 border-dashed rounded-2xl py-20 flex flex-col items-center">
            <ShoppingBag size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Exchange is Empty</h3>
            <p className="text-slate-500">There are currently no active secondary listings mapped to the network.</p>
          </div>
        )}
      </div>
    </div>
  );
}
