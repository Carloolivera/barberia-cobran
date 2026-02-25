import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Configuración Edge-safe (sin imports de Node.js / DB)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    // Provider vacío necesario para que next-auth compile en Edge Runtime
    Credentials({}),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (isAdminPath && !isLoginPage && !isAuthenticated) {
        return Response.redirect(new URL("/admin/login", nextUrl));
      }
      if (isAuthenticated && isLoginPage) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
