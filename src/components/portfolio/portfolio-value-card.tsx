'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { formatCurrency } from '@/lib/portfolio-utils'

interface PortfolioValueCardProps {
  totalValue: number
  isLoading: boolean
  onRefresh: () => void
}

export function PortfolioValueCard({ totalValue, isLoading, onRefresh }: PortfolioValueCardProps) {
  return (
    <Card className="w-full md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl break-words">Total Portfolio Value</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold break-words">${formatCurrency(totalValue)} USD</p>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              className="mt-4 md:mt-6 w-full text-sm md:text-lg py-3 md:py-4 px-6 md:px-8 cursor-pointer"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Portfolio Data'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
