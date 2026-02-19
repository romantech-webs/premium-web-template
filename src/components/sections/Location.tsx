"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Navigation } from "lucide-react"
import { useClinic } from "@/config/clinic-context"

function useOpenStatus(schedule: Array<{ days: string; hours: string }>) {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null)

  useEffect(() => {
    function check() {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }))
      const dayIndex = now.getDay() // 0=Sun
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const dayNames: Record<string, number[]> = {
        "lunes": [1], "martes": [2], "miércoles": [3], "miercoles": [3],
        "jueves": [4], "viernes": [5], "sábado": [6], "sabado": [6], "domingo": [0],
        "lunes a viernes": [1, 2, 3, 4, 5], "lunes - viernes": [1, 2, 3, 4, 5],
        "lunes a sábado": [1, 2, 3, 4, 5, 6], "lunes - sábado": [1, 2, 3, 4, 5, 6],
      }

      let isOpen = false
      let nextOpen = ""

      for (const entry of schedule) {
        const daysLower = entry.days.toLowerCase().trim()
        if (daysLower === "cerrado" || entry.hours.toLowerCase() === "cerrado") continue

        const matchedDays = dayNames[daysLower]
        if (!matchedDays || !matchedDays.includes(dayIndex)) continue

        // Parse hours like "09:00 - 20:00" or "09:00 - 14:00 / 16:00 - 20:00"
        const timeRanges = entry.hours.split("/").map(r => r.trim())
        for (const range of timeRanges) {
          const parts = range.split("-").map(p => p.trim())
          if (parts.length !== 2) continue
          const [openStr, closeStr] = parts
          const openParts = openStr.split(":").map(Number)
          const closeParts = closeStr.split(":").map(Number)
          if (openParts.length < 2 || closeParts.length < 2) continue

          const openMin = openParts[0] * 60 + openParts[1]
          const closeMin = closeParts[0] * 60 + closeParts[1]

          if (currentMinutes >= openMin && currentMinutes < closeMin) {
            isOpen = true
            break
          }

          if (currentMinutes < openMin && !nextOpen) {
            nextOpen = openStr
          }
        }
        if (isOpen) break
      }

      if (isOpen) {
        setStatus({ isOpen: true, label: "Abierto ahora" })
      } else if (nextOpen) {
        setStatus({ isOpen: false, label: `Abre a las ${nextOpen}` })
      } else {
        setStatus({ isOpen: false, label: "Cerrado" })
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [schedule])

  return status
}

export function Location() {
  const clinic = useClinic()
  const openStatus = useOpenStatus(clinic.schedule)

  return (
    <section id="ubicacion" className="section-padding bg-white">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10 lg:mb-12"
        >
          <span className="section-label justify-center">
            {clinic.sectionCopy.locationLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-secondary mt-4 mb-4 lg:mb-6">
            {clinic.sectionCopy.locationTitle}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-secondary/60 leading-relaxed">
            Estamos en el corazón de {clinic.address.city}, con fácil acceso en transporte público y parking cercano.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 lg:space-y-6"
          >
            {/* Address */}
            <div className="bg-neutral rounded-2xl p-5 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">Dirección</h3>
                  <p className="text-secondary/70 text-sm">
                    {clinic.address.street}<br />
                    {clinic.address.postalCode} {clinic.address.city}<br />
                    {clinic.address.province}
                  </p>
                  <a
                    href={clinic.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-primary font-medium hover:underline"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </a>
                </div>
              </div>
            </div>

            {/* Schedule with open/closed badge */}
            <div className="bg-neutral rounded-2xl p-5 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-secondary">Horario</h3>
                    {openStatus && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        openStatus.isOpen
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          openStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                        }`} />
                        {openStatus.label}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-secondary/70">
                    {clinic.schedule.map((item, index) => (
                      <li key={index}>
                        <span className="font-medium text-secondary">{item.days}:</span>{" "}
                        {item.hours}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-neutral rounded-2xl p-5 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">Contacto</h3>
                  <a
                    href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                    className="text-secondary/70 hover:text-primary transition-colors block"
                  >
                    {clinic.phone}
                  </a>
                  {clinic.email && (
                  <a
                    href={`mailto:${clinic.email}`}
                    className="text-secondary/70 hover:text-primary transition-colors block mt-1"
                  >
                    {clinic.email}
                  </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-neutral rounded-2xl overflow-hidden h-full min-h-[350px] lg:min-h-[400px]">
              {clinic.googleMapsEmbed && clinic.googleMapsEmbed !== "TODO: URL embed" ? (
                <iframe
                  src={clinic.googleMapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 350 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  title={`Ubicación de ${clinic.name}`}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-secondary/30">
                  <div className="text-center p-8">
                    <MapPin className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm font-medium">Mapa de Google</p>
                    <p className="text-xs mt-1">
                      Configura googleMapsEmbed en /config/clinic.ts
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
