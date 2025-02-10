# Étape 1 : Build avec Node.js
FROM node:18 AS build

WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
RUN npm install
COPY . .


# Construire l'application frontend
RUN npm run build --verbose

# Garder l'image Node.js (optionnel)
# Ce conteneur sera préservé et accessible si nécessaire
FROM node:18 AS node-container
COPY --from=build /app/dist /app/dist

# Étape 2 : Serveur Nginx
FROM nginx:latest

# Suppression de la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape 1
COPY --from=build /app/dist/. /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
