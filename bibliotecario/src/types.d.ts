// Declaración global de espacios de nombres para Express
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}

// Declaración de módulos
declare module 'uuid';
declare module 'multer';
declare module 'cors'; 