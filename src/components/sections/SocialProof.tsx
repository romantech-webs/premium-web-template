"use client"

import { motion } from "framer-motion"
import { Users, Star, Award, Layers, ExternalLink } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { CountUp } from "@/components/count-up"

export function SocialProof() {
  const clinic = useClinic()

  const stats = [
    {
      icon: Users,
      end: clinic.reviews.count,
      prefix: "+",
      label: "Clientes satisfechos",
    },
    {
      icon: Star,
      end: clinic.reviews.rating,
      decimals: 1,
      label: "Valoración Google",
    },
    ...(clinic.yearsExperience
      ? [{
          icon: Award,
          end: clinic.yearsExperience,
          prefix: "+",
          label: "Años de experiencia",
        }]
      : []),
    {
      icon: Layers,
      end: clinic.services.length,
      label: "Tratamientos",
    },
  ]

  return (
    <section className="py-10 md:py-16 bg-neutral relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="container-wide px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shrink-0">
                <stat.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-secondary leading-none">
                  <CountUp end={stat.end} prefix={stat.prefix} decimals={stat.decimals} />
                </p>
                <p className="text-xs sm:text-sm text-secondary/50 uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Google verified badge */}
          <motion.a
            href={clinic.reviews.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: stats.length * 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm text-secondary/70 hover:shadow-md hover:border-primary/20 transition-all duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Verificado en Google
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        </div>
      </div>
    </section>
  )
}
