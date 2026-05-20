"use client"

import Link from "next/link"
import { ChevronRight, ArrowUpRight, Phone, MessageCircle } from "lucide-react"
import type { ClinicConfig } from "@/config/types"

type Pricing = NonNullable<ClinicConfig["pricing"]>

export function PricingTable({ pricing, clinic }: { pricing: Pricing; clinic: ClinicConfig }) {
  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`
  const phoneClean = clinic.phone.replace(/\s/g, "")

  return (
    <>
      {/* Hero band */}
      <section className="relative pt-32 pb-10 bg-gradient-to-br from-neutral via-white to-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="container max-w-5xl mx-auto px-4 relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary/50 mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary font-medium">Precios</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-5">
                {pricing.label || "Tarifas"}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary leading-[1.05] mb-4 text-balance">
                {pricing.title || "Precios de nuestros tratamientos"}
              </h1>
              {pricing.description && (
                <p className="text-base sm:text-lg text-secondary/70 leading-relaxed max-w-3xl whitespace-pre-line">
                  {pricing.description}
                </p>
              )}
            </div>

            <div className="hidden lg:flex flex-col gap-2 shrink-0">
              <a
                href={`tel:${phoneClean}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-lg hover:bg-secondary transition-colors shadow-lg shadow-primary/20"
              >
                <Phone className="w-4 h-4" />
                {clinic.phone}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1faa54] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing tables */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {pricing.categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-gradient-to-br from-white to-neutral rounded-2xl border border-secondary/10 shadow-sm p-6 lg:p-7"
              >
                <h2 className="text-xl lg:text-2xl font-display font-bold text-secondary mb-5 pb-4 border-b border-secondary/10">
                  {cat.name}
                </h2>
                <ul className="divide-y divide-secondary/5">
                  {cat.items.map((item, i) => (
                    <li
                      key={`${cat.name}-${i}`}
                      className="flex items-baseline justify-between gap-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base text-secondary font-medium leading-snug">
                          {item.name}
                        </p>
                        {item.duration && (
                          <p className="text-xs text-secondary/50 mt-0.5">{item.duration}</p>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-primary whitespace-nowrap shrink-0">
                        {item.priceFrom ? "desde " : ""}
                        {item.price} €
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {pricing.note && (
            <p className="text-xs text-secondary/50 italic mt-8 max-w-3xl">{pricing.note}</p>
          )}

          {/* CTA */}
          <section className="mt-12 p-7 sm:p-10 bg-gradient-to-br from-secondary via-secondary to-primary text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3 leading-tight">
                ¿Quieres reservar tu tratamiento?
              </h2>
              <p className="opacity-90 mb-7 text-base sm:text-lg max-w-2xl">
                Pide tu cita por teléfono o WhatsApp. Te asesoramos sin compromiso sobre el tratamiento que mejor se adapta a ti.
              </p>
              <div className="flex flex-wrap gap-3">
                {clinic._meta?.bookingEnabled ? (
                  <Link
                    href="/reservar"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-secondary font-bold rounded-xl hover:bg-neutral shadow-xl transition-all hover:scale-[1.02]"
                  >
                    {clinic.ctaLabel || "Pedir Cita"}
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-secondary font-bold rounded-xl hover:bg-neutral shadow-xl transition-all hover:scale-[1.02]"
                  >
                    {clinic.ctaLabel || "Pedir Cita"}
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                )}
                <a
                  href={`tel:${phoneClean}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>{clinic.phone}</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  )
}
