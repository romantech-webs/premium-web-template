import type { ClinicConfig } from "@/config/types"

const HEALTH_SCHEMA_TYPES = [
  "Dentist", "PhysicalTherapy", "PsychologicalTreatment", "MedicalClinic",
  "Podiatric", "DieteticsAndNutrition", "SpeechPathology", "VeterinaryCare",
  "Optician", "HealthClub",
]

export function isHealthSchemaType(schemaType: string): boolean {
  return HEALTH_SCHEMA_TYPES.includes(schemaType)
}

/**
 * Returns the @type value for a business node carrying review snippets.
 *
 * Google's Review snippet validator requires the parent_node to be one of a fixed
 * top-level list (LocalBusiness, Organization, Product, …). Medical subtypes like
 * `PhysicalTherapy` or `Dentist` are technically subclasses of LocalBusiness in
 * schema.org, but Google does NOT resolve that hierarchy and flags them as
 * "El tipo de objeto del campo '<parent_node>' no es válido" in Search Console.
 *
 * Declaring @type as an array that explicitly includes "LocalBusiness" makes the
 * site eligible for review rich results while keeping the specific medical subtype
 * for E-E-A-T / topical relevance.
 */
function getBusinessNodeType(schemaType: string): string | string[] {
  if (isHealthSchemaType(schemaType)) {
    return ["LocalBusiness", schemaType]
  }
  return schemaType
}

const DAY_MAP: Record<string, string> = {
  lunes: "Monday", martes: "Tuesday", miercoles: "Wednesday", "miércoles": "Wednesday",
  jueves: "Thursday", viernes: "Friday", sabado: "Saturday", "sábado": "Saturday",
  domingo: "Sunday",
  l: "Monday", m: "Tuesday", x: "Wednesday", j: "Thursday", v: "Friday", s: "Saturday", d: "Sunday",
}
const ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

function normalizeDays(spec: string): string[] {
  const s = spec.toLowerCase().trim()
  const rangeMatch = s.match(/^(\S+)\s*[-aá]\s*(\S+)$/i)
  if (rangeMatch) {
    const a = DAY_MAP[rangeMatch[1]]
    const b = DAY_MAP[rangeMatch[2]]
    if (a && b) {
      const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b)
      if (ai >= 0 && bi >= 0 && ai <= bi) return ORDER.slice(ai, bi + 1)
    }
  }
  return s.split(/[,\s]+/).map((d) => DAY_MAP[d]).filter((d): d is string => Boolean(d))
}

function padTime(t: string): string {
  const [h, m] = t.split(":")
  return `${h.padStart(2, "0")}:${m}`
}

function parseHours(spec: string): { opens?: string; closes?: string } {
  const m = spec.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/)
  if (m) return { opens: padTime(m[1]), closes: padTime(m[2]) }
  return {}
}

/** Normalize a free-text country to an ISO 3166-1 alpha-2 code (schema.org expects the code). */
function isoCountry(country: string | undefined): string {
  const c = (country || "").trim().toLowerCase()
  if (!c) return "ES"
  if (["es", "españa", "espana", "spain"].includes(c)) return "ES"
  if (/^[a-z]{2}$/.test(c)) return c.toUpperCase()
  return (country || "").trim()
}

export function generateLocalBusinessSchema(clinic: ClinicConfig, baseUrl: string) {
  const isSAB = !clinic.address.street && !clinic.address.postalCode

  const openingHours = clinic.schedule
    .map((s) => {
      const days = normalizeDays(s.days)
      const hours = parseHours(s.hours)
      if (days.length === 0 || !hours.opens || !hours.closes) return null
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens: hours.opens,
        closes: hours.closes,
      }
    })
    .filter(Boolean)

  const reviews = (clinic.reviews.featured || []).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.author },
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.text,
    ...(r.date ? { datePublished: r.date } : {}),
  }))

  const sameAs = [
    clinic.social.instagram,
    clinic.social.facebook,
    clinic.social.linkedin,
    clinic.social.tiktok,
    clinic.reviews.url,
  ].filter((s): s is string => Boolean(s))

  const serviceAreas = clinic.serviceAreas && clinic.serviceAreas.length > 0
    ? clinic.serviceAreas
    : [clinic.address.city]

  const areaServed = serviceAreas.map((name) => ({ "@type": "City", name }))

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": getBusinessNodeType(clinic.schemaType),
    "@id": `${baseUrl}/#business`,
    name: clinic.name,
    description: clinic.description,
    url: baseUrl,
    telephone: clinic.phone,
    ...(clinic.email ? { email: clinic.email } : {}),
    ...(clinic.logo ? { logo: `${baseUrl}${clinic.logo}` } : {}),
    image: `${baseUrl}/og-image.jpg`,
    address: isSAB ? {
      "@type": "PostalAddress",
      addressLocality: clinic.address.city,
      addressRegion: clinic.addressRegion || clinic.address.province,
      addressCountry: isoCountry(clinic.address.country),
    } : {
      "@type": "PostalAddress",
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      addressRegion: clinic.addressRegion || clinic.address.province,
      postalCode: clinic.address.postalCode,
      addressCountry: isoCountry(clinic.address.country),
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: clinic.coordinates.lat,
      longitude: clinic.coordinates.lng,
    },
    areaServed,
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: clinic.reviews.rating.toString(),
      reviewCount: clinic.reviews.count.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    ...(reviews.length > 0 ? { review: reviews } : {}),
    ...(clinic.priceRange ? { priceRange: clinic.priceRange } : {}),
    ...(clinic.paymentMethods && clinic.paymentMethods.length > 0
      ? { paymentAccepted: clinic.paymentMethods.join(", ") } : {}),
    currenciesAccepted: "EUR",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }

  if (isSAB) {
    schema.serviceArea = {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: clinic.coordinates.lat,
        longitude: clinic.coordinates.lng,
      },
      geoRadius: "25000",
    }
  }

  const owner = clinic.team?.[0]
  if (owner) {
    schema.founder = {
      "@type": "Person",
      name: owner.name,
      jobTitle: owner.role,
      ...(owner.image ? { image: `${baseUrl}${owner.image}` } : {}),
      ...(owner.bio ? { description: owner.bio } : {}),
      worksFor: { "@id": `${baseUrl}/#business` },
    }
  }

  // Additional physical centers → schema.org `department` (each its own location node)
  if (clinic.centers && clinic.centers.length > 0) {
    schema.department = clinic.centers.map((c) => ({
      "@type": getBusinessNodeType(clinic.schemaType),
      name: c.name || clinic.name,
      ...(c.phone ? { telephone: c.phone } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: c.address.street,
        addressLocality: c.address.city,
        addressRegion: clinic.addressRegion || c.address.province,
        postalCode: c.address.postalCode,
        addressCountry: isoCountry(c.address.country),
      },
      ...(c.googleMapsUrl ? { hasMap: c.googleMapsUrl } : {}),
    }))
  }

  return schema
}

export function generateFAQSchema(clinic: ClinicConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: clinic.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function generateServiceSchema(clinic: ClinicConfig, baseUrl: string) {
  const serviceAreas = clinic.serviceAreas && clinic.serviceAreas.length > 0
    ? clinic.serviceAreas
    : [clinic.address.city]

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: clinic.services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        url: `${baseUrl}/servicios/${service.id}`,
        provider: { "@id": `${baseUrl}/#business` },
        areaServed: serviceAreas.map((name) => ({ "@type": "City", name })),
      },
    })),
  }
}

export function generateIndividualServiceSchema(
  clinic: ClinicConfig,
  service: { id: string; name: string; description: string; longDescription?: string },
  baseUrl: string,
) {
  const serviceAreas = clinic.serviceAreas && clinic.serviceAreas.length > 0
    ? clinic.serviceAreas
    : [clinic.address.city]

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}/servicios/${service.id}#service`,
    name: service.name,
    description: service.longDescription || service.description,
    url: `${baseUrl}/servicios/${service.id}`,
    provider: { "@id": `${baseUrl}/#business` },
    areaServed: serviceAreas.map((name) => ({ "@type": "City", name })),
    serviceType: service.name,
  }
}

export function generateBreadcrumbSchema(baseUrl: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  }
}

export function generateWebSiteSchema(clinic: ClinicConfig, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: clinic.name,
    description: clinic.description,
    inLanguage: "es-ES",
    publisher: { "@id": `${baseUrl}/#business` },
  }
}
