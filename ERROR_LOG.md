# Registro de Errores y Lecciones Aprendidas

Este documento rastrea los errores críticos del proyecto `Kolozus`, sus causas raíz y las medidas tomadas para prevenirlos.

## 2026-02-04

### 1. Fallo de Build en Producción (Frontend)
- **Error**: `Module not found: Can't resolve '@/components/ui/alert-dialog'`
- **Consecuencia**: Fallo total del despliegue en Coolify.
- **Causa Raíz**: Se importó `AlertDialog` en `Sidebar.tsx` sin crear primero el archivo del componente base.
- **Acción Correctiva**: Se creó `frontend/components/ui/alert-dialog.tsx`.

### 2. Olvido de `git push`
- **Error**: Retraso en verificación por falta de push.
- **Causa Raíz**: Flujo de trabajo incompleto.
- **Acción Correctiva**: Push inmediato y refuerzo del checklist de tareas.

### 3. Dependencia Faltante (Frontend)
- **Error**: `Module not found: ... @radix-ui/react-alert-dialog`
- **Consecuencia**: Segundo fallo de build.
- **Causa Raíz**: Se añadió código (`alert-dialog.tsx`) sin instalar el paquete npm correspondiente.
- **Acción Correctiva**: Se agregó `@radix-ui/react-alert-dialog` a `package.json` y se actualizó `package-lock.json`.

### 4. Conflicto de Navegación/Red Traefik (Error 504)
- **Error**: `504 Gateway Timeout` al intentar acceder a `/api/spaces/`.
- **Causa Raíz**:
    1. **Conflicto de Nombres**: Usar `backend` como nombre de router en Traefik colisionó con los nombres internos generados por Coolify.
    2. **Red Incorrecta**: Traefik intentaba conectar por la red `default` en lugar de `coolify`.
- **Acción Correctiva**:
    - Se renombró el router/servicio en `docker-compose.yml` a `kolozus-backend`.
    - Se forzó la red con `traefik.docker.network=coolify`.

---
*Documento vivo de mejora continua.*
