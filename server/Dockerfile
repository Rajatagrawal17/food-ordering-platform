FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --workspace server --omit=dev
COPY . .
WORKDIR /app/server
EXPOSE 5000
CMD ["node", "app.js"]