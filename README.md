# simple-backend-architecture-fastify

**A lightweight, performance-oriented REST API built with Fastify, TypeScript, and MongoDB.**

This project is a backend architecture showcase designed around a **Performance First** philosophy: minimize unnecessary abstractions, reduce runtime overhead, and leverage the native capabilities of the underlying technologies.

Rather than relying on heavyweight frameworks, ORMs, or dependency injection containers, the application adopts a pragmatic functional architecture focused on performance, maintainability, scalability, and developer experience.

## Tech Stack

| Technology                | Purpose                               |
| ------------------------- | ------------------------------------- |
| **Node.js**               | JavaScript runtime                    |
| **TypeScript**            | Static typing and type safety         |
| **Fastify**               | High-performance HTTP framework       |
| **MongoDB Native Driver** | Direct database interaction           |
| **TypeBox + Ajv**         | Schema-based request validation       |
| **JWT (HS256)**           | Stateless access token authentication |
| **Argon2id**              | Secure password hashing               |
| **Docker Compose**        | Containerized application environment |

## Architecture

The application follows a **Functional Layered Architecture**, organized by feature.

```text
HTTP Request
     |
     v
 Fastify Routes
     |
     v
 Service Layer
     |
     v
 Repository Layer
     |
     v
 MongoDB Native Driver
     |
     v
   MongoDB
```

Each layer has a clearly defined responsibility:

- **Routes:** HTTP handling, authentication, request validation, and response schemas.
- **Services:** Business logic and application rules.
- **Repositories:** Database queries, persistence, and data access.

Dependencies are injected through lightweight factory functions and initialized once during module registration.

This approach avoids unnecessary class hierarchies, controller boilerplate, and dependency injection frameworks while preserving separation of concerns and testability.

## Performance-First Design

Performance is a primary architectural consideration throughout the project.

### 1. Fastify Native Capabilities

Fastify provides a low-overhead HTTP layer with schema-based validation and optimized JSON serialization.

The application uses **TypeBox** to define JSON Schema-compatible contracts, allowing Fastify to leverage Ajv for request validation and fast-json-stringify for response serialization.

### 2. MongoDB Native Driver

Instead of introducing an ODM such as Mongoose, the application interacts with MongoDB using its official Node.js driver.

This avoids document hydration overhead and provides direct control over queries, projections, indexes, and database operations.

MongoDB connections are managed through a shared connection pool initialized during application startup.

### 3. Stateless JWT Authentication

Access tokens use signed JWTs with a **10-minute expiration**.

Protected endpoints validate the token cryptographically without querying the database to check session state.

Refresh tokens are handled separately through persistent MongoDB sessions.

This reduces database interaction during authentication while maintaining refresh token rotation and session revocation capabilities.

### 4. Optimized Database Operations

Database access is designed to avoid unnecessary round trips:

- Atomic operations for updates and deletions.
- Ownership checks directly in MongoDB query filters.
- Field projections to retrieve only required data.
- Indexes supporting frequently used filters and sorting.
- Connection pooling for efficient connection reuse.

## Project Structure

The project follows a feature-first modular architecture, where application functionality is organized into independent, self-contained modules rather than grouping all routes, services, and repositories into global directories.

Each feature encapsulates its own HTTP endpoints, business logic, validation schemas, data models, and persistence operations.

This organization improves code discoverability, reduces coupling between unrelated features, and allows the application to grow without introducing unnecessary architectural complexity.

```text
src/
├── app.ts
├── server.ts
│
├── config/
│   └── env.ts
│
├── plugins/
│   ├── auth.ts
│   └── database.ts
│
├── modules/
│   ├── auth/
│   ├── users/
│   └── tasks/
│
├── shared/
│   └── errors/
│
└── types/
    └── fastify.d.ts
```

### Directory Responsibilities

**config/ — Application Configuration**

Centralizes environment variables and configuration schemas. Configuration is validated during application startup using TypeBox and @fastify/env, following a fail-fast approach to prevent the server from starting with invalid or missing settings.

**plugins/ — Infrastructure & Fastify Extensions**

Contains reusable Fastify plugins responsible for infrastructure-level concerns such as database connections and authentication.
Plugins integrate with Fastify's lifecycle and encapsulation system, allowing resources to be initialized once and shared across application modules.

**modules/ — Feature-Based Organization**

Contains the application's business features, each implemented as an independent module.
Every module follows the same internal conventions:

| File             | Responsibility                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| \*.routes.ts     | HTTP endpoints, request handling, authentication hooks, and response codes |
| \*.service.ts    | Business logic, application rules, and data transformations                |
| \*.repository.ts | Database access, queries, projections, and persistence                     |
| \*.schema.ts     | TypeBox validation schemas, HTTP contracts, and TypeScript types           |
| \*.model.ts      | Data structures representing persisted documents                           |
| \*.utils.ts      | Feature-specific utility functions                                         |

New features can be introduced by adding a new directory under modules/ without reorganizing the existing application.

**shared/ — Cross-Cutting Components**

Contains reusable components that are not specific to a single business feature.
Currently, this includes centralized application error classes that provide consistent error handling and standardized HTTP responses.

**types/ — Global TypeScript Extensions**

Contains TypeScript declaration files used to extend framework-level types.
For example, fastify.d.ts defines the custom decorators registered by Fastify plugins, such as the MongoDB connection, application configuration, and authentication middleware.

**app.ts — Application Factory**

Creates and configures the Fastify instance, registers plugins and feature modules, and defines global application behavior.
The application factory is separate from the HTTP server startup, enabling the application to be initialized independently for testing.

**server.ts — Application Entry Point**

Handles HTTP server startup and process lifecycle management, including graceful shutdown through SIGINT and SIGTERM.
This separation keeps infrastructure initialization independent from process execution.

## Getting Started

### Prerequisites

- Node.js compatible with the project configuration
- npm
- Docker and Docker Compose

### Environment Configuration

Create a `.env` file in the project root:

```dotenv
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=fastify_showcase
MONGODB_POOL_SIZE=10

JWT_SECRET=your-generated-secret
CLIENT_ORIGIN=http://localhost:5173
```

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

Replace `JWT_SECRET` with the generated value. Never commit real secrets to version control.

### Option 1 — Run with Docker Compose

Build and start the application and MongoDB:

```bash
docker compose up -d --build
```

Docker Compose starts the backend and database as separate services.

Within the Docker network, the backend connects to MongoDB using:

```text
mongodb://mongo:27017
```

Verify container status:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs -f backend
```

Stop the containers:

```bash
docker compose down
```

MongoDB data persists in a named Docker volume.

### Option 2 — Local Development

Start MongoDB:

```bash
docker compose up -d mongo
```

Ensure the MongoDB service publishes port `27017` to `127.0.0.1` in the local Docker Compose configuration.

Install dependencies:

```bash
npm install
```

Start Fastify with automatic reload:

```bash
npm run dev
```

The backend will be available at:

```text
http://localhost:3000
```

Verify the health endpoint:

```bash
curl http://localhost:3000/health
```

### Production Build

Compile TypeScript:

```bash
npm run build
```

Run the compiled application:

```bash
npm run start
```

## Authentication Flow

1. The client authenticates through `/auth/login`.
2. The backend verifies the credentials.
3. A new session is created in MongoDB.
4. A signed JWT access token is returned in the response.
5. A refresh token is stored in an HttpOnly cookie.
6. Protected routes validate the JWT without a session database lookup.
7. When the access token expires, `/auth/refresh` rotates the refresh token and returns a new access token.
8. Logout revokes the refresh session and clears its cookie.

# Author

Created by Vincenzo Brasca.
