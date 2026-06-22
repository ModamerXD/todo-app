# TaskFlow — Modular ToDo Application

A fully containerized, secure ToDo application built as a three-tier architecture: React frontend, Node.js/Express REST API, and PostgreSQL database. Each tier runs in its own Docker container and communicates over isolated Docker networks.

---

## Quick Start

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Docker | 24.x |
| Docker Compose | 2.x (`docker compose`) |

### 1. Clone the repository

```bash
git clone <repo-url>
cd todo-app
```

### 2. Configure environment

A working `.env` file is included. **Before production use**, update these values:

```bash
# Generate a secure JWT secret:
openssl rand -hex 64

# Then set in .env:
JWT_SECRET=<your-generated-secret>
POSTGRES_PASSWORD=<strong-db-password>
DB_PASSWORD=<same-strong-db-password>
```

### 3. Build and run

```bash
docker compose up --build
```

> First build takes ~2–3 minutes (npm install + React build). Subsequent starts are fast.

### 4. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/health |

### Stop the app

```bash
docker compose down          # stop containers
docker compose down -v       # stop containers + delete DB volume (full reset)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Host                              │
│                                                                 │
│  ┌──────────────────┐   frontend_net   ┌──────────────────┐     │
│  │   taskflow_      │ ──────────────── │   taskflow_      │     │
│  │   frontend       │                  │   backend        │     │
│  │  (nginx:80)      │                  │  (node:5000)     │     │
│  │  React SPA       │                  │  Express REST    │     │
│  └──────────────────┘                  └──────────────────┘     │
│        Port 3000                              Port 5000         │
│                                               │ backend_net     │
│                                         ┌─────┴─────────────┐   │
│                                         │  taskflow_db      │   │
│                                         │  (postgres:5432)  │   │
│                                         │  (not exposed)    │   │
│                                         └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Network isolation

- **`backend_net`**: Only `db` and `backend` containers. The database is never reachable from the frontend container.
- **`frontend_net`**: Only `frontend` and `backend` containers.
- The PostgreSQL port (5432) is not published to the host — only the backend can connect to it.

### Startup order with health checks

```
db (healthy) → backend (healthy) → frontend
```

Docker Compose `depends_on` with `condition: service_healthy` ensures each layer only starts once the layer below is ready.

---

## Authentication Approach

Token-based authentication using **JSON Web Tokens (JWT)**.

### Flow

```
Register / Login
      │
      ▼
 Backend validates credentials
      │
      ▼
 JWT signed with HS256 (secret from env)
 Payload: { id, email, username }
 Expiry:  7 days (configurable)
      │
      ▼
 Token returned to client
      │
      ▼
 Client stores token in localStorage
 Attaches it as: Authorization: Bearer <token>
      │
      ▼
 Backend middleware verifies token on every
 protected route — no DB lookup needed per request
```

### Security measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcryptjs, cost factor 12 |
| JWT secrets | Environment variable, never hardcoded |
| Rate limiting | 20 auth requests / 15 min (express-rate-limit) |
| Generic error messages | Login returns same error for wrong email **and** wrong password (prevents user enumeration) |
| HTTPS-ready | Add a reverse proxy (e.g., Traefik/nginx) in front for TLS in production |
| Helmet.js | Sets 11 security-related HTTP headers |
| CORS | Restricted to `FRONTEND_URL` only |
| Input validation | express-validator on every route |
| Body size limit | 10 KB maximum request body |

---

## Database Structure

```sql
┌─────────────────────────────────┐
│ users                           │
├─────────────────────────────────┤
│ id            UUID  PK          │
│ username      VARCHAR(50) UNIQUE│
│ email         VARCHAR(255)UNIQUE│
│ password_hash VARCHAR(255)      │
│ created_at    TIMESTAMPTZ       │
│ updated_at    TIMESTAMPTZ       │
└─────────────────┬───────────────┘
                  │ 1
                  │
                  │ N
┌─────────────────▼───────────────┐
│ todos                           │
├─────────────────────────────────┤
│ id            UUID  PK          │
│ user_id       UUID  FK → users  │
│ title         VARCHAR(255)      │
│ description   TEXT  nullable    │
│ completed     BOOLEAN  = false  │
│ priority      VARCHAR(10)       │
│               CHECK IN          │
│               ('low','medium',  │
│               'high')           │
│ due_date      TIMESTAMPTZ null  │
│ created_at    TIMESTAMPTZ       │
│ updated_at    TIMESTAMPTZ       │
└─────────────────────────────────┘
```

### Indexes

| Index | Purpose |
|-------|---------|
| `idx_todos_user_id` | Fast per-user todo lookup |
| `idx_todos_completed` | Efficient filter by status |
| `idx_users_email` | Fast login lookup |

### Triggers

`trigger_set_timestamp` automatically updates `updated_at` on every row modification for both tables.

---

## REST API Reference

All `/api/todos` routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in, receive JWT |
| `GET`  | `/api/auth/me` | Get current user profile |

### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/todos` | List todos (optional `?completed=true/false&priority=high`) |
| `GET`    | `/api/todos/stats` | Get task counts by status/priority |
| `GET`    | `/api/todos/:id` | Get single todo |
| `POST`   | `/api/todos` | Create todo |
| `PATCH`  | `/api/todos/:id` | Update todo (partial) |
| `DELETE` | `/api/todos/:id` | Delete todo |

#### Example: Create todo

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull request",
    "description": "Check the auth refactor PR",
    "priority": "high",
    "dueDate": "2026-06-20"
  }'
```

---

## Project Structure

```
todo-app/
├── docker-compose.yml          # Orchestrates all three containers
├── .env                        # Environment variables (secrets)
├── .gitignore
│
├── database/
│   └── init.sql                # Schema + indexes + triggers
│
├── backend/                    # Node.js / Express API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # App entry, middleware setup
│       ├── config/
│       │   └── database.js     # pg Pool configuration
│       ├── middleware/
│       │   ├── auth.js         # JWT verification
│       │   └── errorHandler.js # Validation + global errors
│       ├── models/
│       │   ├── User.js         # User DB operations + bcrypt
│       │   └── Todo.js         # Todo CRUD operations
│       ├── controllers/
│       │   ├── authController.js
│       │   └── todoController.js
│       └── routes/
│           ├── auth.js         # /api/auth/* with validation rules
│           └── todos.js        # /api/todos/* with validation rules
│
└── frontend/                   # React SPA served by nginx
    ├── Dockerfile              # Multi-stage: build → nginx
    ├── nginx.conf              # SPA routing + security headers
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css           # Full design system (dark theme)
        ├── App.js              # Auth-aware routing
        ├── context/
        │   └── AuthContext.js  # Global auth state + token management
        ├── services/
        │   └── api.js          # Axios instance + interceptors
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   └── Dashboard.js    # Main task management view
        └── components/
            ├── TodoForm.js     # Create / edit form
            └── TodoItem.js     # Single task card with inline edit
```

---

## Design Decisions

### Why JWT over sessions?

JWTs are stateless — the backend doesn't need a session store or DB lookup on every request. This makes the architecture simpler and horizontally scalable. The tradeoff (tokens aren't revocable before expiry) is acceptable at this scope; a refresh-token rotation scheme can be added later.

### Why PATCH instead of PUT for updates?

PATCH allows partial updates — the client sends only the fields that changed. This is more efficient and avoids accidental overwrites from stale client state.

### Why separate Docker networks?

Keeping `backend_net` (db + backend) isolated from `frontend_net` (backend + frontend) means a compromised frontend container cannot directly reach the database — it must go through the API which enforces auth and validation.

### Why UUID primary keys?

UUIDs prevent sequential ID enumeration attacks and are safe to expose in API responses. `gen_random_uuid()` is used so the DB generates them server-side.
