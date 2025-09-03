import { useState } from 'react'
import { Routes, Route, Link } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import './App.css'
import Graphite from './pages/Graphite';
function App() {
  const jsonString = `
    {
        "type": "er",
        "nodes": [
          {"id":"ACCOUNTS.User.id","name":"id","type":"ID3","description":"ACCOUNTS"},
          {"id":"ACCOUNTS.User.name","name":"name","type":"String","description":"ACCOUNTS"},
          {"id":"ACCOUNTS.User.reviews","name":"reviews","type":"[Review]","description":"REVIEWS"},
          {"id":"ACCOUNTS.User.username","name":"username","type":"String","description":"ACCOUNTS"},
          {"id":"PRODUCTS.Product.inStock","name":"inStock","type":"Boolean","description":"INVENTORY"},
          {"id":"PRODUCTS.Product.name","name":"name","type":"String","description":"PRODUCTS"},
          {"id":"PRODUCTS.Product.price","name":"price","type":"Int","description":"PRODUCTS"}
        ],
        "edges": [
          { "source": "ACCOUNTS.User.reviews", "target": "REVIEWS.Review.id", "weight": "User.reviews" },
          { "source": "PRODUCTS.Product.reviews", "target": "REVIEWS.Review.id", "weight": "Product.reviews" },
          { "source": "QUERY.Query.me", "target": "ACCOUNTS.User.id", "weight": "Query.me" }
        ]
      }
  `;

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/graphite/:id?" element={<Graphite />} />
      </Routes>
    </BrowserRouter>
  )
}
{/* <Graphite jsonString={jsonString} /> */}
export default App
