'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { formatBalance, formatCurrency } from '@/lib/portfolio-utils'
import { LAMPORTS_PER_SOL } from '@/lib/constants'
import Image from 'next/image'

interface SolBalanceCardProps {
  balance: number
  networkLabel?: string
  isLoading: boolean
  solPrice?: number // Optional real-time SOL price
}

export function SolBalanceCard({ balance, networkLabel, isLoading, solPrice }: SolBalanceCardProps) {
  const solInTokens = balance / LAMPORTS_PER_SOL //TODO You can't do that :)
  const solValue = solPrice ? solInTokens * solPrice : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl break-words">SOL Balance Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                <Image src="/solana-logo.svg" alt="Solana Logo" width={32} height={32} className="w-full h-full" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold break-words">{formatBalance(balance)} SOL</p>
                {solPrice ? (
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                    ≈ ${formatCurrency(solValue)} USD
                  </p>
                ) : (
                  <p className="text-lg md:text-xl text-gray-500 dark:text-gray-500">Price unavailable</p>
                )}
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-500 break-words">
              Current Network: {networkLabel || 'Unknown'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
