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

Copia `frontend/.env.example` a `frontend/.env.local` y ajusta `VITE_API_BASE_URL` si el backend no está en el puerto 8080.

### Despliegue en Render

- Frontend: https://gestion-financiera-perso.onrender.com  
- Backend: https://gestion-financiera-personal-mi90.onrender.com  

Guía detallada con variables de entorno: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)

| Servicio | Variable | Valor |
|----------|----------|--------|
| Frontend | `VITE_API_BASE_URL` | `https://gestion-financiera-personal-mi90.onrender.com/api` |
| Backend | `APP_CORS_ALLOWED_ORIGINS` | `https://gestion-financiera-perso.onrender.com` |
| Backend | `APP_FRONTEND_URL` | `https://gestion-financiera-perso.onrender.com` |
| Backend | `SPRING_DATASOURCE_*`, `JWT_SECRET` | ver DEPLOY_RENDER.md |

## Funcionalidades principales

- Registro e inicio de sesion de usuarios
- Registro de transacciones (ingresos y gastos)
- Categorias personalizadas por usuario
- Consulta de balance con indicador de estado
