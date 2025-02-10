import React from "react"
import "./App.css"
import CryptoSearch from "./components/MainComponent"

/**
 *
 * @returns
 * make a search which use Debounce
 * Create a watch list , and put that into tab bar
 * Once that is done , on clicking on that it should show the list, cripto that is there
 *
 */

function App() {
  return (
    <div className="App">
      <CryptoSearch />
    </div>
  )
}

export default App
