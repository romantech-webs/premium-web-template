import { headers } from "next/headers"
import { getClinicConfig } from "@/config/load-config"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const config = await getClinicConfig(h.get("x-clinic-slug") || "")
  const name = config?.name || ""
  return {
    title: "Reservar Cita",
    description: `Reserva tu cita online en ${name}. Elige servicio, profesional, fecha y hora.`,
  }
}

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
  return children
}
