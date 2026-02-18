import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase()
  const match = host.match(/^([a-z0-9-]+)\.romantechwebs\./)

  if (!match || !match[1] || match[1] === "-" || match[1].startsWith("-") || match[1].endsWith("-")) {
    return new NextResponse("Not found", { status: 404 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-clinic-slug", match[1])
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/((?!api/deploy|_next|favicon\\.ico|images/|og-image\\.jpg|.*\\.).*)"],
}
