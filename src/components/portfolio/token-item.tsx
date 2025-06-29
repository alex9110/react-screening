'use client'

import { TokenInfo } from '@/types/portfolio'
import { formatTokenAmount, truncateAddress } from '@/lib/portfolio-utils'

interface TokenItemProps {
  token: TokenInfo
  index: number
}

export function TokenItem({ token, index }: TokenItemProps) {
  return (
    <div
      key={`${token.mint}-${index}`}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-2"
    >
      <div className="min-w-0 flex-1">
        <span className="text-base md:text-lg font-medium block">{token.symbol || 'Unknown Token'}</span>
        <p className="text-xs md:text-sm text-gray-600 font-mono break-all">{truncateAddress(token.mint)}</p>
      </div>
      <span className="text-base md:text-lg font-mono shrink-0">
        {formatTokenAmount(token.amount, token.decimals)} {token.symbol}
      </span>
    </div>
  )
}
