export const sampleField = `
{
    "type": "data",
    "nodes": [
      {"id":"SELLER.Seller1.id","name":"id","type":"ID","description":"x"},
      {"id":"SELLER.Seller2.id","name":"x","type":"[Review]","description":"x"},

      {"id":"ITEM.Item1.id","name":"author","type":"User","description":"x"},
      {"id":"ITEM.Item2.id","name":"id","type":"ID","description":"x"},
      {"id":"ITEM.Item3.id","name":"id","type":"ID","description":"x"},

      {"id":"ORDER.Order1.LineItem1","name":"Item1","type":"Item1","description":"2"},
      {"id":"ORDER.Order1.LineItem2","name":"Item2","type":"Item2","description":"2"},


      {"id":"ORDER.Order2.lineitem1","name":"Item1","type":"Item1","description":"1"},
      {"id":"ORDER.Order2.lineitem2","name":"Item2","type":"Item2","description":"1"},

      {"id":"ORDER.Order3.id","name":"Item3","type":"Item3","description":"1"},


      {"id":"LINEITEM.Order1LineItem1.id","name":"Item3","type":"Item3","description":"1"},

      {"id":"LINEITEM.Order1LineItem2.id","name":"Item3","type":"Item3","description":"1"},

      {"id":"LINEITEM.Order2LineItem1.id","name":"Item3","type":"Item3","description":"1"},
      {"id":"LINEITEM.Order2LineItem2.id","name":"Item3","type":"Item3","description":"1"},
      {"id":"LINEITEM.Order3LineItem1.id","name":"Item3","type":"Item3","description":"1"},


      {"id":"UNIT.Item1_Unit1.unit1","name":"Item1","type":"Item1","description":"Order1"},
      {"id":"UNIT.Item1_Unit2.id","name":"Item1","type":"Item1","description":"Order1"},
      {"id":"UNIT.Item1_Unit3.id","name":"Item1","type":"Item1","description":"Order2"},
      
      {"id":"UNIT.Item2_Unit1.id","name":"Item2","type":"Item2","description":"Order1"},
      {"id":"UNIT.Item2_Unit2.id","name":"Item2","type":"Item2","description":"Order1"},
      {"id":"UNIT.Item2_Unit3.id","name":"Item2","type":"Item2","description":"Order2"},


      {"id":"UNIT.Item3_Unit1.id","name":"Item3","type":"Item3","description":"Order3"},

      
      {"id":"PACKAGE.Package1.id","name":"author","type":"User","description":"x"},
      {"id":"PACKAGE.Package1.unit1","name":"","type":"Item1","description":"Order1"},
      {"id":"PACKAGE.Package1.unit1","name":"","type":"Item2","description":"Order1"},

      {"id":"PACKAGE.Package2.id","name":"id","type":"ID","description":"x"},
      {"id":"PACKAGE.Package2.unit2","name":"product","type":"Item1","description":"Order1"},
      {"id":"PACKAGE.Package2.unit3","name":"product","type":"Item1","description":"Order2"},
      {"id":"PACKAGE.Package2.unit2","name":"product","type":"Item2","description":"Order1"},
      {"id":"PACKAGE.Package2.unit3","name":"product","type":"Item2","description":"Order2"},

      {"id":"PACKAGE.Package3.id","name":"id","type":"ID","description":"x"},
      {"id":"PACKAGE.Package3.unit1","name":"","type":"Item3","description":"Order3"},


      {"id":"AG.Hub.event1","name":"","type":"Item3","description":"Order3"},
      {"id":"AG.Hub.event2","name":"","type":"Item3","description":"Order3"},
      {"id":"AG.Hub.event3","name":"","type":"Item3","description":"Order3"},
      {"id":"CG.Hub.event1","name":"","type":"Item3","description":"Order3"},

      {"id":"BUYER.Buyer1.id","name":"id","type":"ID","description":"x"},
      {"id":"BUYER.Buyer1.name","name":"name","type":"String","description":"x"},
      {"id":"BUYER.Buyer2.id","name":"x","type":"[Review]","description":"x"},
            {"id":"BUYER.Buyer3.id","name":"x","type":"[Review]","description":"x"},

      {"id":"BUYER.Buyer2.name","name":"username","type":"String","description":"x"}
    ],
    "edges": [
      { "source": "SELLER.Seller1.id", "target": "ITEM.Item1.id", "weight": "list" },
      { "source": "SELLER.Seller2.id", "target": "ITEM.Item2.id", "weight": "list" },
      { "source": "SELLER.Seller2.id", "target": "ITEM.Item3.id", "weight": "list" },

      { "source": "ITEM.Item1.id", "target": "ORDER.Order1.id", "weight": "order" },
      { "source": "ITEM.Item1.id", "target": "ORDER.Order2.id", "weight": "order" },

      { "source": "ITEM.Item2.id", "target": "ORDER.Order1.id", "weight": "order" },    
      { "source": "ITEM.Item2.id", "target": "ORDER.Order2.id", "weight": "order" },

      { "source": "ITEM.Item3.id", "target": "ORDER.Order3.id", "weight": "order" },


      { "source": "ORDER.Order1.id", "target": "LINEITEM.Order1LineItem1.id", "weight": "contains" },
      { "source": "ORDER.Order1.id", "target": "LINEITEM.Order1LineItem2.id", "weight": "contains" },
      { "source": "ORDER.Order2.id", "target": "LINEITEM.Order2LineItem1.id", "weight": "contains" },
      { "source": "ORDER.Order2.id", "target": "LINEITEM.Order2LineItem2.id", "weight": "contains" },
      { "source": "ORDER.Order3.id", "target": "LINEITEM.Order3LineItem1.id", "weight": "contains" },




      { "source": "LINEITEM.Order1LineItem1.id", "target": "UNIT.Item1_Unit1.id", "weight": "contains" },
      { "source": "LINEITEM.Order1LineItem1.id", "target": "UNIT.Item1_Unit2.id", "weight": "contains" },
      { "source": "LINEITEM.Order1LineItem2.id", "target": "UNIT.Item2_Unit1.id", "weight": "contains" },
      { "source": "LINEITEM.Order1LineItem2.id", "target": "UNIT.Item2_Unit2.id", "weight": "contains" },
      { "source": "LINEITEM.Order2LineItem1.id", "target": "UNIT.Item1_Unit3.id", "weight": "contains" },
      { "source": "LINEITEM.Order2LineItem2.id", "target": "UNIT.Item2_Unit3.id", "weight": "contains" },
      { "source": "LINEITEM.Order3LineItem1.id", "target": "UNIT.Item3_Unit1.id", "weight": "contains" },


      { "source": "UNIT.Item1_Unit1.id", "target": "PACKAGE.Package1.id", "weight": "belongs to" },
      { "source": "UNIT.Item1_Unit2.id", "target": "PACKAGE.Package2.id", "weight": "belongs to" },
      { "source": "UNIT.Item1_Unit3.id", "target": "PACKAGE.Package2.id", "weight": "belongs to" },
      

      { "source": "UNIT.Item2_Unit1.id", "target": "PACKAGE.Package1.id", "weight": "belongs to" },
      { "source": "UNIT.Item2_Unit2.id", "target": "PACKAGE.Package2.id", "weight": "belongs to" },
      { "source": "UNIT.Item2_Unit3.id", "target": "PACKAGE.Package2.id", "weight": "belongs to" },

      { "source": "UNIT.Item3_Unit1.id", "target": "PACKAGE.Package3.id", "weight": "belongs to" },


      { "source": "PACKAGE.Package1.id", "target": "BUYER.Buyer1.id", "weight": "deliver" },
      { "source": "PACKAGE.Package2.id", "target": "BUYER.Buyer1.id", "weight": "deliver" },
      { "source": "PACKAGE.Package2.id", "target": "BUYER.Buyer3.id", "weight": "deliver" },

      { "source": "UNIT.Item3_Unit1.id", "target": "AG.Hub.id", "weight": "authenticate" },
      { "source": "AG.Hub.id", "target": "CG.Hub.id", "weight": "grade" },
      { "source": "CG.Hub.id", "target": "BUYER.Buyer2.id", "weight": "deliver" }

    ]
  }

`;
export const sampleEntity = `

{
  "metadata": {},
  "nodes": [
    {
      "id": "ROOT.root",
      "name": "root",
      "type": "ROOT",
      "fields": [
        {
          "id": "ROOT.root.id",
          "name": "id",
          "type": "root",
          "value": "{...}",
          "parents": [
            "a.b.c"
          ],
          "children": [
            "USER.USRabc.id",
            "ORDERS.ORDERS1.orderId",
            "ORDERS.ORDERS2.orderId"
          ]
        }
      ]
    },
    {
      "id": "USER.USRabc",
      "name": "USRabc",
      "type": "USER",
      "fields": [
        {
          "id": "USER.USRabc.id",
          "name": "id",
          "type": "string",
          "value": "USRabc"
        },
        {
          "id": "USER.USRabc.addresses",
          "name": "addresses",
          "type": "object",
          "value": "[...]"
        },
        {
          "id": "USER.USRabc.preferences",
          "name": "preferences",
          "type": "preferences",
          "value": "{...}"
        },
        {
          "id": "USER.USRabc.orderHistory",
          "name": "orderHistory",
          "type": "object",
          "value": "[...]"
        }
      ]
    },
    {
      "id": "[ADDRESSES].USRabc",
      "name": "USRabc",
      "type": "[ADDRESSES]",
      "fields": [
        {
          "id": "[ADDRESSES].USRabc.ADDRESSES[0]",
          "name": "ADDRESSES[0]",
          "type": "object",
          "value": "{...}"
        },
        {
          "id": "[ADDRESSES].USRabc.ADDRESSES[1]",
          "name": "ADDRESSES[1]",
          "type": "object",
          "value": "{...}"
        }
      ]
    },
    {
      "id": "ADDRESSES.ADDRESSES[0]",
      "name": "ADDRESSES[0]",
      "type": "ADDRESSES",
      "fields": [
        {
          "id": "ADDRESSES.ADDRESSES[0].type",
          "name": "type",
          "type": "string",
          "value": "home"
        },
        {
          "id": "ADDRESSES.ADDRESSES[0].street",
          "name": "street",
          "type": "string",
          "value": "123 Main St"
        },
        {
          "id": "ADDRESSES.ADDRESSES[0].city",
          "name": "city",
          "type": "string",
          "value": "Anytown"
        },
        {
          "id": "ADDRESSES.ADDRESSES[0].zipCode",
          "name": "zipCode",
          "type": "string",
          "value": "12345"
        }
      ]
    },
    {
      "id": "ADDRESSES.ADDRESSES[1]",
      "name": "ADDRESSES[1]",
      "type": "ADDRESSES",
      "fields": [
        {
          "id": "ADDRESSES.ADDRESSES[1].type",
          "name": "type",
          "type": "string",
          "value": "work"
        },
        {
          "id": "ADDRESSES.ADDRESSES[1].street",
          "name": "street",
          "type": "string",
          "value": "456 Business Ave"
        },
        {
          "id": "ADDRESSES.ADDRESSES[1].city",
          "name": "city",
          "type": "string",
          "value": "Metropolis"
        },
        {
          "id": "ADDRESSES.ADDRESSES[1].zipCode",
          "name": "zipCode",
          "type": "string",
          "value": "67890"
        }
      ]
    },
    {
      "id": "PREFERENCES.preferencesId",
      "name": "preferencesId",
      "type": "PREFERENCES",
      "fields": [
        {
          "id": "PREFERENCES.preferencesId.newsletter",
          "name": "newsletter",
          "type": "boolean",
          "value": "true"
        },
        {
          "id": "PREFERENCES.preferencesId.notifications",
          "name": "notifications",
          "type": "notifications",
          "value": "{...}"
        }
      ]
    },
    {
      "id": "NOTIFICATIONS.notificationsId",
      "name": "notificationsId",
      "type": "NOTIFICATIONS",
      "fields": [
        {
          "id": "NOTIFICATIONS.notificationsId.email",
          "name": "email",
          "type": "boolean",
          "value": "true"
        },
        {
          "id": "NOTIFICATIONS.notificationsId.sms",
          "name": "sms",
          "type": "boolean",
          "value": "false"
        }
      ]
    },
    {
      "id": "[ORDERHISTORY].USRabc",
      "name": "USRabc",
      "type": "[ORDERHISTORY]",
      "fields": [
        {
          "id": "[ORDERHISTORY].USRabc.ORDERHISTORY[0]",
          "name": "ORDERHISTORY[0]",
          "type": "object",
          "value": "{...}"
        },
        {
          "id": "[ORDERHISTORY].USRabc.ORDERHISTORY[1]",
          "name": "ORDERHISTORY[1]",
          "type": "object",
          "value": "{...}"
        }
      ]
    },
    {
      "id": "ORDERHISTORY.ORDERHISTORY[0]",
      "name": "ORDERHISTORY[0]",
      "type": "ORDERHISTORY",
      "fields": [
        {
          "id": "ORDERHISTORY.ORDERHISTORY[0].orderId",
          "name": "orderId",
          "type": "string",
          "value": "ORD001"
        }
      ]
    },
    {
      "id": "ORDERHISTORY.ORDERHISTORY[1]",
      "name": "ORDERHISTORY[1]",
      "type": "ORDERHISTORY",
      "fields": [
        {
          "id": "ORDERHISTORY.ORDERHISTORY[1].orderId",
          "name": "orderId",
          "type": "string",
          "value": "ORD002"
        }
      ]
    },
    {
      "id": "ORDERS.ORDERS1",
      "name": "ORDERS1",
      "type": "ORDERS",
      "fields": [
        {
          "id": "ORDERS.ORDERS1.orderId",
          "name": "orderId",
          "type": "string",
          "value": "ORD001"
        },
        {
          "id": "ORDERS.ORDERS1.date",
          "name": "date",
          "type": "string",
          "value": "2025-08-15"
        },
        {
          "id": "ORDERS.ORDERS1.items",
          "name": "items",
          "type": "object",
          "value": "[...]"
        },
        {
          "id": "ORDERS.ORDERS1.totalAmount",
          "name": "totalAmount",
          "type": "number",
          "value": "1250"
        }
      ]
    },
    {
      "id": "[ITEMS].ORDERS1",
      "name": "ORDERS1",
      "type": "[ITEMS]",
      "fields": [
        {
          "id": "[ITEMS].ORDERS1.ITEM001",
          "name": "ITEM001",
          "type": "object",
          "value": "{...}"
        },
        {
          "id": "[ITEMS].ORDERS1.ITEM002",
          "name": "ITEM002",
          "type": "object",
          "value": "{...}"
        }
      ]
    },
    {
      "id": "ITEMS.ITEM001",
      "name": "ITEM001",
      "type": "ITEMS",
      "fields": [
        {
          "id": "ITEMS.ITEM001.id",
          "name": "id",
          "type": "string",
          "value": "ITEM001"
        },
        {
          "id": "ITEMS.ITEM001.productId",
          "name": "productId",
          "type": "string",
          "value": "PROD001"
        },
        {
          "id": "ITEMS.ITEM001.name",
          "name": "name",
          "type": "string",
          "value": "Laptop"
        },
        {
          "id": "ITEMS.ITEM001.quantity",
          "name": "quantity",
          "type": "number",
          "value": "1"
        },
        {
          "id": "ITEMS.ITEM001.price",
          "name": "price",
          "type": "number",
          "value": "1200"
        }
      ]
    },
    {
      "id": "ITEMS.ITEM002",
      "name": "ITEM002",
      "type": "ITEMS",
      "fields": [
        {
          "id": "ITEMS.ITEM002.id",
          "name": "id",
          "type": "string",
          "value": "ITEM002"
        },
        {
          "id": "ITEMS.ITEM002.productId",
          "name": "productId",
          "type": "string",
          "value": "PROD003"
        },
        {
          "id": "ITEMS.ITEM002.name",
          "name": "name",
          "type": "string",
          "value": "Mouse"
        },
        {
          "id": "ITEMS.ITEM002.quantity",
          "name": "quantity",
          "type": "number",
          "value": "2"
        },
        {
          "id": "ITEMS.ITEM002.price",
          "name": "price",
          "type": "number",
          "value": "25"
        }
      ]
    },
    {
      "id": "ORDERS.ORDERS2",
      "name": "ORDERS2",
      "type": "ORDERS",
      "fields": [
        {
          "id": "ORDERS.ORDERS2.orderId",
          "name": "orderId",
          "type": "string",
          "value": "ORD002"
        },
        {
          "id": "ORDERS.ORDERS2.date",
          "name": "date",
          "type": "string",
          "value": "2025-09-01"
        },
        {
          "id": "ORDERS.ORDERS2.items",
          "name": "items",
          "type": "object",
          "value": "[...]"
        },
        {
          "id": "ORDERS.ORDERS2.totalAmount",
          "name": "totalAmount",
          "type": "number",
          "value": "75"
        }
      ]
    },
    {
      "id": "[ITEMS].ORDERS2",
      "name": "ORDERS2",
      "type": "[ITEMS]",
      "fields": [
        {
          "id": "[ITEMS].ORDERS2.ITEM003",
          "name": "ITEM003",
          "type": "object",
          "value": "{...}"
        }
      ]
    },
    {
      "id": "ITEMS.ITEM003",
      "name": "ITEM003",
      "type": "ITEMS",
      "fields": [
        {
          "id": "ITEMS.ITEM003.id",
          "name": "id",
          "type": "string",
          "value": "ITEM003"
        },
        {
          "id": "ITEMS.ITEM003.productId",
          "name": "productId",
          "type": "string",
          "value": "PROD005"
        },
        {
          "id": "ITEMS.ITEM003.name",
          "name": "name",
          "type": "string",
          "value": "Keyboard"
        },
        {
          "id": "ITEMS.ITEM003.quantity",
          "name": "quantity",
          "type": "number",
          "value": "1"
        },
        {
          "id": "ITEMS.ITEM003.price",
          "name": "price",
          "type": "number",
          "value": "75"
        }
      ]
    }
  ],
  "edges": [
    {
      "source": "ROOT.root",
      "target": "USER.USRabc",
      "label": "user"
    },
    {
      "source": "USER.USRabc",
      "target": "[ADDRESSES].USRabc",
      "label": "addresses[]"
    },
    {
      "source": "[ADDRESSES].USRabc",
      "target": "ADDRESSES.ADDRESSES[0]",
      "label": "ADDRESSES[0]"
    },
    {
      "source": "[ADDRESSES].USRabc",
      "target": "ADDRESSES.ADDRESSES[1]",
      "label": "ADDRESSES[1]"
    },
    {
      "source": "USER.USRabc",
      "target": "PREFERENCES.preferencesId",
      "label": "preferences"
    },
    {
      "source": "PREFERENCES.preferencesId",
      "target": "NOTIFICATIONS.notificationsId",
      "label": "notifications"
    },
    {
      "source": "USER.USRabc",
      "target": "[ORDERHISTORY].USRabc",
      "label": "orderHistory[]"
    },
    {
      "source": "[ORDERHISTORY].USRabc",
      "target": "ORDERHISTORY.ORDERHISTORY[0]",
      "label": "ORDERHISTORY[0]"
    },
    {
      "source": "[ORDERHISTORY].USRabc",
      "target": "ORDERHISTORY.ORDERHISTORY[1]",
      "label": "ORDERHISTORY[1]"
    },
    {
      "source": "ROOT.root",
      "target": "ORDERS.ORDERS1",
      "label": "orders"
    },
    {
      "source": "ORDERS.ORDERS1",
      "target": "[ITEMS].ORDERS1",
      "label": "items[]"
    },
    {
      "source": "[ITEMS].ORDERS1",
      "target": "ITEMS.ITEM001",
      "label": "ITEM001"
    },
    {
      "source": "[ITEMS].ORDERS1",
      "target": "ITEMS.ITEM002",
      "label": "ITEM002"
    },
    {
      "source": "ROOT.root",
      "target": "ORDERS.ORDERS2",
      "label": "orders"
    },
    {
      "source": "ORDERS.ORDERS2",
      "target": "[ITEMS].ORDERS2",
      "label": "items[]"
    },
    {
      "source": "[ITEMS].ORDERS2",
      "target": "ITEMS.ITEM003",
      "label": "ITEM003"
    },
    {
      "source": "ORDERHISTORY.ORDERHISTORY[0]",
      "target": "ORDERS.ORDERS1",
      "label": "L:ORD001"
    },
    {
      "source": "ORDERHISTORY.ORDERHISTORY[1]",
      "target": "ORDERS.ORDERS2",
      "label": "L:ORD002"
    }
  ]
}

`;

export const sampleJson = `
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


export const sampleYaml = `
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

export const sampleGraphql: string = `
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
  posts(limit: Int, offset: Int): [Post!]!  # <-- Query args on field
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

input UserFilter {
  role: Role
  nameContains: String
}

# Queries with args
type Query {
  user(id: ID!): User!                     # <-- Input arg
  users(filter: UserFilter, limit: Int): [User!]!  # <-- InputObject + Scalar args
  search(term: String!): [SearchResult!]!
}

# Mutations with input objects
type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
}

# Subscriptions
type Subscription {
  newPost: Post!
}


`;

export const sampleOpenapi = `
---
openapi: 3.0.3
info:
  title: Multi-root API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /orders/{id}:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
    Order:
      type: object
      properties:
        id:
          type: string
        total:
          type: number
`;

