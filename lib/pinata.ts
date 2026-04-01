// file: lib/pinata.ts

const PINATA_API_KEY = process.env.PINATA_API_KEY || ''
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || ''
const PINATA_JWT = process.env.PINATA_JWT || ''

export interface PinataResponse {
    IpfsHash: string
    PinSize: number
    Timestamp: string
}

export async function uploadToPinata(file: File): Promise<PinataResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
            type: file.type,
            size: file.size.toString()
        }
    })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({
        cidVersion: 1
    })
    formData.append('pinataOptions', options)

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`
        },
        body: formData
    })

    if (!res.ok) {
        const error = await res.text()
        throw new Error(`Pinata upload failed: ${error}`)
    }

    return res.json()
}

export async function uploadBufferToPinata(
    buffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<PinataResponse> {
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType })
    const file = new File([blob], fileName, { type: mimeType })
    return uploadToPinata(file)
}

export function getIPFSGatewayUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`
}

export async function unpinFromPinata(cid: string): Promise<boolean> {
    const res = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`
        }
    })

    return res.ok
}