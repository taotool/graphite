import React, { useEffect, useState, useRef } from "react";
import { Graphite } from "./Graphite";
import { Flowite } from "./Flowite";

import "./Graphite.css"
import Editor from "@monaco-editor/react";
import { useMediaQuery } from "@mui/material";
import type { OnMount } from "@monaco-editor/react";
import { yamlToFieldGraph, graphqlToFieldGraph, openapiToFieldGraph, jsonToFieldGraph, toEntityGraph } from "./functions"

export interface DataOProps {
  data: string;
  options: Record<string, any>
}

const json = `
{
  "user": {
    "id": "User123",
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
  },
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
`;
// Example usage with your schema
const graphql: string = `
# Scalars
scalar DateTime
scalar JSON

# Enum
enum Role {
  ADMIN
  USER
  GUEST
}

# Interface
interface Node {
  id: ID!
  createdAt: DateTime!
}

# Types
type User implements Node {
  id: ID!
  createdAt: DateTime!
  name: String!
  role: Role!
  posts: [Post!]!
  
  resume: JSON
}

type Post implements Node {
  id: ID!
  createdAt: DateTime!
  title: String!
  content: String
  author: User!
}

# Union
union SearchResult = User | Post

# Input
input CreateUserInput {
  name: String!
  role: Role!
}

input CreatePostInput {
  title: String!
  content: String
  authorId: ID!
}

# Queries
type Query {
  users: [User!]!
  posts: [Post!]!
  search(term: String!): [SearchResult!]!
}

# Mutations
type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
}

# Subscriptions
type Subscription {
  newPost: Post!
}

`;

const yaml = `
---
# This is a sample YAML configuration file
# Comments are denoted by a hash symbol (#)

# Scalar values (strings, numbers, booleans)
name: John Doe
age: 30
isStudent: false
pi: 3.14159

# Lists/Sequences (items prefixed with a hyphen and space)
skills:
  - Python
  - JavaScript
  - YAML
hobbies:
  - reading
  - hiking
  - coding

# Mappings/Dictionaries (key-value pairs)
address:
  street: 123 Main St
  city: Anytown
  zipCode: 12345

# Nested structures
company:
  name: Tech Solutions Inc.
  departments:
    - sales
    - engineering
    - marketing
  employees:
    manager:
      firstName: Jane
      lastName: Smith
    staff:
      - firstName: Bob
        lastName: Johnson
      - firstName: Alice
        lastName: Williams

# Multi-line string (using the | literal style)
description: |
  This is a multi-line string.
  Each line will be preserved,
  including the line breaks.

# Folded multi-line string (using the > folded style)
message: >
  This is a folded multi-line string.
  Newlines are replaced with spaces,
  unless explicitly indented.
`;
export const DataO: React.FC<DataOProps> = (props) => {
  const [data, setData] = useState(props.data); // rawJson as state
  const [type, setType] = useState(props.options.type || "json");
  const [engine, setEngine] = useState(props.options.engine || "flowite");
  console.log("--------- DataO render start ---------");


  const convertToFieldGraph = (data: string, type: string, engine: string) => {
    if (!type || type === 'json') {
      const fieldGraphData = jsonToFieldGraph(JSON.parse(data), props.options.arr, props.options.keys)
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }

    if (type === 'graphql') {
      const fieldGraphData = graphqlToFieldGraph(data);
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }

    if (type === 'yaml') {
      const fieldGraphData = yamlToFieldGraph(data, props.options.arr, props.options.keys);
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }

    if (type === 'openapi') {
      const fieldGraphData = openapiToFieldGraph(JSON.parse(data), props.options.arr, props.options.keys);
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }
  }
  // const keys = [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId","buyer_id"]]
  const [graphJson, setGraphJson] = useState(() => convertToFieldGraph(data, type, engine)); // graphJson as state
  const [dividerX, setDividerX] = useState(30); // left panel width in %
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
    if (!value) return;
    setData(value);
  };
  // const handleEditorChange = (value: string | undefined) => {
  //   console.log("Editor changed");
  //   if (!value) return;
  //   setRawJson(value);

  // // try updating graph only if JSON is valid
  // try {
  //   const graphJson = convertToFieldGraph(value);
  //   // const parsed = JSON.parse(value);
  //   // const updatedGraph = jsonToFieldGraph(parsed, props.options.arr, props.options.keys);
  //   // const graphJson = JSON.stringify(updatedFieldGraph, null, 2);
  //   setGraphJson(graphJson);
  //   console.log("Graph updated ");
  // } catch (err) {
  //   // invalid JSON, ignore for now
  // }
  // };
  // Handle dropdown changes
  const handleTypeChange = (e: any) => {
    setType(e.target.value);
    setData(e.target.value === "json" ? json : e.target.value === "graphql" ? graphql : yaml);

  };

  const handleEngineChange = (e: any) => {
    setEngine(e.target.value);
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


  // Regenerate graphJson whenever type, engine, or rawJson changes
  useEffect(() => {
    try {
      const graphJson = convertToFieldGraph(data, type, engine);
      setGraphJson(graphJson);
      console.log("Graph updated ");
    } catch (err) {
      setGraphJson(""); // invalid JSON → no graph
    }
  }, [type, engine, data]);

  console.log("--------- DataO render end ---------");
  return (
    <div>
      {/* Head div with dropdowns */}
      <div style={{ border: "0px solid red", padding: "0.5rem", textAlign: "left" }}>
        <label>
          Type:{" "}
          <select value={type} onChange={handleTypeChange}>
            <option value="json">JSON</option>
            <option value="graphql">GraphQL</option>
            <option value="yaml">YAML</option>
          </select>
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Engine:{" "}
          <select value={engine} onChange={handleEngineChange}>
            <option value="flowite">Flowite</option>
            <option value="graphite">Graphite</option>
          </select>
        </label>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", height: "90vh", width: "96vw" }}>
        {/* Right panel: JSON editor */}
        <div style={{ border: "1px solid #ccc", width: `${dividerX}%` }}>
          <Editor
            height="100%"
            language={type.toLowerCase()}
            value={data}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={prefersDarkMode ? "vs-dark" : "light"}
            options={{
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 4,
                horizontalScrollbarSize: 4,
                arrowSize: 12,
              },
            }}
          />
          {/* </Editor> */}
        </div>

        {/* Divider */}
        <div
          onPointerDown={handleMouseDown}
          style={{
            width: "4px",
            cursor: "col-resize",
            border: "1px solid #ccc",
            backgroundColor: "var(--border-color)",
          }}
        />

        {/* Left panel: Graph */}
        <div style={{ border: "1px solid #ccc", width: `${100 - dividerX}%` }}>
          {engine === "flowite" ? (
            <Flowite jsonstr={graphJson || ""} />
          ) : (
            <Graphite jsonString={graphJson} />
          )}
        </div>
      </div>
    </div>
  );
}

