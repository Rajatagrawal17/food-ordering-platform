# Food Ordering Platform

Production-ready full-stack food ordering platform built with React, Node.js, Express, and MongoDB.

## Architecture

- `client/`: React frontend with Vite
- `server/`: Express API with MongoDB and JWT authentication
- Root workspace: shared scripts and orchestration

## Features

- Authentication with access and refresh tokens
- Role-based access control
- Food catalog with categories, search, and filters
- Persistent cart
- Razorpay checkout and payment verification
- Real-time order tracking and admin updates
- Cloudinary image upload flow
- Reviews, seeded demo data, and sample carts
- Validation, pagination, centralized error handling, and CSRF protection
- Docker, CI/CD, and test suites

## Development

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Seed the database with `npm run seed --workspace server`
4. Start both apps with `npm run dev`

## Development Scripts

- `npm run lint`
- `npm run test`
- `npm run test:coverage`
- `npm run build`

## Route Map

### Public Frontend Routes

- `/`
- `/menu`
- `/login`
- `/register`
- `/cart`
- `/orders`
- `/orders/:orderId`

### Protected Frontend Routes

- `/checkout`
- `/profile`
- `/admin`

### API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/foods`
- `POST /api/foods`
- `GET /api/foods/:id`
- `PATCH /api/foods/:id`
- `DELETE /api/foods/:id`
- `GET /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/items/:itemId`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/failure`
- `GET /api/categories`
- `GET /api/reviews/featured`
- `GET /api/reviews/food/:foodId`
- `POST /api/uploads/image`
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/orders`

## Roadmap

- Authentication and authorization
- Catalog management and search
- Cart persistence and checkout flow
- Order tracking and status updates
- Admin analytics and moderation
- Testing and deployment hardening
