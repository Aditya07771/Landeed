"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { computeSHA256 } from '@/lib/hash';

export default function DisputeDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [dispute, setDispute] = useState<any>(null);
  const [verifiers, setVerifiers] = useState([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/dispute/${id}`).then(res => res.json()).then(setDispute);
    if (session?.user?.role === 'AUTHORITY') {
      fetch('/api/user?role=VERIFIER').then(res => res.json()).then(setVerifiers);
    }
  }, [id, session]);

  const handleAssign = async (verifierId: string) => {
    const res = await fetch(`/api/dispute/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifierId })
    });
    if (res.ok) {
      const data = await res.json();
      setDispute((prev: any) => ({ ...prev, assignedTo: data.assignedTo, status: data.status }));
    }
  };

  const handleResolveDismiss = async (action: 'RESOLVE' | 'DISMISS', resolution: string) => {
    const res = await fetch(`/api/dispute/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, resolution })
    });
    if (res.ok) {
      setDispute((prev: any) => ({ ...prev, status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED', resolution }));
    }
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const hash = await computeSHA256(file);

      const formData = new FormData();
      formData.append('file', file);

      const pinataRes = await fetch('/api/pinata', { method: 'POST', body: formData });
      const pinataData = await pinataRes.json().catch(() => ({}));
      if (!pinataRes.ok || !pinataData.IpfsHash) {
        throw new Error(pinataData.error || `IPFS upload failed (${pinataRes.status})`);
      }

      const eviFormData = new FormData();
      eviFormData.append('ipfsCid', pinataData.IpfsHash);
      eviFormData.append('fileName', file.name);
      eviFormData.append('hash', hash);

      const eviRes = await fetch(`/api/dispute/${id}/evidence`, {
        method: 'POST',
        body: eviFormData
      });
      if (eviRes.ok) {
        const refreshed = await fetch(`/api/dispute/${id}`).then(r => r.json());
        if (!refreshed.error) setDispute(refreshed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!dispute) return <div className='text-black'>Loading...</div>;

  return (
    <div className="text-slate-900 p-6 max-w-5xl mx-auto space-y-8">
      <h1 className='text-slate-900 text-3xl font-bold border-b pb-2'>Dispute Details</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="mb-2"><strong className="text-slate-700 w-24 inline-block">Land:</strong> {dispute.land?.landId}</p>
        <p className="mb-2"><strong className="text-slate-700 w-24 inline-block">Category:</strong> {dispute.category}</p>
        <p className="mb-2"><strong className="text-slate-700 w-24 inline-block">Description:</strong> {dispute.description}</p>
        <p className="mb-2"><strong className="text-slate-700 w-24 inline-block">Status:</strong> {dispute.status}</p>
        <p className="mb-2"><strong className="text-slate-700 w-24 inline-block">Resolution:</strong> {dispute.resolution}</p>
      </div>

      {session?.user?.role === 'AUTHORITY' && dispute.status === 'OPEN' && (
        <div>
          <h2 className='text-black'>Assign Verifier</h2>
          <select onChange={e => handleAssign(e.target.value)}>
            <option value="">Select Verifier</option>
            {verifiers.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      )}

      {session?.user?.role === 'AUTHORITY' && dispute.status === 'UNDER_REVIEW' && (
        <div>
          <h2>Resolve / Dismiss</h2>
          <form onSubmit={(e: any) => {
            e.preventDefault();
            handleResolveDismiss(e.nativeEvent.submitter.value, e.target.resolution.value);
          }}>
            <textarea name="resolution" required />
            <button type="submit" value="RESOLVE">Resolve</button>
            <button type="submit" value="DISMISS">Dismiss</button>
          </form>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Evidence files</h2>
        <p className="mt-1 text-sm text-slate-500">
          Files are stored on IPFS (Pinata). Each row links to the public gateway so anyone with this page access can open or download the file. The same CID appears in your Pinata dashboard.
        </p>
        {!dispute.evidence?.length ? (
          <p className="mt-4 text-sm text-slate-600">No evidence uploaded yet for this dispute.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {dispute.evidence.map((e: any) => {
              const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${e.ipfsCid}`;
              const who = e.uploader?.name || e.uploader?.email || e.uploadedBy || 'Unknown';
              return (
                <li
                  key={e.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{e.fileName}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded by <span className="text-slate-700">{who}</span>
                      {e.createdAt ? ` · ${new Date(e.createdAt).toLocaleString()}` : ''}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500 break-all">
                      SHA-256: {e.hash}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400 break-all">
                      CID: {e.ipfsCid}
                    </p>
                  </div>
                  <a
                    href={gatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    View / download
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {(dispute.assignedTo === session?.user?.id || session?.user?.role === 'AUTHORITY' || dispute.filedById === session?.user?.id) && (
        <div className="upload-evidence-container">
          <style>{`
            .upload-evidence-container {
              margin-top: 2rem;
              padding: 2rem;
              background: linear-gradient(145deg, #ffffff, #f8fafd);
              border-radius: 12px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.04);
              border: 1px solid rgba(226, 232, 240, 0.8);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .upload-evidence-container:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            }
            .upload-title {
              font-size: 1.25rem;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 1.25rem;
              margin-top: 0;
            }
            .upload-form {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            .file-input {
              flex: 1;
              padding: 0.75rem 1rem;
              border: 2px dashed #cbd5e1;
              border-radius: 8px;
              background-color: #f8fafc;
              color: #475569;
              cursor: pointer;
              transition: border-color 0.2s ease, background-color 0.2s ease;
            }
            .file-input:hover {
              border-color: #3b82f6;
              background-color: #eff6ff;
            }
            .upload-btn {
              padding: 0.75rem 2rem;
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.1s ease, box-shadow 0.2s ease;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            .upload-btn:hover {
              transform: scale(1.02);
              box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
            }
            .upload-btn:active {
              transform: scale(0.98);
            }
          `}</style>
          <h2 className="upload-title">Upload Evidence</h2>
          <form className="upload-form" onSubmit={handleUploadEvidence}>
            <input className="file-input" type="file" onChange={e => setFile(e.target.files?.[0] || null)} required />
            <button className="upload-btn" type="submit">Upload</button>
          </form>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
      <ul>
        {dispute.timeline?.map((t: any) => (
          <li key={t.id}>{new Date(t.createdAt).toLocaleString()} - {t.action} {t.note}</li>
        ))}
      </ul>
    </div>
  );
}
