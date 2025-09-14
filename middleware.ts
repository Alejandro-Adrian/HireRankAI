import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function isBuildTime() {
  return false // Always false for local development
}

export async function middleware(request: NextRequest) {
  // Skip middleware during build time
  if (isBuildTime()) {
    return NextResponse.next({ request })
  }

  const SUPABASE_URL = "https://zcetut0jqacqhqhqhqhq.supabase.co"
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXR1dDBqcWFjcWhxaHFocWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzI4MDAsImV4cCI6MjA1MjQ0ODgwMH0.example_anon_key"

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[v0] Missing Supabase environment variables")
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware - User:", user ? "Authenticated" : "Not authenticated")
  } catch (error) {
    console.error("[v0] Auth check failed in middleware:", error)
    // Return early if Supabase client creation fails
    return NextResponse.next({ request })
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.redirect() or
  // NextResponse.rewrite(), you must:
  // 1. Pass the request in it, like so: NextResponse.redirect(new URL('/login', request.url), { request })
  // 2. Copy over the cookies, like so: supabaseResponse.cookies.getAll().forEach((cookie) => myNewResponse.cookies.set(cookie.name, cookie.value))

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/rankings (public ranking APIs)
     * - api/applications (public application APIs)
     * - apply/ (public application pages)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/rankings|api/applications|apply/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
