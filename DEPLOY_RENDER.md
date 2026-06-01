# Despliegue en Render

URLs de este proyecto:

| Servicio | URL |
|----------|-----|
| Frontend | https://gestion-financiera-perso.onrender.com |
| Backend (API) | https://gestion-financiera-personal-mi90.onrender.com |
| API base (para el front) | `https://gestion-financiera-personal-mi90.onrender.com/api` |

---

## 1. Backend (Web Service)

En **Render → tu servicio backend → Environment**:

| Variable | Valor |
|----------|--------|
| `SPRING_DATASOURCE_URL` | URL JDBC de tu Postgres en Render (ej. `jdbc:postgresql://...`) |
| `SPRING_DATASOURCE_USERNAME` | usuario de la base |
| `SPRING_DATASOURCE_PASSWORD` | contraseña de la base |
| `JWT_SECRET` | cadena larga y aleatoria (no uses el valor por defecto) |
| `APP_CORS_ALLOWED_ORIGINS` | `https://gestion-financiera-perso.onrender.com` |
| `APP_FRONTEND_URL` | `https://gestion-financiera-perso.onrender.com` |

Para **recuperación de contraseña por correo** (si no configuras esto, el enlace solo sale en los logs del backend):

| Variable | Valor (ejemplo Gmail) |
|----------|------------------------|
| `SPRING_MAIL_HOST` | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | `587` |
| `SPRING_MAIL_USERNAME` | tu correo Gmail |
| `SPRING_MAIL_PASSWORD` | contraseña de aplicación de Google (no la contraseña normal) |
| `APP_MAIL_FROM` | mismo correo que `SPRING_MAIL_USERNAME` |

Guía paso a paso: [RECUPERACION_CONTRASENA.md](./RECUPERACION_CONTRASENA.md)

Opcional (recomendado en producción):

| Variable | Valor |
|----------|--------|
| `SPRING_JPA_SHOW_SQL` | `false` |

**Root directory:** `backend`  
**Dockerfile path:** `backend/Dockerfile` (o build con Maven si lo configuraste así)

Comprueba que el backend responde:

```text
https://gestion-financiera-personal-mi90.onrender.com/api/usuarios/login
```

(POST con credenciales; un 400 es normal si el body está vacío.)

---

## 2. Frontend (Static Site)

En **Render → tu sitio estático → Environment**:

| Variable | Valor |
|----------|--------|
| `VITE_API_BASE_URL` | `https://gestion-financiera-personal-mi90.onrender.com/api` |

**Importante:** Vite lee esta variable **al hacer build**. Después de guardarla:

1. **Manual Deploy → Deploy latest commit** (o un redeploy completo).

Si no redeployas, el front seguirá apuntando a `localhost:8080`.

**Build command:** `npm install && npm run build`  
**Publish directory:** `dist`  
**Root directory:** `frontend`

---

## 3. Checklist rápido

- [ ] Postgres en Render vinculado al backend
- [ ] Variables del backend guardadas y servicio **Live**
- [ ] `VITE_API_BASE_URL` en el front con `/api` al final
- [ ] Redeploy del **frontend** después de la variable
- [ ] Probar login en https://gestion-financiera-perso.onrender.com

---

## 4. Problemas frecuentes

| Síntoma | Causa | Solución |
|---------|--------|----------|
| "No se pudo conectar con el servidor" | Front compilado sin `VITE_API_BASE_URL` | Redeploy del front con la variable |
| Error CORS en consola | Origen no permitido | `APP_CORS_ALLOWED_ORIGINS` = URL exacta del front (sin `/` final) |
| Backend muy lento al primer uso | Plan free de Render (cold start) | Esperar 30–60 s y reintentar |
| 401 en todo | JWT / sesión vieja | Cerrar sesión, borrar datos del sitio, volver a entrar |

---

## 5. Local vs producción

| Entorno | `VITE_API_BASE_URL` |
|---------|---------------------|
| Local | `http://localhost:8080/api` (en `frontend/.env.local`) |
| Render | `https://gestion-financiera-personal-mi90.onrender.com/api` |
