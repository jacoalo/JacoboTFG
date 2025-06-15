export interface Articulo {
  id_art: string;
  id_cm: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  id_factura?: string;
} 