"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Phone, Star, ArrowRight, Play } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { CountUp } from "@/components/count-up"

const clipReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  visible: { clipPath: "inset(0 0% 0 0)", opacity: 1 },
}

export function Hero() {
  const clinic = useClinic()
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

        {/* Gradient orbs - larger and animated */}
        <motion.div
          className="absolute top-20 right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

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
            {/* Trust badge with pulse ring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg shadow-black/5 border border-gray-100 mb-8 relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0 0px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                    "0 0 0 8px color-mix(in srgb, var(--color-primary) 0%, transparent)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
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

            {/* Headline with clip reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-secondary leading-[1.1] mb-6">
              <motion.span
                className="block"
                variants={clipReveal}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {clinic.heroHeadline?.[0] || ""}
              </motion.span>
              {clinic.heroHeadline?.[1] && (
              <motion.span
                className="relative inline-block"
                variants={clipReveal}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-primary">{clinic.heroHeadline[1]}</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </motion.span>
              )}
              {clinic.heroHeadline?.[2] && (
              <motion.span
                className="block text-3xl sm:text-4xl lg:text-5xl mt-2 font-semibold text-secondary/70"
                variants={clipReveal}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {clinic.heroHeadline[2]}
              </motion.span>
              )}
            </h1>

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

            {/* Stats with dividers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-12 pt-10 border-t border-gray-200 grid grid-cols-3 gap-6"
            >
              {[
                { end: clinic.reviews.count, prefix: "+", label: clinic.statsLabel },
                { end: clinic.services.length, label: "Tratamientos" },
                { end: clinic.reviews.rating, decimals: 1, label: "Valoración" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-gray-200 hidden lg:block -ml-3" />}
                  <div>
                    <p className="text-3xl sm:text-4xl font-bold text-secondary">
                      <CountUp end={stat.end} prefix={stat.prefix} decimals={stat.decimals} />
                    </p>
                    <p className="text-sm text-secondary/50 mt-1 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative group"
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
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
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{clinic.reviews.rating}</p>
                    <p className="text-xs text-secondary/50 uppercase tracking-wider">Google</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating badge - Specialty */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl p-4 hidden lg:block"
              >
                <motion.div
                  className="flex items-center gap-3"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-secondary">{clinic.specialty}</p>
                    <p className="text-xs text-secondary/50">{clinic.name}</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Corner accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-accent rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-secondary/30 font-medium select-none">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-secondary/20 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  )
}
