"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Navigation } from "lucide-react"
import { clinic } from "@/config/clinic"

export function Location() {
  return (
    <section id="ubicacion" className="section-padding bg-white">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            {clinic.sectionCopy.locationLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-secondary mt-4 mb-6">
            {clinic.sectionCopy.locationTitle}
          </h2>
          <p className="text-lg text-secondary/70">
            Estamos en el corazón de {clinic.address.city}, con fácil acceso en transporte público y parking cercano.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Address */}
            <div className="bg-neutral rounded-2xl p-6">
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

            {/* Schedule */}
            <div className="bg-neutral rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">Horario</h3>
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
            <div className="bg-neutral rounded-2xl p-6">
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
            <div className="bg-neutral rounded-2xl overflow-hidden h-full min-h-[400px]">
              {clinic.googleMapsEmbed && clinic.googleMapsEmbed !== "TODO: URL embed" ? (
                <iframe
                  src={clinic.googleMapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 400 }}
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
