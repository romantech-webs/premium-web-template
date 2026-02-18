# Instrucciones del Proyecto — premium-web

## Arquitectura

Multi-tenant Next.js (standalone mode) sirviendo N webs de clínicas desde un VPS.
- Cada subdomain `{slug}.romantechwebs.com` carga config desde `/var/www/sites/{slug}/config.json`
- Middleware extrae subdomain → header `x-clinic-slug`
- `layout.tsx` (server) lee config → `ClinicProvider` (client context) → `useClinic()` hook
- API de deploy en `/api/deploy` (POST para crear, DELETE para borrar)
- Caddy sirve imágenes estáticas, reverse proxy todo lo demás a localhost:3001

## Convenciones

- Todos los componentes acceden a datos de la clínica via `useClinic()`, nunca importando config directamente
- `ClinicConfig` type definido en `src/config/types.ts`
- Colores se inyectan como CSS custom properties: `--color-primary`, etc.
- Iconos de Lucide — usar nombre como string, renderizado dinámico
- WhatsApp widget usa SVG oficial, NO Lucide MessageCircle

## Regla: Frontend Design First

**OBLIGATORIO**: Antes de realizar cualquier tarea de frontend (componentes, páginas, estilos, UI/UX), DEBES:

1. Invocar el skill `/frontend-design` usando la herramienta Skill
2. Leer y seguir completamente el workflow que proporciona el skill
3. No comenzar a escribir código hasta completar el proceso de diseño

### Tareas que requieren /frontend-design:
- Crear o modificar componentes React
- Cambiar estilos, layouts, o diseño visual
- Construir páginas o secciones nuevas

## Verificación

```bash
npm test          # Vitest
npm run build     # Next.js standalone build
npm run lint      # ESLint
```

## Deploy

Las webs se crean vía API desde `automatizacion-webs`. Para actualizar el template:
```bash
ssh root@46.225.137.78 'bash /var/www/premium-web/scripts/deploy-vps.sh'
```
