"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Instagram, Linkedin, Award } from "lucide-react"
import { clinic } from "@/config/clinic"

export function Team() {
  return (
    <section id="equipo" className="section-padding bg-neutral relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container-wide relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="section-label justify-center">{clinic.sectionCopy.teamLabel}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary mt-4 mb-6">
            {clinic.sectionCopy.teamTitle}
          </h2>
          <p className="text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.teamDescription}
          </p>
        </motion.div>

        {/* Team Grid - Single member layout */}
        <div className="max-w-4xl mx-auto">
          {clinic.team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] rotate-2" />
                  <div className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl">
                    {member.image && member.image !== "/images/team/placeholder.jpg" ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <div className="text-center text-primary/50">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-5xl">👤</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Floating badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 hidden md:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary">{member.role}</p>
                        <p className="text-xs text-secondary/50">{clinic.name}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Info */}
                <div className="text-center md:text-left">
                  <h3 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
                    {member.name}
                  </h3>
                  <p className="text-xl text-primary font-semibold mb-6">
                    {member.role}
                  </p>
                  <p className="text-secondary/60 text-lg leading-relaxed mb-8">
                    {member.bio}
                  </p>

                  {/* Social links */}
                  <div className="flex gap-3 justify-center md:justify-start">
                    {clinic.social.instagram && (
                      <a
                        href={clinic.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {clinic.social.linkedin && (
                      <a
                        href={clinic.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
