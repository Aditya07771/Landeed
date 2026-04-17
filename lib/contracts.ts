// file: lib/contracts.ts

import { ethers } from 'ethers'

export const LAND_REGISTRY_ABI = [
    "function registerLand(string memory _landId, bytes32 _documentHash) external returns (bool)",
    "function getLand(string memory _landId) external view returns (string memory, address, uint8, bytes32, uint256)",
    "function updateLandStatus(string memory _landId, uint8 _newStatus) external returns (bool)",
    "function transferOwnership(string memory _landId, address _newOwner) external returns (bool)",
    "function updateDocumentHash(string memory _landId, bytes32 _newHash) external returns (bool)",
    "function verifyDocumentHash(string memory _landId, bytes32 _hash) external view returns (bool)",
    "function getLandCount() external view returns (uint256)",
    "event LandRegistered(string indexed landId, address indexed owner, bytes32 documentHash, uint256 timestamp)",
    "event LandStatusUpdated(string indexed landId, uint8 oldStatus, uint8 newStatus, uint256 timestamp)",
    "event LandOwnershipTransferred(string indexed landId, address indexed previousOwner, address indexed newOwner, uint256 timestamp)"
] as const

export const ACQUISITION_ABI = [
    "function requestAcquisition(string memory _landId, uint256 _amount) external returns (bool)",
    "function verifyLand(string memory _landId, string memory _notes) external returns (bool)",
    "function approveAcquisition(string memory _landId) external returns (bool)",
    "function rejectAcquisition(string memory _landId, string memory _reason) external returns (bool)",
    "function transferOwnership(string memory _landId, address _newOwner) external returns (bool)",
    "function getAcquisition(string memory _landId) external view returns (address, address, uint8, uint256, string memory, uint256, uint256)",
    "function addAuthority(address _authority) external",
    "function addVerifier(address _verifier) external",
    "event AcquisitionRequested(string indexed landId, address indexed authority, uint256 amount, uint256 timestamp)",
    "event LandVerified(string indexed landId, address indexed verifier, string notes, uint256 timestamp)",
    "event AcquisitionApproved(string indexed landId, address indexed authority, uint256 timestamp)",
    "event AcquisitionRejected(string indexed landId, address indexed verifier, string reason, uint256 timestamp)",
    "event OwnershipTransferred(string indexed landId, address indexed previousOwner, address indexed newOwner, uint256 timestamp)"
] as const




// file: lib/contracts.ts (ADD Escrow functions)

// ... existing code ...

export const ESCROW_ABI = [
  "function lockFunds(string memory _landId, address _landOwner) external payable returns (bool)",
  "function releaseFunds(string memory _landId) external returns (bool)",
  "function refundFunds(string memory _landId) external returns (bool)",
  "function getPayment(string memory _landId) external view returns (address, address, uint256, uint8, uint256, uint256)",
  "function getBalance() external view returns (uint256)",
  "event FundsLocked(string indexed landId, address indexed authority, address indexed landOwner, uint256 amount, uint256 timestamp)",
  "event FundsReleased(string indexed landId, address indexed landOwner, uint256 amount, uint256 timestamp)",
  "event FundsRefunded(string indexed landId, address indexed authority, uint256 amount, uint256 timestamp)"
] as const

/** Ethers v6 resolves non-`0x`+40hex strings as ENS names; Mumbai has no ENS → cryptic UNSUPPORTED_OPERATION. */
function envContractAddress(envName: string, value: string | undefined): string {
    const raw = (value ?? '').trim()
    if (!raw) {
        throw new Error(`${envName} is not set. Add the deployed contract address to .env.local`)
    }
    if (!ethers.isAddress(raw)) {
        throw new Error(
            `${envName} must be a full 0x-prefixed address (40 hex digits). ` +
                `Current value is invalid or a placeholder — that triggers ENS resolution and fails on Polygon Mumbai.`
        )
    }
    return ethers.getAddress(raw)
}

let cachedContractAddresses: {
    landRegistry: string
    acquisition: string
    escrow: string
} | null = null

export function getContractAddresses() {
    if (!cachedContractAddresses) {
        cachedContractAddresses = {
            landRegistry: envContractAddress(
                'NEXT_PUBLIC_LAND_REGISTRY_ADDRESS',
                process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS
            ),
            acquisition: envContractAddress(
                'NEXT_PUBLIC_ACQUISITION_ADDRESS',
                process.env.NEXT_PUBLIC_ACQUISITION_ADDRESS
            ),
            escrow: envContractAddress('NEXT_PUBLIC_ESCROW_ADDRESS', process.env.NEXT_PUBLIC_ESCROW_ADDRESS)
        }
    }
    return cachedContractAddresses
}

/** @deprecated Prefer getContractAddresses() — getters validate env on first use */
export const CONTRACT_ADDRESSES = {
    get landRegistry() {
        return getContractAddresses().landRegistry
    },
    get acquisition() {
        return getContractAddresses().acquisition
    },
    get escrow() {
        return getContractAddresses().escrow
    }
}

export async function getEscrowContract(withSigner = false) {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet found')
  
  if (withSigner) {
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESSES.escrow, ESCROW_ABI, signer)
  }
  
  return new ethers.Contract(CONTRACT_ADDRESSES.escrow, ESCROW_ABI, provider)
}

export async function lockFundsOnChain(landId: string, landOwnerAddress: string, amountInMatic: number) {
  const contract = await getEscrowContract(true)
  const amountWei = ethers.parseEther(amountInMatic.toString())
  const tx = await contract.lockFunds(landId, landOwnerAddress, { value: amountWei })
  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber
  }
}

export async function releaseFundsOnChain(landId: string) {
  const contract = await getEscrowContract(true)
  const tx = await contract.releaseFunds(landId)
  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber
  }
}

export async function refundFundsOnChain(landId: string) {
  const contract = await getEscrowContract(true)
  const tx = await contract.refundFunds(landId)
  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber
  }
}

export async function updateDocHashOnChain(landId: string, docHash: string) {
  const contract = await getLandRegistryContract(true)
  const hashBytes = ethers.id(docHash)
  const tx = await contract.updateDocumentHash(landId, hashBytes)
  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber
  }
}



export function getProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum)
    }
    return null
}

export async function getSigner() {
    const provider = getProvider()
    if (!provider) throw new Error('No wallet found')
    return provider.getSigner()
}

export async function getLandRegistryContract(withSigner = false) {
    const provider = getProvider()
    if (!provider) throw new Error('No wallet found')

    if (withSigner) {
        const signer = await provider.getSigner()
        return new ethers.Contract(CONTRACT_ADDRESSES.landRegistry, LAND_REGISTRY_ABI, signer)
    }

    return new ethers.Contract(CONTRACT_ADDRESSES.landRegistry, LAND_REGISTRY_ABI, provider)
}

export async function getAcquisitionContract(withSigner = false) {
    const provider = getProvider()
    if (!provider) throw new Error('No wallet found')

    if (withSigner) {
        const signer = await provider.getSigner()
        return new ethers.Contract(CONTRACT_ADDRESSES.acquisition, ACQUISITION_ABI, signer)
    }

    return new ethers.Contract(CONTRACT_ADDRESSES.acquisition, ACQUISITION_ABI, provider)
}

export async function registerLandOnChain(landId: string, documentHash: string) {
    const contract = await getLandRegistryContract(true)
    const hashBytes = ethers.id(documentHash)
    const tx = await contract.registerLand(landId, hashBytes)
    const receipt = await tx.wait()
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    }
}

export async function requestAcquisitionOnChain(landId: string, amount: number) {
    const contract = await getAcquisitionContract(true)
    const amountWei = ethers.parseEther(amount.toString())
    const tx = await contract.requestAcquisition(landId, amountWei)
    const receipt = await tx.wait()
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    }
}

export async function verifyLandOnChain(landId: string, notes: string) {
    const contract = await getAcquisitionContract(true)
    const tx = await contract.verifyLand(landId, notes)
    const receipt = await tx.wait()
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    }
}

export async function approveAcquisitionOnChain(landId: string) {
    const contract = await getAcquisitionContract(true)
    const tx = await contract.approveAcquisition(landId)
    const receipt = await tx.wait()
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    }
}

export async function rejectAcquisitionOnChain(landId: string, reason: string) {
    const contract = await getAcquisitionContract(true)
    const tx = await contract.rejectAcquisition(landId, reason)
    const receipt = await tx.wait()
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    }
}

export async function transferOwnershipOnChain(landId: string, newOwner: string) {
    const contract = await getAcquisitionContract(true)
    const tx = await contract.transferOwnership(landId, newOwner)
    const receipt = await tx.wait()
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
    }
}

export async function getLandFromChain(landId: string) {
    const contract = await getLandRegistryContract(false)
    const result = await contract.getLand(landId)
    return {
        landId: result[0],
        owner: result[1],
        status: Number(result[2]),
        documentHash: result[3],
        timestamp: Number(result[4])
    }
}

export async function connectWallet(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed')
    }

    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
    })

    return accounts[0]
}

export async function getCurrentWallet(): Promise<string | null> {
    if (typeof window === 'undefined' || !window.ethereum) {
        return null
    }

    const accounts = await window.ethereum.request({
        method: 'eth_accounts'
    })

    return accounts[0] || null
}