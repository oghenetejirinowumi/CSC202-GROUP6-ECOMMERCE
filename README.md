# CSC202-GROUP6-ECOMMERCE
CSC 202 Group 6: Mini E-Commerce App A full-stack React 19 and Node.js application built with TypeScript, Prisma, and Supabase. Features a type-safe API, shadcn/ui components, and a automated Git workflow.

## Backend API Quick Test (curl)

Use these commands to test the SQLite + Express backend in `backend/`.

### 1) Install backend dependencies

```bash
cd backend
pnpm add sqlite3 express cors bcrypt
```

### 2) Initialize database

```bash
pnpm run init-db
```

### 3) Start API server (port 50000)

```bash
pnpm start
```

### 4) Test routes with curl

Get all products:

```bash
curl http://localhost:50000/api/products
```

Register a user:

```bash
curl -X POST http://localhost:50000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "brian",
    "email": "brian@example.com",
    "password": "mypassword123"
  }'
```

Create an order (replace `1` with a real user ID from register response):

```bash
curl -X POST http://localhost:50000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "total": 2499.98
  }'
```
