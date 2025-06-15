export interface Usuario {
  dni: string;
  login: string;
  password?: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  investigador: boolean;
} 