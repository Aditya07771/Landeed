## Land Acquisition Blockchain (LandChain)

A full‑stack land registry + acquisition workflow built with **Next.js (App Router)**, **PostgreSQL (Prisma)**, and **EVM smart contracts (Hardhat + Solidity)**.

It models the end‑to‑end lifecycle of a land parcel:

- **Registration**: owner registers land metadata + document hash (on-chain + DB).
- **Acquisition**: authorities request acquisition, verifiers verify/reject, authorities approve and transfer ownership.
- **Payments**: escrow-style fund lock/release/refund.
- **Disputes**: owners/authorities file disputes and upload evidence to **IPFS (Pinata)**; evidence is stored in DB with CID + hash.

---

## Tech stack

### Frontend

- **Next.js 14.2 (App Router)** (`app/`): UI + server routes.
- **React 18** + **TypeScript**.
- **Tailwind CSS**: styling.
- **Radix UI** (`@radix-ui/*`): accessible UI primitives.
- **lucide-react**: icons.
- **framer-motion**: animations.
- **Leaflet + React-Leaflet**: interactive map UI.
- **@turf/turf**: geo / polygon utilities.
- **qrcode**: QR generation for land pages.
- **@tanstack/react-query / react-table**: data fetching patterns and tabular UI (where used).

### Auth & Sessions

- **NextAuth v4** with **Credentials Provider** (`lib/auth.ts`)
  - Passwords hashed with **bcryptjs**
  - JWT session strategy (role + user id + wallet address embedded in session token)

### Backend / API

- **Next.js Route Handlers** under `app/api/**/route.ts`
- **Prisma ORM** (`prisma/schema.prisma`, `lib/prisma.ts`)
- **PostgreSQL** (commonly used with Neon; any Postgres works)

### Web3 / Blockchain

- **Solidity 0.8.19** smart contracts in `blockchain/contracts/`
  - `LandRegistry.sol`
  - `Acquisition.sol`
  - `Escrow.sol`
  - plus dispute/transfer helpers (see folder)
- **Hardhat** (`blockchain/hardhat.config.ts`) with networks:
  - `localhost` (Hardhat node)
  - `matic-mumbai` (80001)
  - `matic-amoy` (80002)
- **ethers v6**: contract calls from the Next.js app (`lib/contracts.ts`)
- **wagmi v2 + Web3Modal**: wallet connection (`lib/wagmi.ts`, `components/WalletConnect`)

### Storage / Documents

- **Pinata IPFS** uploads:
  - `/api/documents` (document upload for lands)
  - `/api/pinata` (generic upload used by dispute evidence)
- Evidence/documents store:
  - `ipfsCid` (CID from Pinata)
  - `hash` (SHA-256 computed client-side in `lib/hash.ts`)
  - `gatewayUrl` uses `https://gateway.pinata.cloud/ipfs/<CID>`

---

## Project structure (high-level)

- `app/`: Next.js pages + route handlers
  - `app/(app)/...`: authenticated app screens (dashboard, lands, dispute, authority, verifier, etc.)
  - `app/api/...`: REST-ish API endpoints
- `components/`: reusable UI components (`DocumentList`, `WalletConnect`, actions, etc.)
- `lib/`:
  - `auth.ts`: NextAuth config (credentials login)
  - `contracts.ts`: ethers helpers + contract ABIs + address validation
  - `pinata.ts`: Pinata helpers
  - `hash.ts`: SHA-256 helpers
  - `prisma.ts`: Prisma client singleton
- `prisma/`:
  - `schema.prisma`: DB schema (users, lands, acquisition, disputes, evidence, marketplace, etc.)
  - `seed.ts`: seed script
- `blockchain/`: Hardhat project (Solidity contracts + deploy scripts)

---

## Features (what you can do)

### Roles

The app is role-driven via `session.user.role` (from NextAuth JWT):

- **OWNER**: register lands, upload land documents, file disputes, upload evidence, view marketplace activity.
- **AUTHORITY**: request acquisitions, approve/reject workflows, assign verifiers, manage disputes.
- **VERIFIER**: review assigned/pending requests, approve/verify or reject, upload dispute-related evidence (when allowed).
- **ADMIN**: user administration and oversight endpoints (where enabled).

### Dispute evidence (where to see uploaded files)

Evidence uploaded on a dispute is shown on the dispute detail page:

- Navigate to **Disputes** → select a dispute → open **`/dispute/<disputeId>`**
- Evidence files are stored in **Postgres** (`DisputeEvidence` table) and link to **Pinata gateway** with the CID.

---

## Getting started (local development)

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database (local or managed like Neon)
- Optional: **MetaMask** (or any injected EIP-1193 wallet) for on-chain actions

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` (recommended) or use `.env` (used by Hardhat as configured).

Minimum required for the web app:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# WalletConnect / Web3Modal (recommended)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"

# Pinata (for IPFS uploads)
PINATA_JWT="your_pinata_jwt"

# Contract Addresses (set after deploying contracts)
NEXT_PUBLIC_LAND_REGISTRY_ADDRESS="0x..."
NEXT_PUBLIC_ACQUISITION_ADDRESS="0x..."
NEXT_PUBLIC_ESCROW_ADDRESS="0x..."
```

Hardhat / blockchain deployment variables (used by `blockchain/hardhat.config.ts`):

```bash
PRIVATE_KEY="0x<deployer-private-key>"
MUMBAI_RPC_URL="https://rpc-mumbai.maticvigil.com"
AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
```

Notes:

- **Do not commit secrets**. Rotate any keys that have been exposed publicly.
- Contract address env vars **must be full 0x addresses**. Ethers v6 treats invalid address strings as ENS names (which fails on Polygon testnets).

### 3) Set up the database

Generate Prisma client (also runs on `postinstall`):

```bash
npm run postinstall
```

Then apply migrations (if your repo contains them) or push schema:

```bash
npx prisma db push
```

Optionally seed:

```bash
npx prisma db seed
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Smart contracts (local + testnets)

The contracts live in `blockchain/` as a separate Hardhat project.

### Local chain (recommended for development)

Terminal A: start a local node

```bash
cd blockchain
npm install
npm run node
```

Terminal B: deploy to local node

```bash
cd blockchain
npm run deploy:local
```

After deploy, copy the printed contract addresses into:

- `NEXT_PUBLIC_LAND_REGISTRY_ADDRESS`
- `NEXT_PUBLIC_ACQUISITION_ADDRESS`
- `NEXT_PUBLIC_ESCROW_ADDRESS`

Restart `npm run dev` so Next.js picks up the updated env vars.

### Deploy to Polygon testnets

```bash
cd blockchain
npm run deploy:mumbai
# or
npm run deploy:amoy
```

---

## Common scripts

Web app (root):

- `npm run dev`: start Next.js dev server
- `npm run build`: production build
- `npm run start`: start production server
- `npm run lint`: lint

Blockchain (`blockchain/`):

- `npm run compile`: compile contracts
- `npm run test`: run contract tests
- `npm run node`: start local Hardhat chain
- `npm run deploy:local | deploy:mumbai | deploy:amoy`: deploy scripts

---

## Troubleshooting

### “network does not support ENS” (ethers v6) on Polygon testnets

This usually means an address is **missing/invalid** (e.g. `NEXT_PUBLIC_ACQUISITION_ADDRESS` is empty or a placeholder like `0x...`).
Fix your env vars with real deployed addresses and restart the dev server.

### Evidence uploaded but not visible in UI

Pinata upload ≠ saved evidence record. The flow is:

1) upload file to Pinata (gets CID)
2) POST evidence metadata to `/api/dispute/<id>/evidence` (stores in Postgres)
3) view it in `/dispute/<id>` under **Evidence files**

---

## License

MIT (or update this section if you plan a different license).
