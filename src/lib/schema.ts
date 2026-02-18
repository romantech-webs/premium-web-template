import type { ClinicConfig } from "@/config/types"

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
