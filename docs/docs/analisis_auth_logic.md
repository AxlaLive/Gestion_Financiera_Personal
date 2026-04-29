# Análisis Técnico - Módulo de Autenticación
**Responsable:** Juan José (Análisis 1)

## 1. Definición de la Lógica de Sesión (Frontend)
Para el cumplimiento de la HU-02, se ha definido el siguiente flujo técnico:
- **Gestión de Tokens:** Se implementará el uso de **JSON Web Tokens (JWT)** para el manejo de sesiones.
- **Persistencia:** El token obtenido tras el login se almacenará en `localStorage` para asegurar que la sesión no se pierda al recargar el navegador.
- **Contexto Global:** Se utilizará un `AuthContext` que envolverá la aplicación para validar si el usuario está autenticado antes de permitir el acceso a rutas privadas (Dashboard).

## 2. Criterios de Aceptación (Gherkin)
Escenario: Inicio de sesión exitoso
  DADO que el usuario ingresa sus credenciales correctas
  CUANDO hace clic en el botón de "Iniciar sesión"
  ENTONCES el sistema debe generar el token de acceso
  Y redirigir al usuario a la vista principal (Dashboard).

## 3. Requerimientos de UI/UX (Pendientes de aplicación en Figma)
Tras el análisis de los mockups de Login y Registro, se identificaron los siguientes ajustes necesarios para estandarizar la interfaz:
- Cambiar etiquetas de MAYÚSCULAS sostenidas a "Sentence case" (ej: de "CORREO" a "Correo electrónico").
- Ajustar la alineación de los campos de entrada para mejorar la jerarquía visual.
