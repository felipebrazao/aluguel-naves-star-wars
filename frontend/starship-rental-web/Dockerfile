# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# A URL da API é baked-in pelo Vite em tempo de build.
# Passe via --build-arg no docker-compose ou na CLI.
ARG VITE_API_URL=http://localhost:8081
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# ── Stage 2: runtime (Nginx) ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Configuração para SPA: fallback de qualquer rota para index.html
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
