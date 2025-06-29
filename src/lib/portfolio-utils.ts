import { TokenInfo } from '@/types/portfolio'
import { LAMPORTS_PER_SOL } from './constants'
import { fetchTokenPrices } from './price-utils'

export const formatBalance = (balance: number): string => {
  return (balance / LAMPORTS_PER_SOL).toFixed(2)
}

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatTokenAmount = (amount: string, decimals: number): string => {
  const numericAmount = parseFloat(amount) / Math.pow(10, decimals)
  return numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

// Legacy function - deprecated in favor of real price calculation
export const calculateTokenValue = (token: TokenInfo): number => {
  // For production: this should not be used without real prices
  const amount = parseFloat(token.amount) / Math.pow(10, token.decimals)
  // Only return token amount, not USD value without real price
  return amount
}

export const calculateTotalPortfolioValue = (tokens: TokenInfo[]): number => {
  return tokens.reduce((total, token) => {
    return total + calculateTokenValue(token)
  }, 0)
}

// Calculate token value with real prices
export const calculateTokenValueWithRealPrice = async (
  token: TokenInfo,
  realPrices: Record<string, number>,
): Promise<number> => {
  const amount = parseFloat(token.amount) / Math.pow(10, token.decimals)
  const price = realPrices[token.symbol || '']

  if (!price) {
    throw new Error(`Price not available for token: ${token.symbol}`)
  }

  return amount * price
}

// Async version of calculateTotalPortfolioValue with real prices
export const calculateTotalPortfolioValueWithRealPrices = async (tokens: TokenInfo[]): Promise<number> => {
  if (tokens.length === 0) return 0

  try {
    // Get unique token symbols
    const uniqueSymbols = [...new Set(tokens.map((token) => token.symbol).filter(Boolean))]

    // Fetch real prices for all tokens
    const realPrices = await fetchTokenPrices(uniqueSymbols as string[])

    // Calculate total value using real prices, skip tokens without prices
    let totalValue = 0
    for (const token of tokens) {
      try {
        const tokenValue = await calculateTokenValueWithRealPrice(token, realPrices)
        totalValue += tokenValue
      } catch (error) {
        // Skip tokens without available prices instead of failing entire calculation
        console.warn(`Skipping token ${token.symbol} due to missing price:`, error)
      }
    }

    return totalValue
  } catch (error) {
    console.warn('Failed to fetch any token prices:', error)
    // Return 0 instead of throwing - let UI show tokens without USD values
    return 0
  }
}

export const truncateAddress = (address: string, startChars = 8, endChars = 8): string => {
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

// Simulate API delay for realistic UX
export const simulateApiDelay = (ms = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
