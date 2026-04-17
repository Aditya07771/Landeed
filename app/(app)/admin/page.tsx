"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Network, Search, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetch('/api/analytics').then(res => res.json()).then(setData);
      fetch('/api/user').then(res => res.json()).then(setUsers);
    }
  }, [session]);

  const updateUserRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (res.ok) window.location.reload();
  };

  const handleKyc = async (id: string, isKycVerified: boolean) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isKycVerified })
    });
    if (res.ok) window.location.reload();
  };

  if (!data) return (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20">
          <Network size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 mt-1">Platform monitoring and user role administration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Lands</h3>
            <p className="text-3xl font-bold text-slate-900">{data.totalLands}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Mortgage Val</h3>
            <p className="text-3xl font-bold text-slate-900">₹{data.totalMortgageValue?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Tax</h3>
            <p className="text-3xl font-bold text-rose-600">₹{data.taxRevenuePending?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Collected Tax</h3>
            <p className="text-3xl font-bold text-emerald-600">₹{data.taxRevenueCollected?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">User Identity Management</h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{users.length} registered</span>
        </div>
        
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">User Profile</th>
                  <th className="px-6 py-3 font-medium">Role Assignment</th>
                  <th className="px-6 py-3 font-medium text-center">KYC Status</th>
                  <th className="px-6 py-3 font-medium text-center">Wallet Config</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-white border text-xs font-medium border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                        value={u.role || 'OWNER'} 
                        onChange={e => updateUserRole(u.id, e.target.value)}
                      >
                        <option value="OWNER">Owner</option>
                        <option value="AUTHORITY">Authority</option>
                        <option value="VERIFIER">Verifier</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            {u.isKycVerified ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                                    <ShieldCheck size={14} /> Verified
                                </span>
                            ) : (
                                <button onClick={() => handleKyc(u.id, true)} className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded transition-colors">
                                    Needs Review
                                </button>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {u.walletAddress ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-slate-100 text-slate-600">
                                {u.walletAddress.substring(0, 6)}...{u.walletAddress.substring(u.walletAddress.length - 4)}
                            </span>
                        ) : (
                            <span className="text-slate-400 text-xs italic">Unconnected</span>
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
            <p className="text-slate-500 font-medium">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
