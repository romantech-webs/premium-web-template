# Workflow: Sistema de Templates para Webs de Clínicas

## Estructura de Directorios

```
/Users/emilio/
├── premium-web/                    # Template base (NO modificar directamente)
│   ├── src/config/clinic.ts       # Configuración con TODOs
│   ├── public/images/             # Carpetas vacías para imágenes
│   └── WORKFLOW.md                # Esta documentación
│
└── proyectos/cebos/               # Proyectos de clientes
    ├── fisio-lourdes-benitez/     # Ejemplo: Fisioterapia
    ├── dental-clinica-dental/     # Ejemplo: Dental
    └── nutri-nutricionista/       # Ejemplo: Nutrición
```

## Convención de Nombres

**Formato:** `tipodeclinica-nombredeclinica`

### Prefijos por tipo de clínica:
- `fisio-` → Fisioterapia
- `dental-` → Clínicas dentales
- `nutri-` → Nutricionistas
- `psico-` → Psicología
- `podolo-` → Podología
- `esteti-` → Estética
- `veterina-` → Veterinaria
- `optica-` → Ópticas

### Ejemplos:
- `fisio-lourdes-benitez`
- `dental-sonrisa-perfecta`
- `nutri-maria-garcia`
- `psico-mente-sana`

---

## Proceso de Personalización

### Paso 1: Crear proyecto del cliente

```bash
# Crear directorio
mkdir -p /Users/emilio/proyectos/cebos/[tipo]-[nombre]

# Copiar template
cp -r /Users/emilio/premium-web/* /Users/emilio/proyectos/cebos/[tipo]-[nombre]/

# Copiar archivos ocultos
cp /Users/emilio/premium-web/.gitignore /Users/emilio/proyectos/cebos/[tipo]-[nombre]/

# Entrar al proyecto
cd /Users/emilio/proyectos/cebos/[tipo]-[nombre]

# Instalar dependencias
npm install
```

### Paso 2: Recopilar datos del cliente

Usar esta plantilla para recoger la información:

```
=== DATOS DEL CLIENTE ===

IDENTIDAD:
- Nombre de la clínica:
- Eslogan:
- Descripción (para SEO):

CONTACTO:
- Teléfono:
- WhatsApp:
- Email:

UBICACIÓN:
- Dirección completa:
- Ciudad y código postal:
- URL Google Maps:

HORARIOS:
- Lunes:
- Martes:
- Miércoles:
- Jueves:
- Viernes:
- Sábado:
- Domingo:

REDES SOCIALES:
- Instagram:
- Facebook:
- LinkedIn:
- TikTok:

RESEÑAS GOOGLE:
- Puntuación:
- Número de reseñas:
- URL de Google Business:

SERVICIOS (listar todos):
1.
2.
3.

EQUIPO (por cada miembro):
- Nombre:
- Cargo:
- Biografía breve:

DIFERENCIADORES (qué les hace únicos):
1.
2.
3.
4.

PREGUNTAS FRECUENTES:
1. P:
   R:
2. P:
   R:
```

### Paso 3: Obtener recursos visuales

1. **Logo** → Guardar en `/public/images/logo.jpg` o `.png`
2. **Imagen hero** → Guardar en `/public/images/hero.jpg`
3. **Fotos del equipo** → Guardar en `/public/images/team/nombre.jpg`
4. **Galería** → Guardar en `/public/images/gallery/1.jpg`, `2.jpg`, etc.

### Paso 4: Personalizar configuración

Editar `/src/config/clinic.ts`:
- Reemplazar todos los valores `TODO:` con datos reales
- Extraer colores del logo del cliente
- Añadir servicios específicos del tipo de clínica
- Personalizar FAQ según especialidad

### Paso 5: Verificar y desplegar

```bash
# Verificar que compila
npm run build

# Probar localmente
npm run dev

# Si todo OK, desplegar según método elegido
```

---

## Checklist de Verificación

### Antes de entregar:

- [ ] `clinic.ts` no contiene ningún "TODO:"
- [ ] Logo cargado en `/public/images/logo.jpg`
- [ ] Imagen hero cargada (o usando placeholder)
- [ ] Colores extraídos del logo
- [ ] Teléfono y WhatsApp correctos
- [ ] Dirección completa con URL de Google Maps
- [ ] Horarios actualizados
- [ ] Redes sociales configuradas (las que existan)
- [ ] Servicios personalizados para el tipo de clínica
- [ ] Equipo con foto y bio
- [ ] FAQ relevantes añadidas
- [ ] SEO personalizado (título, descripción, keywords)
- [ ] `npm run build` funciona sin errores
- [ ] Probado en móvil y escritorio

---

## Notas de Diseño

### WhatsApp CTA
- El botón flotante de WhatsApp debe usar siempre el **icono SVG oficial de WhatsApp** (NO usar MessageCircle de Lucide ni otros iconos genéricos)
- El icono oficial está implementado en `/src/components/layout/WhatsAppWidget.tsx`
- Color del botón: verde oficial de WhatsApp `#25D366`
- **IMPORTANTE:** Lucide React NO tiene el icono oficial de WhatsApp, usar el SVG personalizado del componente

---

## Notas Importantes

1. **NUNCA modificar premium-web directamente** - Siempre copiar a proyectos/cebos/
2. **Mantener el template limpio** - Si mejoras el template, aplicar a premium-web
3. **Backup antes de desplegar** - Guardar copia del proyecto antes de subir
4. **Documentar cambios específicos** - Si un cliente necesita algo especial, documentarlo

---

## Comandos Útiles

```bash
# Ver estructura de un proyecto
ls -la /Users/emilio/proyectos/cebos/[proyecto]/

# Buscar TODOs pendientes
grep -r "TODO" /Users/emilio/proyectos/cebos/[proyecto]/src/

# Verificar imágenes
ls -la /Users/emilio/proyectos/cebos/[proyecto]/public/images/

# Limpiar y reinstalar
rm -rf node_modules .next && npm install
```
