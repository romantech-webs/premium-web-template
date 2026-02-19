"use client"

import { motion } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { CountUp } from "@/components/count-up"

type IconName = keyof typeof LucideIcons

function getIcon(iconName: string) {
  const Icon = LucideIcons[iconName as IconName] as React.ComponentType<{ className?: string }>
  return Icon || LucideIcons.Circle
}

export function WhyUs() {
  const clinic = useClinic()

  const stats = [
    { end: clinic.services.length, label: "Tratamientos", icon: "Layers" },
    { end: clinic.reviews.count, prefix: "+", label: `${clinic.statsLabel} satisfechos`, icon: "Users" },
    { end: clinic.reviews.rating, decimals: 1, label: "Valoración media", icon: "Star" },
    { end: 100, suffix: "%", label: "Dedicación", icon: "Heart" },
  ]

  return (
    <section className="section-padding bg-secondary text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-accent to-transparent" style={{ height: '2px' }} />
        <div className="absolute top-0 left-0 h-full bg-gradient-to-b from-accent to-transparent" style={{ width: '2px' }} />
      </div>

      <div className="container-wide relative">
        {/* Mobile layout: Stats first, then features as timeline */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label !text-accent">
              {clinic.sectionCopy.whyUsLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-4 mb-4">
              {clinic.sectionCopy.whyUsTitle}
            </h2>
            <p className="text-white/60 text-base mb-8 leading-relaxed">
              {clinic.sectionCopy.whyUsDescription}
            </p>
          </motion.div>

          {/* Stats grid — 2x2 with large numbers */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {stats.map((stat, index) => {
              const Icon = getIcon(stat.icon)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl p-5 border border-white/[0.08]">
                    <Icon className="w-5 h-5 text-accent mb-3" />
                    <p
                      className="text-4xl font-bold text-white mb-1"
                      style={{ textShadow: "0 0 40px color-mix(in srgb, var(--color-primary) 40%, transparent)" }}
                    >
                      <CountUp end={stat.end} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
                    </p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Features as vertical timeline */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-primary/30 to-transparent" />

            {clinic.whyUs.map((item, index) => {
              const Icon = getIcon(item.icon)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative mb-6 last:mb-0"
                >
                  {/* Dot on timeline */}
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white/10 border border-accent/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Desktop layout: original 2-col */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center">
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
                    <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 group-hover:border-accent transition-all duration-300">
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
              {stats.map((stat, index) => {
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
                    <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl p-8 border border-white/[0.08] hover:bg-white/[0.12] hover:border-primary/30 transition-all duration-300">
                      <Icon className="w-6 h-6 text-accent mb-4" />
                      <p
                        className="text-4xl sm:text-5xl font-bold text-white mb-2"
                        style={{ textShadow: "0 0 60px color-mix(in srgb, var(--color-primary) 40%, transparent)" }}
                      >
                        <CountUp end={stat.end} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
                      </p>
                      <p className="text-sm text-white/50 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-accent/30 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
