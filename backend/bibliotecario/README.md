# Bibliotecario - Backend para Gestión de Documentos

Este es un servicio backend para gestionar documentos. Permite subir archivos, almacenarlos con un ID único y recuperarlos posteriormente.

## Instalación

```bash
# Navegar al directorio del backend
cd bibliotecario

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar el servidor
npm start
```

Para desarrollo:
```bash
npm run dev
```

## Configuración

El servidor se ejecuta por defecto en el puerto **3001**. Si este puerto está ocupado, el servidor mostrará un mensaje de error apropiado. Para cambiar el puerto, puede establecer la variable de entorno `PORT`:

```bash
# En sistemas Unix/Linux/Mac
export PORT=4000
npm start

# En Windows (CMD)
set PORT=4000
npm start

# En Windows (PowerShell)
$env:PORT=4000
npm start
```

## Endpoints API

### Subir Documento
- **URL**: `http://localhost:3001/api/documentos/subir`
- **Método**: `POST`
- **Contenido**: `multipart/form-data`
- **Parámetro del formulario**: `documento` (el archivo a subir)

**Respuesta exitosa**:
```json
{
  "mensaje": "Documento archivado con éxito",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombreOriginal": "ejemplo.pdf",
    "fechaSubida": "2023-10-20T15:30:00.000Z",
    "tamano": 12345,
    "tipo": "application/pdf",
    "ruta": "ruta/al/archivo.pdf"
  }
}
```

### Descargar Documento
- **URL**: `http://localhost:3001/api/documentos/descargar/:id`
- **Método**: `GET`
- **Parámetros de URL**: `id` - ID único del documento

**Respuesta exitosa**: El archivo se descarga automáticamente

### Obtener Información de un Documento
- **URL**: `http://localhost:3001/api/documentos/info/:id`
- **Método**: `GET`
- **Parámetros de URL**: `id` - ID único del documento

**Respuesta exitosa**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nombreOriginal": "ejemplo.pdf",
  "fechaSubida": "2023-10-20T15:30:00.000Z",
  "tamano": 12345,
  "tipo": "application/pdf",
  "ruta": "ruta/al/archivo.pdf"
}
```

## Estructura de Directorios

- `/src` - Código fuente TypeScript
- `/documentos` - Directorio donde se almacenan los archivos subidos
- `/dist` - Código compilado (generado después de ejecutar `npm run build`)

## Solución de Problemas

Si encuentra el error `EADDRINUSE`, significa que el puerto ya está en uso. Utilice un puerto diferente como se describe en la sección de Configuración. 