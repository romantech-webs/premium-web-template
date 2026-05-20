import dynamic from "next/dynamic"
import { headers } from "next/headers"
import { Hero } from "@/components/sections/Hero"
import { getClinicConfig } from "@/config/load-config"

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

export default async function HomePage() {
  const slug = (await headers()).get("x-clinic-slug") || ""
  const config = slug ? await getClinicConfig(slug) : null
  const hidden = new Set(config?.hiddenSections ?? [])
  const show = (key: string) => !hidden.has(key as never)

  return (
    <>
      <Hero />
      {show("services") && <Services />}
      {show("process") && <Process />}
      {show("reviews") && <Reviews />}
      {show("socialProof") && <SocialProof />}
      {show("whyUs") && <WhyUs />}
      {show("team") && <Team />}
      {show("gallery") && <Gallery />}
      {show("faq") && <FAQ />}
      {show("location") && <Location />}
      {show("cta") && <CTA />}
    </>
  )
}
