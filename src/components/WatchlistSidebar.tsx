import React, { useState } from "react"
import { Button } from "./ui"
import { WatchList } from "../types"

interface WatchlistSidebarProps {
  watchlists: WatchList[]
  selectedWatchlist: string | null
  onSelectWatchlist: (id: string) => void
  onCreateWatchlist: (name: string) => void
}

const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  watchlists,
  selectedWatchlist,
  onSelectWatchlist,
  onCreateWatchlist,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newWatchlistName, setNewWatchlistName] = useState("")

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      onCreateWatchlist(newWatchlistName)
      setNewWatchlistName("")
      setIsModalOpen(false)
    }
  }

  return (
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
            onClick={() => onSelectWatchlist(list.id)}
          >
            <div className="font-medium">{list.name}</div>
            <div className="text-sm text-gray-500">
              {list.coins.length} coins
            </div>
          </div>
        ))}
      </div>

      {/* Create Watchlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New WatchList</h2>
            <input
              type="text"
              placeholder="Watchlist name"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
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
        </div>
      )}
    </div>
  )
}

export default WatchlistSidebar
