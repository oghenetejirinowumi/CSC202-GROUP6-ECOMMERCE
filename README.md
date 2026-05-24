# CSC202-GROUP6-ECOMMERCE

CSC 202 Group 6: Mini E-Commerce App — a full-stack gadget store built with Next.js and Node.js.

## Description

This project is a web-based e-commerce platform where users can browse gadgets, manage a cart, place orders, and view order history.

## Project Objectives

- To design a simple functional e-commerce system.
- To provide a user-friendly interface for customers.
- To understand how online shopping platforms are operated.
- To practice teamwork and collaboration.
- To practice collaboration using GitHub.
- To create proper and structured documentation of the entire process.

## Target Users

- Students
- Small business owners
- Online shoppers
- Companies

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Node.js, Express, SQLite
- **Auth:** JWT (signed tokens on login/register)

## Setup

### Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm run init-db
pnpm start
```

API runs at `http://localhost:50000`.

### Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Location | Variable | Description |
|----------|----------|-------------|
| backend/.env | `PORT` | API port (default 50000) |
| backend/.env | `FRONTEND_ORIGIN` | CORS origin (default http://localhost:3000) |
| backend/.env | `JWT_SECRET` | Secret for signing auth tokens |
| frontend/.env.local | `NEXT_PUBLIC_API_URL` | Backend URL (default http://localhost:50000) |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products |
| POST | `/api/register` | Register user (returns token) |
| POST | `/api/login` | Login (returns token) |
| GET | `/api/cart/:userId` | Get cart (auth required) |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart` | Update quantity |
| DELETE | `/api/cart/:userId/:productId` | Remove item |
| DELETE | `/api/cart/:userId` | Clear cart |
| POST | `/api/orders` | Place order (clears cart) |
| GET | `/api/users/:userId/orders` | Order history |
| GET | `/api/orders/:id` | Order details |

Protected routes require header: `Authorization: Bearer <token>`

## Manual Test Plan

1. Start backend and frontend (see Setup).
2. Open `http://localhost:3000` — products should load on the home page.
3. Register at `/register` — you should be signed in automatically.
4. Click **Add to cart** on a product — cart badge updates, drawer opens.
5. Open cart, change quantity, remove an item.
6. Go to **Checkout** and place order — redirected to order confirmation.
7. Visit **Orders** in the navbar — your order appears in the list.
8. Sign out (click username) and sign in again at `/login`.
9. Try checkout with an empty cart — should show an error or disabled button.

## Project Status

Core shopping flow is implemented: browse → cart → checkout → order history.
