import { WatchList } from "../types"

const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY as string

export const StorageService = {
  saveWatchlists: (watchlists: WatchList[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists))
    } catch (error) {
      console.error("Error saving watchlists:", error)
    }
  },

  getWatchlists: (): WatchList[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error loading watchlists:", error)
      return []
    }
  },
}
