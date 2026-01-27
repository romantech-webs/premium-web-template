# Premium Web - Template para Clínicas

Template Next.js premium para clínicas en España. Valor percibido +10K€. Personaliza cambiando SOLO `/src/config/clinic.ts`.

## Características

- **Next.js 14** con App Router y TypeScript
- **Tailwind CSS** + shadcn/ui para diseño premium
- **Framer Motion** para microinteracciones
- **Lucide Icons** para iconografía consistente
- **SEO optimizado** con Schema.org (LocalBusiness/MedicalClinic)
- **WhatsApp Widget** flotante para conversión
- **Responsive** y optimizado para móvil
- **Accesible** según WCAG

## Inicio Rápido

### 1. Clonar e instalar

```bash
git clone <repo-url> mi-clinica
cd mi-clinica
npm install
```

### 2. Configurar la clínica

Edita el archivo `/src/config/clinic.ts` con los datos de la clínica:

```typescript
export const clinic = {
  name: "Clínica Ejemplo",
  tagline: "Tu salud, nuestra prioridad",
  colors: {
    primary: "#2563eb",    // Color principal (derivar del logo)
    secondary: "#0f172a",  // Color oscuro
    accent: "#10b981",     // Color de acento
    neutral: "#f8fafc",    // Fondo claro
  },
  phone: "+34 912 345 678",
  whatsapp: "+34912345678",
  // ... más configuración
}
```

### 3. Añadir imágenes

Coloca las imágenes en `/public/images/`:

```
public/
├── images/
│   ├── team/           # Fotos del equipo
│   ├── gallery/        # Fotos de instalaciones
│   └── og-image.jpg    # Imagen para redes sociales
```

### 4. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout global + SEO
│   ├── page.tsx            # Landing page
│   ├── contacto/           # Página de contacto
│   ├── aviso-legal/        # Aviso legal
│   ├── privacidad/         # Política de privacidad
│   └── cookies/            # Política de cookies
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Navegación sticky
│   │   ├── Footer.tsx      # Footer completo
│   │   └── WhatsAppWidget.tsx
│   └── sections/
│       ├── Hero.tsx        # Hero con CTA
│       ├── Services.tsx    # Grid de servicios
│       ├── Process.tsx     # "Cómo trabajamos"
│       ├── Reviews.tsx     # Reseñas Google
│       ├── WhyUs.tsx       # "Por qué elegirnos"
│       ├── Team.tsx        # Equipo
│       ├── Gallery.tsx     # Galería
│       ├── FAQ.tsx         # Preguntas frecuentes
│       ├── Location.tsx    # Mapa + ubicación
│       └── CTA.tsx         # Banner de conversión
├── config/
│   └── clinic.ts           # ⭐ CONFIGURACIÓN CENTRAL
└── lib/
    ├── utils.ts            # Utilidades (cn)
    └── schema.ts           # Generadores Schema.org
```

## Configuración Completa

El archivo `/src/config/clinic.ts` contiene todas las configuraciones:

| Sección | Descripción |
|---------|-------------|
| `name`, `tagline`, `description` | Identidad de la clínica |
| `colors` | Paleta de colores (derivar del logo) |
| `phone`, `whatsapp`, `email` | Datos de contacto |
| `address`, `coordinates` | Ubicación física |
| `schedule` | Horarios de atención |
| `social` | Redes sociales |
| `reviews` | Rating y reseñas destacadas |
| `services` | Lista de servicios con iconos |
| `process` | Pasos del proceso de trabajo |
| `whyUs` | Diferenciadores |
| `team` | Equipo profesional |
| `gallery` | Galería de instalaciones |
| `faq` | Preguntas frecuentes |
| `seo` | Metadatos SEO |
| `legal` | Datos legales (CIF, razón social) |

## Personalización de Colores

Los colores se definen en `clinic.ts` y se aplican automáticamente en toda la web:

```typescript
colors: {
  primary: "#2563eb",   // Botones, links, acentos
  secondary: "#0f172a", // Textos oscuros, footer
  accent: "#10b981",    // Elementos destacados
  neutral: "#f8fafc",   // Fondos claros
}
```

**Tip:** Usa un color-picker para extraer el color principal del logo de la clínica.

## Iconos Disponibles

Los iconos son de [Lucide Icons](https://lucide.dev/icons/). Para servicios y características, usa el nombre del icono:

```typescript
services: [
  { icon: "Stethoscope", ... },
  { icon: "Heart", ... },
  { icon: "Activity", ... },
]
```

## Google Maps Embed

Para añadir el mapa:

1. Ve a Google Maps
2. Busca la dirección de la clínica
3. Click en "Compartir" > "Incorporar un mapa"
4. Copia la URL del `src` del iframe
5. Pégala en `googleMapsEmbed`

## SEO

El template incluye:

- Meta tags dinámicos
- Open Graph para redes sociales
- Schema.org LocalBusiness/MedicalClinic
- Schema.org FAQPage para las preguntas frecuentes
- Sitemap automático de Next.js

## Despliegue

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Build Manual

```bash
npm run build
npm start
```

## Checklist Pre-Lanzamiento

- [ ] Todos los `TODO:` reemplazados en `clinic.ts`
- [ ] Imágenes del equipo añadidas
- [ ] Imágenes de galería añadidas
- [ ] Google Maps embed configurado
- [ ] Reseñas reales añadidas
- [ ] Textos legales revisados por abogado
- [ ] Testeado en móvil
- [ ] Lighthouse > 90 en móvil
- [ ] Google Search Console configurado
- [ ] Analytics instalado

## Soporte

Para soporte técnico o personalizaciones avanzadas, contacta con el desarrollador.

---

Desarrollado con Next.js, Tailwind CSS y mucho cariño.
