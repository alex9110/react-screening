import { useState, useCallback, useEffect } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { address, Address } from 'gill'
import { TOKEN_PROGRAM_ADDRESS, TOKEN_2022_PROGRAM_ADDRESS } from 'gill/programs/token'
import { PortfolioData, TokenInfo } from '@/types/portfolio'
import { calculateTotalPortfolioValue, calculateTotalPortfolioValueWithRealPrices } from '@/lib/portfolio-utils'
import { fetchTokenPrices, getSolPrice } from '@/lib/price-utils'

export const usePortfolio = () => {
  const { account, client } = useWalletUi()

  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    tokens: [],
    totalValue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [currentSolPrice, setCurrentSolPrice] = useState<number>(0) // Will be set when real price is fetched

  // Helper function to get token accounts
  const getTokenAccountsByOwner = async (walletAddress: Address, programId: Address) => {
    try {
      const response = await client.rpc
        .getTokenAccountsByOwner(walletAddress, { programId }, { commitment: 'confirmed', encoding: 'jsonParsed' })
        .send()
      return response.value ?? []
    } catch (err) {
      console.error('Error fetching token accounts:', err)
      return []
    }
  }

  // Simple token registry - could be enhanced with real token registry lookup
  const getTokenSymbol = (mint: string): string | null => {
    const knownTokens: Record<string, string> = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'USDT',
      So11111111111111111111111111111111111111112: 'SOL',
      // Add more known tokens as needed
    }
    return knownTokens[mint] || null
  }

  const getTokenName = (mint: string): string | null => {
    const knownTokens: Record<string, string> = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USD Coin',
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'Tether USD',
      So11111111111111111111111111111111111111112: 'Solana',
      // Add more known tokens as needed
    }
    return knownTokens[mint] || null
  }

  const fetchPortfolioData = useCallback(async (): Promise<void> => {
    if (!account) return

    setIsLoading(true)
    setError('')

    try {
      const walletAddress = address(account.address)

      // Get SOL balance
      const solBalance = await client.rpc.getBalance(walletAddress).send()
      const solInLamports = Number(solBalance.value)

      // Get token accounts
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        getTokenAccountsByOwner(walletAddress, TOKEN_PROGRAM_ADDRESS),
        getTokenAccountsByOwner(walletAddress, TOKEN_2022_PROGRAM_ADDRESS),
      ])

      const allTokenAccounts = [...tokenAccounts, ...token2022Accounts]

      // Process token accounts into TokenInfo format
      const tokens: TokenInfo[] = allTokenAccounts
        .filter((account) => {
          const parsedInfo = account.account.data.parsed?.info
          // Temporarily disable balance filtering to see all tokens
          return parsedInfo // && Number(parsedInfo.tokenAmount.amount) > 0
        })
        .map((account) => {
          const parsedInfo = account.account.data.parsed.info
          const tokenAmount = parsedInfo.tokenAmount
          const mint = parsedInfo.mint

          // Better token name/symbol extraction (could be enhanced with token registry lookup)
          const mintShort = mint.slice(0, 8)
          const symbol = getTokenSymbol(mint) || `T${mintShort}`
          const name = getTokenName(mint) || `Token ${mintShort}...`

          return {
            mint,
            amount: tokenAmount.amount,
            decimals: tokenAmount.decimals,
            symbol,
            name,
          }
        })

      // Calculate token values with real prices and get real SOL price
      const solInTokens = solInLamports / 1_000_000_000 // Convert lamports to SOL

      let totalTokenValue = 0
      let solPrice = 0
      let pricesAvailable = true

      try {
        // Try to fetch real-time prices for both tokens and SOL in parallel
        const [fetchedTokenValue, fetchedSolPrice] = await Promise.all([
          calculateTotalPortfolioValueWithRealPrices(tokens),
          getSolPrice(),
        ])

        totalTokenValue = fetchedTokenValue
        solPrice = fetchedSolPrice
        setCurrentSolPrice(solPrice)
      } catch (priceError) {
        // If price fetching fails, show portfolio without USD values
        console.warn('Failed to fetch real prices, showing portfolio without USD values:', priceError)
        pricesAvailable = false
        solPrice = 0
        totalTokenValue = 0
        setCurrentSolPrice(0) // This will show "Price unavailable" in UI
      }

      const solValue = pricesAvailable ? solInTokens * solPrice : 0
      const totalPortfolioValue = totalTokenValue + solValue

      setPortfolio({
        balance: solInLamports,
        tokens,
        totalValue: totalPortfolioValue,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching portfolio data'
      setError(errorMessage)
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Portfolio fetch error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [account, client])

  // Auto-fetch when account changes
  useEffect(() => {
    if (account) {
      fetchPortfolioData()
    } else {
      // Reset portfolio when no account
      setPortfolio({ balance: 0, tokens: [], totalValue: 0 })
    }
  }, [account, fetchPortfolioData])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    portfolio,
    isLoading,
    error,
    fetchPortfolioData,
    clearError,
    isConnected: !!account,
    currentSolPrice,
  }
}
