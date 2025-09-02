import { useState } from 'react'
import { Routes, Route, Link } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import './App.css'
import Graphite from './pages/Graphite';
function App() {

  return (

    <BrowserRouter>

      <Routes>
        <Route path="/graphite/:id?" element={<Graphite />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
