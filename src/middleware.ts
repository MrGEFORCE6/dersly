import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve auth & role cookies
  const authToken = request.cookies.get('derspompa_auth_token')?.value;
  const userRole = request.cookies.get('derspompa_user_role')?.value;

  // Check if Supabase session cookie is present
  const allCookies = request.cookies.getAll();
  const hasSupabaseSession = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  const isAuthenticated = Boolean(authToken || hasSupabaseSession);

  // 1. Dashboard protection: Teachers only!
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Students and Parents MUST be blocked from teacher dashboard
    if (userRole === 'student' || userRole === 'parent') {
      const studentUrl = request.nextUrl.clone();
      studentUrl.pathname = '/student';
      studentUrl.searchParams.set('denied', 'teacher_only');
      return NextResponse.redirect(studentUrl);
    }
  }

  // 2. Teachers' Lounge protection: Teachers only!
  if (pathname.startsWith('/feed/teachers')) {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole === 'student' || userRole === 'parent') {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/feed/students';
      deniedUrl.searchParams.set('denied', 'teachers_lounge_forbidden');
      return NextResponse.redirect(deniedUrl);
    }
  }

  // 3. Student Portal & General Protected Routes
  const isProtectedArea = [
    '/student',
    '/settings',
    '/profile',
    '/chat',
    '/messages',
    '/parent',
    '/feed/students',
  ].some((route) => pathname.startsWith(route));

  if (isProtectedArea) {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/feed/teachers/:path*',
    '/feed/students/:path*',
    '/student/:path*',
    '/messages/:path*',
    '/parent/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/chat/:path*',
  ],
};
