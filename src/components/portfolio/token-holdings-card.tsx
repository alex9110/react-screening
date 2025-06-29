'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TokenLoadingSkeleton } from '@/components/ui/loading-skeleton'
import { TokenInfo } from '@/types/portfolio'
import { TokenItem } from './token-item'

interface TokenHoldingsCardProps {
  tokens: TokenInfo[]
  isLoading: boolean
}

export function TokenHoldingsCard({ tokens, isLoading }: TokenHoldingsCardProps) {
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎭 TokenHoldingsCard render:', {
      tokensLength: tokens.length,
      isLoading,
      shouldShowEmpty: !isLoading && tokens.length === 0,
      tokens: tokens,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl break-words">Token Holdings & Assets</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TokenLoadingSkeleton />
        ) : tokens.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🪙</div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No tokens found</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your wallet doesn't contain any tokens yet. You can get some tokens by using a DEX or receiving transfers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token, index) => (
              <TokenItem key={`${token.mint}-${index}`} token={token} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
