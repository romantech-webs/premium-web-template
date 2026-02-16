"use client"

import { motion } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { clinic } from "@/config/clinic"

type IconName = keyof typeof LucideIcons

function getIcon(iconName: string) {
  const Icon = LucideIcons[iconName as IconName] as React.ComponentType<{ className?: string }>
  return Icon || LucideIcons.Circle
}

export function Services() {
  return (
    <section id="servicios" className="section-padding bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container-wide relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <span className="section-label">{clinic.sectionCopy.servicesLabel}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary mb-6">
            {clinic.sectionCopy.servicesTitle}
          </h2>
          <p className="text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.servicesDescription}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinic.services.map((service, index) => {
            const Icon = getIcon(service.icon)
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="card-athletic h-full p-8 bg-gradient-to-br from-white to-neutral">
                  {/* Number */}
                  <div className="text-6xl font-bold text-primary/10 mb-4 leading-none">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {service.name}
                  </h3>
                  <p className="text-secondary/60 text-sm mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2">
                    {service.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-secondary/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Hover arrow */}
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
