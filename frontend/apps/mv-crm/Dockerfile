# Stage 1: build
FROM node:20-alpine AS builder

ARG VITE_API_URL=https://apics.michelangelodelvalle.com/api
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_PROJECT_ID
ENV VITE_PROJECT_ID=$VITE_PROJECT_ID

WORKDIR /app

# Copiar shared/ y mv-crm/ (vite.config.js resuelve @shared como ../../shared)
COPY shared/ ./shared/
COPY apps/mv-crm/ ./apps/mv-crm/

WORKDIR /app/apps/mv-crm
RUN npm ci
# Symlink node_modules al root para que shared/ pueda resolver sus imports
RUN ln -s /app/apps/mv-crm/node_modules /app/node_modules
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/mv-crm/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
