export interface Crypto {
  symbol: string
  price: string
  priceChangePercent: string
}

export interface WatchList {
  id: string
  name: string
  coins: Crypto[]
}

export interface SearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  cryptoData: Crypto[]
  loading: boolean
  onAddToWatchlist: (crypto: Crypto) => void
  selectedWatchlist: string | null
}
