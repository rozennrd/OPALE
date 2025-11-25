# ---- Étape 1 : Build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---- Étape 2 : Run avec Nginx ----
FROM nginx:1.25-alpine AS run

# Supprimer la conf par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier ta conf custom
COPY dockerization/nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
