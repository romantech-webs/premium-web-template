"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { useClinic } from "@/config/clinic-context"

type IconName = keyof typeof LucideIcons

function getIcon(iconName: string) {
  const Icon = LucideIcons[iconName as IconName] as React.ComponentType<{ className?: string }>
  return Icon || LucideIcons.Circle
}

export function Services() {
  const clinic = useClinic()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const cardWidth = el.firstElementChild?.clientWidth || 280
      const gap = 16
      setActiveIndex(Math.round(scrollLeft / (cardWidth + gap)))
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="servicios" className="section-padding bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container-wide relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-10 lg:mb-16"
        >
          <span className="section-label">{clinic.sectionCopy.servicesLabel}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-secondary mb-4 lg:mb-6">
            {clinic.sectionCopy.servicesTitle}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.servicesDescription}
          </p>
        </motion.div>

        {/* Mobile: Horizontal carousel */}
        <div className="md:hidden">
          <div ref={scrollRef} className="carousel-snap gap-4 -mx-4 px-4 pb-4">
            {clinic.services.map((service, index) => {
              const Icon = getIcon(service.icon)
              return (
                <div key={service.id} className="w-[80vw] max-w-[320px]">
                  <div className="h-full p-5 bg-gradient-to-br from-white to-neutral rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-secondary mb-1.5">{service.name}</h3>
                    <p className="text-secondary/60 text-sm mb-3 leading-relaxed line-clamp-4">{service.description}</p>
                    <ul className="space-y-1.5">
                      {service.benefits.slice(0, 3).map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-secondary/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {clinic.services.map((_, i) => (
              <button
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === activeIndex ? "var(--color-primary)" : "var(--color-primary)",
                  opacity: i === activeIndex ? 1 : 0.2,
                  transform: i === activeIndex ? "scale(1.5)" : "scale(1)",
                }}
                onClick={() => {
                  const el = scrollRef.current
                  if (!el) return
                  const cardWidth = el.firstElementChild?.clientWidth || 280
                  el.scrollTo({ left: i * (cardWidth + 16), behavior: "smooth" })
                }}
                aria-label={`Ir al servicio ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinic.services.map((service, index) => {
            const Icon = getIcon(service.icon)
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <div className="relative h-full p-8 bg-gradient-to-br from-white to-neutral rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl font-bold leading-none mb-4 bg-gradient-to-b from-primary/15 to-transparent bg-clip-text text-transparent">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:rotate-3 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{service.name}</h3>
                  <p className="text-secondary/60 text-sm mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2">
                    {service.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-secondary/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2">
                    <LucideIcons.ArrowRight className="w-5 h-5 text-accent" />
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
