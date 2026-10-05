# Stage 1: Build React SPA
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build argument for backend API URL
ARG VITE_API_URL=http://localhost:5000/api-v1
ENV VITE_API_URL=$VITE_API_URL

# Build the client SPA (outputs to build/client)
RUN npm run build

# Stage 2: Serve static files with lightweight Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/build/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]