# Utiliser l'image officielle de Nginx
FROM nginx:latest

# Suppression de la configuration par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf
RUN npm i
RUN npm audit fix
RUN npm run build --verbose || tail -n 20 /root/.npm/_logs/*.log

# Copier le build du front dans le dossier web de Nginx
COPY dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
