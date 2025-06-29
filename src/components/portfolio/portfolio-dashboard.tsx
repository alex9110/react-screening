'use client'

import { useWalletUi } from '@wallet-ui/react'
import { usePortfolio } from '@/hooks/use-portfolio'
import { WalletConnectionPrompt } from './wallet-connection-prompt'
import { SolBalanceCard } from './sol-balance-card'
import { TokenHoldingsCard } from './token-holdings-card'
import { PortfolioValueCard } from './portfolio-value-card'

export function PortfolioDashboard() {
  const { cluster } = useWalletUi()
  const { portfolio, isLoading, error, fetchPortfolioData, isConnected, currentSolPrice } = usePortfolio()

  if (!isConnected) {
    return <WalletConnectionPrompt />
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 break-words">
        My Portfolio Dashboard for Cryptocurrency Assets
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <PortfolioValueCard totalValue={portfolio.totalValue} isLoading={isLoading} onRefresh={fetchPortfolioData} />
        <SolBalanceCard
          balance={portfolio.balance}
          networkLabel={cluster?.label}
          isLoading={isLoading}
          solPrice={currentSolPrice}
        />
        <TokenHoldingsCard tokens={portfolio.tokens} isLoading={isLoading} />
      </div>
    </div>
  )
}
