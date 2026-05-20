"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Phone, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useClinic } from "@/config/clinic-context"
import { CountUp } from "@/components/count-up"
import { cn } from "@/lib/utils"

const clipReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  visible: { clipPath: "inset(0 0% 0 0)", opacity: 1 },
}

function getHeadlineSizeClasses(headline: string[] | undefined) {
  const totalLength = (headline || []).join("").length
  if (totalLength > 50) return { main: "text-xl sm:text-2xl", sub: "text-lg sm:text-xl" }
  if (totalLength > 30) return { main: "text-2xl sm:text-3xl", sub: "text-xl sm:text-2xl" }
  return { main: "text-3xl sm:text-4xl", sub: "text-2xl sm:text-3xl" }
}

function LuxuryHero() {
  const clinic = useClinic()
  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`
  const bookingEnabled = clinic._meta?.bookingEnabled
  const ctaHref = bookingEnabled ? '/reservar' : whatsappUrl
  const ctaTarget = bookingEnabled ? undefined : '_blank'
  const ctaRel = bookingEnabled ? undefined : 'noopener noreferrer'

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Full-screen background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.webp"
          alt={`${clinic.name} - ${clinic.tagline}`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Subtle dark overlay */}
        {!clinic.heroNoOverlay && <div className="absolute inset-0 bg-black/30" />}
      </div>

      {/* Content — bottom-left aligned */}
      <div className="relative z-10 w-full">
        {/* Mobile */}
        <div className="lg:hidden px-6 pt-28 pb-12 text-left">
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs text-white/60 font-medium uppercase tracking-[0.2em] mb-4"
          >
            {clinic.specialty}
          </motion.p>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.1] mb-4"
          >
            {clinic.heroHeadline?.[0] || ""}
            {clinic.heroHeadline?.[1] && (
              <span className="block mt-1">{clinic.heroHeadline[1]}</span>
            )}
          </motion.h1>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base text-white/70 mb-8 leading-relaxed max-w-md"
          >
            {clinic.heroDescription}
          </motion.p>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white text-white text-sm font-medium uppercase tracking-[0.15em] rounded-[4px] hover:bg-white hover:text-[var(--color-secondary)] transition-all duration-300"
            >
              {clinic.ctaLabel || 'Pedir presupuesto'}
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block px-8 pb-24 pt-32">
          <div className="container-wide">
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xs text-white/60 font-medium uppercase tracking-[0.25em] mb-6"
            >
              {clinic.specialty}
            </motion.p>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-white leading-[1.05] mb-6 max-w-4xl"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="block">{clinic.heroHeadline?.[0] || ""}</span>
              {clinic.heroHeadline?.[1] && (
                <span className="block">{clinic.heroHeadline[1]}</span>
              )}
            </motion.h1>

            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl text-white/70 mb-10 max-w-xl leading-relaxed"
            >
              {clinic.heroDescription}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {bookingEnabled ? (
                <Link
                  href="/reservar"
                  className="inline-flex items-center gap-3 px-10 py-4 border-2 border-white text-white text-sm font-medium uppercase tracking-[0.15em] rounded-[4px] hover:bg-white hover:text-[var(--color-secondary)] transition-all duration-300"
                >
                  {clinic.ctaLabel || 'Pedir presupuesto'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-4 border-2 border-white text-white text-sm font-medium uppercase tracking-[0.15em] rounded-[4px] hover:bg-white hover:text-[var(--color-secondary)] transition-all duration-300"
                >
                  {clinic.ctaLabel || 'Pedir presupuesto'}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium select-none">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export function Hero() {
  const clinic = useClinic()
  if (clinic.theme === 'luxury') return <LuxuryHero />

  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`
  const featuredReview = clinic.reviews.featured.length > 0
    ? clinic.reviews.featured.reduce((best, r) => r.text.length > best.text.length ? r : best, clinic.reviews.featured[0])
    : null
  const headlineSize = getHeadlineSizeClasses(clinic.heroHeadline)
  const fullHeadline = (clinic.heroHeadline || []).filter(Boolean).join(" ")

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <h1 className="sr-only">{fullHeadline}</h1>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
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
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-accent to-transparent" />
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-accent to-transparent" />
        </div>
      </div>

      {/* === MOBILE HERO (< lg) === */}
      <div className="lg:hidden w-full relative z-10">
        {/* Hero image — full width with gradient overlay */}
        <div className="relative w-full h-[50vh] min-h-[320px]">
          <Image
            src="/images/hero.webp"
            alt={`${clinic.name} - ${clinic.tagline}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {!clinic.heroNoOverlay && (
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-transparent to-white" />
          )}

          {/* Floating rating badge on image — top-24 clears the fixed header */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute top-24 left-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg"
          >
            <div className="flex -space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
              ))}
            </div>
            <span className="text-xs font-bold text-secondary">
              {clinic.reviews.rating}
              {!clinic.heroHidePatientsStat && <> · {clinic.reviews.count}</>}
            </span>
          </motion.div>
        </div>

        {/* Content below image */}
        <div className="px-4 pt-6 pb-8">
          <motion.div
            initial={false}
            aria-hidden="true"
            className={cn(headlineSize.main, "font-display font-bold text-secondary leading-[1.05] mb-4 text-balance")}
          >
            <span className="block">{clinic.heroHeadline?.[0] || ""}</span>
            {clinic.heroHeadline?.[1] && (
              <span className="text-primary">{" "}{clinic.heroHeadline[1]}</span>
            )}
            {clinic.heroHeadline?.[2] && (
              <span className={cn("block mt-1 font-semibold text-secondary/70", headlineSize.sub)}>
                {clinic.heroHeadline[2]}
              </span>
            )}
          </motion.div>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-base text-secondary/60 mb-6 leading-relaxed"
          >
            {clinic.heroDescription}
          </motion.p>

          {/* Mini testimonial — mobile */}
          {featuredReview && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mb-6 p-4 bg-neutral rounded-xl border-l-4 border-l-accent"
            >
              <p className="text-sm text-secondary/70 italic leading-relaxed">
                &ldquo;{featuredReview.text.length > 120 ? `${featuredReview.text.slice(0, 120)}...` : featuredReview.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-0.5">
                  {[...Array(featuredReview.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-secondary">{featuredReview.author}</span>
              </div>
            </motion.div>
          )}

          {/* CTA buttons — full width */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex gap-3"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 text-sm py-3.5"
            >
              <span className="inline-flex items-center justify-center gap-2 w-full">
                {clinic.ctaLabel || "Pedir presupuesto"}
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
            <a
              href={`tel:${clinic.phone.replace(/\s/g, "")}`}
              className="btn-secondary text-sm py-3.5 px-4"
              aria-label="Llamar por teléfono"
            >
              <Phone className="w-5 h-5" />
            </a>
          </motion.div>

          {/* Stats — horizontal scroll */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200 flex justify-between"
          >
            {([
              !clinic.heroHidePatientsStat && { end: clinic.reviews.count, prefix: "+", label: clinic.statsLabel },
              { end: clinic.services.length, label: "Servicios" },
              { end: clinic.reviews.rating, decimals: 1, label: "Valoración" },
              clinic.heroShowYearsExperience && clinic.yearsExperience && { end: clinic.yearsExperience, prefix: "+", label: "Años experiencia" },
            ].filter(Boolean) as Array<{ end: number; prefix?: string; label: string; decimals?: number }>).map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  <CountUp end={stat.end} prefix={stat.prefix} decimals={stat.decimals} />
                </p>
                <p className="text-[10px] text-secondary/50 mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* === DESKTOP HERO (lg+) === */}
      <div className="container-wide section-padding relative z-10 pt-32 lg:pt-24 hidden lg:block">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-left"
          >
            {/* Trust badge */}
            <motion.div
              initial={false}
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
                  <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                ))}
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-sm font-semibold text-secondary">
                {clinic.reviews.rating}
                {!clinic.heroHidePatientsStat && <> · {clinic.reviews.count} reseñas</>}
              </span>
            </motion.div>

            {/* Headline (visual; SEO h1 is sr-only above) */}
            <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-secondary leading-[1.1] mb-6" aria-hidden="true">
              <span className="block">{clinic.heroHeadline?.[0] || ""}</span>
              {clinic.heroHeadline?.[1] && (
                <span className="relative inline-block">
                  <span className="text-primary">{clinic.heroHeadline[1]}</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
              {clinic.heroHeadline?.[2] && (
                <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 font-medium text-secondary/50">
                  {clinic.heroHeadline[2]}
                </span>
              )}
            </div>

            {/* Description */}
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl text-secondary/60 mb-8 max-w-xl leading-relaxed"
            >
              {clinic.heroDescription}
            </motion.p>

            {/* Mini testimonial — desktop */}
            {featuredReview && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl border-l-4 border-l-accent shadow-sm max-w-xl"
              >
                <p className="text-sm text-secondary/70 italic leading-relaxed">
                  &ldquo;{featuredReview.text.length > 120 ? `${featuredReview.text.slice(0, 120)}...` : featuredReview.text}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-0.5">
                    {[...Array(featuredReview.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-secondary">{featuredReview.author}</span>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-row gap-4 justify-start"
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
                  {clinic.ctaLabel || "Pedir presupuesto"}
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
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={(() => {
                const n = (!clinic.heroHidePatientsStat ? 1 : 0) + 2 + (clinic.heroShowYearsExperience && clinic.yearsExperience ? 1 : 0)
                const colsClass = n === 4 ? 'grid-cols-4' : n === 3 ? 'grid-cols-3' : 'grid-cols-2'
                return `mt-12 pt-10 border-t border-gray-200 grid gap-6 ${colsClass}`
              })()}
            >
              {([
                !clinic.heroHidePatientsStat && { end: clinic.reviews.count, prefix: "+", label: clinic.statsLabel },
                { end: clinic.services.length, label: "Tratamientos" },
                { end: clinic.reviews.rating, decimals: 1, label: "Valoración" },
                clinic.heroShowYearsExperience && clinic.yearsExperience && { end: clinic.yearsExperience, prefix: "+", label: "Años experiencia" },
              ].filter(Boolean) as Array<{ end: number; prefix?: string; label: string; decimals?: number }>).map((stat, i) => (
                <div key={i} className="text-left flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-gray-200 -ml-3" />}
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

          {/* Hero Image — desktop */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative group"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-[2rem] -rotate-3" />
              <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-2xl shadow-primary/20">
                <Image
                  src="/images/hero.webp"
                  alt={`${clinic.name} - ${clinic.tagline}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  priority
                  sizes="50vw"
                />
                {!clinic.heroNoOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-secondary/10 to-primary/5" />
                )}
              </div>

              {/* Floating badge - Rating */}
              {clinic.heroShowRatingBadge !== false && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-xl p-4"
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
              )}

              {/* Floating badge - Specialty */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl p-4"
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

              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-accent rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — desktop only */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        initial={false}
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

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  )
}
