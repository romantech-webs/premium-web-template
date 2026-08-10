export interface BlogPost {
  title: string
  metaDescription: string
  h1: string
  publishedDate: string
  modifiedDate?: string
  category?: string
  readingTime?: string
  intro: string
  sections: Array<{ heading: string; body: string }>
  faq?: Array<{ q?: string; a?: string; question?: string; answer?: string }>
  callToAction?: string
  relatedKeywords?: string[]
  internalLinks?: string[]
  image?: string
}

export interface CustomPage {
  title: string
  metaDescription: string
  h1: string
  intro?: string
  /** Free-text describing what's unique about this location/page (rendered as paragraph below intro). */
  uniqueAngle?: string
  sections?: Array<{ heading: string; body: string }>
  faq?: Array<{ question: string; answer: string }>
  testimonial?: { author?: string; text: string; rating?: number } | string
  services?: string[]
  cta?: { label: string; description?: string }
  /** Schema type for this page: defaults to "WebPage" */
  schemaType?: "AboutPage" | "Service" | "LocalBusiness" | "WebPage"
}

// ClinicConfig — matches the shape produced by mapper.ts in automatizacion-webs
export interface ClinicConfig {
  name: string
  logo: string | null
  /** "wordmark" = logo image already contains the brand name; the header hides the duplicate text. "icon" = small icon, keep the text next to it. Defaults to "icon". */
  logoStyle?: "icon" | "wordmark"
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
  /**
   * Optional human label for the primary center (e.g. "Centro Ocaña").
   * If omitted, the primary center uses `clinic.name` as its label
   * when rendered alongside additional `centers`.
   */
  primaryCenterName?: string
  /**
   * Additional centers (besides the primary one defined by `address`,
   * `phone`, `googleMapsEmbed`). Triggers the multi-center Location layout.
   */
  centers?: Array<{
    name?: string
    address: {
      street: string
      city: string
      province: string
      postalCode: string
      country?: string
    }
    phone: string
    googleMapsUrl: string
    googleMapsEmbed: string
  }>
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
    longDescription?: string
    benefits: string[]
    icon: string
    image?: string
    faq?: Array<{ question: string; answer: string }>
    process?: string[]
    relatedKeywords?: string[]
    h1?: string
    seoTitle?: string
    seoMetaDescription?: string
    priceFrom?: string   // e.g. "40 €" or "Desde 850 €"
    timeEstimate?: string // e.g. "30-60 min" or "1-2 días"
    /** Keeps /servicios/{id} and the sitemap entry alive, but drops the card from the homepage grid. */
    hideFromHome?: boolean
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
  heroShowRatingBadge?: boolean
  heroNoOverlay?: boolean
  heroHidePatientsStat?: boolean
  heroShowYearsExperience?: boolean
  /** Hides every review-derived element of the hero: star badges, featured quote and the rating stat. */
  heroHideSocialProof?: boolean
  /**
   * Hero image path. Defaults to "/images/hero.webp".
   * Static images are served with a 1-year `immutable` Cache-Control, so replacing
   * the file in place leaves old visitors stuck on the previous photo — point this
   * at a new filename (e.g. "/images/hero-2.webp") to bust that cache.
   */
  heroImage?: string
  /** Hides the whole stats row under the hero CTAs (patients / treatments / rating / years). */
  heroHideStats?: boolean
  /** Short line rendered where the stats row sits. Pairs with `heroHideStats` to replace numbers with a claim. */
  heroNote?: string
  /** Hides the floating badge over the hero image (specialty + play icon). */
  heroHideSpecialtyBadge?: boolean
  /**
   * Drops the secondary "Llamar Ahora" button from the desktop hero, leaving a single CTA.
   * Mobile keeps its compact phone icon: the header hides the number at that width.
   */
  heroHideCallButton?: boolean
  /** Extra header nav entries, inserted before "Contacto" (e.g. anchors to home sections). */
  navExtraItems?: Array<{ label: string; href: string }>
  /**
   * Trust badges under the hero of service and custom pages. Omit for the vertical
   * default (health verticals only get the Google rating); pass [] to hide the strip.
   */
  serviceTrustSignals?: Array<{ icon?: "star" | "shield" | "clock" | "check"; title: string; subtitle?: string }>
  /** Closing CTA copy on service pages. Health verticals fall back to `ctaDescription`. */
  serviceCtaDescription?: string
  whyUsHideIcons?: boolean
  whyUsHideStats?: boolean
  hiddenSections?: Array<'services' | 'process' | 'reviews' | 'socialProof' | 'whyUs' | 'team' | 'gallery' | 'faq' | 'location' | 'cta'>
  specialty: string
  ctaLabel: string
  ctaHeadline: string
  ctaDescription: string
  statsLabel: string
  /** Value for the `statsLabel` hero stat. Falls back to the Google review count when absent. */
  patientsCount?: number
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
  theme?: 'default' | 'luxury'
  customDomain?: string
  serviceAreas?: string[]
  priceRange?: string
  paymentMethods?: string[]
  addressRegion?: string
  yearsActive?: number
  urgenciasBadge?: { label: string; description?: string }
  pages?: Record<string, CustomPage>
  /**
   * Optional structured pricing list. When present, takes over the /precios
   * route with a category/table layout. Falls back to pages.precios otherwise.
   */
  pricing?: {
    label?: string
    title?: string
    description?: string
    note?: string
    categories: Array<{
      name: string
      items: Array<{
        name: string
        duration?: string
        price: number
        priceFrom?: boolean
      }>
    }>
  }
  blog?: { posts: Record<string, BlogPost> }
  verifications?: {
    google?: string   // content of <meta name="google-site-verification">
    bing?: string     // content of <meta name="msvalidate.01">
    yandex?: string   // content of <meta name="yandex-verification">
    pinterest?: string
    facebook?: string // domain verification
    /** IndexNow key (uuid-ish hex string). Triggers <key>.txt at root. */
    indexNowKey?: string
  }
  _meta?: {
    projectId: string
    widgetApiUrl: string
    bookingEnabled?: boolean
    bookingPlan?: string
    productsEnabled?: boolean
    productsPlan?: string
    leadId?: string
    isDemo?: boolean
    noindex?: boolean
  }
}
