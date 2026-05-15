import { NextRequest, NextResponse } from "next/server"

const CUSTOM_DOMAINS: Record<string, string> = (() => {
  try {
    return JSON.parse(process.env.CUSTOM_DOMAINS_JSON || "{}")
  } catch {
    return {}
  }
})()

export function middleware(request: NextRequest) {
  const rawHost = (request.headers.get("host") || "").toLowerCase().replace(/:\d+$/, "")
  const host = rawHost.replace(/^www\./, "")

  let slug: string | null = null

  const sub = rawHost.match(/^([a-z0-9-]+)\.romantechwebs\./)
  if (sub && sub[1] && sub[1] !== "-" && !sub[1].startsWith("-") && !sub[1].endsWith("-")) {
    slug = sub[1]
  } else if (CUSTOM_DOMAINS[host]) {
    slug = CUSTOM_DOMAINS[host]
  }

  if (!slug) {
    return new NextResponse("Not found", { status: 404 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-clinic-slug", slug)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/((?!api/deploy|_next/|favicon\\.ico|images/|og-image\\.jpg).*)",
  ],
}
