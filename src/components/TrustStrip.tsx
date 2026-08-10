import { Star, Shield, Clock, CheckCircle2 } from "lucide-react"
import { isHealthSchemaType } from "@/lib/schema"
import type { ClinicConfig } from "@/config/types"

const ICONS = {
  star: <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />,
  shield: <Shield className="w-5 h-5 text-primary shrink-0" />,
  clock: <Clock className="w-5 h-5 text-accent shrink-0" />,
  check: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
} as const

type Signal = { icon?: keyof typeof ICONS; title: string; subtitle?: string }

/**
 * The default strip was written for the trades vertical ("Autónomo profesional",
 * "Presupuesto cerrado"). Clinics get only the badge backed by real config data —
 * the Google rating — unless the config spells out its own signals.
 */
function resolveSignals(config: ClinicConfig): Signal[] {
  if (config.serviceTrustSignals) return config.serviceTrustSignals as Signal[]

  const signals: Signal[] = []
  if (!config.heroHideSocialProof && config.reviews.count > 0) {
    signals.push({
      icon: "star",
      title: `${config.reviews.rating} · ${config.reviews.count} reseñas`,
      subtitle: "Google",
    })
  }
  if (isHealthSchemaType(config.schemaType)) return signals

  signals.push(
    { icon: "shield", title: "Autónomo profesional", subtitle: "Factura · garantía" },
    { icon: "clock", title: "Atención el mismo día", subtitle: "Disponibilidad" },
    { icon: "check", title: "Presupuesto cerrado", subtitle: "Sin sorpresas" },
  )
  return signals
}

export function TrustStrip({ config }: { config: ClinicConfig }) {
  const signals = resolveSignals(config)
  if (signals.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-secondary/10">
      {signals.map((signal, i) => (
        <div key={i} className="flex items-center gap-2.5 text-secondary/70">
          {ICONS[signal.icon ?? "check"]}
          <div className="text-xs sm:text-sm">
            <div className="font-bold text-secondary">{signal.title}</div>
            {signal.subtitle && (
              <div className="text-secondary/50 text-[11px]">{signal.subtitle}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
