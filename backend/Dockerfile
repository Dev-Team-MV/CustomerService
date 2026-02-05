# Backend Node.js - CustomerService
FROM node:20-alpine

WORKDIR /app

# Dependencias
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Código de la aplicación
COPY . .

EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "server.js"]
