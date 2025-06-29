// Real-time token price fetching utilities
//
// PRODUCTION STRATEGY:
// - For unknown tokens: throw errors instead of guessing prices
// - Only stable coins (USDC, USDT) have fallback prices (≈$1)
// - Proper error handling forces UI to show "Price unavailable"

interface TokenPrice {
  price: number
  lastUpdated: number
}

interface PriceCache {
  [symbol: string]: TokenPrice
}

// Cache prices for 5 minutes to avoid too many API calls
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const priceCache: PriceCache = {}

// Production-ready fallback strategy:
// 1. Try multiple price sources
// 2. Show error state instead of fake prices
// 3. Cache last known good prices
const STABLE_COIN_PRICES: Record<string, number> = {
  // Only for stablecoins where price is relatively stable
  USDC: 1.0,
  USDT: 1.0,
}

/**
 * Get real-time token prices from CoinGecko API
 */
export async function fetchTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    // Check cache first
    const now = Date.now()
    const cachedPrices: Record<string, number> = {}
    const symbolsToFetch: string[] = []

    for (const symbol of symbols) {
      const cached = priceCache[symbol]
      if (cached && now - cached.lastUpdated < CACHE_DURATION) {
        cachedPrices[symbol] = cached.price
      } else {
        symbolsToFetch.push(symbol)
      }
    }

    // If all prices are cached, return them
    if (symbolsToFetch.length === 0) {
      return cachedPrices
    }

    // Map token symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {
      SOL: 'solana',
      USDC: 'usd-coin',
      USDT: 'tether',
      BONK: 'bonk',
    }

    const idsToFetch = symbolsToFetch.map((symbol) => symbolToId[symbol]).filter(Boolean)

    if (idsToFetch.length === 0) {
      // Return cached prices and stable coin prices for unknown tokens
      const result = { ...cachedPrices }
      for (const symbol of symbolsToFetch) {
        if (STABLE_COIN_PRICES[symbol]) {
          result[symbol] = STABLE_COIN_PRICES[symbol]
        } else {
          // In production - throw error instead of guessing
          throw new Error(`Unable to fetch price for token: ${symbol}`)
        }
      }
      return result
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch.join(',')}&vs_currencies=usd`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Process and cache the results
    const newPrices: Record<string, number> = {}

    for (const symbol of symbolsToFetch) {
      const coinId = symbolToId[symbol]
      if (coinId && data[coinId]?.usd) {
        const price = data[coinId].usd
        newPrices[symbol] = price

        // Cache the price
        priceCache[symbol] = {
          price,
          lastUpdated: now,
        }
      } else {
        // Use stable coin price or throw error
        if (STABLE_COIN_PRICES[symbol]) {
          newPrices[symbol] = STABLE_COIN_PRICES[symbol]
        } else {
          // In production, throw error for unknown tokens
          throw new Error(`Failed to fetch price for ${symbol}`)
        }
      }
    }

    return { ...cachedPrices, ...newPrices }
  } catch (error) {
    console.error('Error fetching token prices:', error)

    // In production: throw error instead of returning fake prices
    throw new Error('Unable to fetch token prices. Please try again later.')
  }
}

/**
 * Get price for a single token
 */
export async function fetchTokenPrice(symbol: string): Promise<number> {
  const prices = await fetchTokenPrices([symbol])
  const price = prices[symbol]

  if (price) {
    return price
  }

  // Fallback for stable coins only
  if (STABLE_COIN_PRICES[symbol]) {
    return STABLE_COIN_PRICES[symbol]
  }

  // In production, throw error for unknown tokens
  throw new Error(`Unable to fetch price for token: ${symbol}`)
}

/**
 * Clear price cache (useful for testing or manual refresh)
 */
export function clearPriceCache(): void {
  Object.keys(priceCache).forEach((key) => delete priceCache[key])
}

/**
 * Get SOL price specifically (most commonly used)
 */
export async function getSolPrice(): Promise<number> {
  return fetchTokenPrice('SOL')
}
