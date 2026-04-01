// file: components/DocumentUpload.tsx

'use client'

import { useState } from 'react'
import { computeSHA256 } from '@/lib/hash'

interface Props {
    landId: string
    onUploadComplete: () => void
}

const DOC_TYPES = [
    { value: 'OWNERSHIP_PROOF', label: 'Ownership Proof' },
    { value: 'REGISTRY_PAPER', label: 'Registry Paper' },
    { value: 'TAX_RECEIPT', label: 'Tax Receipt' },
    { value: 'MAP_DOCUMENT', label: 'Map Document' }
]

export default function DocumentUpload({ landId, onUploadComplete }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [docType, setDocType] = useState('')
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState('')
    const [result, setResult] = useState<{ cid: string; gatewayUrl: string } | null>(null)

    async function handleUpload() {
        if (!file || !docType) {
            setError('Select file and document type')
            return
        }

        setUploading(true)
        setError('')
        setProgress('Computing hash...')

        try {
            const hash = await computeSHA256(file)
            setProgress('Uploading to IPFS...')

            const formData = new FormData()
            formData.append('file', file)
            formData.append('landId', landId)
            formData.append('type', docType)
            formData.append('hash', hash)

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Upload failed')
            }

            const data = await res.json()
            setResult({ cid: data.cid, gatewayUrl: data.gatewayUrl })
            setProgress('Upload complete!')
            setFile(null)
            setDocType('')
            onUploadComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4 p-4 border rounded">
            <h3 className="font-bold">Upload Document</h3>

            <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2 border rounded"
            >
                <option value="">Select document type</option>
                {DOC_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />

            {file && (
                <p className="text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {progress && <p className="text-blue-500 text-sm">{progress}</p>}

            <button
                onClick={handleUpload}
                disabled={uploading || !file || !docType}
                className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Upload to IPFS'}
            </button>

            {result && (
                <div className="p-2 bg-green-50 rounded text-sm">
                    <p>CID: <span className="font-mono">{result.cid}</span></p>
                    <a href={result.gatewayUrl} target="_blank" className="text-blue-500">
                        View on IPFS Gateway
                    </a>
                </div>
            )}
        </div>
    )
}