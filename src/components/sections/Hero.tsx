"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Phone, Star, ArrowRight, Play } from "lucide-react"
import { clinic } from "@/config/clinic"

export function Hero() {
  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Diagonal lines */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              var(--color-secondary),
              var(--color-secondary) 1px,
              transparent 1px,
              transparent 40px
            )`
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />

        {/* Athletic corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-accent to-transparent" />
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-accent to-transparent" />
        </div>
      </div>

      <div className="container-wide section-padding relative z-10 pt-32 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg shadow-black/5 border border-gray-100 mb-8"
            >
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                  />
                ))}
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-sm font-semibold text-secondary">
                {clinic.reviews.rating} · {clinic.reviews.count} reseñas
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-secondary leading-[1.1] mb-6"
            >
              <span className="block">{clinic.heroHeadline[0]}</span>
              <span className="relative inline-block">
                <span className="text-primary">{clinic.heroHeadline[1]}</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2 font-semibold text-secondary/70">
                {clinic.heroHeadline[2]}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl text-secondary/60 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {clinic.heroDescription}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="inline-flex items-center gap-3">
                  Reservar Cita
                  <ArrowRight className="w-5 h-5" />
                </span>
              </motion.a>

              <motion.a
                href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                className="btn-secondary text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5" />
                Llamar Ahora
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-12 pt-10 border-t border-gray-200 grid grid-cols-3 gap-6"
            >
              {[
                { value: `+${clinic.reviews.count}`, label: clinic.statsLabel },
                { value: String(clinic.services.length), label: "Tratamientos" },
                { value: clinic.reviews.rating.toString(), label: "Valoración" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="text-3xl sm:text-4xl font-bold text-secondary">{stat.value}</p>
                  <p className="text-sm text-secondary/50 mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            {/* Main image container */}
            <div className="relative">
              {/* Background shape */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-[2rem] -rotate-3" />

              {/* Image */}
              <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-2xl shadow-primary/20">
                <Image
                  src="/images/hero.webp"
                  alt={`${clinic.name} - ${clinic.tagline}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent" />
              </div>

              {/* Floating badge - Rating */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-xl p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{clinic.reviews.rating}</p>
                    <p className="text-xs text-secondary/50 uppercase tracking-wider">Google</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge - Specialty */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-secondary">{clinic.specialty}</p>
                    <p className="text-xs text-secondary/50">{clinic.name}</p>
                  </div>
                </div>
              </motion.div>

              {/* Corner accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-accent rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  )
}
