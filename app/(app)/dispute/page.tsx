"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Scale, MessageSquareWarning, ChevronRight, Search } from 'lucide-react';

export default function DisputePage() {
  const { data: session } = useSession();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [form, setForm] = useState({ landId: '', category: 'OWNERSHIP_CONFLICT', description: '' });
  const [lands, setLands] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dispute').then(res => res.json()).then(data => setDisputes(Array.isArray(data) ? data : []));
    if (session?.user?.role === 'OWNER') {
      fetch('/api/lands').then(res => res.json()).then(data => setLands(Array.isArray(data) ? data : []));
    }
  }, [session]);

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/dispute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const newDispute = await res.json();
      setDisputes(prev => [...prev, newDispute] as any);
      setForm({ landId: '', category: 'OWNERSHIP_CONFLICT', description: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <Scale size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dispute Portal</h1>
          <p className="text-slate-500 mt-1">File or manage property conflict appeals and investigations.</p>
        </div>
      </div>

      {session?.user?.role === 'OWNER' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquareWarning size={18} className="text-amber-500" /> Lodge a Dispute Configuration
            </h2>
          </div>
          <form onSubmit={handleFileDispute} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Affected Land</label>
                <select className="w-full text-sm rounded-xl border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors" value={form.landId} onChange={e => setForm({...form, landId: e.target.value})} required>
                  <option value="">Select an owned land parcel</option>
                  {lands.map((land: any) => (
                    <option key={land.id} value={land.id}>{land.landId} - {land.location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Conflict Category</label>
                <select className="w-full text-sm rounded-xl border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                  <option value="OWNERSHIP_CONFLICT">Ownership Conflicting Claims</option>
                  <option value="BOUNDARY_DISPUTE">Boundary Overlap Dispute</option>
                  <option value="FRAUDULENT_REGISTRATION">Fraud Investigation</option>
                  <option value="ENCUMBRANCE">Hidden Encumbrances</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Formal Description of Facts</label>
                <textarea rows={4} className="w-full text-sm rounded-xl border-slate-200 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="Detailed reasoning and summary to dispatch to authorities..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-amber-500 text-white hover:bg-amber-600 px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-amber-500/20 transition-all">
                Submit Filing
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Active Jurisdiction Filings</h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{disputes.length} ongoing</span>
        </div>
        
        {disputes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Land Token</th>
                  <th className="px-6 py-3 font-medium">Conflict Type</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((d: any) => {
                    const isResolved = d.status === 'RESOLVED' || d.status === 'DISMISSED';
                    return (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-mono text-xs text-slate-600">{d.land?.landId || 'Unknown'}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">
                                {d.category.replace(/_/g, ' ')}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                                    ${isResolved ? 'bg-slate-100 text-slate-600' : 
                                    d.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {d.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link href={`/dispute/${d.id}`} className="inline-flex items-center text-violet-600 font-medium hover:text-violet-800 transition-colors">
                                    Manage <ChevronRight size={16} className="ml-1 opacity-50 group-hover:opacity-100" />
                                </Link>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Search className="text-slate-300 mb-4" size={40} />
            <p className="text-slate-500 font-medium">No disputes filed within your jurisdiction</p>
          </div>
        )}
      </div>
    </div>
  );
}
