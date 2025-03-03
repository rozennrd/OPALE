# Utiliser une image officielle de Python comme base
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de l'application dans le conteneur
COPY requirements.txt ./

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code source de l'application
COPY . .

# Exposer le port sur lequel l'application écoute
EXPOSE 3001

# Définir la commande pour exécuter l'application
CMD ["python", "main.py"]
