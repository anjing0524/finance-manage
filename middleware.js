import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // Manage route protection
    const token = await getToken({ req });
    const isAuth = !!token;
    const isLoginPage = pathname.startsWith('/login');

    const sensitiveRoutes = ['/dashboard'];
    const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isLoginPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (!isAuth && isAccessingSensitiveRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
  {
    callbacks: {
      async authorized({ token }) {
        return true;
      },
    },
  },
);

export const config = {
  matchter: ['/', '/login', '/dashboard/:path*', '/api/:path*'],
};
