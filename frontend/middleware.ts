import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOBILE_UA = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // 1. Supabase auth callback
  if (url.pathname === "/" || url.pathname === "") {
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    const accessToken = url.searchParams.get("access_token");
    const code = url.searchParams.get("code");

    if ((tokenHash && type) || accessToken || code) {
      const callbackUrl = new URL("/auth/callback", url.origin);
      url.searchParams.forEach((val, key) => {
        callbackUrl.searchParams.set(key, val);
      });
      return NextResponse.redirect(callbackUrl);
    }
  }

  // 2. モバイルUA検出 → /m へリダイレクト
  const ua = req.headers.get("user-agent") || "";
  const isMobile = MOBILE_UA.test(ua);

  // すでに /m 配下 or API or 静的 → スキップ
  const path = url.pathname;
  const skip = path.startsWith("/m") || path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/auth");

  if (isMobile && !skip) {
    // /owners → /m/owners, / → /m, /diagnosis → /m/diagnosis 等
    const mobilePath = path === "/" ? "/m" : `/m${path}`;

    // /m配下に存在しないページ（/contractor/mypage等）はそのまま
    const mobileRoutes = ["/", "/owners", "/contractors", "/diagnosis", "/map-demo"];
    const shouldRedirect = mobileRoutes.some(r => path === r || path === r + "/");

    if (shouldRedirect) {
      url.pathname = path === "/" ? "/m" : `/m${path.replace(/\/$/, "")}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|opengraph|sw\\.js|manifest\\.json|icon-).*)"],
};
