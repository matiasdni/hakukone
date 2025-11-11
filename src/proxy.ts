import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

// Create the next-intl middleware
const handleI18nRouting = createMiddleware(routing);

/**
 * Proxy for handling i18n routing
 * Stack Auth handles its own authentication via cookies and the handler routes
 */
export function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|handler|.*\\..*).*)",
  ],
};
