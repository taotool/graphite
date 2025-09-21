import "./App.css"
import "./pages/Graphite.css"
import { DataO } from "./pages/DataO";

// const entityGraph = `
// {
//   "metadata": {},
//   "nodes": [
//     {
//       "id": "ROOT.root",
//       "name": "root",
//       "type": "ROOT",
//       "fields": [
//         {
//           "id": "ROOT.root.id",
//           "name": "id",
//           "type": "root",
//           "value": "{...}"
//         }
//       ]
//     },
//     {
//       "id": "USER.USRabc",
//       "name": "USRabc",
//       "type": "USER",
//       "fields": [
//         {
//           "id": "USER.USRabc.id",
//           "name": "id",
//           "type": "string",
//           "value": "USRabc"
//         },
//         {
//           "id": "USER.USRabc.addresses",
//           "name": "addresses",
//           "type": "object",
//           "value": "[...]"
//         },
//         {
//           "id": "USER.USRabc.preferences",
//           "name": "preferences",
//           "type": "preferences",
//           "value": "{...}"
//         },
//         {
//           "id": "USER.USRabc.orderHistory",
//           "name": "orderHistory",
//           "type": "object",
//           "value": "[...]"
//         }
//       ]
//     },
//     {
//       "id": "[ADDRESSES].USRabc",
//       "name": "USRabc",
//       "type": "[ADDRESSES]",
//       "fields": [
//         {
//           "id": "[ADDRESSES].USRabc.ADDRESSES[0]",
//           "name": "ADDRESSES[0]",
//           "type": "object",
//           "value": "{...}"
//         },
//         {
//           "id": "[ADDRESSES].USRabc.ADDRESSES[1]",
//           "name": "ADDRESSES[1]",
//           "type": "object",
//           "value": "{...}"
//         }
//       ]
//     },
//     {
//       "id": "ADDRESSES.ADDRESSES[0]",
//       "name": "ADDRESSES[0]",
//       "type": "ADDRESSES",
//       "fields": [
//         {
//           "id": "ADDRESSES.ADDRESSES[0].type",
//           "name": "type",
//           "type": "string",
//           "value": "home"
//         },
//         {
//           "id": "ADDRESSES.ADDRESSES[0].street",
//           "name": "street",
//           "type": "string",
//           "value": "123 Main St"
//         },
//         {
//           "id": "ADDRESSES.ADDRESSES[0].city",
//           "name": "city",
//           "type": "string",
//           "value": "Anytown"
//         },
//         {
//           "id": "ADDRESSES.ADDRESSES[0].zipCode",
//           "name": "zipCode",
//           "type": "string",
//           "value": "12345"
//         }
//       ]
//     },
//     {
//       "id": "ADDRESSES.ADDRESSES[1]",
//       "name": "ADDRESSES[1]",
//       "type": "ADDRESSES",
//       "fields": [
//         {
//           "id": "ADDRESSES.ADDRESSES[1].type",
//           "name": "type",
//           "type": "string",
//           "value": "work"
//         },
//         {
//           "id": "ADDRESSES.ADDRESSES[1].street",
//           "name": "street",
//           "type": "string",
//           "value": "456 Business Ave"
//         },
//         {
//           "id": "ADDRESSES.ADDRESSES[1].city",
//           "name": "city",
//           "type": "string",
//           "value": "Metropolis"
//         },
//         {
//           "id": "ADDRESSES.ADDRESSES[1].zipCode",
//           "name": "zipCode",
//           "type": "string",
//           "value": "67890"
//         }
//       ]
//     },
//     {
//       "id": "PREFERENCES.preferencesId",
//       "name": "preferencesId",
//       "type": "PREFERENCES",
//       "fields": [
//         {
//           "id": "PREFERENCES.preferencesId.newsletter",
//           "name": "newsletter",
//           "type": "boolean",
//           "value": "true"
//         },
//         {
//           "id": "PREFERENCES.preferencesId.notifications",
//           "name": "notifications",
//           "type": "notifications",
//           "value": "{...}"
//         }
//       ]
//     },
//     {
//       "id": "NOTIFICATIONS.notificationsId",
//       "name": "notificationsId",
//       "type": "NOTIFICATIONS",
//       "fields": [
//         {
//           "id": "NOTIFICATIONS.notificationsId.email",
//           "name": "email",
//           "type": "boolean",
//           "value": "true"
//         },
//         {
//           "id": "NOTIFICATIONS.notificationsId.sms",
//           "name": "sms",
//           "type": "boolean",
//           "value": "false"
//         }
//       ]
//     },
//     {
//       "id": "[ORDERHISTORY].USRabc",
//       "name": "USRabc",
//       "type": "[ORDERHISTORY]",
//       "fields": [
//         {
//           "id": "[ORDERHISTORY].USRabc.ORDERHISTORY[0]",
//           "name": "ORDERHISTORY[0]",
//           "type": "object",
//           "value": "{...}"
//         },
//         {
//           "id": "[ORDERHISTORY].USRabc.ORDERHISTORY[1]",
//           "name": "ORDERHISTORY[1]",
//           "type": "object",
//           "value": "{...}"
//         }
//       ]
//     },
//     {
//       "id": "ORDERHISTORY.ORDERHISTORY[0]",
//       "name": "ORDERHISTORY[0]",
//       "type": "ORDERHISTORY",
//       "fields": [
//         {
//           "id": "ORDERHISTORY.ORDERHISTORY[0].orderId",
//           "name": "orderId",
//           "type": "string",
//           "value": "ORD001"
//         }
//       ]
//     },
//     {
//       "id": "ORDERHISTORY.ORDERHISTORY[1]",
//       "name": "ORDERHISTORY[1]",
//       "type": "ORDERHISTORY",
//       "fields": [
//         {
//           "id": "ORDERHISTORY.ORDERHISTORY[1].orderId",
//           "name": "orderId",
//           "type": "string",
//           "value": "ORD002"
//         }
//       ]
//     },
//     {
//       "id": "ORDERS.ORDERS1",
//       "name": "ORDERS1",
//       "type": "ORDERS",
//       "fields": [
//         {
//           "id": "ORDERS.ORDERS1.orderId",
//           "name": "orderId",
//           "type": "string",
//           "value": "ORD001"
//         },
//         {
//           "id": "ORDERS.ORDERS1.date",
//           "name": "date",
//           "type": "string",
//           "value": "2025-08-15"
//         },
//         {
//           "id": "ORDERS.ORDERS1.items",
//           "name": "items",
//           "type": "object",
//           "value": "[...]"
//         },
//         {
//           "id": "ORDERS.ORDERS1.totalAmount",
//           "name": "totalAmount",
//           "type": "number",
//           "value": "1250"
//         }
//       ]
//     },
//     {
//       "id": "[ITEMS].ORDERS1",
//       "name": "ORDERS1",
//       "type": "[ITEMS]",
//       "fields": [
//         {
//           "id": "[ITEMS].ORDERS1.ITEM001",
//           "name": "ITEM001",
//           "type": "object",
//           "value": "{...}"
//         },
//         {
//           "id": "[ITEMS].ORDERS1.ITEM002",
//           "name": "ITEM002",
//           "type": "object",
//           "value": "{...}"
//         }
//       ]
//     },
//     {
//       "id": "ITEMS.ITEM001",
//       "name": "ITEM001",
//       "type": "ITEMS",
//       "fields": [
//         {
//           "id": "ITEMS.ITEM001.id",
//           "name": "id",
//           "type": "string",
//           "value": "ITEM001"
//         },
//         {
//           "id": "ITEMS.ITEM001.productId",
//           "name": "productId",
//           "type": "string",
//           "value": "PROD001"
//         },
//         {
//           "id": "ITEMS.ITEM001.name",
//           "name": "name",
//           "type": "string",
//           "value": "Laptop"
//         },
//         {
//           "id": "ITEMS.ITEM001.quantity",
//           "name": "quantity",
//           "type": "number",
//           "value": "1"
//         },
//         {
//           "id": "ITEMS.ITEM001.price",
//           "name": "price",
//           "type": "number",
//           "value": "1200"
//         }
//       ]
//     },
//     {
//       "id": "ITEMS.ITEM002",
//       "name": "ITEM002",
//       "type": "ITEMS",
//       "fields": [
//         {
//           "id": "ITEMS.ITEM002.id",
//           "name": "id",
//           "type": "string",
//           "value": "ITEM002"
//         },
//         {
//           "id": "ITEMS.ITEM002.productId",
//           "name": "productId",
//           "type": "string",
//           "value": "PROD003"
//         },
//         {
//           "id": "ITEMS.ITEM002.name",
//           "name": "name",
//           "type": "string",
//           "value": "Mouse"
//         },
//         {
//           "id": "ITEMS.ITEM002.quantity",
//           "name": "quantity",
//           "type": "number",
//           "value": "2"
//         },
//         {
//           "id": "ITEMS.ITEM002.price",
//           "name": "price",
//           "type": "number",
//           "value": "25"
//         }
//       ]
//     },
//     {
//       "id": "ORDERS.ORDERS2",
//       "name": "ORDERS2",
//       "type": "ORDERS",
//       "fields": [
//         {
//           "id": "ORDERS.ORDERS2.orderId",
//           "name": "orderId",
//           "type": "string",
//           "value": "ORD002"
//         },
//         {
//           "id": "ORDERS.ORDERS2.date",
//           "name": "date",
//           "type": "string",
//           "value": "2025-09-01"
//         },
//         {
//           "id": "ORDERS.ORDERS2.items",
//           "name": "items",
//           "type": "object",
//           "value": "[...]"
//         },
//         {
//           "id": "ORDERS.ORDERS2.totalAmount",
//           "name": "totalAmount",
//           "type": "number",
//           "value": "75"
//         }
//       ]
//     },
//     {
//       "id": "[ITEMS].ORDERS2",
//       "name": "ORDERS2",
//       "type": "[ITEMS]",
//       "fields": [
//         {
//           "id": "[ITEMS].ORDERS2.ITEM003",
//           "name": "ITEM003",
//           "type": "object",
//           "value": "{...}"
//         }
//       ]
//     },
//     {
//       "id": "ITEMS.ITEM003",
//       "name": "ITEM003",
//       "type": "ITEMS",
//       "fields": [
//         {
//           "id": "ITEMS.ITEM003.id",
//           "name": "id",
//           "type": "string",
//           "value": "ITEM003"
//         },
//         {
//           "id": "ITEMS.ITEM003.productId",
//           "name": "productId",
//           "type": "string",
//           "value": "PROD005"
//         },
//         {
//           "id": "ITEMS.ITEM003.name",
//           "name": "name",
//           "type": "string",
//           "value": "Keyboard"
//         },
//         {
//           "id": "ITEMS.ITEM003.quantity",
//           "name": "quantity",
//           "type": "number",
//           "value": "1"
//         },
//         {
//           "id": "ITEMS.ITEM003.price",
//           "name": "price",
//           "type": "number",
//           "value": "75"
//         }
//       ]
//     }
//   ],
//   "edges": [
//     {
//       "source": "ROOT.root",
//       "target": "USER.USRabc",
//       "label": "user"
//     },
//     {
//       "source": "USER.USRabc",
//       "target": "[ADDRESSES].USRabc",
//       "label": "addresses[]"
//     },
//     {
//       "source": "[ADDRESSES].USRabc",
//       "target": "ADDRESSES.ADDRESSES[0]",
//       "label": "ADDRESSES[0]"
//     },
//     {
//       "source": "[ADDRESSES].USRabc",
//       "target": "ADDRESSES.ADDRESSES[1]",
//       "label": "ADDRESSES[1]"
//     },
//     {
//       "source": "USER.USRabc",
//       "target": "PREFERENCES.preferencesId",
//       "label": "preferences"
//     },
//     {
//       "source": "PREFERENCES.preferencesId",
//       "target": "NOTIFICATIONS.notificationsId",
//       "label": "notifications"
//     },
//     {
//       "source": "USER.USRabc",
//       "target": "[ORDERHISTORY].USRabc",
//       "label": "orderHistory[]"
//     },
//     {
//       "source": "[ORDERHISTORY].USRabc",
//       "target": "ORDERHISTORY.ORDERHISTORY[0]",
//       "label": "ORDERHISTORY[0]"
//     },
//     {
//       "source": "[ORDERHISTORY].USRabc",
//       "target": "ORDERHISTORY.ORDERHISTORY[1]",
//       "label": "ORDERHISTORY[1]"
//     },
//     {
//       "source": "ROOT.root",
//       "target": "ORDERS.ORDERS1",
//       "label": "orders"
//     },
//     {
//       "source": "ORDERS.ORDERS1",
//       "target": "[ITEMS].ORDERS1",
//       "label": "items[]"
//     },
//     {
//       "source": "[ITEMS].ORDERS1",
//       "target": "ITEMS.ITEM001",
//       "label": "ITEM001"
//     },
//     {
//       "source": "[ITEMS].ORDERS1",
//       "target": "ITEMS.ITEM002",
//       "label": "ITEM002"
//     },
//     {
//       "source": "ROOT.root",
//       "target": "ORDERS.ORDERS2",
//       "label": "orders"
//     },
//     {
//       "source": "ORDERS.ORDERS2",
//       "target": "[ITEMS].ORDERS2",
//       "label": "items[]"
//     },
//     {
//       "source": "[ITEMS].ORDERS2",
//       "target": "ITEMS.ITEM003",
//       "label": "ITEM003"
//     },
//     {
//       "source": "ORDERHISTORY.ORDERHISTORY[0]",
//       "target": "ORDERS.ORDERS1",
//       "label": "L:ORD001"
//     },
//     {
//       "source": "ORDERHISTORY.ORDERHISTORY[1]",
//       "target": "ORDERS.ORDERS2",
//       "label": "L:ORD002"
//     }
//   ]
// }
// `;
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
# Custom scalar for DateTime
scalar DateTime

# Enum for post status
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

# User type
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

# Post type
type Post {
  id: ID!
  title: String!
  content: String
  author: User!
  status: PostStatus!
  createdAt: DateTime!
}

# Input type for creating a new post
input CreatePostInput {
  title: String!
  content: String
  authorId: ID!
  status: PostStatus = DRAFT
}

# Input type for updating a post
input UpdatePostInput {
  title: String
  content: String
  status: PostStatus
}

# Root Query type
type Query {
  # Fetch all users
  users: [User!]!

  # Fetch a single user by ID
  user(id: ID!): User

  # Fetch all posts (optional filter by status)
  posts(status: PostStatus): [Post!]!

  # Fetch a single post by ID
  post(id: ID!): Post
}

# Root Mutation type
type Mutation {
  # Create a new user
  createUser(name: String!, email: String!): User!

  # Create a new post
  createPost(input: CreatePostInput!): Post!

  # Update an existing post
  updatePost(id: ID!, input: UpdatePostInput!): Post!

  # Delete a post by ID
  deletePost(id: ID!): Boolean!
}

# Schema definition (optional in modern GraphQL servers)
schema {
  query: Query
  mutation: Mutation
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

function App() {
  return (
    <div style={{ display: "flex", height: "90vh", width: "96vw" }} >
      {/* <JsonGraphite jsonString={jsonString} options={{"arr": true, "keys": [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId", "buyer_id"]]}} /> */}
      <DataO data={graphql} options={{ type: 'graphql', engine:"graphite"}} />
      {/* <JsonFlowite jsonString={jsonString} options={{"arr": true, "keys": [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId", "buyer_id"]]}} /> */}
      {/* <OpenApiGraph yamls={[yaml1, yaml2]} /> */}
      {/* <JsonGraph jsonstr={jsonString} /> */}
      {/* <OpenApiGraphite yamls={[yaml1, yaml2]} />  */}
      {/* <Graphite jsonString={graphJsonString} />  */}

      {/* <Flowite jsonstr={jsonString} /> */}
    </div>
  );
}

export default App;
