# Stage 1: build
FROM node:20-alpine AS builder

ARG VITE_API_URL=https://apics.michelangelodelvalle.com/api
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_PROJECT_ID
ENV VITE_PROJECT_ID=$VITE_PROJECT_ID

WORKDIR /app

COPY shared/ ./shared/
COPY apps/6town-houses/ ./apps/6town-houses/

WORKDIR /app/apps/6town-houses
RUN npm ci
RUN ln -s /app/apps/6town-houses/node_modules /app/node_modules
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/6town-houses/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
