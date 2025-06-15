FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de configuración y dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el código fuente
COPY src/ ./src/

# Compilamos el código TypeScript
RUN npm run build

# Creamos el directorio para los documentos
RUN mkdir -p documentos

# Exponemos el puerto que usa el servicio
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 