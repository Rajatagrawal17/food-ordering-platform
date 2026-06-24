# API Documentation

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

## Security

- `GET /api/csrf-token`

## Catalog

- `GET /api/categories`
- `GET /api/foods`
- `GET /api/foods/:id`
- `POST /api/foods`
- `PATCH /api/foods/:id`
- `DELETE /api/foods/:id`
- `GET /api/reviews/featured`
- `GET /api/reviews/food/:foodId`
- `POST /api/reviews`

## Cart

- `GET /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`

## Payments

- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/failure`

## Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`

## Uploads

- `POST /api/uploads/image`

## Admin

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/orders`
