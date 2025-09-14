import { jsx as _jsx } from "react/jsx-runtime";
import { JsonGraph } from "./pages/JsonGraph";
import "./App.css";
import "./pages/Graphite.css";
const initialJson = `
[
  {
    "user": {
      "id": "USRabc",
      "addresses": [
        {
          "type": "home",
          "street": "123 Main St",
          "city": "Anytown",
          "zipCode": "12345"
        },
        {
          "type": "work",
          "street": "456 Business Ave",
          "city": "Metropolis",
          "zipCode": "67890"
        }
      ],
      "preferences": {
        "newsletter": true,
        "notifications": {
          "email": true,
          "sms": false
        }
      },
      "orderHistory": [
        {
          "orderId": "ORD001"
        },
        {
          "orderId": "ORD002"
        }
      ]
    }
  },
  {
    "orders": [
      {
        "orderId": "ORD001",
        "date": "2025-08-15",
        "items": [
          {
            "id": "ITEM001",
            "productId": "PROD001",
            "name": "Laptop",
            "quantity": 1,
            "price": 1200
          },
          {
            "id": "ITEM002",
            "productId": "PROD003",
            "name": "Mouse",
            "quantity": 2,
            "price": 25
          }
        ],
        "totalAmount": 1250
      },
      {
        "orderId": "ORD002",
        "date": "2025-09-01",
        "items": [
          {
            "id": "ITEM003",
            "productId": "PROD005",
            "name": "Keyboard",
            "quantity": 1,
            "price": 75
          }
        ],
        "totalAmount": 75
      }
    ]
  }
]
`.trim();
function App() {
    return (_jsx("div", { style: { display: "flex", height: "90vh", width: "96vw" }, children: _jsx(JsonGraph, { json: initialJson }) }));
}
export default App;
