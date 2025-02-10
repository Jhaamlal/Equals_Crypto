import React from "react"
import { Card, CardContent, Button } from "./ui"
import { Trash2 } from "lucide-react"
import { WatchList } from "../types"

interface WatchlistDetailProps {
  watchlist: WatchList
  realtimePrices: Record<string, { price: string; priceChangePercent: string }>
  onRemoveFromWatchlist: (symbol: string) => void
}

const WatchlistDetail: React.FC<WatchlistDetailProps> = ({
  watchlist,
  realtimePrices,
  onRemoveFromWatchlist,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{watchlist.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.coins.map((coin) => {
          const realtimeData = realtimePrices[coin.symbol] || {
            price: coin.price,
            priceChangePercent: coin.priceChangePercent,
          }
          const priceChange = parseFloat(realtimeData.priceChangePercent)

          return (
            <Card
              key={coin.symbol}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{coin.symbol}</h3>
                    <p className="text-2xl font-bold">
                      ${parseFloat(realtimeData.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`text-lg font-semibold ${
                        priceChange >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {priceChange.toFixed(2)}%
                    </span>
                    <Button
                      onClick={() => onRemoveFromWatchlist(coin.symbol)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default WatchlistDetail
