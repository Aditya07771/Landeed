"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Receipt, FileText, CheckCircle, Search, AlertCircle } from 'lucide-react';

export default function TaxPage() {
  const { data: session } = useSession();
  const [taxes, setTaxes] = useState<any[]>([]);
  const [form, setForm] = useState({ landId: '', taxYear: new Date().getFullYear(), assessedValue: '', taxAmount: '', dueDate: '' });

  useEffect(() => {
    fetch('/api/tax').then(res => res.json()).then(data => setTaxes(Array.isArray(data) ? data : []));
  }, []);

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tax', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/tax/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
          <Receipt size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tax Records</h1>
          <p className="text-slate-500 mt-1">Manage and track property tax assessments.</p>
        </div>
      </div>

      {session?.user?.role === 'AUTHORITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-slate-400" /> Issue Tax Notice
            </h2>
          </div>
          <form onSubmit={handleCreateTax} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Land ID</label>
                <input type="text" className="w-full text-sm rounded-lg border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white transition-colors" placeholder="CUID..." value={form.landId} onChange={e => setForm({...form, landId: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
                <input type="number" className="w-full text-sm rounded-lg border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white transition-colors" placeholder="YYYY" value={form.taxYear} onChange={e => setForm({...form, taxYear: +e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Assessed Value</label>
                <input type="number" className="w-full text-sm rounded-lg border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white transition-colors" placeholder="₹" value={form.assessedValue} onChange={e => setForm({...form, assessedValue: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tax Amount</label>
                <input type="number" className="w-full text-sm rounded-lg border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white transition-colors" placeholder="₹" value={form.taxAmount} onChange={e => setForm({...form, taxAmount: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
                <input type="date" className="w-full text-sm rounded-lg border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white transition-colors" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                Issue Notice
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">All Tax Records</h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{taxes.length} records</span>
        </div>
        {taxes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Land Reference</th>
                  <th className="px-6 py-3 font-medium text-center">Tax Year</th>
                  <th className="px-6 py-3 font-medium text-right">Assessed Val</th>
                  <th className="px-6 py-3 font-medium text-right">Tax Amount</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxes.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.land?.landId}</td>
                    <td className="px-6 py-4 text-center font-medium">{t.taxYear}</td>
                    <td className="px-6 py-4 text-right text-slate-500">₹{t.assessedValue?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{t.taxAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${t.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : t.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {session?.user?.role === 'AUTHORITY' && t.status === 'PENDING' ? (
                        <button onClick={() => handleUpdateStatus(t.id, 'PAID')} className="text-violet-600 hover:text-violet-700 font-medium text-xs bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Search className="text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 font-medium">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
