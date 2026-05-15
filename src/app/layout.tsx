import { headers } from "next/headers"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Cormorant_Garamond, Montserrat } from "next/font/google"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { ClinicProvider } from "@/config/clinic-context"
import { generateLocalBusinessSchema, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema, isHealthSchemaType } from "@/lib/schema"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget"
import { MobileCTABar } from "@/components/layout/MobileCTABar"
import { CookieConsent } from "@/components/layout/CookieConsent"
import { DemoBanner } from "@/components/layout/DemoBanner"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

async function getSlugAndConfig() {
  const h = await headers()
  const slug = h.get("x-clinic-slug")
  if (!slug) return null
  const config = await getClinicConfig(slug)
  if (!config) return null
  return { slug, config }
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getSlugAndConfig()
  if (!result) return { title: "No encontrado" }
  const { slug, config } = result
  const baseUrl = getBaseUrl(slug, config)

  return {
    title: {
      template: config.seo.titleTemplate,
      default: config.seo.defaultTitle,
    },
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords,
    alternates: { canonical: baseUrl },
    openGraph: {
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: [`${baseUrl}/og-image.jpg`],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: config._meta?.noindex ? { index: false, follow: false } : {
      index: true,
      follow: true,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getSlugAndConfig()
  if (!result) return notFound()
  const { slug, config } = result
  const baseUrl = getBaseUrl(slug, config)
  const widgetApiUrl = config._meta?.widgetApiUrl || process.env.WIDGET_API_URL || ""
  const projectId = config._meta?.projectId || ""
  // Sanitize for safe inline script interpolation
  const safeApiUrl = JSON.stringify(widgetApiUrl).slice(1, -1)
  const safePid = JSON.stringify(projectId).slice(1, -1)
  const safeGa4Id = config.tracking?.ga4Id ? JSON.stringify(config.tracking.ga4Id).slice(1, -1) : ""

  return (
    <html lang="es">
      <head>
        {/* Preload LCP hero image */}
        <link
          rel="preload"
          as="image"
          href="/images/hero.webp"
          // @ts-expect-error fetchpriority not in React types yet
          fetchpriority="high"
        />
        {/* Dynamic CSS variables from config */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {
              --color-primary: ${config.colors.primary};
              --color-secondary: ${config.colors.secondary};
              --color-accent: ${config.colors.accent};
              --color-neutral: ${config.colors.neutral};
            }`,
          }}
        />
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema(config, baseUrl)),
          }}
        />
        {isHealthSchemaType(config.schemaType) && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateFAQSchema(config)),
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateServiceSchema(config, baseUrl)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBreadcrumbSchema(baseUrl, [
              { name: "Inicio", path: "/" },
            ])),
          }}
        />
        {/* Widget globals + script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__WIDGET_API_URL="${safeApiUrl}";window.__PROJECT_ID="${safePid}";`,
          }}
        />
        {widgetApiUrl && (config._meta?.bookingEnabled || config._meta?.productsEnabled) && (
          <script
            src={`${widgetApiUrl}/widget.js`}
            data-project-name={config.name}
            data-api-url={widgetApiUrl}
            data-project-id={projectId}
            data-primary-color={config.colors.primary}
            data-booking-enabled={config._meta?.bookingEnabled ? "true" : "false"}
            defer
          />
        )}
        {/* Tracking beacon */}
        {widgetApiUrl && projectId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){if(location.search.indexOf("_notrack")!==-1)return;var sid=Math.random().toString(36).slice(2);var api="${safeApiUrl}/api/widget/track";var pid="${safePid}";var sent={};function t(e){if(sent[e])return;sent[e]=1;fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:pid,event:e,sessionId:sid}),keepalive:true}).catch(function(){});}t("page_view");var scrolled=false;window.addEventListener("scroll",function(){if(!scrolled&&window.scrollY/(document.body.scrollHeight-window.innerHeight)>0.5){scrolled=true;t("scroll_50");}});document.addEventListener("click",function(e){if(e.target.closest("a[href^='tel:'],a[href^='mailto:'],button")){sent.cta_click=0;t("cta_click");}});})();`,
            }}
          />
        )}
        {/* GA4 — blocked until cookie consent (type=text/plain, activated by CookieConsent component) */}
        {config.tracking?.ga4Id && (
          <>
            <script
              type="text/plain"
              data-consent="analytics"
              src={`https://www.googletagmanager.com/gtag/js?id=${config.tracking.ga4Id}`}
            />
            <script
              type="text/plain"
              data-consent="analytics"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${safeGa4Id}');`,
              }}
            />
          </>
        )}
        {/* Meta Pixel — blocked until cookie consent */}
        {config.tracking?.metaPixelId && (
          <script
            type="text/plain"
            data-consent="analytics"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${config.tracking.metaPixelId}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body className={`${cormorant.variable} ${montserrat.variable} font-sans overflow-x-hidden noise-overlay${config.theme === 'luxury' ? ' theme-luxury' : ''}`}>
        <ClinicProvider config={config}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-secondary focus:font-semibold">
            Saltar al contenido
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <DemoBanner />
          <WhatsAppWidget />
          <MobileCTABar />
          <CookieConsent />
        </ClinicProvider>
      </body>
    </html>
  )
}
