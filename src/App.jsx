import { useState } from 'react'
import { Routes, Route, Link } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import './App.css'
import Graphites from './pages/Graphites';
import Graphite from './pages/Graphite';
function App() {

  return (

    <div id="root-scrollpane">
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Graphites />} />
          <Route path="/:id" element={<Graphite />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
