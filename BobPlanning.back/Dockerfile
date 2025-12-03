# -------------------------------------------------
# Étape 1 – Build (compilation TypeScript)
# -------------------------------------------------
FROM node:lts-alpine3.22 AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY eslint.config.mts ./
COPY jest.config.ts ./
RUN npm ci
RUN npm run build

# Copie le fichier config
RUN mkdir -p dist/database/config
COPY src/database/config/db.conf dist/database/config/

# -------------------------------------------------
# Étape 2 – Runtime (image légère)
# -------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

# Copie le package.json pour installer les dépendances prod
COPY package*.json ./

# ⚠️ AJOUT IMPORTANT : Installer les dépendances de production
RUN npm ci --omit=dev

# Copie le code compilé
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
