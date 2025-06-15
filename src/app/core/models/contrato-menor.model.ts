export interface CMenor {
  id: string;
  proyecto: string;
  proveedor: string;
  cif: string;
  justificacion: string;
  importe: number;
  localidad: string;
  fecha_firma_ip?: Date;
  necesidad: number;
  aplicacionp?: string;
  ejercicio: number;
  presupuesto?: string;
  ofertaeconomica: boolean;
  calidad: boolean;
  criterio_calidad?: string;
  gerente?: string;
  fecha_firma_gerente?: Date;
  documento_firmado?: string;
  documento_generado: boolean;
} 