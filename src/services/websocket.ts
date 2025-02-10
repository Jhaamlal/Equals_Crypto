let socket_Data = process.env.REACT_APP_BINANCE_WS as string
export class WebSocketService {
  private ws: WebSocket | null = null
  private subscribers: Map<string, (data: any) => void> = new Map()

  connect(symbols: string[]) {
    if (this.ws) {
      this.ws.close()
    }

    this.ws = new WebSocket(socket_Data)

    this.ws.onopen = () => {
      const subscribeMsg = {
        method: "SUBSCRIBE",
        params: symbols.map((symbol) => `${symbol.toLowerCase()}@ticker`),
        id: 1,
      }
      this.ws?.send(JSON.stringify(subscribeMsg))
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.s) {
        const handlers = this.subscribers.get(data.s)
        if (handlers) {
          handlers({
            symbol: data.s,
            price: data.c, //Price
            priceChangePercent: data.P, //percentage change
          })
        }
      }
    }

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }

  subscribe(symbol: string, callback: (data: any) => void) {
    this.subscribers.set(symbol, callback)
  }

  unsubscribe(symbol: string) {
    this.subscribers.delete(symbol)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
  }
}

export const wsService = new WebSocketService()
