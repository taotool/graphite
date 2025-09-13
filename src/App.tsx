import { useEffect, useState, useRef } from "react";
import { Graphite } from "./pages/Graphite";
import "./App.css"
import "./pages/Graphite.css"
import { convertJsonToGraph } from "./funcs/json-graph";
import Editor from "@monaco-editor/react";
import { useMediaQuery } from "@mui/material";
import type { OnMount } from "@monaco-editor/react";



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
  console.log("--------- App render ");
  const keys = [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId","buyer_id"]]
  const [rawJson, setRawJson] = useState(initialJson); // rawJson as state
  const [graphJson, setGraphJson] = useState(() =>
    JSON.stringify(convertJsonToGraph(JSON.parse(initialJson), true, keys), null, 2)
  );
  const [dividerX, setDividerX] = useState(40); // left panel width in %
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<any>(null);


  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newDivider = (e.clientX / window.innerWidth) * 100;
      if (newDivider > 10 && newDivider < 90) {
        setDividerX(newDivider);
      }
    }
  };
  // handle JSON editor changes
  const handleEditorChange = (value: string | undefined) => {
    console.log("Editor changed");
    if (!value) return;
    setRawJson(value);

    // try updating graph only if JSON is valid
    try {
      const parsed = JSON.parse(value);
      const updatedGraph = convertJsonToGraph(parsed, true, keys);
      const graphJson = JSON.stringify(updatedGraph, null, 2);
      setGraphJson(graphJson);
      console.log("Graph updated ");
    } catch (err) {
      // invalid JSON, ignore for now
    }
  };
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
    };
  }, [isDragging]);
  return (
    <div style={{ display: "flex", height: "90vh", width: "96vw" }} >


      {/* Right panel: JSON editor */}
      <div style={{ border: "1px solid #ccc", width: `${dividerX}%` }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={rawJson}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={prefersDarkMode ? "vs-dark" : "light"}
          options={{
            scrollbar: {
              vertical: "auto",      // "auto" | "visible" | "hidden"
              horizontal: "auto",
              verticalScrollbarSize: 4, // <-- width of vertical scrollbar (px)
              horizontalScrollbarSize: 4, // <-- height of horizontal scrollbar (px)
              arrowSize: 12,             // optional, size of arrows
            }
          }}
        />
      </div>
      {/* Divider */}
      <div
        onPointerDown={handleMouseDown}
        style={{ width: "8px", cursor: "col-resize", backgroundColor: "#f0f0f0" }}
      />
      {/* Left panel: Graph */}
      <div style={{ border: "1px solid #ccc", width: `${100 - dividerX}%` }}>
        <Graphite jsonString={graphJson} />
      </div>
    </div>
  );
}

export default App;
