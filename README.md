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
- Docker Desktop

## Instalación

1. Créate una carpeta donde guardar el proyecto y Clona este repositorio
```bash
git clone <url-del-repositorio>
```

2. Instala las dependencias
```bash
npm install
wsl --install
```

3. Configura la base de datos
   - Asegúrate de tener PostgreSQL instalado y en ejecución
   - Ejecuta Docker Desktop (debes tenerlo instalado)



## Ejecución

1. Inicia el backend
```bash
cd backend
docker-compose up -d
```

2. Inicia la aplicación Angular (en la ruta raiz del proyecto y en otra terminal)
```bash
ng serve --open
```

3. Abre tu navegador en `http://localhost:4200`


4. Detener el backend
```bash
cd backend
docker-compose down
```

## Tests

El proyecto incluye tests unitarios para los componentes, servicios y guards de Angular implementados con Jasmine y Karma.

### Ejecutar todos los tests
```bash
ng test
```

### Ejecutar tests en modo watch (se ejecutan automáticamente al cambiar archivos)
```bash
ng test --watch
```

### Ejecutar tests con cobertura de código
```bash
ng test --code-coverage
```

### Ejecutar tests en modo headless (sin abrir navegador)
```bash
ng test --watch=false --browsers=ChromeHeadless
```

### Cobertura de tests

- **Servicios principales**: AuthService, ProyectoService con tests exhaustivos de funcionalidad
- **Guards**: Tests de autorización y redirección (authGuard, gestorGuard)  
- **Componentes**: Tests de creación y funcionalidad básica de todos los componentes
- **Casos cubiertos**: Autenticación, autorización por roles, CRUD de proyectos, validaciones de formularios, manejo de errores

Los tests están completamente en español siguiendo las mejores prácticas de testing con patrones AAA (Preparar-Ejecutar-Verificar).

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

Este proyecto está creado para la entrega del Trabajo Fin de Grado en la Universidad Internacional de La Rioja
