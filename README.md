# 🔐 Stacks Capsule

> **Decentralized Time-Locked Assets on Bitcoin**

Stacks Capsule is a trustless smart contract application that enables users to lock STX tokens with time-based releases tied to Bitcoin block heights. Built on Stacks, secured by Bitcoin.

![Stacks Capsule](https://img.shields.io/badge/Stacks-Testnet-5546ff?style=for-the-badge&logo=stacks&logoColor=white)
![Bitcoin](https://img.shields.io/badge/Secured%20by-Bitcoin-f7931a?style=for-the-badge&logo=bitcoin&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Smart Contract](#-smart-contract)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Tech Stack](#-tech-stack)

---

## 🌟 Overview

Stacks Capsule allows you to:

- **Lock STX tokens** with a specific recipient and release date
- **Use Bitcoin block heights** as an immutable time oracle
- **Create trustless transfers** that unlock automatically when conditions are met
- **Track capsule progress** with real-time visualization

### Use Cases

- 🎁 **Gift Giving**: Send birthday or holiday gifts that unlock on special dates
- 💰 **Savings**: Lock your own STX to prevent spending until a future date
- 📅 **Scheduled Payments**: Set up future payments tied to Bitcoin blocks
- 🏦 **Vesting**: Create token vesting schedules for teams or investors

---

## ⚙️ How It Works

### The Stacks-Bitcoin Relationship

Stacks is a layer-1 blockchain connected to Bitcoin. Every Stacks block is cryptographically linked to a Bitcoin block through a process called **Proof of Transfer (PoX)**. This means:

1. **Bitcoin Block Height** = The current position in Bitcoin's blockchain
2. **`burn-block-height`** = A Clarity variable that returns the current Bitcoin block height
3. **~10 minutes** = Average time between Bitcoin blocks

### Time-Locking Mechanism

```clarity
;; In our smart contract, we use burn-block-height for trustless time locks
(asserts! (>= burn-block-height (get release-block capsule)) ERR_NOT_REACHED)
```

When you create a capsule:
1. You specify a **target Bitcoin block height** for release
2. The contract locks your STX until that block is mined
3. Nobody—not even the contract deployer—can unlock it early
4. Once the target block is reached, only the recipient can claim

### Example Timeline

| Action | Block Height | Time |
|--------|--------------|------|
| Create capsule | 870,000 | Now |
| Target release | 870,144 | ~1 day later |
| Blocks until unlock | 144 | ~24 hours |

---

## 📁 Project Structure

```
StacksCapsule/
├── contracts/                 # Clarity smart contracts (Clarinet project)
│   ├── contracts/
│   │   └── stacks-capsule.clar
│   ├── tests/
│   │   └── stacks-capsule_test.ts
│   ├── settings/
│   │   ├── Devnet.toml
│   │   ├── Testnet.toml
│   │   └── Mainnet.toml
│   └── Clarinet.toml
│
├── frontend/                  # Next.js 14 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── CapsuleForm.tsx
│   │   │   ├── CapsuleCard.tsx
│   │   │   ├── CapsuleList.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── Footer.tsx
│   │   └── context/
│   │       └── StacksContext.tsx
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 📜 Smart Contract

### Contract: `stacks-capsule.clar`

#### Constants

| Name | Value | Description |
|------|-------|-------------|
| `ERR_NOT_AUTHORIZED` | `u101` | Caller is not the designated recipient |
| `ERR_NOT_REACHED` | `u102` | Target block hasn't been reached yet |
| `ERR_ALREADY_CLAIMED` | `u103` | Capsule has already been claimed |
| `ERR_INVALID_AMOUNT` | `u104` | Amount must be greater than 0 |
| `ERR_INVALID_BLOCK` | `u105` | Target block must be in the future |
| `ERR_CAPSULE_NOT_FOUND` | `u106` | Capsule ID doesn't exist |

#### Public Functions

##### `lock-stx`
```clarity
(lock-stx (recipient principal) (amount uint) (release-block uint) (memo (string-utf8 256)))
```
Creates a new time-locked capsule.

**Parameters:**
- `recipient`: The principal who can claim the STX
- `amount`: Amount in microSTX (1 STX = 1,000,000 microSTX)
- `release-block`: Bitcoin block height when claimable
- `memo`: Optional message (max 256 characters)

**Returns:** `(ok uint)` - The new capsule ID

##### `claim-stx`
```clarity
(claim-stx (id uint))
```
Claims STX from an unlocked capsule.

**Requirements:**
- Caller must be the designated recipient
- Current block must be >= release block
- Capsule status must be "open"

**Returns:** `(ok true)` on success

#### Read-Only Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `get-capsule-info` | `(optional ...)` | Full capsule metadata |
| `get-current-block` | `uint` | Current Bitcoin block height |
| `get-total-capsules` | `uint` | Total capsules created |
| `get-sender-capsules` | `{capsule-ids: (list)}` | All capsules sent by address |
| `get-recipient-capsules` | `{capsule-ids: (list)}` | All capsules for recipient |
| `is-claimable` | `bool` | Whether capsule can be claimed |
| `get-blocks-remaining` | `uint` | Blocks until unlock |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Clarinet](https://docs.hiro.so/clarinet/getting-started) v2.0+
- [Leather](https://leather.io/) or [Xverse](https://www.xverse.app/) wallet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/stacks-capsule.git
cd stacks-capsule
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Edit `.env.local` with your deployed contract address.

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Testing the Smart Contract

```bash
cd contracts
clarinet test
```

### Running Clarinet Console

```bash
cd contracts
clarinet console
```

---

## 🌐 Deployment

### Deploy Smart Contract to Testnet

1. **Get testnet STX**
   - Visit [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)

2. **Configure deployment**
   - Update `contracts/settings/Testnet.toml` with your mnemonic

3. **Deploy**
```bash
cd contracts
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

### Deploy Frontend to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variables from `.env.example`

3. **Deploy**
   - Vercel will automatically build and deploy

---

## 🛠 Tech Stack

### Smart Contracts
- **[Clarity](https://docs.stacks.co/clarity)** - Smart contract language for Stacks
- **[Clarinet](https://docs.hiro.so/clarinet)** - Development environment

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[Lucide React](https://lucide.dev/)** - Icons

### Stacks Integration
- **[@stacks/connect](https://github.com/hirosystems/connect)** - Wallet connection
- **[@stacks/transactions](https://github.com/hirosystems/stacks.js)** - Transaction building
- **[@stacks/network](https://github.com/hirosystems/stacks.js)** - Network configuration

---

## 🔒 Security

- **Immutable Time Locks**: Once created, capsules cannot be modified or unlocked early
- **Bitcoin Security**: Uses Bitcoin's consensus for time verification
- **Post Conditions**: Prevents unintended token transfers
- **No Admin Keys**: Contract has no special privileges for the deployer

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  <p>Built with ❤️ on <a href="https://stacks.co">Stacks</a></p>
  <p>Secured by <a href="https://bitcoin.org">Bitcoin</a></p>
</div>

