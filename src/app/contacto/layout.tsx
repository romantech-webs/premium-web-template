import { headers } from "next/headers"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const slug = h.get("x-clinic-slug") || ""
  const config = await getClinicConfig(slug)
  const name = config?.name || ""
  const city = config?.address?.city || ""
  return {
    title: "Contacto",
    description: `Contacta con ${name}${city ? ` en ${city}` : ""}. Dirección, teléfono y formulario de contacto.`,
    alternates: { canonical: `${getBaseUrl(slug, config)}/contacto` },
  }
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children
}
