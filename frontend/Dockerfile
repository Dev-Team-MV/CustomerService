# Stage 1: build
FROM node:20-alpine AS builder

# Para Jenkins: build-arg VITE_API_URL (producción vs desarrollo)
ARG VITE_API_URL=https://apics.michelangelodelvalle.com/api
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_PROJECT_ID
ENV VITE_PROJECT_ID=$VITE_PROJECT_ID

WORKDIR /app

# Copiar shared/ y lakewood-p1/ (vite.config.js resuelve @shared como ../../shared)
COPY shared/ ./shared/
COPY apps/lakewood-p1/ ./apps/lakewood-p1/

WORKDIR /app/apps/lakewood-p1
RUN npm ci
# Symlink node_modules al root para que shared/ pueda resolver sus imports
RUN ln -s /app/apps/lakewood-p1/node_modules /app/node_modules
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/lakewood-p1/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
