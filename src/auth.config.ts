import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Public routes that don't require authentication
      const publicRoutes = ['/login', '/signup', '/terms', '/privacy', '/api/auth'];
      const isPublicRoute = publicRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      ) || nextUrl.pathname === '/';

      // If trying to access protected route without login
      if (!isPublicRoute && !isLoggedIn) {
        return false; // Redirect to login
      }

      // If logged in and trying to access login/signup
      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Role-based access control
      if (isLoggedIn && auth?.user) {
        const role = auth.user.role;

        // Admin routes
        if (nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }

        // Coach routes
        if (nextUrl.pathname.startsWith('/coach') && role !== 'coach' && role !== 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }

        // Student routes
        if (nextUrl.pathname.startsWith('/student') && role !== 'student' && role !== 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Providers are added in auth.ts
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;
