# Architecture

## Overview

The platform uses an npm workspace monorepo with a React/Vite client and an Express/Mongo backend. The backend follows a layered design with routes, controllers, services, repositories, models, and utilities.

## Backend Flow

Request -> middleware -> route -> controller -> service -> repository -> database.

Cross-cutting concerns include authentication, authorization, validation, CSRF protection, sanitization, logging, rate limiting, and Socket.IO events.

## Frontend Flow

UI -> pages -> hooks/context -> services -> api clients.

The app uses lazy-loaded routes, Context API state, Axios interceptors, and Socket.IO subscriptions for real-time updates.

## Domain Modules

- Authentication and refresh rotation
- Catalog and category discovery
- Cart persistence
- Razorpay checkout and verification
- Order history and tracking
- Admin analytics and live updates
- Cloudinary uploads
- Reviews and seeded demo data
