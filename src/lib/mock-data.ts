export const MOCK_PORTFOLIO_DATA = {
  balance: 2500000000, // 2.5 SOL in lamports
  tokens: [
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: '1000000',
      decimals: 6,
      symbol: 'USDC',
    },
    {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      amount: '500000000',
      decimals: 6,
      symbol: 'USDT',
    },
  ],
} as const
