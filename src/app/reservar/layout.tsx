import { headers } from "next/headers"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const slug = h.get("x-clinic-slug") || ""
  const config = await getClinicConfig(slug)
  const name = config?.name || ""
  return {
    title: "Reservar Cita",
    description: `Reserva tu cita online en ${name}. Elige servicio, profesional, fecha y hora.`,
    alternates: { canonical: `${getBaseUrl(slug, config)}/reservar` },
  }
}

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
  return children
}
