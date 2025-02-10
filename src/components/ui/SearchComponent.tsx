import React from "react"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "./Alert"
import { Crypto } from "../../types"
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { Input } from "./Input"

interface SearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  cryptoData: Crypto[]
  loading: boolean
  onAddToWatchlist: (crypto: Crypto) => void
  selectedWatchlist: string | null
}

const SearchComponent: React.FC<SearchProps> = ({
  searchTerm,
  onSearchChange,
  cryptoData,
  loading,
  onAddToWatchlist,
  selectedWatchlist,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Search Cryptocurrencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for a cryptocurrency..."
            value={searchTerm}
            onChange={(e: any) => onSearchChange(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {!loading && cryptoData.length > 0 && (
          <div className="mt-6 space-y-4">
            {cryptoData.map((crypto, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{crypto.symbol}</h3>
                      <p className="text-2xl font-bold">
                        ${parseFloat(crypto.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-lg font-semibold ${
                          parseFloat(crypto.priceChangePercent) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {parseFloat(crypto.priceChangePercent).toFixed(2)}%
                      </span>
                      {selectedWatchlist && (
                        <button
                          onClick={() => onAddToWatchlist(crypto)}
                          className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && cryptoData.length === 0 && searchTerm && (
          <Alert className="mt-6">
            <AlertDescription>
              No cryptocurrencies found matching your search.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default SearchComponent
