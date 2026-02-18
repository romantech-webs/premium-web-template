# premium-web — Template Multi-Tenant para Clínicas

Aplicación Next.js multi-tenant que sirve webs premium de clínicas desde un único servidor. Cada subdomain `{slug}.romantechwebs.com` carga su configuración desde disco.

## Stack

- **Next.js 16** con App Router, TypeScript, modo `standalone`
- **Tailwind CSS v3** + shadcn/ui + Framer Motion
- **PM2** cluster mode (2 instancias, puerto 3001)
- **Caddy** reverse proxy con wildcard TLS (Let's Encrypt vía DNS-01 Cloudflare)

## Arquitectura Multi-Tenant

```
Cliente → Caddy (TLS + static files) → Next.js (PM2 cluster)
                                              ↓
                                    Middleware extrae subdomain
                                              ↓
                                    load-config.ts lee /var/www/sites/{slug}/config.json
                                              ↓
                                    ClinicProvider (React Context)
                                              ↓
                                    Componentes renderizan con useClinic()
```

### Flujo de request

1. `test-clinic.romantechwebs.com` → Caddy
2. Si `/images/*` o `/og-image.jpg` → Caddy sirve directamente de `/var/www/sites/test-clinic/`
3. Todo lo demás → reverse proxy a `localhost:3001` (Next.js)
4. Middleware extrae subdomain → header `x-clinic-slug`
5. `layout.tsx` lee config de `/var/www/sites/{slug}/config.json`
6. `ClinicProvider` hace la config disponible vía `useClinic()` hook

### Estructura en disco

```
/var/www/
├── premium-web/              # Este repo (Next.js standalone)
│   ├── .next/standalone/     # Build output
│   ├── ecosystem.config.cjs  # PM2 config
│   ├── Caddyfile             # Caddy config (master copy)
│   ├── scripts/deploy-vps.sh # Script de deploy/actualización
│   └── .env.production       # DEPLOY_SECRET, SITES_DIR, PORT
└── sites/                    # Datos de cada web
    ├── test-clinic/
    │   ├── config.json       # ClinicConfig completa
    │   ├── og-image.jpg      # OG image generada
    │   └── images/
    │       ├── hero.webp
    │       ├── gallery/
    │       └── team/
    └── otra-clinica/
        └── ...
```

## API de Deploy

### `POST /api/deploy`
Crea o actualiza una web. Recibe FormData con:
- `slug`: identificador de la web (a-z, 0-9, guiones)
- `config`: JSON string con la ClinicConfig completa
- `file:images/hero.webp`, `file:og-image.jpg`, etc.: archivos binarios

Auth: `Authorization: Bearer {DEPLOY_SECRET}`

### `DELETE /api/deploy`
Elimina una web. Body JSON: `{ "slug": "test-clinic" }`.

Auth: `Authorization: Bearer {DEPLOY_SECRET}`

### Seguridad
- Token de autenticación obligatorio
- Validación de slug (solo `[a-z0-9-]`)
- Protección contra path traversal (resolve + prefix check)
- Límite por archivo: 10MB, total: 50MB
- Cache invalidation automática tras deploy/delete

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx            # Server layout: lee config, ClinicProvider
│   ├── page.tsx              # Landing page
│   ├── contacto/             # Página de contacto
│   ├── aviso-legal/          # Aviso legal
│   ├── privacidad/           # Política de privacidad
│   ├── cookies/              # Política de cookies
│   ├── robots.ts             # robots.txt dinámico por subdomain
│   ├── sitemap.ts            # sitemap.xml dinámico
│   └── api/deploy/           # Deploy API (POST/DELETE)
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Navegación sticky
│   │   ├── Footer.tsx        # Footer completo
│   │   └── WhatsAppWidget.tsx # WhatsApp flotante (SVG oficial)
│   └── sections/
│       ├── Hero.tsx          # Hero con CTA animado
│       ├── Services.tsx      # Grid de servicios con iconos Lucide
│       ├── Process.tsx       # "Cómo trabajamos" (steps)
│       ├── Reviews.tsx       # Reseñas Google con estrellas
│       ├── WhyUs.tsx         # Diferenciadores
│       ├── Team.tsx          # Equipo profesional
│       ├── Gallery.tsx       # Galería con lightbox
│       ├── FAQ.tsx           # FAQ con acordeón
│       ├── Location.tsx      # Mapa + info ubicación
│       └── CTA.tsx           # Banner de conversión
├── config/
│   ├── types.ts              # ClinicConfig interface
│   ├── load-config.ts        # Lee config.json del disco (con cache 5min)
│   └── clinic-context.tsx    # ClinicProvider + useClinic() hook
├── lib/
│   ├── utils.ts              # cn() utility
│   └── schema.ts             # Schema.org generators
└── middleware.ts              # Extrae subdomain → x-clinic-slug header
```

## Desarrollo local

```bash
npm install
npm run dev
```

Para simular un subdomain en local, añade a `/etc/hosts`:
```
127.0.0.1 test-clinic.localhost
```

Y crea una config de prueba:
```bash
mkdir -p /var/www/sites/test-clinic
echo '{"name":"Test","tagline":"Test",...}' > /var/www/sites/test-clinic/config.json
```

## Actualizar en producción

```bash
ssh root@46.225.137.78 'bash /var/www/premium-web/scripts/deploy-vps.sh'
```

Esto hace: git pull → npm ci → build → copy static → pm2 reload (zero-downtime).

## Tests

```bash
npm test
```

Cubre: middleware (subdomain extraction, invalid hosts), load-config (cache, file size limit), deploy API (auth, slug validation, path traversal).

## Infra en VPS

| Servicio | Config | Comando |
|----------|--------|---------|
| **PM2** | `ecosystem.config.cjs` | `pm2 status`, `pm2 logs premium-web` |
| **Caddy** | `/etc/caddy/Caddyfile` | `systemctl status caddy`, `journalctl -u caddy` |
| **TLS** | DNS-01 via Cloudflare API | Auto-renewal por Caddy |
| **Firewall** | UFW (22, 80, 443) | `ufw status` |
