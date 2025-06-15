# Gestión Justificaciones

Aplicación web para la gestión de proyectos y justificaciones desarrollada con Angular 19 y PostgreSQL.

## Descripción

Esta aplicación permite la gestión completa de proyectos de subvención I+D adjudicadas, incluyendo:

- Gestión de usuarios (gestores e investigadores)
- Gestión de proyectos
- Gestión de contratos menores
- Gestión de comisiones de servicio
- Gestión de gastos de personal
- Generación y descarga de documentación

## Requisitos previos

- Node.js 18.x o superior
- Angular CLI 19.x
- PostgreSQL 14.x o superior

## Instalación

1. Clona este repositorio
```bash
git clone <url-del-repositorio>
cd gestionCSIC
```

2. Instala las dependencias
```bash
npm install
```

3. Configura la base de datos
   - Asegúrate de tener PostgreSQL instalado y en ejecución
   - Crea una base de datos para la aplicación
   - Ejecuta el script de creación de tablas ubicado en `backend/db/schema.sql`

4. Configura el backend
```bash
cd backend
npm install
```

## Ejecución

1. Inicia el backend
```bash
cd backend
npm run start
```

2. Inicia la aplicación Angular (en otra terminal)
```bash
ng serve
```

3. Abre tu navegador en `http://localhost:4200`

## Características principales

- **Autenticación**: Login de usuarios, cambio de contraseña y gestión de perfiles
- **Proyectos**: Gestión completa de proyectos de subvención
- **Contratos menores**: Creación, edición y seguimiento de contratos menores
- **Comisiones de servicio**: Gestión de comisiones de servicio con generación de documentación
- **Gastos de personal**: Registro y seguimiento de gastos de personal
- **Documentación**: Generación y descarga de toda la documentación asociada a proyectos

## Estructura del proyecto

- `/src/app/core`: Servicios, modelos y guardias principales
- `/src/app/features`: Componentes principales organizados por funcionalidad
- `/src/app/shared`: Componentes, directivas y pipes compartidos
- `/backend`: API REST para comunicación con la base de datos

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
