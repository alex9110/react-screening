'use client'

import { WalletButton } from '@/components/solana/solana-provider'

export function WalletConnectionPrompt() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 break-words">
        Portfolio Dashboard - Please Connect Wallet
      </h1>
      <div className="p-4 md:p-6 lg:p-8 rounded-lg border-4 border-yellow-500">
        <p className="text-sm md:text-lg lg:text-2xl font-bold break-words mb-6">
          ⚠️ WALLET CONNECTION REQUIRED - Please connect your Solana wallet to view your cryptocurrency portfolio
        </p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
