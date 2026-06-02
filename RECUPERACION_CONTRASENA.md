# Recuperación de contraseña

## Cómo funciona

1. El usuario entra en **¿Olvidaste tu contraseña?** (`/forgot-password`) e ingresa su correo.
2. El backend busca el usuario, genera un **token seguro** (válido 30 minutos) y lo guarda en la tabla `password_reset_tokens`.
3. Se envía un **correo** con un enlace: `https://tu-front.onrender.com/reset-password?token=...`
4. El usuario abre el enlace, define la nueva contraseña y el backend la guarda hasheada (BCrypt).

Por seguridad, la API **siempre** responde “Si el correo existe, se ha enviado un enlace…” aunque el correo no esté registrado.

---

## Por qué “no llega el correo”

Hasta ahora el backend solo **imprimía el enlace en los logs**. Para que llegue al buzón debes configurar **SMTP** en el servidor (Render o local).

Sin `SPRING_MAIL_HOST`, verás en los logs del backend algo como:

```text
[PasswordReset] SMTP no configurado ... Enlace de recuperación para usuario@mail.com → http://...
```

En desarrollo puedes copiar ese enlace y abrirlo en el navegador.

---

## Configuración con Gmail (recomendado para el proyecto)

Gmail no acepta tu contraseña normal en apps; necesitas una **contraseña de aplicación**:

1. Cuenta Google → **Seguridad** → activar **verificación en 2 pasos**.
2. **Contraseñas de aplicaciones** → crear una para “Correo” / “Otro”.
3. Copiar la contraseña de 16 caracteres (sin espacios).

### Variables en Render (backend)

| Variable | Ejemplo |
|----------|---------|
| `SPRING_MAIL_HOST` | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | `587` |
| `SPRING_MAIL_USERNAME` | `tu-correo@gmail.com` |
| `SPRING_MAIL_PASSWORD` | contraseña de aplicación (16 caracteres) |
| `APP_MAIL_FROM` | `tu-correo@gmail.com` (mismo que USERNAME) |
| `APP_FRONTEND_URL` | `https://gestion-financiera-perso.onrender.com` |

Después de guardar, **reinicia / redeploy** el servicio backend.

### Local (`application.properties` o variables de entorno)

```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=tu-correo@gmail.com
SPRING_MAIL_PASSWORD=xxxx xxxx xxxx xxxx
APP_MAIL_FROM=tu-correo@gmail.com
APP_FRONTEND_URL=http://localhost:5173
```

---

## Probar el flujo completo

1. Backend y front en marcha; SMTP configurado (o leer el enlace en logs).
2. Ir a `/forgot-password`, correo de un usuario **ya registrado**.
3. Revisar bandeja (y spam) o logs del backend.
4. Abrir el enlace → `/reset-password?token=...`
5. Nueva contraseña: mínimo **10 caracteres**, mayúscula, minúscula, número y carácter especial.
6. Iniciar sesión en `/login`.

---

## Endpoints (API)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/forgot-password` | Body: `{ "correo": "..." }` |
| GET | `/api/auth/reset-password/validate?token=...` | Valida el token |
| POST | `/api/auth/reset-password` | Body: `{ "token": "...", "password": "..." }` |

---

## Otros proveedores SMTP

| Proveedor | Host | Puerto |
|-----------|------|--------|
| Gmail | `smtp.gmail.com` | 587 |
| Outlook | `smtp.office365.com` | 587 |
| SendGrid | `smtp.sendgrid.net` | 587 (usuario `apikey`, password = API key) |
| Brevo (Sendinblue) | `smtp-relay.brevo.com` | 587 |

Misma idea: `SPRING_MAIL_HOST`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `APP_MAIL_FROM`.
