// // file: lib/wagmi.ts

// import { http, createConfig } from 'wagmi'
// import { polygonMumbai, polygon, localhost } from 'wagmi/chains'
// import { injected } from 'wagmi/connectors'

// const polygonAmoy = {
//     id: 80002,
//     name: 'Polygon Amoy',
//     nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
//     rpcUrls: {
//         default: { http: ['https://rpc-amoy.polygon.technology'] },
//     },
//     blockExplorers: {
//         default: { name: 'OKLink', url: 'https://www.oklink.com/amoy' },
//     },
//     testnet: true,
// } as const

// export const config = createConfig({
//     chains: [localhost, polygonMumbai, polygonAmoy, polygon],
//     connectors: [injected()],
//     transports: {
//         [localhost.id]: http(),
//         [polygonMumbai.id]: http(),
//         [polygonAmoy.id]: http(),
//         [polygon.id]: http(),
//     },
// })


// lib/wagmi.ts
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { polygonMumbai, polygon } from 'wagmi/chains'

// export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!
export const projectId = 'ac3ab543ebfbf9228277e0e611526ca9'

const metadata = {
    name: 'LandChain',
    description: 'Blockchain Land Registry System',
    url: 'https://landchain.app',
    icons: ['https://landchain.app/icon.png']
}

const chains = [polygonMumbai, polygon] as const

export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata
})