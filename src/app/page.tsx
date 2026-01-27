import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { Process } from "@/components/sections/Process"
import { Reviews } from "@/components/sections/Reviews"
import { WhyUs } from "@/components/sections/WhyUs"
import { Team } from "@/components/sections/Team"
import { Gallery } from "@/components/sections/Gallery"
import { FAQ } from "@/components/sections/FAQ"
import { Location } from "@/components/sections/Location"
import { CTA } from "@/components/sections/CTA"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <Reviews />
      <WhyUs />
      <Team />
      <Gallery />
      <FAQ />
      <Location />
      <CTA />
    </>
  )
}
