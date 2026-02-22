// ClinicConfig — matches the shape produced by mapper.ts in automatizacion-webs
export interface ClinicConfig {
  name: string
  logo: string | null
  tagline: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
  }
  phone: string
  whatsapp: string
  whatsappMessage: string
  email: string
  address: {
    street: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  googleMapsUrl: string
  googleMapsEmbed: string
  coordinates: { lat: number; lng: number }
  schedule: Array<{ days: string; hours: string }>
  social: {
    instagram: string | null
    facebook: string | null
    linkedin: string | null
    tiktok: string | null
  }
  reviews: {
    rating: number
    count: number
    url: string
    featured: Array<{
      author: string
      rating: number
      text: string
      date: string
    }>
  }
  services: Array<{
    id: string
    name: string
    description: string
    benefits: string[]
    icon: string
  }>
  yearsExperience?: number
  process: Array<{
    step: number
    title: string
    description: string
    icon?: string
  }>
  whyUs: Array<{
    title: string
    description: string
    icon: string
  }>
  team: Array<{
    name: string
    role: string
    image: string
    bio: string
  }>
  gallery: Array<{
    src: string
    alt: string
  }>
  faq: Array<{ question: string; answer: string }>
  seo: {
    titleTemplate: string
    defaultTitle: string
    defaultDescription: string
    keywords: string[]
    ogImage: string
  }
  legal: {
    companyName: string
    cif: string
    registeredAddress: string
  }
  heroHeadline: string[]
  heroDescription: string
  specialty: string
  ctaLabel: string
  ctaHeadline: string
  ctaDescription: string
  statsLabel: string
  schemaType: string
  sectionCopy: {
    servicesLabel: string
    servicesTitle: string
    servicesDescription: string
    processLabel: string
    processTitle: string
    processDescription: string
    whyUsLabel: string
    whyUsTitle: string
    whyUsDescription: string
    reviewsLabel: string
    reviewsTitle: string
    galleryLabel: string
    galleryTitle: string
    galleryDescription: string
    faqLabel: string
    faqTitle: string
    faqDescription: string
    locationLabel: string
    locationTitle: string
    teamLabel: string
    teamTitle: string
    teamDescription: string
  }
  tracking?: {
    ga4Id?: string
    metaPixelId?: string
  }
  _meta?: {
    projectId: string
    widgetApiUrl: string
    bookingEnabled?: boolean
  }
}
