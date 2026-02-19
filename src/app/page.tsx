import dynamic from "next/dynamic"
import { Hero } from "@/components/sections/Hero"

const Services = dynamic(() => import("@/components/sections/Services").then(m => ({ default: m.Services })))
const Process = dynamic(() => import("@/components/sections/Process").then(m => ({ default: m.Process })))
const Reviews = dynamic(() => import("@/components/sections/Reviews").then(m => ({ default: m.Reviews })))
const WhyUs = dynamic(() => import("@/components/sections/WhyUs").then(m => ({ default: m.WhyUs })))
const Team = dynamic(() => import("@/components/sections/Team").then(m => ({ default: m.Team })))
const Gallery = dynamic(() => import("@/components/sections/Gallery").then(m => ({ default: m.Gallery })))
const SocialProof = dynamic(() => import("@/components/sections/SocialProof").then(m => ({ default: m.SocialProof })))
const FAQ = dynamic(() => import("@/components/sections/FAQ").then(m => ({ default: m.FAQ })))
const Location = dynamic(() => import("@/components/sections/Location").then(m => ({ default: m.Location })))
const CTA = dynamic(() => import("@/components/sections/CTA").then(m => ({ default: m.CTA })))

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <Reviews />
      <SocialProof />
      <WhyUs />
      <Team />
      <Gallery />
      <FAQ />
      <Location />
      <CTA />
    </>
  )
}
