# App financiera

Aplicacion de gestion financiera personal que permite registrar ingresos y gastos, categorizar transacciones y consultar el balance general.

## Estructura del proyecto

```
app-financiera/
├── backend/    # API REST con Spring Boot + Java 21
└── frontend/   # Interfaz web con React + TypeScript + Vite
```

## Tecnologías

**Backend:**
- Java 21, Spring Boot, Maven
- PostgreSQL 14 (via Docker Compose)
- JPA / Hibernate

**Frontend:**
- React 18, TypeScript, Vite
- TailwindCSS, shadcn/ui
- React Query, React Router DOM

## Requisitos previos

- Java 21
- Docker (para PostgreSQL)
- Node.js o Bun

## ¿Cómo ejecutar?

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor inicia en `http://localhost:8080` y levanta PostgreSQL automaticamente via Docker Compose.

### Frontend

```bash
cd frontend
bun install
bun run dev
```

El servidor de desarrollo inicia en `http://localhost:5173`.

## Funcionalidades principales

- Registro e inicio de sesion de usuarios
- Registro de transacciones (ingresos y gastos)
- Categorias personalizadas por usuario
- Consulta de balance con indicador de estado
