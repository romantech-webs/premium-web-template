"use client"

import { motion } from "framer-motion"
import { useClinic } from "@/config/clinic-context"
import { iconMap, DEFAULT_ICON_WEIGHT } from "@/lib/icon-map"

function getIcon(iconName: string) {
  return iconMap[iconName] || null
}

export function Process() {
  const clinic = useClinic()

  return (
    <section className="section-padding bg-neutral section-divider">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10 lg:mb-16"
        >
          <span className="section-label justify-center">
            {clinic.sectionCopy.processLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-secondary mt-4 mb-4 lg:mb-6">
            {clinic.sectionCopy.processTitle}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.processDescription}
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <motion.div
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 origin-left"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 20%, transparent), var(--color-primary), color-mix(in srgb, var(--color-primary) 20%, transparent))" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {clinic.process.map((step, index) => {
              const StepIcon = step.icon ? getIcon(step.icon) : null
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-lg hover:border-primary/20 border border-transparent transition-all duration-300 relative z-10 hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]">
                    {/* Step number + icon */}
                    <div className="flex items-center gap-3 mb-4 lg:mb-5">
                      <div className="relative w-12 h-12">
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              "0 0 0 0px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                              "0 0 0 10px color-mix(in srgb, var(--color-primary) 0%, transparent)"
                            ]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: index * 0.4 }}
                        />
                        <div className="relative w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg shadow-lg shadow-primary/30">
                          {step.step}
                        </div>
                      </div>
                      {StepIcon && (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <StepIcon className="w-5 h-5 text-primary" weight={DEFAULT_ICON_WEIGHT} />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg lg:text-xl font-display font-semibold text-secondary mb-2 lg:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm lg:text-base text-secondary/70">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector - mobile/tablet */}
                  {index < clinic.process.length - 1 && (
                    <div className="lg:hidden flex justify-center py-3">
                      <svg
                        className="w-6 h-6 text-primary/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
