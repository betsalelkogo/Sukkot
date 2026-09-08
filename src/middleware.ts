import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionKey } from "@/lib/session-key";

const COOKIE_NAME = "admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login" || pathname === "/api/admin/login";

  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }
  if (isLogin) {
    return NextResponse.next();
  }

  const secret = await getSessionKey();
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!secret || !token) {
    return deny(request, isAdminApi);
  }

  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    return deny(request, isAdminApi);
  }
}

function deny(request: NextRequest, isAdminApi: boolean) {
  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const login = new URL("/admin/login", request.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
