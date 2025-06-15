import express from 'express';
import cors from 'cors';
import { documentosRouter } from './routes/documentos';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/documentos', documentosRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Bibliotecario funcionando correctamente' });
});

// Iniciamos el servidor con manejo de errores
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Directorio de documentos: ${path.resolve('./documentos')}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Intente con otro puerto.`);
    process.exit(1);
  } else {
    console.error('Error al iniciar el servidor:', err);
  }
}); 