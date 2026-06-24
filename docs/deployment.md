# Deployment

## Container Strategy

- Backend image runs the Express API directly from source.
- Frontend image builds the Vite app and serves static assets through Nginx.
- MongoDB is provided by the compose stack or an external managed service.

## Release Flow

1. Validate environment variables.
2. Run lint and tests.
3. Build frontend and backend.
4. Push container images.
5. Trigger deployment through the CI workflow hook.

## Operational Checks

- `/api/health` must return database readiness.
- Socket.IO connections must authenticate with access tokens.
- Payment verification must be successful before order creation.