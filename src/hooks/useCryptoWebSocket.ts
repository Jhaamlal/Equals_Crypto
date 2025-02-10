import { useEffect, useRef, useCallback, useState } from "react"
import { WatchList } from "../types"

const BINANCE_Socket_URL = process.env.REACT_APP_BINANCE_WS as string
const useCryptoWebSocket = (
  selectedWatchlist: string | null,
  watchlists: WatchList[]
) => {
  const wsRef = useRef<WebSocket | null>(null)
  const [realtimePrices, setRealtimePrices] = useState<
    Record<string, { price: string; priceChangePercent: string }>
  >({})

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.s) {
      setRealtimePrices((prev) => ({
        ...prev,
        [data.s]: {
          price: data.c, //  price
          priceChangePercent: data.P, // Price change percent
        },
      }))
    }
  }, [])

  useEffect(() => {
    if (!selectedWatchlist) return

    const selectedList = watchlists.find((w) => w.id === selectedWatchlist)
    if (!selectedList?.coins.length) return

    const ws = new WebSocket(BINANCE_Socket_URL)
    wsRef.current = ws

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
        handleWebSocketMessage(data)
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
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log("Unsubscribing before closing WebSocket...")
        const unsubscribeMsg = {
          method: "UNSUBSCRIBE",
          params: selectedList.coins.map(
            (coin) => `${coin.symbol.toLowerCase()}@ticker`
          ),
          id: 1,
        }
        wsRef.current.send(JSON.stringify(unsubscribeMsg))
        wsRef.current.close()
      }
    }
  }, [selectedWatchlist, watchlists, handleWebSocketMessage])

  return realtimePrices
}

export default useCryptoWebSocket
