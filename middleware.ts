import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // อนุญาตให้เข้าถึงหน้าเข้าสู่ระบบ, ลงทะเบียน, ไฟล์สถิต, และ API ได้โดยตรง
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ตรวจสอบคุกกี้เซสชันของผู้ใช้
  const userCookie = request.cookies.get("flower_pos_user")?.value;
  const tokenCookie = request.cookies.get("sb-access-token")?.value;

  // หากยังไม่ได้ลงทะเบียนหรือล็อกอิน ให้เปลี่ยนเส้นทางไปยังหน้า /login ทันที
  if (!userCookie && !tokenCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)",
  ],
};
