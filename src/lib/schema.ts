import type { ClinicConfig } from "@/config/types"

// Google restricted FAQPage rich results to gov/health sites (Aug 2023)
const HEALTH_SCHEMA_TYPES = [
  "Dentist", "PhysicalTherapy", "PsychologicalTreatment", "MedicalClinic",
  "Podiatric", "DieteticsAndNutrition", "SpeechPathology", "VeterinaryCare",
  "Optician", "HealthClub",
]

export function isHealthSchemaType(schemaType: string): boolean {
  return HEALTH_SCHEMA_TYPES.includes(schemaType)
}

export function generateLocalBusinessSchema(clinic: ClinicConfig, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": clinic.schemaType,
    name: clinic.name,
    description: clinic.description,
    url: baseUrl,
    telephone: clinic.phone,
    ...(clinic.email ? { email: clinic.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      addressRegion: clinic.address.province,
      postalCode: clinic.address.postalCode,
      addressCountry: clinic.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: clinic.coordinates.lat,
      longitude: clinic.coordinates.lng,
    },
    openingHoursSpecification: clinic.schedule.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.days,
      opens: s.hours.split(" - ")[0],
      closes: s.hours.split(" - ")[1],
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: clinic.reviews.rating.toString(),
      reviewCount: clinic.reviews.count.toString(),
    },
    sameAs: [
      clinic.social.instagram,
      clinic.social.facebook,
      clinic.social.linkedin,
      clinic.social.tiktok,
    ].filter(Boolean),
  }
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
        provider: {
          "@type": clinic.schemaType,
          name: clinic.name,
          url: baseUrl,
        },
      },
    })),
  }
}

export function generateIndividualServiceSchema(
  clinic: ClinicConfig,
  service: { id: string; name: string; description: string; longDescription?: string },
  baseUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.longDescription || service.description,
    url: `${baseUrl}/servicios/${service.id}`,
    provider: {
      "@type": clinic.schemaType,
      name: clinic.name,
      url: baseUrl,
      telephone: clinic.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address.street,
        addressLocality: clinic.address.city,
        addressRegion: clinic.address.province,
        postalCode: clinic.address.postalCode,
        addressCountry: clinic.address.country,
      },
    },
    areaServed: {
      "@type": "City",
      name: clinic.address.city,
    },
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
