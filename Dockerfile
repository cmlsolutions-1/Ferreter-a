
# 1️⃣ Etapa de dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2️⃣ Etapa de build (compila TS)
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3️⃣ Etapa final (imagen liviana para producción)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production


# Solo instala dependencias necesarias para producción
COPY package*.json ./
RUN npm install --omit=dev

# Copia el código ya compilado
COPY --from=build /app/dist ./dist

COPY --from=build /app/templates ./templates

EXPOSE 3001

CMD ["node", "dist/app.js"]
