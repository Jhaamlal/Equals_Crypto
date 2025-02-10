import React, { useState, useEffect } from "react"
import { useDebounce } from "../hooks"
import { Search, Plus, Trash2 } from "lucide-react"
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Modal,
} from "./ui"
import { Crypto, WatchList } from "../types"

const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY as string
const Socket_URL = process.env.REACT_APP_BINANCE_WS as string

const CryptoSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [cryptoData, setCryptoData] = useState<Crypto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [watchlists, setWatchlists] = useState<WatchList[]>([])
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(
    null
  )
  const [realtimePrices, setRealtimePrices] = useState<
    Record<string, { price: string; priceChangePercent: string }>
  >({})
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500)

  useEffect(() => {
    const savedWatchlists = localStorage.getItem(STORAGE_KEY)
    if (savedWatchlists) {
      setWatchlists(JSON.parse(savedWatchlists))
    }
  }, [])

  useEffect(() => {
    // for data to be persist even after the length
    if (watchlists.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists))
    }
  }, [watchlists])

  useEffect(() => {
    const selectedList = watchlists.find((w) => w.id === selectedWatchlist)
    if (!selectedList?.coins.length) return

    const ws = new WebSocket(Socket_URL)

    ws.onopen = () => {
      console.log("WebSocket Connected 🚀")
      const subscribeMsg = {
        method: "SUBSCRIBE",
        params: selectedList.coins.map(
          (coin) => `${coin.symbol.toLowerCase()}@ticker`
        ),
        id: 1,
      }
      ws.send(JSON.stringify(subscribeMsg))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.s) {
          console.log("Abhi maja ayga bidu ✅✌️: ", data)

          setRealtimePrices((prev) => ({
            ...prev,
            [data.s]: {
              price: data.c, //Paisa
              priceChangePercent: data.P, // Change %
            },
          }))
        }
      } catch (error) {
        console.error("Error parsing WebSocket message ❌:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket Error ❌", error)
    }

    ws.onclose = (event) => {
      console.warn("WebSocket Closed ❌", event)
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("Unsubscribing before closing WebSocket...")

        const unsubscribeMsg = {
          method: "UNSUBSCRIBE",
          params: selectedList.coins.map(
            (coin) => `${coin.symbol.toLowerCase()}@ticker`
          ),
          id: 1,
        }

        ws.send(JSON.stringify(unsubscribeMsg))
      }
      ws.close()
    }
  }, [selectedWatchlist, watchlists])

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
      const response = await fetch("https://api.binance.com/api/v3/ticker/24hr")
      const data = await response.json()
      // First 10 item only
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

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      const newWatchlist: WatchList = {
        id: Date.now().toString(),
        name: newWatchlistName,
        coins: [],
      }
      setWatchlists([...watchlists, newWatchlist])
      setNewWatchlistName("")
      setIsModalOpen(false)
    }
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
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Watchlists</h2>
          <Button onClick={() => setIsModalOpen(true)}>Create</Button>
        </div>
        <div className="space-y-2">
          {watchlists.map((list) => (
            <div
              key={list.id}
              className={`cursor-pointer rounded-md p-2 ${
                selectedWatchlist === list.id
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedWatchlist(list.id)}
            >
              <div className="font-medium">{list.name}</div>
              <div className="text-sm text-gray-500">
                {list.coins.length} coins
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Search  */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {crypto.symbol}
                          </h3>
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
                          {/* if it is in the Watchlist in that case you can have  */}
                          {selectedWatchlist && (
                            <Button
                              onClick={() => handleAddToWatchlist(crypto)}
                              className="flex items-center space-x-1"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && cryptoData.length === 0 && debouncedSearchTerm && (
              <Alert className="mt-6">
                <AlertDescription>
                  No cryptocurrencies found matching your search.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        {/* Search  */}
        {selectedWatchlistData ? (
          // Watchlist detail

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{selectedWatchlistData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedWatchlistData.coins.map((coin) => {
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
                          <h3 className="text-lg font-semibold">
                            {coin.symbol}
                          </h3>
                          <p className="text-2xl font-bold">
                            ${parseFloat(realtimeData.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`text-lg font-semibold ${
                              priceChange >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {priceChange.toFixed(2)}%
                          </span>
                          <Button
                            onClick={() =>
                              handleRemoveFromWatchlist(coin.symbol)
                            }
                            // variant="destructive"
                            // size="sm"
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
        ) : (
          <></>
        )}
      </div>
      {/* Main content */}

      {/* Create Watchlist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Watchlist"
      >
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Watchlist name"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export { CryptoSearch }
