# Utilisation de l'image Node.js officielle
FROM node:latest

# Définition du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install && npm run build

# Copie le db.conf
COPY ../../bobPlanning.db/db.conf ./dist/database/config/

# Exposition du port de l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]