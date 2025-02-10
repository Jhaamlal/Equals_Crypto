import React, { useState, useEffect } from "react"
import { useDebounce } from "../hooks"
import { Crypto, WatchList } from "../types"
import WatchlistSidebar from "./WatchlistSidebar"
import SearchComponent from "./SearchComponent"
import WatchlistDetail from "./WatchlistDetail"
import useCryptoWebSocket from "../hooks/useCryptoWebSocket"

const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY as string
const BINANCE_API_URL = process.env.REACT_APP_BINANCE_API_URL as string

const MainComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [cryptoData, setCryptoData] = useState<Crypto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [watchlists, setWatchlists] = useState<WatchList[]>([])
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(
    null
  )
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500)

  useEffect(() => {
    const savedWatchlists = localStorage.getItem(STORAGE_KEY)
    if (savedWatchlists) {
      setWatchlists(JSON.parse(savedWatchlists))
    }
  }, [])

  useEffect(() => {
    if (watchlists.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists))
    }
  }, [watchlists])

  const realtimePrices = useCryptoWebSocket(selectedWatchlist, watchlists)

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchCryptoData(debouncedSearchTerm)
    } else {
      setCryptoData([])
    }
  }, [debouncedSearchTerm])

  const fetchCryptoData = async (term: string) => {
    setLoading(true)
    try {
      const response = await fetch(BINANCE_API_URL)
      const data = await response.json()
      // first 10 item
      const filteredData = data
        .filter((crypto: any) =>
          crypto.symbol.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 10)

      setCryptoData(
        filteredData.map((crypto: any) => ({
          symbol: crypto.symbol,
          price: crypto.lastPrice,
          priceChangePercent: crypto.priceChangePercent,
        }))
      )
    } catch (error) {
      console.error("Error fetching crypto data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWatchlist = (name: string) => {
    const newWatchlist: WatchList = {
      id: Date.now().toString(),
      name,
      coins: [],
    }
    setWatchlists([...watchlists, newWatchlist])
  }

  const handleAddToWatchlist = (crypto: Crypto) => {
    if (selectedWatchlist) {
      setWatchlists(
        watchlists.map((list) =>
          list.id === selectedWatchlist
            ? {
                ...list,
                coins: list.coins.some((c) => c.symbol === crypto.symbol)
                  ? list.coins
                  : [...list.coins, crypto],
              }
            : list
        )
      )
    }
  }

  const handleRemoveFromWatchlist = (symbol: string) => {
    if (selectedWatchlist) {
      setWatchlists(
        watchlists.map((list) =>
          list.id === selectedWatchlist
            ? {
                ...list,
                coins: list.coins.filter((c) => c.symbol !== symbol),
              }
            : list
        )
      )
    }
  }

  const selectedWatchlistData = watchlists.find(
    (w) => w.id === selectedWatchlist
  )

  return (
    <div className="flex h-screen">
      <WatchlistSidebar
        watchlists={watchlists}
        selectedWatchlist={selectedWatchlist}
        onSelectWatchlist={setSelectedWatchlist}
        onCreateWatchlist={handleCreateWatchlist}
      />
      <div className="flex-1 p-8 overflow-auto">
        <SearchComponent
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          cryptoData={cryptoData}
          loading={loading}
          onAddToWatchlist={handleAddToWatchlist}
          selectedWatchlist={selectedWatchlist}
        />
        {selectedWatchlistData && (
          <WatchlistDetail
            watchlist={selectedWatchlistData}
            realtimePrices={realtimePrices}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
        )}
      </div>
    </div>
  )
}

export default MainComponent
