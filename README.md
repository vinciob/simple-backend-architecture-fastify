# simple-backend-architecture-fastify

Fastify implementation of the `simple-backend-architecture-showcase` project.
This repository implements a simple backend API using **Fastify**, **TypeScript**, **MongoDB**, **Mongoose**, **Zod** and **JWT authentication**.
The domain is intentionally simple: users can register, login and manage their own todos.  
The main goal is to showcase clean backend architecture, request validation, authentication middleware and ownership-based access control.

---

# Tech Stack
- Node.js
- TypeScript
- Fastify
- MongoDB
- Mongoose
- Zod
- JWT
- bcrypt
- dotenv

---

# Features
- User registration
- User login
- JWT authentication
- Protected routes
- Authenticated user injected into request context
- Todo CRUD
- Todo ownership validation
- Zod request validation
- Mongoose models
- Centralized environment configuration
- Modular project structure

---

# API Routes

## Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Todos

```http
POST   /api/todos
GET    /api/todos
GET    /api/todos/:todoId
PATCH  /api/todos/:todoId
DELETE /api/todos/:todoId
PATCH  /api/todos/:todoId/complete
PATCH  /api/todos/:todoId/reopen
```

---

# Architecture

```txt
src/
  config/
    env.ts
  db/
    connection.ts
  entities/
    user.entity.ts
    todo.entity.ts
  middleware/
    validateToken.ts
  routes/
    auth.routes.ts
    todo.routes.ts
  controllers/
    auth/
      registerUser.ts
      loginUser.ts
      getMe.ts
    todos/
      createTodo.ts
      getTodos.ts
      getTodoById.ts
      updateTodo.ts
      deleteTodo.ts
      completeTodo.ts
      reopenTodo.ts
  lib/
    authUtils.ts
    logger.ts
    validateObjectId.ts
  app.ts
  server.ts
```

---

# Authentication Flow

Protected routes use a JWT middleware that:
1. reads the `Authorization` header
2. validates the Bearer token
3. loads the authenticated user from MongoDB
4. attaches basic user information to `request.user`
5. allows the controller to access the authenticated user safely

Example request header:

```http
Authorization: Bearer <token>
```

---

# Entity Design

Each entity is kept as a single source of truth.
For this demo project, each entity file contains:
- Mongoose schema and model
- Zod validation schemas
- TypeScript inferred types

Example:

```txt
entities/
  user.entity.ts
  todo.entity.ts
```

This keeps the domain definition simple, centralized and easy to inspect.

---

# Environment Variables

Create a `.env` file using `.env.example` as reference.

```env
PORT=5001
NODE_ENV=development
DB_URI=mongodb://localhost:27017/todo-fastify
JWT_SECRET=your-secret-key

```

---

# Getting Started

## Install dependencies

```bash
npm install
```

## Run in development mode

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start production build

```bash
npm start
```

---

# Example Payloads

## Register

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "sex": "male",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+390000000000"
}
```

## Login

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

## Create Todo

```json
{
  "title": "Study Fastify architecture",
  "description": "Review routes, middleware, validation and entity design",
  "priority": "high",
  "dueDate": "2026-05-30T10:00:00.000Z"
}
```

---

# Related Project

This repository is part of:

```txt
simple-backend-architecture-showcase
```

Other planned implementations:
- Express
- FastAPI
- Django REST Framework

---

# Author

Created by Vincenzo Brasca.
