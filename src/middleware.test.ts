import { describe, it, expect } from "vitest"
import { middleware, config } from "./middleware"
import { NextRequest } from "next/server"

function makeRequest(host: string, pathname = "/") {
  return new NextRequest(new URL(`http://${host}${pathname}`), {
    headers: { host },
  })
}

// NextResponse.next() with rewritten request headers stores them as
// x-middleware-request-<header-name> on the response
const SLUG_HEADER = "x-middleware-request-x-clinic-slug"

describe("middleware", () => {
  it("extracts slug from valid subdomain", () => {
    const res = middleware(makeRequest("clinica.romantechwebs.com"))
    expect(res.status).not.toBe(404)
    expect(res.headers.get(SLUG_HEADER)).toBe("clinica")
  })

  it("normalizes uppercase host to lowercase slug", () => {
    const res = middleware(makeRequest("CLINICA.Romantechwebs.com"))
    expect(res.status).not.toBe(404)
    expect(res.headers.get(SLUG_HEADER)).toBe("clinica")
  })

  it("returns 404 for bare domain (no subdomain)", () => {
    const res = middleware(makeRequest("romantechwebs.com"))
    expect(res.status).toBe(404)
  })

  it("returns 404 for invalid slug with consecutive dots", () => {
    const res = middleware(makeRequest("evil..romantechwebs.com"))
    expect(res.status).toBe(404)
  })

  it("returns 404 for slug that starts with dash", () => {
    const res = middleware(makeRequest("-bad.romantechwebs.com"))
    expect(res.status).toBe(404)
  })

  it("returns 404 for slug that ends with dash", () => {
    const res = middleware(makeRequest("bad-.romantechwebs.com"))
    expect(res.status).toBe(404)
  })

  it("accepts slug with numbers and dashes", () => {
    const res = middleware(makeRequest("clinica-dental-123.romantechwebs.com"))
    expect(res.status).not.toBe(404)
    expect(res.headers.get(SLUG_HEADER)).toBe("clinica-dental-123")
  })

  it("matcher excludes API deploy routes", () => {
    const matcher = config.matcher[0]
    expect(matcher).toContain("api/deploy")
  })
})
