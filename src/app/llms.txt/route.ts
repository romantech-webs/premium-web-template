import { headers } from "next/headers"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"

/** Resumen en texto plano del sitio para buscadores con IA (convención llms.txt). */
export async function GET() {
  const h = await headers()
  const slug = h.get("x-clinic-slug")
  const config = slug ? await getClinicConfig(slug) : null
  if (!slug || !config || config._meta?.noindex) {
    return new Response("Not found", { status: 404 })
  }
  const baseUrl = getBaseUrl(slug, config)

  const centers = [
    { name: config.primaryCenterName || config.name, phone: config.phone, address: config.address },
    ...(config.centers || []).map((c) => ({ name: c.name || config.name, phone: c.phone, address: c.address })),
  ].filter((c) => c.address)

  const lines = [
    `# ${config.name}`,
    "",
    ...(config.description ? [`> ${config.description}`, ""] : []),
    "## Servicios",
    ...(config.services || []).map(
      (s) => `- [${s.name}](${baseUrl}/servicios/${s.id}): ${s.seoMetaDescription || s.description}`,
    ),
    "",
    "## Centros",
    ...centers.map(
      (c) => `- ${c.name}: ${c.address.street}, ${c.address.postalCode} ${c.address.city}${c.phone ? ` · ${c.phone}` : ""}`,
    ),
    "",
    "## Contacto",
    `- [Contacto](${baseUrl}/contacto)`,
    ...(config.pricing ? [`- [Precios](${baseUrl}/precios)`] : []),
    "",
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  })
}
