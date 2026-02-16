"use client"

import { motion } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { clinic } from "@/config/clinic"

type IconName = keyof typeof LucideIcons

function getIcon(iconName: string) {
  const Icon = LucideIcons[iconName as IconName] as React.ComponentType<{ className?: string }>
  return Icon || LucideIcons.Circle
}

export function WhyUs() {
  return (
    <section className="section-padding bg-secondary text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 100px,
            rgba(255,255,255,0.03) 100px,
            rgba(255,255,255,0.03) 101px
          )`
        }} />
      </div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-transparent" />
      </div>

      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label !text-accent">
              {clinic.sectionCopy.whyUsLabel}
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mt-4 mb-6">
              {clinic.sectionCopy.whyUsTitle}
            </h2>
            <p className="text-white/60 text-xl mb-12 leading-relaxed">
              {clinic.sectionCopy.whyUsDescription}
            </p>

            {/* Features */}
            <div className="space-y-6">
              {clinic.whyUs.map((item, index) => {
                const Icon = getIcon(item.icon)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-5 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors duration-300">
                      <Icon className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-white/50 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: String(clinic.services.length), label: "Tratamientos", icon: "Layers" },
                { value: `+${clinic.reviews.count}`, label: `${clinic.statsLabel} satisfechos`, icon: "Users" },
                { value: clinic.reviews.rating.toString(), label: "Valoración media", icon: "Star" },
                { value: "100%", label: "Dedicación", icon: "Heart" },
              ].map((stat, index) => {
                const Icon = getIcon(stat.icon)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="relative group"
                  >
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-accent/50 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-accent mb-4" />
                      <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</p>
                      <p className="text-sm text-white/50 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Decorative corner */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-accent/30 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
