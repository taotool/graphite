
export const flow = `
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

export const json = `
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


export const yaml = `
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

export const graphql: string = `
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

export const openapi = `
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

