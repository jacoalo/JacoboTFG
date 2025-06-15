import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';

const router = express.Router();
const DOCUMENTOS_DIR = path.join(__dirname, '../../documentos');

// Asegurarse de que existe el directorio de documentos
if (!fs.existsSync(DOCUMENTOS_DIR)) {
  fs.mkdirSync(DOCUMENTOS_DIR, { recursive: true });
}

// Configuración de multer para el almacenamiento de archivos
// Usamos primero un almacenamiento temporal
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Almacenar temporalmente en la carpeta principal
    cb(null, DOCUMENTOS_DIR);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generamos un ID único como nombre de archivo
    const fileId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${fileId}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

interface DocumentoMetadata {
  id: string;
  nombreOriginal: string;
  fechaSubida: string;
  tamano: number;
  tipo: string;
  ruta: string;
  proyecto: string; // ID del proyecto asociado (obligatorio)
}

// Mapa para guardar los metadatos de los documentos
const documentosMetadata = new Map<string, DocumentoMetadata>();

// Definimos la interfaz para extender el tipo Request
interface RequestConArchivo extends Request {
  file?: Express.Multer.File;
}

// Endpoint para subir un documento
router.post('/subir', upload.single('documento'), (req: RequestConArchivo, res: Response) => {
  try {
    console.log('=== DEPURACIÓN: Inicio de subida de documento ===');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivo recibido:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'Ninguno');
    
    if (!req.file) {
      console.log('ERROR: No se ha enviado ningún archivo');
      return res.status(400).json({ error: 'No se ha enviado ningún archivo' });
    }
    
    const proyectoId = req.body.proyecto as string;
    console.log('ID del proyecto recibido:', proyectoId);
    
    if (!proyectoId) {
      console.log('ERROR: No se ha proporcionado ID de proyecto');
      return res.status(400).json({ error: 'Se requiere el ID del proyecto' });
    }

    const file = req.file;
    const fileId = path.parse(file.filename).name; // Obtenemos el ID del nombre del archivo (sin extensión)
    console.log('ID generado para el archivo:', fileId);
    
    // Crear carpeta del proyecto si no existe
    const proyectoDir = path.join(DOCUMENTOS_DIR, proyectoId);
    if (!fs.existsSync(proyectoDir)) {
      fs.mkdirSync(proyectoDir, { recursive: true });
    }

    // Mover el archivo a la carpeta del proyecto
    const fileExt = path.extname(file.originalname);
    const nuevoNombreArchivo = `${fileId}${fileExt}`;
    const rutaOriginal = file.path;
    const nuevaRuta = path.join(proyectoDir, nuevoNombreArchivo);
    
    fs.renameSync(rutaOriginal, nuevaRuta);
    console.log(`Archivo movido de ${rutaOriginal} a ${nuevaRuta}`);
    
    // Guardamos los metadatos
    const metadata: DocumentoMetadata = {
      id: fileId,
      nombreOriginal: file.originalname,
      fechaSubida: new Date().toISOString(),
      tamano: file.size,
      tipo: file.mimetype,
      ruta: nuevaRuta,
      proyecto: proyectoId
    };
    
    console.log('Metadatos del documento:', metadata);
    documentosMetadata.set(fileId, metadata);
    
    // Guardamos los metadatos en un archivo JSON para persistencia
    const metadataPath = path.join(proyectoDir, `${fileId}.json`);
    console.log('Ruta del archivo de metadatos:', metadataPath);
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('Metadatos guardados correctamente');
    
    console.log('=== DEPURACIÓN: Finalización exitosa de subida de documento ===');
    return res.status(201).json({ 
      mensaje: 'Documento archivado con éxito', 
      id: fileId,
      metadata
    });
  } catch (error) {
    console.error('=== ERROR DETALLADO AL SUBIR DOCUMENTO ===');
    console.error(error);
    console.error('=========================================');
    return res.status(500).json({ error: 'Error interno al procesar el archivo' });
  }
});

// Endpoint para descargar un documento
router.get('/descargar/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proyectoId = req.query.proyecto as string;
    
    if (!proyectoId) {
      return res.status(400).json({ error: 'Se requiere el ID del proyecto' });
    }
    
    // Intentamos leer los metadatos del archivo
    const metadataPath = path.join(DOCUMENTOS_DIR, proyectoId, `${id}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    const metadataStr = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: DocumentoMetadata = JSON.parse(metadataStr);
    
    // Verificamos que el archivo exista
    if (!fs.existsSync(metadata.ruta)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Enviamos el archivo
    res.download(metadata.ruta, metadata.nombreOriginal);
  } catch (error) {
    console.error('Error al descargar el documento:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Endpoint para obtener información de un documento
router.get('/info/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proyectoId = req.query.proyecto as string;
    
    if (!proyectoId) {
      return res.status(400).json({ error: 'Se requiere el ID del proyecto' });
    }
    
    // Intentamos leer los metadatos del archivo
    const metadataPath = path.join(DOCUMENTOS_DIR, proyectoId, `${id}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    const metadataStr = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: DocumentoMetadata = JSON.parse(metadataStr);
    
    return res.json(metadata);
  } catch (error) {
    console.error('Error al obtener información del documento:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Endpoint para descargar todos los documentos de un proyecto en un ZIP
router.get('/descargar-proyecto/:proyectoId', (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.params;
    
    // Verificar que existe el directorio del proyecto
    const proyectoDir = path.join(DOCUMENTOS_DIR, proyectoId);
    if (!fs.existsSync(proyectoDir)) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Buscar todos los archivos de metadatos JSON
    const archivosJson = fs.readdirSync(proyectoDir)
      .filter(archivo => archivo.endsWith('.json'));

    if (archivosJson.length === 0) {
      return res.status(404).json({ error: 'No hay documentos en este proyecto' });
    }

    // Crear un nombre para el archivo ZIP
    const fechaActual = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreZip = `proyecto-${proyectoId}-${fechaActual}.zip`;

    // Configurar la respuesta HTTP
    res.attachment(nombreZip);
    res.setHeader('Content-Type', 'application/zip');

    // Crear el archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 } // Nivel máximo de compresión
    });

    // Enviar el archivo al cliente
    archive.pipe(res);

    // Error handling
    archive.on('error', (err: Error) => {
      console.error('Error al crear el archivo ZIP:', err);
      res.status(500).end();
    });

    // Leer cada archivo de metadatos y añadir los documentos al ZIP
    archivosJson.forEach(archivoJson => {
      try {
        const metadataPath = path.join(proyectoDir, archivoJson);
        const metadataStr = fs.readFileSync(metadataPath, 'utf-8');
        const metadata: DocumentoMetadata = JSON.parse(metadataStr);
        
        // Verificar que el archivo existe
        if (fs.existsSync(metadata.ruta)) {
          // Añadir el archivo al ZIP con su nombre original
          archive.file(metadata.ruta, { name: metadata.nombreOriginal });
        }
      } catch (error) {
        console.error(`Error al procesar el archivo ${archivoJson}:`, error);
        // Continuamos con el siguiente archivo
      }
    });

    // Finalizar el ZIP
    archive.finalize();
    
  } catch (error) {
    console.error('Error al comprimir los documentos del proyecto:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Exportamos el router
export const documentosRouter = router; 