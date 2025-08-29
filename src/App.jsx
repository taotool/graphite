import { useState } from 'react'
import { Routes, Route, Link } from "react-router-dom";

import './App.css'
import Graphites from './pages/Graphites';
import Graphite from './pages/Graphite';
function App() {

  return (
  
<div id="root-scrollpane"

            >
      {/* Route definitions */}
      <Routes>
                   <Route path="/" element={<Graphites />} />
                   <Route path="/:id" element={<Graphite />} />
      </Routes>
      </div>
  )
}

export default App
