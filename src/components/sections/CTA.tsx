"use client"

import { motion } from "framer-motion"
import { ArrowRight, Phone, Clock, CheckCircle, CalendarCheck } from "lucide-react"
import Link from "next/link"
import { useClinic } from "@/config/clinic-context"

export function CTA() {
  const clinic = useClinic()
  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background with animated gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary) 40%, color-mix(in srgb, var(--color-primary) 90%, var(--color-secondary)) 100%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 8s ease infinite",
        }}
      />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            white,
            white 1px,
            transparent 1px,
            transparent 30px
          )`
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px]" />

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-40 h-40">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-accent to-transparent" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-accent to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-40 h-40">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent" />
        <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-accent to-transparent" />
      </div>

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-label justify-center !text-primary">
            {clinic.ctaLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-display font-bold text-white mt-4 mb-4 lg:mb-6">
            {clinic.ctaHeadline}
          </h2>
          <p className="text-white/60 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8 lg:mb-12 leading-relaxed">
            {clinic.ctaDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-3 px-10 py-5 font-bold bg-white text-secondary hover:bg-accent hover:text-white transition-all duration-300 shadow-2xl shadow-black/20"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                background: "white",
                color: "var(--color-secondary)",
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Reservar por WhatsApp
                <ArrowRight className="w-5 h-5" />
              </span>
            </motion.a>

            <motion.a
              href={`tel:${clinic.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
              }}
            >
              <Phone className="w-5 h-5" />
              {clinic.phone}
            </motion.a>

            {clinic._meta?.bookingEnabled && (
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/reservar"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl font-bold border-2 border-accent/50 text-white hover:bg-accent/20 transition-all duration-300"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
                  }}
                >
                  <CalendarCheck className="w-5 h-5" />
                  Reservar cita
                </Link>
              </motion.div>
            )}
          </div>

          {/* Trust indicators with subtle pulse */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: CheckCircle, text: "Primera consulta informativa" },
              { icon: Clock, text: "Respuesta en menos de 24h" },
              { icon: CheckCircle, text: "Sin compromiso" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-center gap-3 text-white/50"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                >
                  <item.icon className="w-5 h-5 text-accent" />
                </motion.div>
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

    </section>
  )
}
