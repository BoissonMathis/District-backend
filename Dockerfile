# Utiliser une image Node.js officielle
FROM node:20.12.1
# Créer un répertoire de travail
WORKDIR /app
# Copier les fichiers package.json et package-lock.json
COPY package*.json ./
# Installer les dépendances
RUN npm install
# Copier le reste de l’application
COPY . .
# Exposer le port de l’application
EXPOSE 3000
# Démarrer l’application
CMD ["node", "server.js"]