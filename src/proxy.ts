import { NextResponse, type NextRequest } from "next/server";
import { isPublicLocale, localeFromPathname, stripLocalePrefix } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const forwardedLocale = request.headers.get("x-agentmatter-locale");
  const locale = isPublicLocale(forwardedLocale) ? forwardedLocale : pathname.startsWith("/admin") ? "zh" : localeFromPathname(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-agentmatter-locale", locale);

  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const destination = request.nextUrl.clone();
    destination.pathname = stripLocalePrefix(destination.pathname);
    return NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|media|brand|favicon.ico|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image|twitter-image|.*\\.[a-zA-Z0-9]+$).*)"],
};
