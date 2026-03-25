"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useClinic } from "@/config/clinic-context"
import { iconMap, DEFAULT_ICON_WEIGHT } from "@/lib/icon-map"

function getIcon(iconName: string) {
  return iconMap[iconName] || iconMap.CircleDashed
}

export function Services() {
  const clinic = useClinic()
  const isLuxury = clinic.theme === 'luxury'
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const children = Array.from(el.children) as HTMLElement[]
      const center = el.scrollLeft + el.clientWidth / 2
      let closest = 0
      let minDist = Infinity
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.clientWidth / 2 - center)
        if (dist < minDist) { minDist = dist; closest = i }
      })
      setActiveIndex(closest)
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="servicios" className="section-padding bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      {!isLuxury && <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />}

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
        <div className="md:hidden -mx-4">
          <div
            ref={scrollRef}
            className="carousel-snap gap-4 pb-4"
            style={{ paddingInline: "calc(50vw - min(40vw, 160px))" }}
          >
            {clinic.services.map((service, index) => {
              const Icon = getIcon(service.icon)
              return (
                <div key={service.id} className="w-[80vw] max-w-[320px]" style={{ scrollSnapAlign: "center" }}>
                  <Link href={`/servicios/${service.id}`} className="block h-full">
                    <div className="h-full p-5 bg-gradient-to-br from-white to-neutral rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-primary" weight={DEFAULT_ICON_WEIGHT} />
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
                  </Link>
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
                  const child = el.children[i] as HTMLElement
                  if (!child) return
                  el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.clientWidth) / 2, behavior: "smooth" })
                }}
                aria-label={`Ir al servicio ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Flex grid — centers orphan items on last row */}
        <div className="hidden md:flex md:flex-wrap md:justify-center gap-6">
          {clinic.services.map((service, index) => {
            const Icon = getIcon(service.icon)
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <Link href={`/servicios/${service.id}`} className="block h-full">
                  <div className="relative h-full p-8 bg-gradient-to-br from-white to-neutral rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                    {!isLuxury && (
                      <div className="text-4xl font-bold leading-none mb-4 bg-gradient-to-b from-primary/15 to-transparent bg-clip-text text-transparent">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:rotate-3 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" weight={DEFAULT_ICON_WEIGHT} />
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
                      <ArrowRight className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
