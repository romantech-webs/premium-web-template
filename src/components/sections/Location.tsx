"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Navigation } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { useOpenStatus } from "@/lib/use-open-status"

type CenterCard = {
  name?: string
  address: {
    street: string
    city: string
    province: string
    postalCode: string
    country?: string
  }
  phone: string
  googleMapsUrl: string
  googleMapsEmbed: string
}

function MapFrame({ embed, title }: { embed: string; title: string }) {
  return (
    <div className="bg-neutral rounded-2xl overflow-hidden h-full min-h-[350px] lg:min-h-[400px]">
      {embed && embed !== "TODO: URL embed" ? (
        <iframe
          src={embed}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: 350 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups"
          title={title}
        />
      ) : (
        <div className="h-full flex items-center justify-center text-secondary/30">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 mx-auto mb-4" />
            <p className="text-sm font-medium">Mapa de Google</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AddressCard({ center }: { center: CenterCard }) {
  return (
    <div className="bg-neutral rounded-2xl p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary mb-2">Dirección</h3>
          <p className="text-secondary/70 text-sm">
            {center.address.street}<br />
            {center.address.postalCode} {center.address.city}<br />
            {center.address.province}
          </p>
          <a
            href={center.googleMapsUrl}
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
  )
}

function PhoneCard({ phone, email }: { phone: string; email?: string }) {
  return (
    <div className="bg-neutral rounded-2xl p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary mb-2">Contacto</h3>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="text-secondary/70 hover:text-primary transition-colors block"
          >
            {phone}
          </a>
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-secondary/70 hover:text-primary transition-colors block mt-1"
            >
              {email}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function ScheduleCard({
  schedule,
  openStatus,
}: {
  schedule: Array<{ days: string; hours: string }>
  openStatus: { isOpen: boolean; label: string } | null
}) {
  return (
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
            {schedule.map((item, index) => (
              <li key={index}>
                <span className="font-medium text-secondary">{item.days}:</span>{" "}
                {item.hours}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function Location() {
  const clinic = useClinic()
  const openStatus = useOpenStatus(clinic.schedule)

  const additionalCenters = clinic.centers ?? []
  const hasMultipleCenters = additionalCenters.length > 0

  const primaryCenter: CenterCard = {
    name: clinic.primaryCenterName ?? clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    googleMapsUrl: clinic.googleMapsUrl,
    googleMapsEmbed: clinic.googleMapsEmbed,
  }

  const sectionHeader = (
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
        {hasMultipleCenters
          ? `Atendemos en ${additionalCenters.length + 1} centros, mismo equipo profesional. Elige el que más te convenga.`
          : `Estamos en el corazón de ${clinic.address.city}, con fácil acceso en transporte público y parking cercano.`}
      </p>
    </motion.div>
  )

  if (!hasMultipleCenters) {
    return (
      <section id="ubicacion" className="section-padding bg-white section-divider">
        <div className="container-wide">
          {sectionHeader}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 lg:space-y-6"
            >
              <AddressCard center={primaryCenter} />
              <ScheduleCard schedule={clinic.schedule} openStatus={openStatus} />
              <PhoneCard phone={clinic.phone} email={clinic.email} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <MapFrame embed={clinic.googleMapsEmbed} title={`Ubicación de ${clinic.name}`} />
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // Multi-center layout: shared schedule on top, then one row per center
  const centers: CenterCard[] = [primaryCenter, ...additionalCenters]

  return (
    <section id="ubicacion" className="section-padding bg-white section-divider">
      <div className="container-wide">
        {sectionHeader}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10 lg:mb-12"
        >
          <ScheduleCard schedule={clinic.schedule} openStatus={openStatus} />
        </motion.div>

        <div className="space-y-12 lg:space-y-16">
          {centers.map((center, idx) => {
            const heading = center.name ?? `Centro ${idx + 1}`
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-secondary">
                    {heading}
                  </h3>
                </div>
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="space-y-4 lg:space-y-6">
                    <AddressCard center={center} />
                    <PhoneCard
                      phone={center.phone}
                      email={idx === 0 ? clinic.email : undefined}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <MapFrame embed={center.googleMapsEmbed} title={`Ubicación de ${heading}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
