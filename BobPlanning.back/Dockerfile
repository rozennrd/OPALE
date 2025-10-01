# -------------------------------------------------
# Étape 1 – Build (compilation TypeScript)
# -------------------------------------------------
FROM node:20-alpine AS builder

# Crée un répertoire de travail
WORKDIR /app

# Copie uniquement les fichiers nécessaires au build
# (package.json + lock + tsconfig + source)
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY eslint.config.mts ./
COPY jest.config.ts ./

# Installe les dépendances (production + dev, car on a besoin de tsc)
RUN npm ci

# Compile le TypeScript dans le dossier /app/dist
RUN npm run build   # suppose que "build" = "tsc"

# -------------------------------------------------
# Étape 2 – Runtime (image légère)
# -------------------------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

# Copie le code compilé
COPY --from=builder /app/dist ./dist

# Copie le fichier de config (ou le dossier complet)
COPY src/database/config ./dist/database/config  

# Copie le package.json pour installer les dépendances prod
COPY package*.json ./
RUN npm ci --only=production

# Si vous avez d’autres ressources statiques (ex. files)
COPY files ./files

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]