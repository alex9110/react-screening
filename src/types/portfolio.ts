export interface TokenInfo {
  mint: string
  amount: string
  decimals: number
  symbol?: string
}

export interface PortfolioData {
  balance: number
  tokens: TokenInfo[]
  totalValue: number
}

export interface PortfolioError {
  message: string
  code?: string
}
