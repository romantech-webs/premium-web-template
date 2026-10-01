import { describe, it, expect } from "vitest"
import { generateLocalBusinessSchema, generateFAQSchema } from "../schema"
import type { ClinicConfig } from "@/config/types"

const base = {
  name: "Clínica Test",
  description: "d",
  phone: "+34 600 000 000",
  schemaType: "PhysicalTherapy",
  address: { street: "Calle Uno 1", city: "Toledo", province: "Toledo", postalCode: "45001", country: "ES" },
  coordinates: { lat: 39.8, lng: -4.0 },
  schedule: [],
  social: {},
  reviews: { rating: 5, count: 14, url: "https://g.page/x", featured: [{ author: "A", rating: 5, text: "t" }] },
  faq: [{ question: "¿P?", answer: "R" }],
} as unknown as ClinicConfig

describe("generateLocalBusinessSchema", () => {
  const schema = generateLocalBusinessSchema(base, "https://x.com") as Record<string, unknown>

  it("usa Physiotherapy y no la terapia PhysicalTherapy como tipo de negocio", () => {
    expect(schema["@type"]).toEqual(["LocalBusiness", "Physiotherapy"])
  })

  it("no emite valoraciones propias (aggregateRating/review)", () => {
    expect(schema).not.toHaveProperty("aggregateRating")
    expect(schema).not.toHaveProperty("review")
  })

  it("mapea PsychologicalTreatment a MedicalClinic", () => {
    const s = generateLocalBusinessSchema({ ...base, schemaType: "PsychologicalTreatment" }, "https://x.com") as Record<string, unknown>
    expect(s["@type"]).toEqual(["LocalBusiness", "MedicalClinic"])
  })

  it("deja intactos los tipos sin alias", () => {
    const s = generateLocalBusinessSchema({ ...base, schemaType: "Dentist" }, "https://x.com") as Record<string, unknown>
    expect(s["@type"]).toEqual(["LocalBusiness", "Dentist"])
  })
})

describe("centros adicionales (department)", () => {
  const multi = {
    ...base,
    centers: [{
      name: "Centro Nuevo", phone: "+34 611", googleMapsUrl: "u", googleMapsEmbed: "e",
      address: { street: "Calle Dos 2", city: "Toledo", province: "Toledo", postalCode: "45003" },
      coordinates: { lat: 39.9, lng: -4.1 },
    }, {
      phone: "+34 622", googleMapsUrl: "u", googleMapsEmbed: "e",
      address: { street: "Calle Tres 3", city: "Toledo", province: "Toledo", postalCode: "45004" },
    }],
  } as unknown as ClinicConfig
  const dept = (generateLocalBusinessSchema(multi, "https://x.com") as { department: Array<Record<string, unknown>> }).department

  it("cada centro lleva @id propio y enlaza con el negocio principal", () => {
    expect(dept.map((d) => d["@id"])).toEqual(["https://x.com/#center-1", "https://x.com/#center-2"])
    expect(dept[0].parentOrganization).toEqual({ "@id": "https://x.com/#business" })
  })

  it("emite geo solo si el centro trae coordenadas", () => {
    expect(dept[0].geo).toEqual({ "@type": "GeoCoordinates", latitude: 39.9, longitude: -4.1 })
    expect(dept[1]).not.toHaveProperty("geo")
  })
})

describe("generateFAQSchema", () => {
  it("usa las FAQ pasadas y, si no, las globales", () => {
    const own = generateFAQSchema(base, [{ question: "Q", answer: "A" }])
    expect(own.mainEntity).toHaveLength(1)
    expect(own.mainEntity[0].name).toBe("Q")
    expect(generateFAQSchema(base).mainEntity[0].name).toBe("¿P?")
  })
})
