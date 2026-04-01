// file: components/DocumentList.tsx

'use client'

import { useEffect, useState } from 'react'
import { computeSHA256 } from '@/lib/hash'

interface Document {
    id: string
    type: string
    fileName: string
    ipfsCid: string
    hash: string
    gatewayUrl: string
    createdAt: string
}

interface Props {
    landId: string
}

const typeLabels: Record<string, string> = {
    OWNERSHIP_PROOF: 'Ownership Proof',
    REGISTRY_PAPER: 'Registry Paper',
    TAX_RECEIPT: 'Tax Receipt',
    MAP_DOCUMENT: 'Map Document'
}

export default function DocumentList({ landId }: Props) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState<string | null>(null)
    const [verifyResult, setVerifyResult] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchDocuments()
    }, [landId])

    async function fetchDocuments() {
        const res = await fetch(`/api/documents?landId=${landId}`)
        const data = await res.json()
        setDocuments(data)
        setLoading(false)
    }

    async function verifyDocument(doc: Document) {
        setVerifying(doc.id)

        try {
            const res = await fetch(doc.gatewayUrl)
            const blob = await res.blob()
            const file = new File([blob], doc.fileName)
            const currentHash = await computeSHA256(file)

            const isValid = currentHash.toLowerCase() === doc.hash.toLowerCase()
            setVerifyResult(prev => ({ ...prev, [doc.id]: isValid }))
        } catch (error) {
            setVerifyResult(prev => ({ ...prev, [doc.id]: false }))
        } finally {
            setVerifying(null)
        }
    }

    if (loading) return <p>Loading documents...</p>

    if (documents.length === 0) {
        return <p className="text-gray-500">No documents uploaded</p>
    }

    return (
        <div className="space-y-2">
            {documents.map(doc => (
                <div key={doc.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-sm text-gray-500">{typeLabels[doc.type] || doc.type}</p>
                            <p className="text-xs font-mono text-gray-400">
                                CID: {doc.ipfsCid.slice(0, 16)}...
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={doc.gatewayUrl}
                                target="_blank"
                                className="text-sm text-blue-500"
                            >
                                View
                            </a>
                            <button
                                onClick={() => verifyDocument(doc)}
                                disabled={verifying === doc.id}
                                className="text-sm text-green-500"
                            >
                                {verifying === doc.id ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>

                    {verifyResult[doc.id] !== undefined && (
                        <p className={`text-sm mt-1 ${verifyResult[doc.id] ? 'text-green-600' : 'text-red-600'}`}>
                            {verifyResult[doc.id] ? '✓ Hash verified - Document unchanged' : '✗ Hash mismatch - Document may be altered'}
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}