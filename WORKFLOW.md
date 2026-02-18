# Workflow de Operaciones — premium-web

## Despliegue de webs (automatizado)

El pipeline de `automatizacion-webs` se encarga de todo:

```bash
# En automatizacion-webs:
npx tsx scripts/worker.ts --limit 10 --score 69
```

Cada lead pasa por: scrape → AI content → POST a `/api/deploy` → web live.

**No se toca este repo directamente para crear webs.** Este repo es el servidor multi-tenant.

## Actualizar el template (cambios en componentes/estilos)

Cuando haces cambios en el código de premium-web:

### 1. Desarrollar en local
```bash
npm run dev
# Simular subdomain: añadir a /etc/hosts
# 127.0.0.1 test-clinic.localhost
```

### 2. Tests
```bash
npm test
```

### 3. Commit y push
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

### 4. Deploy al VPS
```bash
ssh root@46.225.137.78 'bash /var/www/premium-web/scripts/deploy-vps.sh'
```

El script hace: `git pull → npm ci → build → copy static → pm2 reload`.
Zero-downtime gracias al reload de PM2 cluster.

**Todas las webs existentes se actualizan automáticamente** porque comparten la misma instancia Next.js. Solo los datos (config.json + imágenes) son específicos de cada web.

## Estructura de una web

Cada web se identifica por su `slug`. Los datos están en `/var/www/sites/{slug}/`:

```
/var/www/sites/fisio-lourdes-benitez/
├── config.json          # ClinicConfig completa (generada por AI + scraping)
├── og-image.jpg         # Imagen OG (generada, hero + nombre + color)
└── images/
    ├── hero.webp        # Imagen principal (de Google Places)
    ├── logo.png         # Logo (de redes sociales)
    ├── gallery/
    │   ├── gallery-1.webp
    │   └── gallery-2.webp
    └── team/
        └── team-1.webp
```

## Monitorización

### PM2
```bash
ssh root@46.225.137.78
pm2 status                    # Estado de las instancias
pm2 logs premium-web          # Logs en tiempo real
pm2 monit                     # Monitor interactivo
```

### Caddy
```bash
systemctl status caddy        # Estado del servicio
journalctl -u caddy -f        # Logs en tiempo real
journalctl -u caddy --since "1 hour ago"  # Últimos logs
```

### TLS
Caddy renueva certificados automáticamente. Para verificar:
```bash
curl -vI https://test-clinic.romantechwebs.com 2>&1 | grep "subject:"
```

## Troubleshooting

### Web devuelve 404
- Verificar que existe `/var/www/sites/{slug}/config.json`
- El middleware rechaza hosts sin subdomain válido

### PM2 instancia crashea
```bash
pm2 restart premium-web
pm2 logs premium-web --err --lines 50
```

### Caddy no arranca
```bash
caddy validate --config /etc/caddy/Caddyfile --envfile /etc/caddy/env
journalctl -u caddy --since "5 minutes ago"
```

### TLS falla
- Verificar que `/etc/caddy/env` tiene `CF_API_TOKEN` válido
- El token necesita permisos: Zone > DNS > Edit para romantechwebs.com

### Borrar una web manualmente
```bash
rm -rf /var/www/sites/{slug}
# La cache se invalida sola en 5 min, o restart PM2
```

## Notas de diseño

### WhatsApp Widget
- Usa el **icono SVG oficial de WhatsApp** (NO MessageCircle de Lucide)
- Color verde oficial: `#25D366`
- Posición: esquina inferior derecha

### Colores dinámicos
- Los colores se inyectan como CSS custom properties en `layout.tsx`
- `--color-primary`, `--color-secondary`, `--color-accent`, `--color-neutral`
- Todos los componentes usan `useClinic()` para acceder a la config

### Performance
- Imágenes servidas por Caddy (estáticas, bypass de Next.js)
- Config cacheada en memoria 5 minutos (load-config.ts)
- PM2 cluster mode: 2 instancias para concurrencia
- Next.js standalone: bundle mínimo sin node_modules
